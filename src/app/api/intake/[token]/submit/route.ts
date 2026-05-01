import { NextRequest, NextResponse } from "next/server";
import type { LegalSex } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { intakeFormSchema } from "@/schemas/intake-form";
import { runEligibilityCheck } from "@/services/eligibility";
import { scheduleReminders } from "@/services/reminders";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    // Validate full input
    const validation = intakeFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { demographics, insurance, review } = validation.data;

    // Look up patient
    const patient = await prisma.patient.findUnique({
      where: { intakeToken: token },
      include: {
        insurancePolicies: {
          where: { isPrimary: true },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ ok: false, error: "Patient not found" }, { status: 404 });
    }

    if (patient.intakeStatus === "SUBMITTED") {
      return NextResponse.json(
        { ok: false, error: "Intake already submitted" },
        { status: 409 }
      );
    }

    let policyId: string | undefined;

    // Execute submission in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update patient demographics
      await tx.patient.update({
        where: { id: patient.id },
        data: {
          ...demographics,
          legalSex: demographics.legalSex as LegalSex,
          dateOfBirth: new Date(demographics.dateOfBirth),
          intakeStatus: "SUBMITTED",
        },
      });

      // 2. Upsert primary insurance policy
      const primaryPolicy = patient.insurancePolicies[0];
      const policyData = {
        payerKey: insurance.primaryPayerId,
        memberId: insurance.memberId,
        groupNumber: insurance.groupNumber,
        relationship: insurance.subscriberRelationship,
        isPrimary: true,
      };

      if (primaryPolicy) {
        const updatedPolicy = await tx.insurancePolicy.update({
          where: { id: primaryPolicy.id },
          data: policyData,
        });
        policyId = updatedPolicy.id;
      } else {
        const newPolicy = await tx.insurancePolicy.create({
          data: {
            ...policyData,
            patientId: patient.id,
          },
        });
        policyId = newPolicy.id;
      }

      // 3. Save consents
      const consentsToSave = [
        { key: "HIPAA_NPP", accepted: review.hipaaAcknowledged },
        { key: "TREATMENT", accepted: review.treatmentConsent },
        { key: "FINANCIAL_POLICY", accepted: review.financialPolicy },
      ];

      for (const c of consentsToSave) {
        await tx.consent.upsert({
          where: {
            patientId_consentKey_version: {
              patientId: patient.id,
              consentKey: c.key,
              version: "v1",
            },
          },
          update: {
            accepted: c.accepted,
            acceptedAt: new Date(),
          },
          create: {
            patientId: patient.id,
            consentKey: c.key,
            version: "v1",
            accepted: c.accepted,
            acceptedAt: new Date(),
          },
        });
      }

      // 4. Write AuditLog
      await tx.auditLog.create({
        data: {
          action: "PATIENT_INTAKE_STATUS_CHANGED",
          entityType: "Patient",
          entityId: patient.id,
          metadata: {
            from: patient.intakeStatus,
            to: "SUBMITTED",
          },
        },
      });
    });

    // 5. Trigger eligibility check (async, don't block response)
    if (policyId) {
      runEligibilityCheck(policyId).catch((err) =>
        console.error("[api:intake:submit:eligibility:error]", err)
      );
    }

    // 6. Schedule reminders (Task 7 requirement)
    scheduleReminders(patient.id).catch((err) =>
      console.error("[api:intake:submit:reminders:error]", err)
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api:intake:submit:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
