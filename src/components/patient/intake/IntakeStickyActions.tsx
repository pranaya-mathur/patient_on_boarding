"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IntakeStickyActionsProps = {
  step: number;
  totalSteps: number;
  isBusy: boolean;
  onBack: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  /** Last step submits instead of “Continue” */
  isFinal?: boolean;
};

export function IntakeStickyActions({
  step,
  totalSteps,
  isBusy,
  onBack,
  onPrimary,
  primaryLabel,
  isFinal,
}: IntakeStickyActionsProps) {
  const showBack = step > 1;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/[0.97] shadow-sticky backdrop-blur-md backdrop-saturate-150",
        "supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto flex max-w-xl items-stretch gap-3 px-5 py-4 sm:px-6">
        {showBack ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-12 shrink-0 px-4 sm:min-h-11"
            onClick={onBack}
            disabled={isBusy}
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back
          </Button>
        ) : (
          <div className="w-px shrink-0 sm:w-0" aria-hidden />
        )}
        <Button
          type="button"
          size="lg"
          className="min-h-12 flex-1 gap-2 text-base font-semibold sm:min-h-11"
          onClick={onPrimary}
          disabled={isBusy}
        >
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
          {isBusy ? "Please wait…" : primaryLabel}
          {!isBusy && !isFinal ? <ArrowRight className="size-4 opacity-80" data-icon="inline-end" /> : null}
        </Button>
      </div>
      <p className="mx-auto max-w-xl px-5 pb-3 text-center text-[11px] leading-relaxed text-muted-foreground/90 sm:px-6">
        {step < totalSteps
          ? "Your answers save automatically as you go."
          : "By continuing, you confirm the information below is accurate."}
      </p>
    </div>
  );
}
