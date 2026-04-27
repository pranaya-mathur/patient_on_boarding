"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { applyZodIssuesToForm } from "@/lib/intake/apply-zod-issues";
import { cn } from "@/lib/utils";
import {
  demographicsStepSchema,
  insuranceStepSchema,
  intakeDefaultValues,
  reviewStepSchema,
  type IntakeFormValues,
} from "@/schemas/intake-form";
import { IntakeProgressHeader } from "./IntakeProgressHeader";
import { IntakeStickyActions } from "./IntakeStickyActions";
import { WelcomeStep } from "./steps/WelcomeStep";
import { DemographicsStep } from "./steps/DemographicsStep";
import { InsuranceStep } from "./steps/InsuranceStep";
import { ReviewStep } from "./steps/ReviewStep";

const TOTAL_STEPS = 4;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type IntakeSessionClientProps = {
  token: string;
};

export function IntakeSessionClient({ token }: IntakeSessionClientProps) {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);
  const [isNavigating, startTransition] = useTransition();
  const autosaveTimer = useRef<number | undefined>(undefined);

  const form = useForm<IntakeFormValues>({
    defaultValues: intakeDefaultValues,
    shouldFocusError: true,
  });

  useEffect(() => {
    const sub = form.watch((value) => {
      window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = window.setTimeout(async () => {
        try {
          const res = await fetch(`/api/intake/${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(value),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.policyId) setPolicyId(data.policyId);
          } else {
            const data = await res.json();
            console.error("[intake:autosave:failed]", data.error);
          }
        } catch (err) {
          console.error("[intake:autosave:error]", err);
        }
      }, 750);
    });
    return () => {
      sub.unsubscribe();
      window.clearTimeout(autosaveTimer.current);
    };
  }, [form, token]);

  const goBack = () => {
    if (completed) return;
    setRootError(null);
    if (step <= 1) return;
    setStep((s) => s - 1);
  };

  const goNext = () => {
    if (completed) return;
    setRootError(null);
    startTransition(async () => {
      try {
        await delay(320);

        if (step === 1) {
          setStep(2);
          return;
        }

        if (step === 2) {
          form.clearErrors("demographics");
          const r = demographicsStepSchema.safeParse(form.getValues("demographics"));
          if (!r.success) {
            applyZodIssuesToForm(form.setError, r.error, "demographics");
            return;
          }
          setStep(3);
          return;
        }

        if (step === 3) {
          form.clearErrors("insurance");
          const r = insuranceStepSchema.safeParse(form.getValues("insurance"));
          if (!r.success) {
            applyZodIssuesToForm(form.setError, r.error, "insurance");
            return;
          }
          setStep(4);
          return;
        }

        if (step === 4) {
          form.clearErrors("review");
          const r = reviewStepSchema.safeParse(form.getValues("review"));
          if (!r.success) {
            applyZodIssuesToForm(form.setError, r.error, "review");
            return;
          }

          const res = await fetch(`/api/intake/${token}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.getValues()),
          });

          if (!res.ok) {
            const data = await res.json();
            setRootError(data.error || "Submission failed. Please try again.");
            return;
          }

          setCompleted(true);
        }
      } catch {
        setRootError("Something went wrong while saving. Please try again in a moment.");
      }
    });
  };

  const primaryLabel =
    step === 1 ? "Get started" : step === 2 ? "Continue" : step === 3 ? "Continue to review" : "Submit registration";

  return (
    <FormProvider {...form}>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="border-b border-border/70 bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-xl items-start justify-between gap-5 px-5 py-5 sm:px-6">
            <div className="min-w-0 space-y-1.5">
              <p className="font-serif text-lg font-semibold tracking-tight text-foreground sm:text-xl">Pre-visit intake</p>
              <p className="text-sm leading-snug text-muted-foreground">Secure link · no login required</p>
            </div>
          </div>
          <div className="mx-auto max-w-xl px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
            <IntakeProgressHeader currentStep={completed ? TOTAL_STEPS : step} />
          </div>
        </header>

        <main
          className={cn(
            "mx-auto w-full max-w-xl px-5 pb-44 pt-8 transition-opacity sm:px-6 sm:pb-48 sm:pt-10",
            isNavigating && !completed && "pointer-events-none opacity-[0.72]",
          )}
          aria-busy={isNavigating && !completed}
        >
          {rootError ? (
            <Alert variant="destructive" className="mb-8 rounded-xl border-destructive/25 shadow-sm">
              <AlertCircle className="size-4" />
              <AlertTitle>We could not continue</AlertTitle>
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
          ) : null}

          {completed ? (
            <div className="space-y-8">
              <Alert className="rounded-xl border-primary/20 bg-primary/[0.06] shadow-sm">
                <CheckCircle2 className="size-4 text-primary" />
                <AlertTitle className="text-foreground">Registration submitted</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Thank you. Our team will review your insurance and reach out only if something needs attention. You
                  can close this page — a copy of next steps will be sent to your email on file once processing
                  completes.
                </AlertDescription>
              </Alert>
              <div className="rounded-xl border border-border/80 bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-elevate">
                <p className="font-medium text-foreground">What happens next</p>
                <ul className="mt-4 list-disc space-y-2.5 pl-5 marker:text-primary/50">
                  <li>Eligibility is verified against your payer (typically within one business day).</li>
                  <li>You may receive a text or email reminder before your visit.</li>
                  <li>Bring your physical insurance card and ID to check-in.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {step === 1 ? <WelcomeStep token={token} /> : null}
              {step === 2 ? <DemographicsStep /> : null}
              {step === 3 ? <InsuranceStep token={token} policyId={policyId} /> : null}
              {step === 4 ? <ReviewStep /> : null}
            </div>
          )}
        </main>

        {!completed ? (
          <IntakeStickyActions
            step={step}
            totalSteps={TOTAL_STEPS}
            isBusy={isNavigating}
            onBack={goBack}
            onPrimary={goNext}
            primaryLabel={primaryLabel}
            isFinal={step === TOTAL_STEPS}
          />
        ) : (
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/[0.97] shadow-sticky backdrop-blur-md backdrop-saturate-150",
              "supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            )}
          >
            <div className="mx-auto max-w-xl px-5 py-4 sm:px-6">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "flex h-12 w-full items-center justify-center text-base font-semibold",
                )}
              >
                Return home
              </Link>
            </div>
          </div>
        )}

        <footer className="mx-auto max-w-xl px-5 pb-32 pt-3 text-center text-[11px] leading-relaxed text-muted-foreground/90 sm:px-6 sm:pb-36">
          Questions about this form? Contact your clinic directly — this intake link cannot provide medical advice.
        </footer>
      </div>
    </FormProvider>
  );
}
