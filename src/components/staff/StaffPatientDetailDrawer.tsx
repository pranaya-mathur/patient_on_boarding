"use client";

import { Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { ExceptionChip, OperationsStatusBadge } from "@/components/staff/OperationsStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { StaffPatientRow } from "@/types/staff-dashboard";

function formatVisit(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatUpdated(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

type StaffPatientDetailDrawerProps = {
  patient: StaffPatientRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StaffPatientDetailDrawer({ patient, open, onOpenChange }: StaffPatientDetailDrawerProps) {
  const flags: { key: string; label: string }[] = [];
  if (patient.exceptions.needsReview) flags.push({ key: "review", label: "Needs review" });
  if (patient.exceptions.ocrFailed) flags.push({ key: "ocr", label: "OCR failed" });
  if (patient.exceptions.reminderFailed) flags.push({ key: "rem", label: "Reminder failed" });
  if (patient.exceptions.missingConsent) flags.push({ key: "consent", label: "Missing consent" });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full max-h-dvh w-full max-w-none flex-col gap-0 overflow-hidden border-l border-border/70 bg-card p-0 shadow-elevate sm:max-w-lg lg:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-2 border-b border-border/70 bg-muted/15 px-5 py-5 text-left sm:px-6">
          <SheetTitle className="pr-10 font-serif text-xl leading-tight">{patient.displayName}</SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            Session token <span className="font-mono text-foreground">{patient.intakeTokenShort}</span> · Updated{" "}
            {formatUpdated(patient.lastUpdatedAt)}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-7 px-5 py-6 sm:px-6">
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</h3>
              <div className="flex flex-wrap gap-2">
                <OperationsStatusBadge domain="intake" value={patient.intakeStatus} />
                <OperationsStatusBadge domain="eligibility" value={patient.eligibilityStatus} />
                <OperationsStatusBadge domain="reminder" value={patient.reminderStatus} />
                <OperationsStatusBadge domain="checkIn" value={patient.checkInStatus} />
              </div>
            </section>

            {flags.length ? (
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Exceptions</h3>
                <div className="flex flex-wrap gap-2">
                  {flags.map((f) => (
                    <ExceptionChip key={f.key} label={f.label} />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Staff actions here will write to the audit log when wired to the API layer.
                </p>
              </section>
            ) : null}

            <Separator />

            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Visit</h3>
              <p className="text-sm font-medium text-foreground">{patient.appointmentLabel}</p>
              <p className="text-sm tabular-nums text-muted-foreground">{formatVisit(patient.appointmentAt)}</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Coverage</h3>
              <p className="text-sm text-foreground">{patient.payerLabel}</p>
              <p className="font-mono text-xs text-muted-foreground">Member {patient.memberIdHint}</p>
            </section>

            {patient.intakeNote ? (
              <section className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Staff note</h3>
                <p className="mt-1 text-sm text-foreground">{patient.intakeNote}</p>
              </section>
            ) : null}

            <Separator />

            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Activity</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Smartphone className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
                  <span>Reminder channel and delivery logs will appear here.</span>
                </li>
                <li className="flex gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
                  <span>Email confirmations and intake edits will be listed chronologically.</span>
                </li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border/70 bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" size="sm" disabled>
            Mark reviewed
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            Resend reminder
          </Button>
          <Link
            href="/intake/demo-token"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "inline-flex w-full items-center justify-center sm:w-auto",
            )}
          >
            Preview intake (demo)
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
