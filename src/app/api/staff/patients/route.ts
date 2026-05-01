import { NextRequest, NextResponse } from "next/server";
import type { EligibilityStatus, IntakeStatus, Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const INTAKE_STATUSES: IntakeStatus[] = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "ABANDONED"];
const ELIGIBILITY_STATUSES: EligibilityStatus[] = [
  "NOT_RUN",
  "PENDING",
  "VERIFIED",
  "NEEDS_REVIEW",
  "FAILED",
];

function parseIntakeStatus(value: string | null): IntakeStatus | undefined {
  if (!value) return undefined;
  return INTAKE_STATUSES.includes(value as IntakeStatus) ? (value as IntakeStatus) : undefined;
}

function parseEligibilityStatus(value: string | null): EligibilityStatus | undefined {
  if (!value) return undefined;
  return ELIGIBILITY_STATUSES.includes(value as EligibilityStatus)
    ? (value as EligibilityStatus)
    : undefined;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "25");
    const intakeStatus = searchParams.get("intakeStatus");
    const eligibilityStatus = searchParams.get("eligibilityStatus");
    const checkinStatus = searchParams.get("checkinStatus");
    const search = searchParams.get("search");

    const skip = (page - 1) * perPage;

    // Build filters
    const where: Prisma.PatientWhereInput = {};

    const parsedIntake = parseIntakeStatus(intakeStatus);
    if (parsedIntake) {
      where.intakeStatus = parsedIntake;
    }

    if (search) {
      where.OR = [
        { legalFirstName: { contains: search } },
        { legalLastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const parsedEligibility = parseEligibilityStatus(eligibilityStatus);
    if (parsedEligibility) {
      where.insurancePolicies = {
        some: {
          eligibilityChecks: {
            some: {
              status: parsedEligibility,
            },
          },
        },
      };
    }

    if (checkinStatus) {
      if (checkinStatus === "CHECKED_IN") {
        where.checkIns = { some: {} };
      } else {
        where.checkIns = { none: {} };
      }
    }

    // Query patients with relations
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          appointment: true,
          checkIns: {
            take: 1,
            orderBy: { checkedInAt: "desc" },
          },
          consents: true,
          insurancePolicies: {
            where: { isPrimary: true },
            include: {
              insuranceCards: true,
              eligibilityChecks: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
          communicationLogs: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.patient.count({ where }),
    ]);

    // Transform for UI
    const data = patients.map((p) => {
      const primaryPolicy = p.insurancePolicies[0];
      const latestEligibility = primaryPolicy?.eligibilityChecks[0];
      const latestComm = p.communicationLogs[0];
      const checkIn = p.checkIns[0];

      // Calculate exceptions
      const exceptions = {
        needsReview: latestEligibility?.status === "NEEDS_REVIEW",
        ocrFailed: primaryPolicy?.insuranceCards.some(c => c.ocrStatus === "FAILED") || false,
        reminderFailed: latestComm?.status === "FAILED",
        missingConsent: p.consents.length < 3, // Assuming 3 is the minimum required
      };

      return {
        id: p.id,
        displayName: `${p.legalFirstName} ${p.legalLastName}`,
        intakeTokenShort: p.intakeToken.slice(0, 8),
        appointmentLabel: p.appointment?.visitSummary || "Scheduled Visit",
        appointmentAt: p.appointment?.scheduledAt.toISOString() || p.createdAt.toISOString(),
        intakeStatus: p.intakeStatus,
        eligibilityStatus: latestEligibility?.status || "NOT_RUN",
        reminderStatus: latestComm?.status || "NONE",
        checkInStatus: checkIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
        payerLabel: primaryPolicy?.payerDisplayName || primaryPolicy?.payerKey || "No insurance",
        memberIdHint: primaryPolicy?.memberId ? `...${primaryPolicy.memberId.slice(-4)}` : "—",
        lastUpdatedAt: p.updatedAt.toISOString(),
        exceptions,
        intakeNote: latestEligibility?.summaryLine || undefined,
      };
    });

    return NextResponse.json({
      ok: true,
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("[api:staff:patients:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
