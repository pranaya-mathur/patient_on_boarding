import type { AdapterResult } from "@/services/shared/adapter-result";

export type ReminderChannel = "SMS" | "EMAIL";

export type ReminderTemplateKey = "visit_reminder" | "intake_nudge";

export type ReminderScheduleRequest = {
  patientId: string;
  channel: ReminderChannel;
  /** ISO 8601 instant */
  sendAtIso: string;
  /** Known keys in MVP; allow `string` for future templates without adapter churn */
  templateKey: ReminderTemplateKey | string;
  correlationId?: string;
};

export type ReminderScheduleSuccess = {
  communicationId: string;
  /** Twilio SID, SES id, etc. */
  externalId?: string;
  /** Echo or normalized schedule time from provider */
  scheduledForIso: string;
};

export type ReminderScheduleResult = AdapterResult<ReminderScheduleSuccess>;

export type ReminderCancelSuccess = {
  cancelled: boolean;
  communicationId: string;
};

export type ReminderCancelResult = AdapterResult<ReminderCancelSuccess>;

/**
 * Schedules patient reminders (SMS / email). Real impls enqueue workers or call vendors.
 */
export interface ReminderService {
  readonly providerKey: string;
  schedule(request: ReminderScheduleRequest): Promise<ReminderScheduleResult>;
  /** Optional — implement when your vendor supports cancellation */
  cancel?(communicationId: string, correlationId?: string): Promise<ReminderCancelResult>;
}
