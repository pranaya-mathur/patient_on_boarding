"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { INTAKE_PAYERS } from "@/lib/constants/intake-payers";
import type { IntakeFormValues } from "@/schemas/intake-form";

function payerLabel(id: string) {
  return INTAKE_PAYERS.find((p) => p.id === id)?.label ?? id;
}

export function ReviewStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<IntakeFormValues>();
  const d = useWatch({ control, name: "demographics" });
  const i = useWatch({ control, name: "insurance" });

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-snug">
          Review & sign
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Take a moment to confirm details. You can go back to adjust anything before submitting.
        </p>
      </div>

      <Card className="overflow-hidden rounded-xl border-border/80 shadow-elevate">
        <CardHeader className="space-y-2 border-b border-border/60 bg-muted/[0.35] px-6 py-5">
          <CardTitle className="font-serif text-lg font-semibold tracking-tight">Summary</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            What we will send to registration and your payer (where applicable).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient</h3>
            <p className="text-foreground">
              <span className="font-medium">
                {d.legalFirstName} {d.legalLastName}
              </span>
              {d.preferredName ? <span className="text-muted-foreground"> (“{d.preferredName}”)</span> : null}
            </p>
            <p className="text-muted-foreground">
              DOB {d.dateOfBirth || "—"} · Mobile {d.mobilePhone || "—"}
            </p>
            <p className="text-muted-foreground">{d.email || "—"}</p>
            <p className="text-muted-foreground">
              {[
                d.addressLine1,
                d.addressLine2,
                [d.city, d.state, d.zipCode].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" · ") || "Address incomplete"}
            </p>
          </section>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Insurance</h3>
            <p className="text-foreground">
              <span className="font-medium">{payerLabel(i.primaryPayerId)}</span>
            </p>
            <p className="text-muted-foreground">
              Member ID {i.memberId || "—"}
              {i.groupNumber ? ` · Group ${i.groupNumber}` : ""}
            </p>
            <p className="text-muted-foreground">Relationship: {i.subscriberRelationship?.replaceAll("_", " ")}</p>
            <p className="text-muted-foreground">
              Card images: {i.cardFrontFileName ? i.cardFrontFileName : "Front missing"} ·{" "}
              {i.cardBackFileName ? i.cardBackFileName : "Back missing"}
            </p>
          </section>
        </CardContent>
      </Card>

      <FieldSet className="gap-8 rounded-xl border border-border/70 bg-card px-5 py-6 shadow-sm sm:px-6">
        <FieldLegend variant="legend" className="font-serif text-lg font-semibold tracking-tight text-foreground">
          Consents & acknowledgments
        </FieldLegend>
        <FieldGroup className="gap-6">
          <Controller
            control={control}
            name="review.hipaaAcknowledged"
            render={({ field }) => (
              <Field orientation="responsive" data-invalid={!!errors.review?.hipaaAcknowledged}>
                <Checkbox
                  id="hipaaAck"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  aria-invalid={!!errors.review?.hipaaAcknowledged}
                />
                <FieldContent>
                  <FieldLabel htmlFor="hipaaAck" className="text-sm font-medium leading-snug">
                    Notice of Privacy Practices
                  </FieldLabel>
                  <FieldDescription>
                    I acknowledge receipt of the Notice of Privacy Practices describing how my health information may
                    be used and disclosed, and how I can access it.
                  </FieldDescription>
                  <FieldError errors={[errors.review?.hipaaAcknowledged]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="review.treatmentConsent"
            render={({ field }) => (
              <Field orientation="responsive" data-invalid={!!errors.review?.treatmentConsent}>
                <Checkbox
                  id="treatmentConsent"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  aria-invalid={!!errors.review?.treatmentConsent}
                />
                <FieldContent>
                  <FieldLabel htmlFor="treatmentConsent" className="text-sm font-medium leading-snug">
                    Consent to treatment
                  </FieldLabel>
                  <FieldDescription>
                    I consent to examination and treatment by the care team and trainees under supervision, as
                    explained during my visit.
                  </FieldDescription>
                  <FieldError errors={[errors.review?.treatmentConsent]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="review.financialPolicy"
            render={({ field }) => (
              <Field orientation="responsive" data-invalid={!!errors.review?.financialPolicy}>
                <Checkbox
                  id="financialPolicy"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  aria-invalid={!!errors.review?.financialPolicy}
                />
                <FieldContent>
                  <FieldLabel htmlFor="financialPolicy" className="text-sm font-medium leading-snug">
                    Financial policy
                  </FieldLabel>
                  <FieldDescription>
                    I have read the financial policy, including my responsibility for copays, coinsurance, and
                    non-covered services at the time of service when required.
                  </FieldDescription>
                  <FieldError errors={[errors.review?.financialPolicy]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="review.informationAccurate"
            render={({ field }) => (
              <Field orientation="responsive" data-invalid={!!errors.review?.informationAccurate}>
                <Checkbox
                  id="informationAccurate"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  aria-invalid={!!errors.review?.informationAccurate}
                />
                <FieldContent>
                  <FieldLabel htmlFor="informationAccurate" className="text-sm font-medium leading-snug">
                    Accuracy attestation
                  </FieldLabel>
                  <FieldDescription>
                    I confirm the information provided is accurate to the best of my knowledge. I understand that
                    incorrect insurance information may delay care or result in balance transfers if a claim is denied.
                  </FieldDescription>
                  <FieldError errors={[errors.review?.informationAccurate]} />
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
