import { PrismaClient } from "@prisma/client";
import { demoStaffUsers } from "./data/staff";
import { logSeedPlan } from "./data/manifest";

/**
 * Seed entrypoint. Inserts minimal demo staff only for now — expand with
 * patients/appointments once intake fields are finalized on `Patient`.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    logSeedPlan();

    for (const user of demoStaffUsers) {
      await prisma.staffUser.upsert({
        where: { email: user.email },
        create: user,
        update: { name: user.name },
      });
    }

    console.info("[seed] Demo staff upserted:", demoStaffUsers.length);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
