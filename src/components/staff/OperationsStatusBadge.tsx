"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  checkInStatusLabel,
  eligibilityStatusLabel,
  intakeStatusLabel,
  reminderStatusLabel,
} from "@/lib/staff-status-labels";
import type {
  CheckInStatus,
  EligibilityStatus,
  IntakeStatus,
  ReminderStatus,
} from "@/types/staff-dashboard";

type BadgeTone = "neutral" | "pending" | "positive" | "risk" | "critical";

function toneClasses(tone: BadgeTone) {
  switch (tone) {
    case "neutral":
      return "border-border/70 bg-muted/30 text-foreground/90 shadow-none";
    case "pending":
      return "border-stone-300/70 bg-stone-50 text-stone-800 shadow-none dark:border-stone-600/60 dark:bg-stone-900/40 dark:text-stone-100";
    case "positive":
      return "border-primary/25 bg-primary/[0.09] text-primary shadow-none dark:border-primary/35 dark:bg-primary/15 dark:text-primary";
    case "risk":
      return "border-amber-900/15 bg-amber-50/90 text-amber-950 shadow-none dark:border-amber-800/40 dark:bg-amber-950/25 dark:text-amber-50";
    case "critical":
      return "border-red-900/12 bg-red-50/95 text-red-950 shadow-none dark:border-red-900/45 dark:bg-red-950/30 dark:text-red-50";
  }
}

function intakeTone(s: IntakeStatus): BadgeTone {
  if (s === "NOT_STARTED") return "neutral";
  if (s === "IN_PROGRESS") return "pending";
  return "positive";
}

function eligibilityTone(s: EligibilityStatus): BadgeTone {
  if (s === "NOT_RUN") return "neutral";
  if (s === "PENDING") return "pending";
  if (s === "VERIFIED") return "positive";
  if (s === "NEEDS_REVIEW") return "risk";
  return "critical";
}

function reminderTone(s: ReminderStatus): BadgeTone {
  if (s === "NONE") return "neutral";
  if (s === "SCHEDULED") return "pending";
  if (s === "SENT") return "positive";
  return "critical";
}

function checkInTone(s: CheckInStatus): BadgeTone {
  return s === "CHECKED_IN" ? "positive" : "neutral";
}

type OperationsStatusBadgeProps = {
  className?: string;
} & (
  | { domain: "intake"; value: IntakeStatus }
  | { domain: "eligibility"; value: EligibilityStatus }
  | { domain: "reminder"; value: ReminderStatus }
  | { domain: "checkIn"; value: CheckInStatus }
);

export function OperationsStatusBadge(props: OperationsStatusBadgeProps) {
  const { className, domain, value } = props;
  const label =
    domain === "intake"
      ? intakeStatusLabel(value)
      : domain === "eligibility"
        ? eligibilityStatusLabel(value)
        : domain === "reminder"
          ? reminderStatusLabel(value)
          : checkInStatusLabel(value);
  const tone =
    domain === "intake"
      ? intakeTone(value)
      : domain === "eligibility"
        ? eligibilityTone(value)
        : domain === "reminder"
          ? reminderTone(value)
          : checkInTone(value);

  return (
    <span
      className={cn(
        "inline-flex h-[1.375rem] max-w-full items-center truncate rounded-md border px-2 py-0 text-[10px] font-semibold tracking-[0.04em] uppercase",
        toneClasses(tone),
        className,
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Compact exception chips for table / drawer */
export function ExceptionChip({ label }: { label: string }) {
  return (
    <Badge
      variant="outline"
      className="h-[1.375rem] rounded-md border-stone-300/80 bg-stone-50/90 px-2 text-[10px] font-medium tracking-wide text-stone-800 shadow-none dark:border-stone-600/50 dark:bg-stone-900/35 dark:text-stone-100"
    >
      {label}
    </Badge>
  );
}
