import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PatientAppShellProps = {
  children: ReactNode;
  /** e.g. "Step 1 of 5" — optional breadcrumb for intake */
  stepLabel?: string;
};

/**
 * Calm, single-column patient shell — mobile-first, generous spacing.
 * Later: progress indicator + embedded `ChatWidget` slot.
 */
export function PatientAppShell({ children, stepLabel }: PatientAppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/80 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold tracking-tight text-foreground">Pre-visit intake</p>
            {stepLabel ? <p className="text-sm text-muted">{stepLabel}</p> : null}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-md border border-border bg-background px-2.5 py-1",
              "text-xs font-medium text-muted",
            )}
            title="Demo environment"
          >
            Demo
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8">{children}</main>
      <footer className="mx-auto max-w-lg px-5 pb-10 pt-4 text-center text-xs text-muted">
        Secure intake · Your information is protected
      </footer>
    </div>
  );
}
