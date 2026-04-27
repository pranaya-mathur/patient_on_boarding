/**
 * Shared contract for outbound integrations (OCR, eligibility, reminders, chat).
 * Use {@link AdapterResult} so callers can branch on `ok`, inspect retries, and log without PHI in `details`.
 */

export type AdapterFailure = {
  /** Stable machine-readable code, e.g. `OCR_TIMEOUT`, `ELIGIBILITY_RATE_LIMIT` */
  code: string;
  /** Human-readable message for logs or generic UI */
  message: string;
  /**
   * When true, the same request may succeed on retry (after optional backoff).
   * When false, retrying the identical payload is unlikely to help without a change.
   */
  retryable: boolean;
  /** Suggested minimum delay before retry (e.g. from `Retry-After`) */
  retryAfterMs?: number;
  /** Network / upstream blip — safe to retry with backoff even if payload unchanged */
  transient?: boolean;
  /** Optional opaque provider reference for support tickets (no PHI) */
  providerRequestId?: string;
  /** Safe structured hints for dashboards — avoid PHI */
  details?: Record<string, unknown>;
};

export type AdapterResult<T> =
  | { ok: true; data: T; providerRequestId?: string }
  | { ok: false; error: AdapterFailure };

export function successResult<T>(data: T, meta?: { providerRequestId?: string }): AdapterResult<T> {
  return { ok: true, data, ...meta };
}

/** Typed failure branch for any {@link AdapterResult} success payload shape. */
export function failureResult<T>(error: AdapterFailure): AdapterResult<T> {
  return { ok: false, error };
}

export function isAdapterSuccess<T>(r: AdapterResult<T>): r is { ok: true; data: T; providerRequestId?: string } {
  return r.ok === true;
}

export function isAdapterFailure<T>(r: AdapterResult<T>): r is { ok: false; error: AdapterFailure } {
  return r.ok === false;
}
