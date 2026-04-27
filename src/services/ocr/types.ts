import type { AdapterResult } from "@/services/shared/adapter-result";

export type InsuranceCardSide = "FRONT" | "BACK";

/** Input for a single card side extraction. */
export type OcrExtractRequest = {
  /** Storage key (S3-compatible) — provider fetches bytes out-of-band */
  storageKey: string;
  mimeType?: string;
  side: InsuranceCardSide;
  /** Correlate logs, idempotent retries, and audit rows */
  correlationId?: string;
};

/** Normalized fields written to intake / policy after staff confirmation. */
export type OcrInsuranceFields = {
  payerNameGuess?: string;
  memberId?: string;
  groupNumber?: string;
  subscriberName?: string;
  planName?: string;
};

/** Successful extraction — persist `raw` + `fields` per your retention policy. */
export type OcrExtractSuccess = {
  providerKey: string;
  fields: OcrInsuranceFields;
  /** Optional 0–1 confidence per extracted field */
  fieldConfidence?: Partial<Record<keyof OcrInsuranceFields, number>>;
  /** Raw provider payload for replay, debugging, vendor support */
  raw: Record<string, unknown>;
};

export type OcrExtractResult = AdapterResult<OcrExtractSuccess>;

/**
 * Pluggable OCR for insurance card images.
 * Implementations should be stateless; inject HTTP clients / credentials via constructor in real providers.
 */
export interface OcrProvider {
  readonly providerKey: string;
  extractInsuranceCard(request: OcrExtractRequest): Promise<OcrExtractResult>;
}
