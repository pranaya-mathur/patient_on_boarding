"use client";

import { AlertTriangle, FileWarning, Inbox, MessageSquareWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffDashboardFilters } from "@/types/staff-dashboard";

type QueueDef = {
  id: Exclude<StaffDashboardFilters["exceptionQueue"], "ALL">;
  title: string;
  description: string;
  count: number;
  icon: typeof Inbox;
};

type StaffExceptionQueuesProps = {
  queues: QueueDef[];
  active: StaffDashboardFilters["exceptionQueue"];
  onSelect: (id: StaffDashboardFilters["exceptionQueue"]) => void;
};

export function StaffExceptionQueues({ queues, active, onSelect }: StaffExceptionQueuesProps) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Exception queues</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">Focus the roster on work that needs attention</p>
        </div>
        {active !== "ALL" ? (
          <button
            type="button"
            className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            onClick={() => onSelect("ALL")}
          >
            Clear queue focus
          </button>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {queues.map((q) => {
          const Icon = q.icon;
          const isActive = active === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(isActive ? "ALL" : q.id)}
              className={cn(
                "group flex flex-col gap-4 rounded-xl border p-5 text-left transition-[border-color,box-shadow,background-color] duration-150",
                "bg-card/90 shadow-sm hover:border-primary/25 hover:shadow-elevate",
                isActive ? "border-primary/40 bg-primary/[0.04] shadow-elevate ring-1 ring-primary/20" : "border-border/70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border transition-colors",
                    isActive ? "border-primary/25 bg-primary/[0.1] text-primary" : "border-border/70 bg-muted/35 text-muted-foreground",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">{q.count}</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold leading-snug text-foreground">{q.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{q.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const exceptionQueueMeta: Record<
  Exclude<StaffDashboardFilters["exceptionQueue"], "ALL">,
  { title: string; description: string; icon: typeof Inbox }
> = {
  needs_review: {
    title: "Needs review",
    description: "Eligibility or policy exceptions requiring staff eyes",
    icon: AlertTriangle,
  },
  ocr_failed: {
    title: "OCR failed",
    description: "Card images that could not be read reliably",
    icon: FileWarning,
  },
  reminder_failed: {
    title: "Reminder failed",
    description: "SMS or email delivery errors",
    icon: MessageSquareWarning,
  },
  missing_consent: {
    title: "Missing consent",
    description: "Submitted intake missing required attestations",
    icon: Inbox,
  },
};
