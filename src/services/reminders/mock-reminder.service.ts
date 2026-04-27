import { failureResult, successResult } from "@/services/shared/adapter-result";
import type {
  ReminderCancelResult,
  ReminderScheduleRequest,
  ReminderScheduleResult,
  ReminderService,
} from "./types";

/**
 * Mock reminder pipeline — validates windows; simulates enqueue failures.
 * Swap for Twilio / SES / queue publisher implementing {@link ReminderService}.
 */
export class MockReminderService implements ReminderService {
  readonly providerKey = "mock_reminders";

  async schedule(request: ReminderScheduleRequest): Promise<ReminderScheduleResult> {
    if (request.sendAtIso.includes("fail-hard")) {
      return failureResult({
        code: "REMINDER_REJECTED",
        message: "Mock: send window blocked by policy (non-retryable).",
        retryable: false,
        transient: false,
        details: { templateKey: request.templateKey },
      });
    }

    if (request.sendAtIso.includes("fail") || request.sendAtIso.includes("unavailable")) {
      return failureResult({
        code: "REMINDER_UPSTREAM_UNAVAILABLE",
        message: "Mock: provider unavailable — retry later.",
        retryable: true,
        transient: true,
        retryAfterMs: 1500,
        details: { channel: request.channel },
      });
    }

    const communicationId = `mock-comm-${request.patientId}-${request.templateKey}`;

    return successResult(
      {
        communicationId,
        externalId: `mock-ext-${request.correlationId ?? communicationId.slice(-10)}`,
        scheduledForIso: request.sendAtIso,
      },
      { providerRequestId: `mock-schedule-${communicationId}` },
    );
  }

  async cancel(communicationId: string, correlationId?: string): Promise<ReminderCancelResult> {
    if (communicationId.includes("fail")) {
      return failureResult({
        code: "REMINDER_CANCEL_REJECTED",
        message: "Mock: cancel not supported for this id (simulated).",
        retryable: false,
        transient: false,
        details: { communicationId, correlationId },
      });
    }
    return successResult({ cancelled: true, communicationId });
  }
}

export function createMockReminderService(): ReminderService {
  return new MockReminderService();
}
