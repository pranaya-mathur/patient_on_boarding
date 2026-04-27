import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ ok: false, error: "Token is required" }, { status: 400 });
    }

    // Look up appointment by token
    const appointment = await prisma.appointment.findFirst({
      where: {
        checkinToken: token,
        checkinTokenExpiresAt: {
          gt: new Date(),
        },
      },
      include: {
        patient: true,
        checkIns: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired check-in link" },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (appointment.checkIns.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Already checked in for this appointment" },
        { status: 409 }
      );
    }

    // Create CheckIn row
    await prisma.$transaction(async (tx) => {
      const checkIn = await tx.checkIn.create({
        data: {
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          method: "LINK",
          sourceToken: token,
        },
      });

      // Write AuditLog
      await tx.auditLog.create({
        data: {
          action: "CHECK_IN_RECORDED",
          entityType: "CheckIn",
          entityId: checkIn.id,
          metadata: {
            appointmentId: appointment.id,
            method: "LINK",
          },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      patientName: `${appointment.patient.legalFirstName} ${appointment.patient.legalLastName}`,
      appointmentTime: appointment.scheduledAt,
    });
  } catch (error) {
    console.error("[api:checkin:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
