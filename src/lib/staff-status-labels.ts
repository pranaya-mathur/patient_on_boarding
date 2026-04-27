import type {
  CheckInStatus,
  EligibilityStatus,
  IntakeStatus,
  ReminderStatus,
} from "@/types/staff-dashboard";

export function intakeStatusLabel(s: IntakeStatus): string {
  switch (s) {
    case "NOT_STARTED":
      return "Not started";
    case "IN_PROGRESS":
      return "In progress";
    case "SUBMITTED":
      return "Submitted";
  }
}

export function eligibilityStatusLabel(s: EligibilityStatus): string {
  switch (s) {
    case "NOT_RUN":
      return "Not run";
    case "PENDING":
      return "Pending";
    case "VERIFIED":
      return "Verified";
    case "NEEDS_REVIEW":
      return "Needs review";
    case "FAILED":
      return "Failed";
  }
}

export function reminderStatusLabel(s: ReminderStatus): string {
  switch (s) {
    case "NONE":
      return "None";
    case "SCHEDULED":
      return "Scheduled";
    case "SENT":
      return "Sent";
    case "FAILED":
      return "Failed";
  }
}

export function checkInStatusLabel(s: CheckInStatus): string {
  switch (s) {
    case "NOT_CHECKED_IN":
      return "Not checked in";
    case "CHECKED_IN":
      return "Checked in";
  }
}
