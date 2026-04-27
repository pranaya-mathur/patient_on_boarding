import type { AdapterResult } from "@/services/shared/adapter-result";

/** Business outcome of a completed eligibility call (HTTP/transport success assumed). */
export type EligibilityOutcome = "VERIFIED" | "NEEDS_REVIEW" | "FAILED";

export type EligibilityVerificationRequest = {
  payerKey: string;
  memberId: string;
  groupNumber?: string;
  correlationId?: string;
};

/**
 * Normalized success payload — maps cleanly to `EligibilityCheck.responsePayload` + `summaryLine` + `status` in Prisma.
 * Note: `outcome` of FAILED is still a *successful provider response* (not a transport error).
 */
export type EligibilityVerificationSuccess = {
  providerKey: string;
  outcome: EligibilityOutcome;
  summary: string;
  normalized: {
    outcome: EligibilityOutcome;
    copayCents?: number;
    planName?: string;
    effectiveDate?: string;
    terminationDate?: string;
    reasons?: string[];
  };
  rawResponse: Record<string, unknown>;
};

export type EligibilityVerificationResult = AdapterResult<EligibilityVerificationSuccess>;

/**
 * Payer / clearinghouse eligibility verification.
 * Transport failures → `ok: false`; definitive payer answers → `ok: true` with `data.outcome`.
 */
export interface EligibilityVerificationProvider {
  readonly providerKey: string;
  verify(request: EligibilityVerificationRequest): Promise<EligibilityVerificationResult>;
}
