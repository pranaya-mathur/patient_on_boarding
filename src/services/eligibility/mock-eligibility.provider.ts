import { failureResult, successResult } from "@/services/shared/adapter-result";
import type {
  EligibilityVerificationProvider,
  EligibilityVerificationRequest,
  EligibilityVerificationResult,
  EligibilityVerificationSuccess,
} from "./types";

/**
 * Mock clearinghouse — swap for HTTP client to your vendor.
 * Simulates transport failures with specific `memberId` patterns for retry testing.
 */
export class MockEligibilityVerificationProvider implements EligibilityVerificationProvider {
  readonly providerKey = "mock_eligibility";

  async verify(request: EligibilityVerificationRequest): Promise<EligibilityVerificationResult> {
    await new Promise((r) => setTimeout(r, 40));

    if (request.memberId.includes("timeout")) {
      return failureResult({
        code: "ELIGIBILITY_TIMEOUT",
        message: "Mock payer: gateway timeout — retry with backoff.",
        retryable: true,
        transient: true,
        retryAfterMs: 2500,
        details: { payerKey: request.payerKey },
      });
    }

    if (request.memberId.includes("rate")) {
      return failureResult({
        code: "ELIGIBILITY_RATE_LIMIT",
        message: "Mock payer: rate limited — retry after delay.",
        retryable: true,
        transient: true,
        retryAfterMs: 5000,
        providerRequestId: "mock-rate-limit-1",
      });
    }

    if (request.memberId.endsWith("0")) {
      const data: EligibilityVerificationSuccess = {
        providerKey: this.providerKey,
        outcome: "FAILED",
        summary: "Mock payer: member ID not found.",
        normalized: {
          outcome: "FAILED",
          reasons: ["MEMBER_NOT_FOUND"],
        },
        rawResponse: { payerKey: request.payerKey, reason: "MEMBER_NOT_FOUND" },
      };
      return successResult(data, { providerRequestId: `mock-elig-${request.correlationId ?? "na"}` });
    }

    if (request.memberId.endsWith("7")) {
      const data: EligibilityVerificationSuccess = {
        providerKey: this.providerKey,
        outcome: "NEEDS_REVIEW",
        summary: "Mock payer: plan requires manual review.",
        normalized: {
          outcome: "NEEDS_REVIEW",
          planName: "Complex PPO",
          reasons: ["PLAN_REVIEW"],
        },
        rawResponse: { payerKey: request.payerKey, reason: "PLAN_REVIEW" },
      };
      return successResult(data);
    }

    const data: EligibilityVerificationSuccess = {
      providerKey: this.providerKey,
      outcome: "VERIFIED",
      summary: "Active coverage confirmed (mock).",
      normalized: {
        outcome: "VERIFIED",
        copayCents: 2500,
        planName: "Silver PPO",
        effectiveDate: new Date().toISOString().slice(0, 10),
      },
      rawResponse: { payerKey: request.payerKey, copayCents: 2500 },
    };
    return successResult(data, { providerRequestId: `mock-elig-${request.memberId.slice(-4)}` });
  }
}

export function createMockEligibilityVerificationProvider(): EligibilityVerificationProvider {
  return new MockEligibilityVerificationProvider();
}
