import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { OcrExtractRequest, OcrExtractResult, OcrProvider } from "./types";

/**
 * Local-dev OCR — deterministic from `storageKey` / `correlationId` substrings.
 * Swap for Textract, Google Vision, or a vendor microservice implementing {@link OcrProvider}.
 */
export class MockOcrProvider implements OcrProvider {
  readonly providerKey = "mock_ocr";

  async extractInsuranceCard(request: OcrExtractRequest): Promise<OcrExtractResult> {
    const key = request.storageKey.toLowerCase();

    if (key.includes("fail-hard")) {
      return failureResult({
        code: "OCR_UNRECOVERABLE",
        message: "Mock OCR: document unreadable (simulated hard failure).",
        retryable: false,
        transient: false,
        details: { side: request.side, hint: "fail-hard" },
      });
    }

    if (key.includes("fail") || key.includes("timeout")) {
      return failureResult({
        code: key.includes("timeout") ? "OCR_TIMEOUT" : "OCR_TRANSIENT",
        message: key.includes("timeout")
          ? "Mock OCR: upstream timeout — retry with backoff."
          : "Mock OCR: transient read error — safe to retry.",
        retryable: true,
        transient: true,
        retryAfterMs: key.includes("timeout") ? 2000 : 500,
        details: { side: request.side },
      });
    }

    const fields = {
      payerNameGuess: request.side === "FRONT" ? "Demo Health Plan" : undefined,
      memberId: "XDK8829103",
      groupNumber: "GRP-00921",
      subscriberName: "Alex Patient",
      planName: "Silver PPO",
    };

    return successResult(
      {
        providerKey: this.providerKey,
        fields,
        fieldConfidence: {
          memberId: 0.92,
          groupNumber: 0.78,
          subscriberName: 0.88,
        },
        raw: {
          provider: this.providerKey,
          side: request.side,
          storageKey: request.storageKey,
          correlationId: request.correlationId ?? null,
        },
      },
      { providerRequestId: `mock-ocr-${request.correlationId ?? request.storageKey.slice(-8)}` },
    );
  }
}

export function createMockOcrProvider(): OcrProvider {
  return new MockOcrProvider();
}
