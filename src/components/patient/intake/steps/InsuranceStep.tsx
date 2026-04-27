"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTAKE_PAYERS } from "@/lib/constants/intake-payers";
import type { IntakeFormValues } from "@/schemas/intake-form";

const inputClass = "h-11 min-h-11 text-[15px] md:text-sm";

export function InsuranceStep({ token, policyId }: { token: string; policyId?: string }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<IntakeFormValues>();

  const handleUpload = async (file: File, side: "FRONT" | "BACK") => {
    if (!policyId) {
      console.warn("[insurance:upload] No policyId yet, waiting for autosave...");
      return;
    }

    const statusKey = side === "FRONT" ? "insurance.cardFrontStatus" : "insurance.cardBackStatus";
    const idKey = side === "FRONT" ? "insurance.cardFrontId" : "insurance.cardBackId";

    setValue(statusKey, "UPLOADING");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("side", side);
    formData.append("policyId", policyId);

    try {
      const res = await fetch(`/api/intake/${token}/upload-card`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setValue(idKey, data.cardId);
        setValue(statusKey, "SUCCESS");
      } else {
        console.error("[insurance:upload:failed]", data.error);
        setValue(statusKey, "ERROR");
      }
    } catch (err) {
      console.error("[insurance:upload:error]", err);
      setValue(statusKey, "ERROR");
    }
  };

  return (
    <FieldSet className="gap-10">
      <FieldLegend variant="legend" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
        Insurance
      </FieldLegend>
      <p className="-mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
        We verify coverage before your visit. Clear photos reduce back-and-forth with your payer.
      </p>

      <FieldGroup className="gap-6 sm:gap-7">
        <Field data-invalid={!!errors.insurance?.primaryPayerId}>
          <FieldLabel id="payer-label">Primary insurance carrier</FieldLabel>
          <FieldDescription>Select the plan that is primary for this visit.</FieldDescription>
          <Controller
            control={control}
            name="insurance.primaryPayerId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="payer"
                  aria-labelledby="payer-label"
                  className="h-11 min-h-11 w-full min-w-0 justify-between rounded-md border-border/90 bg-background"
                  aria-invalid={!!errors.insurance?.primaryPayerId}
                >
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {INTAKE_PAYERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.insurance?.primaryPayerId]} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <Field data-invalid={!!errors.insurance?.memberId}>
            <FieldLabel htmlFor="memberId">Member ID</FieldLabel>
            <FieldDescription>Usually printed on the front of your card.</FieldDescription>
            <Input
              id="memberId"
              autoComplete="off"
              className={inputClass}
              aria-invalid={!!errors.insurance?.memberId}
              {...register("insurance.memberId")}
            />
            <FieldError errors={[errors.insurance?.memberId]} />
          </Field>
          <Field data-invalid={!!errors.insurance?.groupNumber}>
            <FieldLabel htmlFor="groupNumber">Group number (if shown)</FieldLabel>
            <FieldDescription>Often required when you are not the subscriber.</FieldDescription>
            <Input
              id="groupNumber"
              className={inputClass}
              aria-invalid={!!errors.insurance?.groupNumber}
              {...register("insurance.groupNumber")}
            />
            <FieldError errors={[errors.insurance?.groupNumber]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.insurance?.subscriberRelationship}>
          <FieldLabel id="relationship-label">Relationship to subscriber</FieldLabel>
          <Controller
            control={control}
            name="insurance.subscriberRelationship"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="relationship"
                  aria-labelledby="relationship-label"
                  className="h-11 min-h-11 w-full min-w-0 justify-between rounded-md border-border/90 bg-background"
                  aria-invalid={!!errors.insurance?.subscriberRelationship}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELF">I am the subscriber</SelectItem>
                  <SelectItem value="SPOUSE">Spouse / partner</SelectItem>
                  <SelectItem value="CHILD">Child / dependent</SelectItem>
                  <SelectItem value="OTHER">Other dependent</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.insurance?.subscriberRelationship]} />
        </Field>
      </FieldGroup>

      <FieldGroup className="gap-6 sm:gap-7">
        <FieldLegend variant="label" className="text-base font-semibold tracking-tight text-foreground">
          Insurance card photos
        </FieldLegend>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For best results, lay the card on a flat surface with even lighting. You can retake before continuing.
        </p>

        <Field data-invalid={!!errors.insurance?.cardFrontFileName}>
          <FieldLabel htmlFor="cardFront">Front of card</FieldLabel>
          <FieldDescription>JPEG or PNG. Glare or blur may delay verification.</FieldDescription>
          <label
            htmlFor="cardFront"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/25 px-4 py-10 text-center transition-colors duration-150 hover:border-primary/30 hover:bg-muted/40"
          >
            <span className="text-sm font-medium text-foreground">
              {control._formValues.insurance?.cardFrontStatus === "SUCCESS" ? "Card uploaded ✓" : 
               control._formValues.insurance?.cardFrontStatus === "UPLOADING" ? "Uploading..." : 
               "Tap to capture or upload"}
            </span>
            <span className="text-xs text-muted-foreground">
              {control._formValues.insurance?.cardFrontStatus === "ERROR" ? "Upload failed — try again" : 
               "Opens your camera on supported phones"}
            </span>
            <Input
              id="cardFront"
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setValue("insurance.cardFrontFileName", f.name, { shouldDirty: true, shouldValidate: true });
                  handleUpload(f, "FRONT");
                }
              }}
            />
          </label>
          <FieldError errors={[errors.insurance?.cardFrontFileName]} />
        </Field>

        <Field data-invalid={!!errors.insurance?.cardBackFileName}>
          <FieldLabel htmlFor="cardBack">Back of card</FieldLabel>
          <FieldDescription>Include the side with contact numbers or secondary coverage, if present.</FieldDescription>
          <label
            htmlFor="cardBack"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/25 px-4 py-10 text-center transition-colors duration-150 hover:border-primary/30 hover:bg-muted/40"
          >
            <span className="text-sm font-medium text-foreground">
              {control._formValues.insurance?.cardBackStatus === "SUCCESS" ? "Card uploaded ✓" : 
               control._formValues.insurance?.cardBackStatus === "UPLOADING" ? "Uploading..." : 
               "Tap to capture or upload"}
            </span>
            <span className="text-xs text-muted-foreground">
              {control._formValues.insurance?.cardBackStatus === "ERROR" ? "Upload failed — try again" : 
               "Same guidance as the front"}
            </span>
            <Input
              id="cardBack"
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setValue("insurance.cardBackFileName", f.name, { shouldDirty: true, shouldValidate: true });
                  handleUpload(f, "BACK");
                }
              }}
            />
          </label>
          <FieldError errors={[errors.insurance?.cardBackFileName]} />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
