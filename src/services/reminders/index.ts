export type {
  ReminderCancelResult,
  ReminderCancelSuccess,
  ReminderChannel,
  ReminderScheduleRequest,
  ReminderScheduleResult,
  ReminderScheduleSuccess,
  ReminderService,
  ReminderTemplateKey,
} from "./types";
export { MockReminderService, createMockReminderService } from "./mock-reminder.service";

/**
 * Schedule visit reminders for a patient.
 */
export async function scheduleReminders(patientId: string): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { patientId },
    });

    if (!appointment) return;

    const visitTime = appointment.scheduledAt.getTime();
    const now = Date.now();

    const reminders = [
      {
        offset: 48 * 60 * 60 * 1000,
        template: "visit_reminder_48h",
        channels: ["SMS", "EMAIL"] as const,
      },
      {
        offset: 24 * 60 * 60 * 1000,
        template: "visit_reminder_24h",
        channels: ["SMS", "EMAIL"] as const,
      },
      {
        offset: 2 * 60 * 60 * 1000,
        template: "checkin_nudge_2h",
        channels: ["SMS"] as const,
      },
    ];

    for (const r of reminders) {
      const scheduledFor = new Date(visitTime - r.offset);
      
      // Skip if time already passed
      if (scheduledFor.getTime() < now) continue;

      for (const channel of r.channels) {
        await prisma.communicationLog.create({
          data: {
            patientId,
            channel,
            templateKey: r.template,
            scheduledFor,
            status: "SCHEDULED",
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: "COMMUNICATION_SCHEDULED",
        entityType: "Patient",
        entityId: patientId,
        metadata: {
          count: reminders.length,
        },
      },
    });
  } catch (error) {
    console.error(`[reminders:schedule] Error for patient ${patientId}:`, error);
  }
}
