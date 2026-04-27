"use client";

import { ChevronRight } from "lucide-react";
import { ExceptionChip, OperationsStatusBadge } from "@/components/staff/OperationsStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { StaffPatientRow } from "@/types/staff-dashboard";

function formatVisit(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatUpdated(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function exceptionLabels(row: StaffPatientRow): string[] {
  const out: string[] = [];
  if (row.exceptions.needsReview) out.push("Review");
  if (row.exceptions.ocrFailed) out.push("OCR");
  if (row.exceptions.reminderFailed) out.push("Reminder");
  if (row.exceptions.missingConsent) out.push("Consent");
  return out;
}

type StaffPatientTableProps = {
  rows: StaffPatientRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const headClass = "h-11 py-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export function StaffPatientTable({ rows, selectedId, onSelect }: StaffPatientTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card/40 shadow-sm">
      <Table className="min-w-[920px] text-[15px]">
      <TableHeader>
        <TableRow className="border-border/60 bg-muted/25 hover:bg-muted/25">
          <TableHead className={cn(headClass, "w-[260px] pl-5")}>Patient</TableHead>
          <TableHead className={cn(headClass, "hidden w-[200px] md:table-cell")}>Visit</TableHead>
          <TableHead className={cn(headClass, "hidden w-[168px] lg:table-cell")}>Coverage</TableHead>
          <TableHead className={headClass}>Intake</TableHead>
          <TableHead className={headClass}>Eligibility</TableHead>
          <TableHead className={cn(headClass, "hidden xl:table-cell")}>Reminder</TableHead>
          <TableHead className={headClass}>Check-in</TableHead>
          <TableHead className={cn(headClass, "hidden w-[148px] lg:table-cell")}>Flags</TableHead>
          <TableHead className={cn(headClass, "w-10 pr-5 text-right")}>
            <span className="sr-only">Open</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const flags = exceptionLabels(row);
          const active = row.id === selectedId;
          return (
            <TableRow
              key={row.id}
              data-state={active ? "selected" : undefined}
              className={cn(
                "cursor-pointer border-border/50 transition-colors duration-150",
                "hover:bg-muted/40",
                active &&
                  "border-primary/[0.08] bg-primary/[0.05] hover:bg-primary/[0.07] data-[state=selected]:bg-primary/[0.05] data-[state=selected]:hover:bg-primary/[0.07]",
              )}
              onClick={() => onSelect(row.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(row.id);
                }
              }}
              tabIndex={0}
              aria-selected={active}
            >
              <TableCell className="whitespace-normal pl-5 align-top py-3.5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-semibold leading-snug text-foreground">{row.displayName}</span>
                  <span className="font-mono text-xs text-muted-foreground">Token {row.intakeTokenShort}</span>
                  {row.intakeNote ? (
                    <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">{row.intakeNote}</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="hidden whitespace-normal align-top py-3.5 md:table-cell">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{row.appointmentLabel}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{formatVisit(row.appointmentAt)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden whitespace-normal align-top py-3.5 lg:table-cell">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm text-foreground">{row.payerLabel}</span>
                  <span className="font-mono text-xs text-muted-foreground">{row.memberIdHint}</span>
                </div>
              </TableCell>
              <TableCell className="align-top py-3.5">
                <OperationsStatusBadge domain="intake" value={row.intakeStatus} />
              </TableCell>
              <TableCell className="align-top py-3.5">
                <OperationsStatusBadge domain="eligibility" value={row.eligibilityStatus} />
              </TableCell>
              <TableCell className="hidden align-top py-3.5 xl:table-cell">
                <OperationsStatusBadge domain="reminder" value={row.reminderStatus} />
              </TableCell>
              <TableCell className="align-top py-3.5">
                <OperationsStatusBadge domain="checkIn" value={row.checkInStatus} />
              </TableCell>
              <TableCell className="hidden whitespace-normal align-top py-3.5 lg:table-cell">
                <div className="flex max-w-[148px] flex-wrap gap-1.5">
                  {flags.length ? (
                    flags.map((f) => <ExceptionChip key={f} label={f} />)
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="pr-5 text-right align-middle text-muted-foreground py-3.5">
                <div className="flex flex-col items-end gap-1">
                  <ChevronRight className="size-4 opacity-60" aria-hidden />
                  <span className="text-[10px] tabular-nums text-muted-foreground lg:hidden">{formatUpdated(row.lastUpdatedAt)}</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
}

export function StaffPatientTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card/40 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-muted/25 px-5 py-3.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="hidden h-2.5 w-16 md:block" />
        <Skeleton className="hidden h-2.5 w-20 lg:block" />
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="hidden h-2.5 w-14 xl:block" />
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="ml-auto hidden h-2.5 w-10 lg:block" />
      </div>
      <div className="divide-y divide-border/55">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-wrap items-center gap-4 px-5 py-3.5 sm:flex-nowrap">
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 sm:min-w-[220px]">
              <Skeleton className="h-4 w-[55%] max-w-[200px]" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="hidden h-10 w-36 shrink-0 md:block" />
            <div className="flex flex-wrap gap-2 sm:contents">
              <Skeleton className="h-6 w-[4.5rem] rounded-md" />
              <Skeleton className="h-6 w-[5.25rem] rounded-md" />
              <Skeleton className="hidden h-6 w-[4.5rem] rounded-md xl:block" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <Skeleton className="h-4 w-10 shrink-0 rounded sm:ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
