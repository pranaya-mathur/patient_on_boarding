"use client";

import { cn } from "@/lib/utils";
import type { StaffDashboardFilters as Filters } from "@/types/staff-dashboard";

type StaffDashboardFiltersProps = {
  value: Filters;
  onChange: (next: Filters) => void;
  className?: string;
};

const intakeOptions: { value: Filters["intake"]; label: string }[] = [
  { value: "ALL", label: "All intake states" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "SUBMITTED", label: "Submitted" },
];

const eligibilityOptions: { value: Filters["eligibility"]; label: string }[] = [
  { value: "ALL", label: "All eligibility" },
  { value: "NOT_RUN", label: "Not run" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "NEEDS_REVIEW", label: "Needs review" },
  { value: "FAILED", label: "Failed" },
];

const reminderOptions: { value: Filters["reminder"]; label: string }[] = [
  { value: "ALL", label: "All reminders" },
  { value: "NONE", label: "None" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

const checkInOptions: { value: Filters["checkIn"]; label: string }[] = [
  { value: "ALL", label: "All check-ins" },
  { value: "NOT_CHECKED_IN", label: "Not checked in" },
  { value: "CHECKED_IN", label: "Checked in" },
];

const selectClass = cn(
  "h-11 w-full min-w-0 rounded-md border border-border/90 bg-background px-3 text-sm font-medium text-foreground",
  "outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring/80 focus-visible:ring-[3px] focus-visible:ring-ring/20",
  "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/25",
);

export function StaffDashboardFilters({ value, onChange, className }: StaffDashboardFiltersProps) {
  const patch = (partial: Partial<Filters>) => onChange({ ...value, ...partial });

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4",
        "rounded-xl border border-border/70 bg-card/80 p-5 shadow-elevate backdrop-blur-sm",
        className,
      )}
    >
      <label className="grid gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Intake</span>
        <select className={selectClass} value={value.intake} onChange={(e) => patch({ intake: e.target.value as Filters["intake"] })}>
          {intakeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Eligibility</span>
        <select
          className={selectClass}
          value={value.eligibility}
          onChange={(e) => patch({ eligibility: e.target.value as Filters["eligibility"] })}
        >
          {eligibilityOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Reminder</span>
        <select className={selectClass} value={value.reminder} onChange={(e) => patch({ reminder: e.target.value as Filters["reminder"] })}>
          {reminderOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Check-in</span>
        <select className={selectClass} value={value.checkIn} onChange={(e) => patch({ checkIn: e.target.value as Filters["checkIn"] })}>
          {checkInOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
