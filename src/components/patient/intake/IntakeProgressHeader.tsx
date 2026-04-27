"use client";

import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Welcome", short: "Start" },
  { id: 2, label: "About you", short: "You" },
  { id: 3, label: "Insurance", short: "Plan" },
  { id: 4, label: "Review", short: "Sign" },
] as const;

type IntakeProgressHeaderProps = {
  currentStep: number;
};

/**
 * Linear progress + step labels — calm hierarchy, no decorative noise.
 */
export function IntakeProgressHeader({ currentStep }: IntakeProgressHeaderProps) {
  const total = STEPS.length;
  const clamped = Math.min(Math.max(currentStep, 1), total);
  const progressValue = total > 1 ? ((clamped - 1) / (total - 1)) * 100 : 100;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">Progress</p>
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
            Step <span className="font-semibold text-foreground">{clamped}</span> of {total}
          </p>
        </div>
        <p className="pb-0.5 text-right text-[11px] tabular-nums text-muted-foreground">{Math.round(progressValue)}%</p>
      </div>

      <Progress value={Number.isFinite(progressValue) ? progressValue : 0} className="gap-2">
        <span className="sr-only">Intake {Math.round(progressValue)} percent complete</span>
        <ProgressTrack className="h-[3px] overflow-hidden rounded-full bg-border/80">
          <ProgressIndicator className="rounded-full bg-primary/90" />
        </ProgressTrack>
      </Progress>

      <div className="relative pt-1">
        <div className="absolute top-[15px] right-[12.5%] left-[12.5%] hidden h-px bg-border/90 sm:block" aria-hidden />
        <ol className="relative grid grid-cols-4 gap-2 text-center sm:gap-3">
          {STEPS.map((s) => {
            const active = s.id === clamped;
            const complete = s.id < clamped;
            return (
              <li key={s.id} className="flex min-w-0 flex-col items-center gap-2">
                <span
                  className={cn(
                    "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition-colors duration-200 sm:size-9 sm:text-xs",
                    complete && "border-primary/35 bg-primary/[0.11] text-primary",
                    active &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0_/0.06)] ring-2 ring-primary/15 ring-offset-2 ring-offset-background",
                    !active && !complete && "border-border/90 bg-card text-muted-foreground shadow-sm",
                  )}
                >
                  {s.id}
                </span>
                <span
                  className={cn(
                    "w-full max-w-[5.5rem] text-[10px] font-medium leading-snug text-muted-foreground sm:max-w-none sm:text-[11px]",
                    active && "text-foreground",
                  )}
                >
                  <span className="sm:hidden">{s.short}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
