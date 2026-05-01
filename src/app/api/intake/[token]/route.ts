import { NextRequest, NextResponse } from "next/server";
import type { LegalSex, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  demographicsAutosaveSchema,
  insuranceAutosaveSchema,
} from "@/schemas/intake-form";
import { z } from "zod";

const autosaveSchema = z.object({
  demographics: demographicsAutosaveSchema.optional(),
  insurance: insuranceAutosaveSchema.optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    // Validate partial input
    const validation = autosaveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { demographics, insurance } = validation.data;

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

    // Prepare update data for Patient
    let patientUpdate: Prisma.PatientUpdateInput = {};
    if (demographics) {
      const { dateOfBirth, legalSex, ...demographicsRest } = demographics;
      patientUpdate = {
        ...demographicsRest,
        ...(dateOfBirth && dateOfBirth !== ""
          ? { dateOfBirth: new Date(dateOfBirth) }
          : {}),
        ...(legalSex && legalSex !== "" ? { legalSex: legalSex as LegalSex } : {}),
      };
    }

    // Set status to IN_PROGRESS if NOT_STARTED
    if (patient.intakeStatus === "NOT_STARTED") {
      patientUpdate.intakeStatus = "IN_PROGRESS";
    }

    let policyId: string | undefined;

    // Execute updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Update patient demographics
      if (Object.keys(patientUpdate).length > 0) {
        await tx.patient.update({
          where: { id: patient.id },
          data: patientUpdate,
        });
      }

      // Upsert primary insurance policy
      if (insurance) {
        const primaryPolicy = patient.insurancePolicies[0];
        const policyData = {
          payerKey: insurance.primaryPayerId,
          memberId: insurance.memberId,
          groupNumber: insurance.groupNumber,
          relationship: insurance.subscriberRelationship,
          isPrimary: true,
        };

        // Filter out undefined values
        const cleanPolicyData = Object.fromEntries(
          Object.entries(policyData).filter(([, v]) => v !== undefined)
        );

        if (primaryPolicy) {
          const updated = await tx.insurancePolicy.update({
            where: { id: primaryPolicy.id },
            data: cleanPolicyData,
          });
          policyId = updated.id;
        } else if (cleanPolicyData.payerKey && cleanPolicyData.memberId) {
          // Only create if we have the minimum required fields for a draft
          const created = await tx.insurancePolicy.create({
            data: {
              ...cleanPolicyData,
              payerKey: cleanPolicyData.payerKey as string,
              memberId: cleanPolicyData.memberId as string,
              patientId: patient.id,
            },
          });
          policyId = created.id;
        }
      } else {
        policyId = patient.insurancePolicies[0]?.id;
      }

      // Write AuditLog
      await tx.auditLog.create({
        data: {
          action: "PATIENT_INTAKE_UPDATED",
          entityType: "Patient",
          entityId: patient.id,
          metadata: {
            updatedFields: Object.keys(body),
          },
        },
      });
    });

    return NextResponse.json({ ok: true, policyId });
  } catch (error) {
    console.error("[api:intake:autosave:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
