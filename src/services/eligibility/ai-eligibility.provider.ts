import { postJson } from "@/services/shared/ai-backend-client";
import { failureResult, successResult } from "@/services/shared/adapter-result";
import type {
  EligibilityVerificationProvider,
  EligibilityVerificationRequest,
  EligibilityVerificationResult,
} from "./types";

type EligibilityBackendResponse = {
  provider_key: string;
  normalized: {
    outcome: "VERIFIED" | "NEEDS_REVIEW" | "FAILED";
    summary: string;
    copay_cents?: number;
    plan_name?: string;
    effective_date?: string;
    termination_date?: string;
    reasons?: string[];
  };
  raw_response?: Record<string, unknown>;
};

export class AiEligibilityVerificationProvider implements EligibilityVerificationProvider {
  readonly providerKey = "groq_langchain";

  async verify(request: EligibilityVerificationRequest): Promise<EligibilityVerificationResult> {
    const response = await postJson<EligibilityBackendResponse, Record<string, unknown>>(
      "/v1/patient-access/eligibility/check",
      request,
    );
    if (!response.ok) return failureResult(response.error);

    const normalized = response.data.normalized;
    return successResult({
      providerKey: this.providerKey,
      outcome: normalized.outcome,
      summary: normalized.summary,
      normalized: {
        outcome: normalized.outcome,
        copayCents: normalized.copay_cents,
        planName: normalized.plan_name,
        effectiveDate: normalized.effective_date,
        terminationDate: normalized.termination_date,
        reasons: normalized.reasons,
      },
      rawResponse: response.data.raw_response ?? {},
    });
  }
}

export function createAiEligibilityVerificationProvider(): EligibilityVerificationProvider {
  return new AiEligibilityVerificationProvider();
}

