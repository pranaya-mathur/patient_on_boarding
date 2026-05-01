"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffDashboardFilters, StaffPatientRow } from "@/types/staff-dashboard";
import { StaffDashboardFilters as StaffFilters } from "@/components/staff/StaffDashboardFilters";
import { exceptionQueueMeta, StaffExceptionQueues } from "@/components/staff/StaffExceptionQueues";
import { StaffPatientDetailDrawer } from "@/components/staff/StaffPatientDetailDrawer";
import { StaffPatientTable, StaffPatientTableSkeleton } from "@/components/staff/StaffPatientTable";
import { Button } from "@/components/ui/button";

const defaultFilters: StaffDashboardFilters = {
  intake: "ALL",
  eligibility: "ALL",
  reminder: "ALL",
  checkIn: "ALL",
  exceptionQueue: "ALL",
};

function sortByAppointment(a: StaffPatientRow, b: StaffPatientRow) {
  return new Date(a.appointmentAt).getTime() - new Date(b.appointmentAt).getTime();
}

export function StaffDashboardClient() {
  const [filters, setFilters] = useState<StaffDashboardFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<StaffPatientRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.intake !== "ALL") params.append("intakeStatus", filters.intake);
        if (filters.eligibility !== "ALL") params.append("eligibilityStatus", filters.eligibility);
        if (filters.checkIn !== "ALL") params.append("checkinStatus", filters.checkIn);
        // Map other filters as needed

        const res = await fetch(`/api/staff/patients?${params.toString()}`);
        const json = await res.json();
        if (json.ok) {
          setPatients(json.data);
          setTotalCount(json.pagination.total);
        }
      } catch (err) {
        console.error("[dashboard:fetch:error]", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [filters]);

  const queueCards = useMemo(() => {
    const ids = ["needs_review", "ocr_failed", "reminder_failed", "missing_consent"] as const;
    return ids.map((id) => ({
      id,
      title: exceptionQueueMeta[id].title,
      description: exceptionQueueMeta[id].description,
      icon: exceptionQueueMeta[id].icon,
      count: patients.filter(p => {
        if (id === "needs_review") return p.exceptions.needsReview;
        if (id === "ocr_failed") return p.exceptions.ocrFailed;
        if (id === "reminder_failed") return p.exceptions.reminderFailed;
        if (id === "missing_consent") return p.exceptions.missingConsent;
        return false;
      }).length,
    }));
  }, [patients]);

  const filteredRows = useMemo(() => {
    let list = patients;
    if (filters.exceptionQueue !== "ALL") {
      list = list.filter(p => {
        if (filters.exceptionQueue === "needs_review") return p.exceptions.needsReview;
        if (filters.exceptionQueue === "ocr_failed") return p.exceptions.ocrFailed;
        if (filters.exceptionQueue === "reminder_failed") return p.exceptions.reminderFailed;
        if (filters.exceptionQueue === "missing_consent") return p.exceptions.missingConsent;
        return false;
      });
    }
    return [...list].sort(sortByAppointment);
  }, [patients, filters.exceptionQueue]);

  const selectedPatient = useMemo(
    () => (selectedId ? patients.find((r) => r.id === selectedId) ?? null : null),
    [patients, selectedId],
  );

  const openDrawerFor = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedId(null);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-7 lg:gap-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Operations</p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem] sm:leading-snug">
            Patient intake roster
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Dense, glanceable view of intake, eligibility, reminders, and check-in. Select a row for full context.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 rounded-lg border border-border/70 bg-card/80 px-3.5 py-2.5 text-xs text-muted-foreground shadow-sm">
          <ClipboardList className="size-3.5 shrink-0 text-muted-foreground/80" aria-hidden />
          <span className="tabular-nums">
            <span className="font-semibold text-foreground">{filteredRows.length}</span> shown ·{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> total
          </span>
        </div>
      </div>

      <StaffExceptionQueues
        queues={queueCards}
        active={filters.exceptionQueue}
        onSelect={(id) => setFilters((f) => ({ ...f, exceptionQueue: id }))}
      />

      <StaffFilters value={filters} onChange={setFilters} />

      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/85 shadow-elevate",
          "backdrop-blur-[2px]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:px-6">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Patients</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Sorted by visit time · scroll horizontally on smaller screens
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-9 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={clearAllFilters}>
            Reset filters
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          {loading ? (
            <div className="p-4 sm:p-6">
              <StaffPatientTableSkeleton />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 px-6 py-24 text-center sm:py-28">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/25 text-muted-foreground shadow-sm">
                <Inbox className="size-6 opacity-90" aria-hidden />
              </div>
              <div className="max-w-sm space-y-2.5">
                <p className="font-serif text-lg font-semibold tracking-tight text-foreground">No patients match</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Try clearing exception focus or widening status filters. Data is demo-only until the API is wired.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" className="shadow-sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="p-0 sm:px-2 sm:pb-3 sm:pt-2">
              <StaffPatientTable rows={filteredRows} selectedId={selectedId} onSelect={openDrawerFor} />
            </div>
          )}
        </div>
      </section>

      {selectedPatient ? (
        <StaffPatientDetailDrawer patient={selectedPatient} open={drawerOpen} onOpenChange={handleDrawerOpenChange} />
      ) : null}
    </div>
  );
}
