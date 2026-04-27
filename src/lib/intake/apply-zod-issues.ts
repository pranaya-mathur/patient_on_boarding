import type { FieldPath, UseFormSetError } from "react-hook-form";
import type { ZodError } from "zod";
import type { IntakeFormValues } from "@/schemas/intake-form";

type IntakePrefix = "demographics" | "insurance" | "review";

/** Maps Zod issues to React Hook Form `setError` paths for a nested intake prefix. */
export function applyZodIssuesToForm(
  setError: UseFormSetError<IntakeFormValues>,
  error: ZodError,
  prefix: IntakePrefix,
) {
  for (const issue of error.issues) {
    const tail = issue.path.length ? issue.path.join(".") : "";
    const name = (tail ? `${prefix}.${tail}` : prefix) as FieldPath<IntakeFormValues>;
    setError(name, { type: issue.code, message: issue.message });
  }
}
