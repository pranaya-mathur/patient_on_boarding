import type { AdapterResult } from "@/services/shared/adapter-result";

export type IntakeChatRequest = {
  /** Opaque session / intake id for logging (no PHI in chat logs by policy) */
  sessionId: string;
  message: string;
  locale?: string;
  correlationId?: string;
};

export type IntakeChatSuccess = {
  message: string;
  citations?: string[];
  suggestedFollowUps?: string[];
};

export type IntakeChatResult = AdapterResult<IntakeChatSuccess>;

/**
 * Constrained intake / logistics assistant (no clinical advice).
 * Policy refusals should use `ok: false` with stable `error.code` for analytics.
 */
export interface IntakeChatbotService {
  readonly providerKey: string;
  reply(request: IntakeChatRequest): Promise<IntakeChatResult>;
}

/** Non-retryable policy outcomes — distinct from transport failures */
export const INTAKE_CHAT_POLICY_CODES = ["OFF_TOPIC", "CLINICAL_REFUSAL"] as const;
export type IntakeChatPolicyCode = (typeof INTAKE_CHAT_POLICY_CODES)[number];
