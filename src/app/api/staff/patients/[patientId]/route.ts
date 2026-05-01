import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { patientId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointment: true,
        insurancePolicies: {
          include: {
            insuranceCards: true,
            eligibilityChecks: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        consents: true,
        communicationLogs: {
          orderBy: { createdAt: "desc" },
        },
        checkIns: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ ok: false, error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: patient });
  } catch (error) {
    console.error("[api:staff:patient:detail:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { patientId } = await params;
    const { action, note } = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        insurancePolicies: {
          where: { isPrimary: true },
          include: {
            eligibilityChecks: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ ok: false, error: "Patient not found" }, { status: 404 });
    }

    if (action === "resend_intake") {
      await prisma.$transaction(async (tx) => {
        const log = await tx.communicationLog.create({
          data: {
            patientId,
            channel: "EMAIL",
            templateKey: "intake_resend",
            status: "SENT",
            sentAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            staffUserId: session.user.id,
            action: "COMMUNICATION_RESENT",
            entityType: "Patient",
            entityId: patientId,
            metadata: { logId: log.id },
          },
        });
      });
    } else if (action === "mark_eligibility_verified") {
      const latestCheck = patient.insurancePolicies[0]?.eligibilityChecks[0];
      if (!latestCheck) {
        return NextResponse.json(
          { ok: false, error: "No eligibility check found to verify" },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.eligibilityCheck.update({
          where: { id: latestCheck.id },
          data: {
            status: "VERIFIED",
            reviewedAt: new Date(),
            reviewedByStaffUserId: session.user.id,
          },
        });

        await tx.auditLog.create({
          data: {
            staffUserId: session.user.id,
            action: "ELIGIBILITY_STATUS_CHANGED",
            entityType: "EligibilityCheck",
            entityId: latestCheck.id,
            metadata: { from: latestCheck.status, to: "VERIFIED" },
          },
        });
      });
    } else if (action === "add_note") {
      const latestCheck = patient.insurancePolicies[0]?.eligibilityChecks[0];
      if (!latestCheck) {
        return NextResponse.json(
          { ok: false, error: "No eligibility check found to add note" },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.eligibilityCheck.update({
          where: { id: latestCheck.id },
          data: { reviewNote: note },
        });

        await tx.auditLog.create({
          data: {
            staffUserId: session.user.id,
            action: "ELIGIBILITY_REVIEW_NOTE_ADDED",
            entityType: "EligibilityCheck",
            entityId: latestCheck.id,
            metadata: { note },
          },
        });
      });
    } else {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api:staff:patient:action:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
