import { prisma } from "@/lib/prisma";

/**
 * Process all reminders that are due for delivery.
 */
export async function processDueReminders(): Promise<void> {
  const now = new Date();

  // Find all scheduled reminders that are due
  const dueReminders = await prisma.communicationLog.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      patient: true,
    },
  });

  if (dueReminders.length === 0) return;

  console.log(`[reminders:process] Found ${dueReminders.length} due reminders`);

  for (const log of dueReminders) {
    try {
      // Mock sending
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[reminders:send] Sending ${log.templateKey} to ${log.patient.legalFirstName} via ${log.channel}`
        );
      }

      // Update status to SENT
      await prisma.communicationLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[reminders:process] Error sending reminder ${log.id}:`, error);
      
      await prisma.communicationLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}
