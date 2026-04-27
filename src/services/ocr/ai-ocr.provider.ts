import { failureResult } from "@/services/shared/adapter-result";
import type { OcrExtractRequest, OcrExtractResult, OcrProvider } from "./types";

/**
 * Production OCR adapter expects the uploaded insurance image to already exist in object storage.
 * Backend currently accepts direct file uploads; this adapter is a JSON-first placeholder until storage wiring is done.
 */
export class AiOcrProvider implements OcrProvider {
  readonly providerKey = "openai_vision";

  async extractInsuranceCard(request: OcrExtractRequest): Promise<OcrExtractResult> {
    void request;
    return failureResult({
      code: "OCR_UPLOAD_REQUIRED",
      message: "Production OCR requires direct image upload to the backend OCR endpoint.",
      retryable: false,
      transient: false,
    });
  }
}

export function createAiOcrProvider(): OcrProvider {
  return new AiOcrProvider();
}

