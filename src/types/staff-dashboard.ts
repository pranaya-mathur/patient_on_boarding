export type IntakeStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";

export type EligibilityStatus = "NOT_RUN" | "PENDING" | "VERIFIED" | "NEEDS_REVIEW" | "FAILED";

export type ReminderStatus = "NONE" | "SCHEDULED" | "SENT" | "FAILED";

export type CheckInStatus = "NOT_CHECKED_IN" | "CHECKED_IN";

export type ExceptionQueueId = "needs_review" | "ocr_failed" | "reminder_failed" | "missing_consent";

export type StaffPatientExceptions = {
  needsReview: boolean;
  ocrFailed: boolean;
  reminderFailed: boolean;
  missingConsent: boolean;
};

export type StaffPatientRow = {
  id: string;
  displayName: string;
  intakeTokenShort: string;
  appointmentLabel: string;
  appointmentAt: string;
  intakeStatus: IntakeStatus;
  eligibilityStatus: EligibilityStatus;
  reminderStatus: ReminderStatus;
  checkInStatus: CheckInStatus;
  payerLabel: string;
  memberIdHint: string;
  lastUpdatedAt: string;
  exceptions: StaffPatientExceptions;
  /** Optional one-line for drawer */
  intakeNote?: string;
};

export type StaffDashboardFilters = {
  intake: IntakeStatus | "ALL";
  eligibility: EligibilityStatus | "ALL";
  reminder: ReminderStatus | "ALL";
  checkIn: CheckInStatus | "ALL";
  /** When set, table shows only rows with this exception flag (AND with dropdown filters). */
  exceptionQueue: ExceptionQueueId | "ALL";
};
