import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type StaffAppShellProps = {
  children: ReactNode;
  title?: string;
};

const nav: ReadonlyArray<{ href: string; label: string; disabled?: boolean }> = [
  { href: "/staff", label: "Queues" },
  { href: "/staff/patients", label: "Patients", disabled: true },
];

/**
 * Operations-style shell — sidebar + dense content area (dashboard scaffold).
 */
export function StaffAppShell({ children, title = "Intake console" }: StaffAppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:h-[100dvh] lg:grid-cols-[248px_1fr] lg:overflow-hidden">
      <aside className="border-b border-border/80 bg-card/95 lg:flex lg:min-h-0 lg:flex-col lg:border-b-0 lg:border-r lg:border-border/70 lg:overflow-y-auto">
        <div className="flex flex-col gap-9 px-5 py-7">
          <div className="space-y-1">
            <p className="font-serif text-lg font-semibold tracking-tight text-foreground">CareFront</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Staff · MVP scaffold</p>
          </div>
          <nav className="flex flex-col gap-0.5" aria-label="Staff navigation">
            {nav.map((item) =>
              item.disabled ? (
                <span
                  key={item.label}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground/55 line-through decoration-muted-foreground/35"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors",
                    "hover:bg-muted/50",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-border/70 bg-card/95 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem]">{title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Queue overview and exceptions</p>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-7">{children}</div>
      </div>
    </div>
  );
}
