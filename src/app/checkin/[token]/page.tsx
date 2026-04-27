"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckInPageProps = { params: Promise<{ token: string }> };

export default function CheckInPage({ params }: CheckInPageProps) {
  const { token } = use(params);
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ patientName: string; appointmentTime: string } | null>(null);

  const handleCheckIn = async () => {
    setStatus("LOADING");
    setError(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();

      if (res.ok) {
        setStatus("SUCCESS");
        setData(json);
      } else {
        setStatus("ERROR");
        setError(json.error || "Failed to check in. Please see the front desk.");
      }
    } catch (err) {
      setStatus("ERROR");
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-dvh bg-muted/30 px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-elevate sm:p-10">
        <header className="space-y-4">
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            Self check-in
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            {status === "SUCCESS" ? "Check-in complete" : "Welcome to the clinic"}
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {status === "SUCCESS" 
              ? "You've successfully checked in. Please take a seat, and we'll be with you shortly."
              : "We've located your appointment. Please confirm your details below to finish checking in."}
          </p>
        </header>

        {status === "ERROR" && (
          <Alert variant="destructive" className="rounded-xl border-destructive/25 shadow-sm">
            <AlertCircle className="size-4" />
            <AlertTitle>Check-in error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "SUCCESS" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{data?.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  Checked in at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="rounded-xl border border-border bg-muted/20 p-5 text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground mb-1">What's next?</p>
              <p>A member of our team will call your name when we're ready to see you. Thank you for your patience.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/10 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/20">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">Confirm your arrival</p>
                <p className="truncate text-xs text-muted-foreground">For today's scheduled visit</p>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold shadow-sm transition-all active:scale-[0.98]"
              size="lg"
              onClick={handleCheckIn}
              disabled={status === "LOADING"}
            >
              {status === "LOADING" ? "Processing..." : "Complete check-in"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
