import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique check-in token for an appointment, valid for 24 hours.
 */
export async function generateCheckinToken(appointmentId: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      checkinToken: token,
      checkinTokenExpiresAt: expiresAt,
    },
  });

  return { token, expiresAt };
}
