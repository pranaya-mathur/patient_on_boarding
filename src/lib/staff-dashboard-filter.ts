import type { StaffDashboardFilters, StaffPatientRow } from "@/types/staff-dashboard";

function matchesException(row: StaffPatientRow, q: StaffDashboardFilters["exceptionQueue"]): boolean {
  if (q === "ALL") return true;
  if (q === "needs_review") return row.exceptions.needsReview;
  if (q === "ocr_failed") return row.exceptions.ocrFailed;
  if (q === "reminder_failed") return row.exceptions.reminderFailed;
  return row.exceptions.missingConsent;
}

export function filterStaffPatients(rows: StaffPatientRow[], f: StaffDashboardFilters): StaffPatientRow[] {
  return rows.filter((row) => {
    if (f.intake !== "ALL" && row.intakeStatus !== f.intake) return false;
    if (f.eligibility !== "ALL" && row.eligibilityStatus !== f.eligibility) return false;
    if (f.reminder !== "ALL" && row.reminderStatus !== f.reminder) return false;
    if (f.checkIn !== "ALL" && row.checkInStatus !== f.checkIn) return false;
    if (!matchesException(row, f.exceptionQueue)) return false;
    return true;
  });
}

export function countExceptionQueue(rows: StaffPatientRow[], q: Exclude<StaffDashboardFilters["exceptionQueue"], "ALL">): number {
  return rows.filter((r) => matchesException(r, q)).length;
}
