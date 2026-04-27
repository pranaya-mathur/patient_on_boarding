# Service adapters

Outbound integrations are defined as **TypeScript interfaces** with **normalized `AdapterResult<T>`** responses (`src/services/shared/adapter-result.ts`).

## Contracts

| Interface | File | Mock factory |
|-----------|------|----------------|
| `OcrProvider` | `ocr/types.ts` | `createMockOcrProvider()` / `createAiOcrProvider()` |
| `EligibilityVerificationProvider` | `eligibility/types.ts` | `createMockEligibilityVerificationProvider()` / `createAiEligibilityVerificationProvider()` |
| `ReminderService` | `reminders/types.ts` | `createMockReminderService()` |
| `IntakeChatbotService` | `chat/types.ts` | `createMockIntakeChatbotService()` / `createAiIntakeChatbotService()` |

## Swapping providers

1. Implement the interface in a new file (e.g. `ocr/textract.provider.ts`).
2. Construct it in server bootstrap / DI (e.g. from `process.env`).
3. Use `createServiceProviders()` in `providers.ts` to switch mock vs AI adapters via env flags.

## Results & retries

- **`ok: true`** — operation completed; `data` is normalized for persistence or UI.
- **`ok: false`** — `error` includes `retryable`, `transient`, and optional `retryAfterMs` for backoff.
- **Eligibility**: payer outcome `FAILED` / `NEEDS_REVIEW` / `VERIFIED` lives in **`data.outcome`** on success; transport errors use **`ok: false`**.

## Bundle

`providers.ts` exports `createServiceProviders()` and supports:

- `USE_AI_BACKEND=true`
- `AI_BACKEND_URL=http://localhost:8001`
