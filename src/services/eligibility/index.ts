export type {
  EligibilityOutcome,
  EligibilityVerificationProvider,
  EligibilityVerificationRequest,
  EligibilityVerificationResult,
  EligibilityVerificationSuccess,
} from "./types";
export {
  MockEligibilityVerificationProvider,
  createMockEligibilityVerificationProvider,
} from "./mock-eligibility.provider";
export { AiEligibilityVerificationProvider, createAiEligibilityVerificationProvider } from "./ai-eligibility.provider";

import { createMockEligibilityVerificationProvider } from "./mock-eligibility.provider";

/**
 * Trigger an asynchronous eligibility check for a given policy.
 */
export async function runEligibilityCheck(policyId: string): Promise<void> {
  try {
    const policy = await prisma.insurancePolicy.findUnique({
      where: { id: policyId },
      include: { patient: true },
    });

    if (!policy) return;

    // Create initial check record
    const check = await prisma.eligibilityCheck.create({
      data: {
        policyId: policy.id,
        status: "PENDING",
        providerKey: "mock_eligibility",
        requestPayload: {
          memberId: policy.memberId,
          payerKey: policy.payerKey,
          patientId: policy.patientId,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ELIGIBILITY_CHECK_REQUESTED",
        entityType: "EligibilityCheck",
        entityId: check.id,
        metadata: { policyId: policy.id },
      },
    });

    const provider = createMockEligibilityVerificationProvider();
    const result = await provider.verify({
      memberId: policy.memberId,
      payerKey: policy.payerKey,
      patientDob: policy.patient.dateOfBirth?.toISOString().slice(0, 10) || "",
      correlationId: check.id,
    });

    let finalStatus: "VERIFIED" | "NEEDS_REVIEW" | "FAILED" = "FAILED";
    let summaryLine = "Unknown error";
    let responsePayload: any = null;
    let reviewNote: string | null = null;

    if (result.ok) {
      finalStatus = result.data.outcome as "VERIFIED" | "NEEDS_REVIEW" | "FAILED";
      summaryLine = result.data.summary;
      responsePayload = result.data as any;
      
      if (finalStatus === "NEEDS_REVIEW" || finalStatus === "FAILED") {
        reviewNote = "System-generated: Result requires staff review.";
      }
    } else {
      finalStatus = "FAILED";
      summaryLine = result.error.message;
      responsePayload = result.error as any;
      reviewNote = `Error: ${result.error.message}`;
    }

    await prisma.eligibilityCheck.update({
      where: { id: check.id },
      data: {
        status: finalStatus,
        summaryLine,
        responsePayload,
        reviewNote,
        completedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ELIGIBILITY_STATUS_CHANGED",
        entityType: "EligibilityCheck",
        entityId: check.id,
        metadata: {
          from: "PENDING",
          to: finalStatus,
        },
      },
    });
  } catch (error) {
    console.error(`[eligibility:run] Critical error for policy ${policyId}:`, error);
    // Try to record the failure if possible
    try {
      await prisma.eligibilityCheck.create({
        data: {
          policyId,
          status: "FAILED",
          providerKey: "system",
          summaryLine: error instanceof Error ? error.message : "Internal system error",
          completedAt: new Date(),
        },
      });
    } catch (dbErr) {
      console.error("[eligibility:run] Failed to record failure to DB:", dbErr);
    }
  }
}
