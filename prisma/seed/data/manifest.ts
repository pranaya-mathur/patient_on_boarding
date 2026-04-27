/**
 * Documents what the seed pipeline will populate as the schema grows.
 * Keeps a single place to read “what demo data exists” without scanning files.
 */
export const SEED_MANIFEST = {
  phases: [
    { id: "staff", description: "Demo staff users for dashboard login (MVP)", status: "active" as const },
    { id: "patients", description: "Demo patients across intake queues", status: "planned" as const },
    { id: "appointments", description: "Linked appointments + check-in samples", status: "planned" as const },
    { id: "insurance", description: "Policies, cards, eligibility outcomes", status: "planned" as const },
    { id: "comms", description: "Reminder / SMS / email CommunicationLog rows", status: "planned" as const },
  ],
} as const;

export function logSeedPlan() {
  console.info("[seed] Manifest:");
  for (const p of SEED_MANIFEST.phases) {
    console.info(`  - ${p.id} (${p.status}): ${p.description}`);
  }
}
