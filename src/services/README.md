# Service adapters

Outbound integrations are defined as **TypeScript interfaces** with **normalized `AdapterResult<T>`** responses (`src/services/shared/adapter-result.ts`).

## Contracts

| Interface | File | Mock factory |
|-----------|------|----------------|
| `OcrProvider` | `ocr/types.ts` | `createMockOcrProvider()` |
| `EligibilityVerificationProvider` | `eligibility/types.ts` | `createMockEligibilityVerificationProvider()` |
| `ReminderService` | `reminders/types.ts` | `createMockReminderService()` |
| `IntakeChatbotService` | `chat/types.ts` | `createMockIntakeChatbotService()` |

## Swapping providers

1. Implement the interface in a new file (e.g. `ocr/textract.provider.ts`).
2. Construct it in server bootstrap / DI (e.g. from `process.env`).
3. Use `providers.mock.ts` as a reference for `createProductionServiceProviders()` when ready.

## Results & retries

- **`ok: true`** — operation completed; `data` is normalized for persistence or UI.
- **`ok: false`** — `error` includes `retryable`, `transient`, and optional `retryAfterMs` for backoff.
- **Eligibility**: payer outcome `FAILED` / `NEEDS_REVIEW` / `VERIFIED` lives in **`data.outcome`** on success; transport errors use **`ok: false`**.

## Bundle

`providers.mock.ts` exports `createMockServiceProviders()` for local development.
