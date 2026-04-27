/** Constrained payer list for MVP — matches eligibility mock keys later. */
export const INTAKE_PAYERS = [
  { id: "demo_east", label: "Demo Health — East" },
  { id: "demo_west", label: "Demo Health — West" },
  { id: "demo_midwest", label: "Demo Health — Midwest" },
] as const;

export type IntakePayerId = (typeof INTAKE_PAYERS)[number]["id"];
