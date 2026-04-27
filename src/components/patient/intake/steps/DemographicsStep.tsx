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
import type { IntakeFormValues } from "@/schemas/intake-form";

const inputClass = "h-11 min-h-11 text-[15px] md:text-sm";

export function DemographicsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<IntakeFormValues>();

  return (
    <FieldSet className="gap-10">
      <FieldLegend variant="legend" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
        About you
      </FieldLegend>
      <p className="-mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Use your legal name as it appears on your insurance card. This helps prevent eligibility delays.
      </p>

      <FieldGroup className="gap-6 sm:gap-7">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <Field data-invalid={!!errors.demographics?.legalFirstName}>
            <FieldLabel htmlFor="legalFirstName">Legal first name</FieldLabel>
            <Input
              id="legalFirstName"
              autoComplete="given-name"
              className={inputClass}
              aria-invalid={!!errors.demographics?.legalFirstName}
              {...register("demographics.legalFirstName")}
            />
            <FieldError errors={[errors.demographics?.legalFirstName]} />
          </Field>
          <Field data-invalid={!!errors.demographics?.legalLastName}>
            <FieldLabel htmlFor="legalLastName">Legal last name</FieldLabel>
            <Input
              id="legalLastName"
              autoComplete="family-name"
              className={inputClass}
              aria-invalid={!!errors.demographics?.legalLastName}
              {...register("demographics.legalLastName")}
            />
            <FieldError errors={[errors.demographics?.legalLastName]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.demographics?.preferredName}>
          <FieldLabel htmlFor="preferredName">Preferred name (optional)</FieldLabel>
          <FieldDescription>How you would like us to greet you at check-in.</FieldDescription>
          <Input
            id="preferredName"
            className={inputClass}
            aria-invalid={!!errors.demographics?.preferredName}
            {...register("demographics.preferredName")}
          />
          <FieldError errors={[errors.demographics?.preferredName]} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.demographics?.dateOfBirth}>
            <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
            <FieldDescription>Use YYYY-MM-DD.</FieldDescription>
            <Input
              id="dateOfBirth"
              type="date"
              className={inputClass}
              aria-invalid={!!errors.demographics?.dateOfBirth}
              {...register("demographics.dateOfBirth")}
            />
            <FieldError errors={[errors.demographics?.dateOfBirth]} />
          </Field>
          <Field data-invalid={!!errors.demographics?.legalSex}>
            <FieldLabel id="legalSex-label">Legal sex (as on insurance)</FieldLabel>
            <FieldDescription>Required by most payers for eligibility checks.</FieldDescription>
            <Controller
              control={control}
              name="demographics.legalSex"
              render={({ field }) => (
                <Select
                  value={field.value ? field.value : undefined}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <SelectTrigger
                    id="legalSex"
                    aria-labelledby="legalSex-label"
                    className="h-11 min-h-11 w-full min-w-0 justify-between rounded-md border-border/90 bg-background"
                    aria-invalid={!!errors.demographics?.legalSex}
                  >
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Female (F)</SelectItem>
                    <SelectItem value="M">Male (M)</SelectItem>
                    <SelectItem value="X">Non-binary / another legal marker (X)</SelectItem>
                    <SelectItem value="U">Prefer not to answer (U)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.demographics?.legalSex]} />
          </Field>
        </div>
      </FieldGroup>

      <FieldGroup className="gap-6 sm:gap-7">
        <FieldLegend variant="label" className="text-base font-semibold tracking-tight text-foreground">
          Contact
        </FieldLegend>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <Field data-invalid={!!errors.demographics?.mobilePhone}>
            <FieldLabel htmlFor="mobilePhone">Mobile phone</FieldLabel>
            <FieldDescription>Used for visit reminders and time-sensitive updates.</FieldDescription>
            <Input
              id="mobilePhone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
              aria-invalid={!!errors.demographics?.mobilePhone}
              {...register("demographics.mobilePhone")}
            />
            <FieldError errors={[errors.demographics?.mobilePhone]} />
          </Field>
          <Field data-invalid={!!errors.demographics?.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldDescription>Confirmation and intake follow-up.</FieldDescription>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              aria-invalid={!!errors.demographics?.email}
              {...register("demographics.email")}
            />
            <FieldError errors={[errors.demographics?.email]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.demographics?.preferredLanguage}>
          <FieldLabel id="preferredLanguage-label">Preferred language</FieldLabel>
          <Controller
            control={control}
            name="demographics.preferredLanguage"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="preferredLanguage"
                  aria-labelledby="preferredLanguage-label"
                  className="h-11 min-h-11 w-full min-w-0 justify-between rounded-md border-border/90 bg-background"
                  aria-invalid={!!errors.demographics?.preferredLanguage}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="other">Other (we will note at check-in)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.demographics?.preferredLanguage]} />
        </Field>
      </FieldGroup>

      <FieldGroup className="gap-6 sm:gap-7">
        <FieldLegend variant="label" className="text-base font-semibold tracking-tight text-foreground">
          Home address
        </FieldLegend>
        <Field data-invalid={!!errors.demographics?.addressLine1}>
          <FieldLabel htmlFor="addressLine1">Street address</FieldLabel>
          <Input
            id="addressLine1"
            autoComplete="address-line1"
            className={inputClass}
            aria-invalid={!!errors.demographics?.addressLine1}
            {...register("demographics.addressLine1")}
          />
          <FieldError errors={[errors.demographics?.addressLine1]} />
        </Field>
        <Field data-invalid={!!errors.demographics?.addressLine2}>
          <FieldLabel htmlFor="addressLine2">Apt, suite, unit (optional)</FieldLabel>
          <Input
            id="addressLine2"
            autoComplete="address-line2"
            className={inputClass}
            aria-invalid={!!errors.demographics?.addressLine2}
            {...register("demographics.addressLine2")}
          />
          <FieldError errors={[errors.demographics?.addressLine2]} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-6 sm:gap-6">
          <Field className="sm:col-span-3" data-invalid={!!errors.demographics?.city}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              autoComplete="address-level2"
              className={inputClass}
              aria-invalid={!!errors.demographics?.city}
              {...register("demographics.city")}
            />
            <FieldError errors={[errors.demographics?.city]} />
          </Field>
          <Field className="sm:col-span-1" data-invalid={!!errors.demographics?.state}>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input
              id="state"
              autoComplete="address-level1"
              className={inputClass}
              aria-invalid={!!errors.demographics?.state}
              maxLength={2}
              placeholder="CA"
              {...register("demographics.state")}
            />
            <FieldError errors={[errors.demographics?.state]} />
          </Field>
          <Field className="sm:col-span-2" data-invalid={!!errors.demographics?.zipCode}>
            <FieldLabel htmlFor="zipCode">ZIP code</FieldLabel>
            <Input
              id="zipCode"
              autoComplete="postal-code"
              inputMode="numeric"
              className={inputClass}
              aria-invalid={!!errors.demographics?.zipCode}
              {...register("demographics.zipCode")}
            />
            <FieldError errors={[errors.demographics?.zipCode]} />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
