import { z } from "zod";
import { INTAKE_PAYERS } from "@/lib/constants/intake-payers";

const payerIds = INTAKE_PAYERS.map((p) => p.id) as [string, ...string[]];

export const demographicsStepSchema = z.object({
  legalFirstName: z.string().min(1, "Enter your legal first name"),
  legalLastName: z.string().min(1, "Enter your legal last name"),
  preferredName: z.string().max(80).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Use YYYY-MM-DD"),
  mobilePhone: z
    .string()
    .min(10, "Enter a valid mobile number")
    .regex(/^[\d\s+().-]{10,}$/, "Enter a valid mobile number"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  addressLine1: z.string().min(1, "Street address is required"),
  addressLine2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z
    .string()
    .min(2, "State / province")
    .max(2, "Use the 2-letter code (e.g. CA)"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  legalSex: z
    .string()
    .min(1, "Select the option that appears on your insurance card")
    .refine((v) => ["F", "M", "X", "U"].includes(v), {
      message: "Select a valid option",
    }),
  preferredLanguage: z.enum(["en", "es", "other"], {
    message: "Choose a preferred language",
  }),
});

export const insuranceStepSchema = z
  .object({
    primaryPayerId: z.enum(payerIds, { message: "Select your insurance carrier" }),
    memberId: z
      .string()
      .min(6, "Member ID is usually at least 6 characters")
      .max(32, "Member ID looks too long"),
    groupNumber: z.string().max(32).optional().or(z.literal("")),
    subscriberRelationship: z.enum(["SELF", "SPOUSE", "CHILD", "OTHER"], {
      message: "Select how you are covered under this plan",
    }),
    cardFrontFileName: z.string().min(1, "Upload the front of your insurance card"),
    cardBackFileName: z.string().min(1, "Upload the back of your insurance card"),
    cardFrontId: z.string().optional(),
    cardBackId: z.string().optional(),
    cardFrontStatus: z.enum(["IDLE", "UPLOADING", "SUCCESS", "ERROR"]).optional(),
    cardBackStatus: z.enum(["IDLE", "UPLOADING", "SUCCESS", "ERROR"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.subscriberRelationship !== "SELF" && !data.groupNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Group number is often required when you are not the primary subscriber",
        path: ["groupNumber"],
      });
    }
  });

export const reviewStepSchema = z.object({
  hipaaAcknowledged: z.boolean().refine((v) => v, {
    message: "You must acknowledge the Notice of Privacy Practices",
  }),
  treatmentConsent: z.boolean().refine((v) => v, {
    message: "Consent to treatment is required to continue",
  }),
  financialPolicy: z.boolean().refine((v) => v, {
    message: "Please confirm you have read the financial policy",
  }),
  informationAccurate: z.boolean().refine((v) => v, {
    message: "Confirm that your information is accurate to the best of your knowledge",
  }),
});

export const intakeFormSchema = z.object({
  demographics: demographicsStepSchema,
  insurance: insuranceStepSchema,
  review: reviewStepSchema,
});

/**
 * PATCH autosave — intentionally loose so in-progress values (empty strings, partial email/phone)
 * do not 400 while the user types. Final validation stays on `demographicsStepSchema` /
 * `insuranceStepSchema` at submit.
 */
export const demographicsAutosaveSchema = z.object({
  legalFirstName: z.string().max(120).optional(),
  legalLastName: z.string().max(120).optional(),
  preferredName: z.union([z.string().max(80), z.literal("")]).optional(),
  dateOfBirth: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: "Use YYYY-MM-DD",
    }),
  mobilePhone: z.string().max(40).optional(),
  email: z.string().max(320).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.union([z.string().max(120), z.literal("")]).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(2).optional(),
  zipCode: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || /^\d{5}(-\d{4})?$/.test(v), {
      message: "Enter a valid ZIP code",
    }),
  legalSex: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || ["F", "M", "X", "U"].includes(v), {
      message: "Select a valid option",
    }),
  preferredLanguage: z.enum(["en", "es", "other"]).optional(),
});

export const insuranceAutosaveSchema = z.object({
  primaryPayerId: z.enum(payerIds).optional(),
  memberId: z.string().max(32).optional(),
  groupNumber: z.union([z.string().max(32), z.literal("")]).optional(),
  subscriberRelationship: z.enum(["SELF", "SPOUSE", "CHILD", "OTHER"]).optional(),
  cardFrontFileName: z.string().max(500).optional(),
  cardBackFileName: z.string().max(500).optional(),
  cardFrontId: z.string().optional(),
  cardBackId: z.string().optional(),
  cardFrontStatus: z.enum(["IDLE", "UPLOADING", "SUCCESS", "ERROR"]).optional(),
  cardBackStatus: z.enum(["IDLE", "UPLOADING", "SUCCESS", "ERROR"]).optional(),
});

export type IntakeFormValues = z.infer<typeof intakeFormSchema>;

/** Draft defaults — `legalSex` starts empty until the patient selects an option. */
export const intakeDefaultValues: IntakeFormValues = {
  demographics: {
    legalFirstName: "",
    legalLastName: "",
    preferredName: "",
    dateOfBirth: "",
    mobilePhone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    legalSex: "",
    preferredLanguage: "en",
  },
  insurance: {
    primaryPayerId: "demo_east",
    memberId: "",
    groupNumber: "",
    subscriberRelationship: "SELF",
    cardFrontFileName: "",
    cardBackFileName: "",
  },
  review: {
    hipaaAcknowledged: false,
    treatmentConsent: false,
    financialPolicy: false,
    informationAccurate: false,
  },
};
