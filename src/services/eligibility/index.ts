import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MockEligibilityVerificationProvider } from "./mock-eligibility.provider";
import { GroqEligibilityVerificationProvider } from "./groq-eligibility.provider";
import type { 
  EligibilityVerificationProvider, 
  EligibilityVerificationRequest 
} from "./types";
export type { 
  EligibilityVerificationProvider, 
  EligibilityVerificationRequest 
};
export { createAiEligibilityVerificationProvider } from "./ai-eligibility.provider";
export { createMockEligibilityVerificationProvider } from "./mock-eligibility.provider";

export function createEligibilityProvider(): EligibilityVerificationProvider {
  const provider = process.env.ELIGIBILITY_PROVIDER;
  const hasGroq = !!process.env.GROQ_API_KEY;

  if (provider === "groq_langchain" || (!provider && hasGroq)) {
    return new GroqEligibilityVerificationProvider();
  }

  // Fallback to mock
  return new MockEligibilityVerificationProvider();
}

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

    const provider = createEligibilityProvider();

    // Create initial check record
    const check = await prisma.eligibilityCheck.create({
      data: {
        policyId: policy.id,
        status: "PENDING",
        providerKey: provider.providerKey,
        requestPayload: {
          memberId: policy.memberId,
          payerKey: policy.payerKey,
          patientId: policy.patientId,
          subscriberName: policy.subscriberName ?? null,
        } satisfies Prisma.InputJsonObject,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ELIGIBILITY_CHECK_REQUESTED",
        entityType: "EligibilityCheck",
        entityId: check.id,
        metadata: { policyId: policy.id, provider: provider.providerKey },
      },
    });

    const result = await provider.verify({
      payerKey: policy.payerKey || "",
      memberId: policy.memberId || "",
      correlationId: check.id,
    });

    let finalStatus: "VERIFIED" | "NEEDS_REVIEW" | "FAILED" = "FAILED";
    let summaryLine = "Unknown error";
    let responsePayload: Prisma.InputJsonValue | undefined;
    let reviewNote: string | null = null;

    if (result.ok) {
      finalStatus = result.data.outcome;
      summaryLine = result.data.summary;
      responsePayload = result.data as unknown as Prisma.InputJsonValue;
      
      if (finalStatus === "NEEDS_REVIEW" || finalStatus === "FAILED") {
        reviewNote = "System-generated: Result requires staff review.";
      }
    } else {
      finalStatus = "FAILED";
      summaryLine = result.error.message;
      responsePayload = {
        code: result.error.code,
        message: result.error.message,
        retryable: result.error.retryable,
      } satisfies Prisma.InputJsonObject;
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
