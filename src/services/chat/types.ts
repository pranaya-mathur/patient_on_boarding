import type { AdapterResult } from "@/services/shared/adapter-result";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  /** Opaque session / intake id for logging (no PHI in chat logs by policy) */
  sessionId: string;
  message: string;
  history?: ChatMessage[];
  locale?: string;
  correlationId?: string;
};

export type ChatSuccess = {
  message: string;
  citations?: string[];
  suggestedFollowUps?: string[];
};

export type ChatResponse = AdapterResult<ChatSuccess>;

/**
 * Constrained intake / logistics assistant (no clinical advice).
 */
export interface ChatbotService {
  readonly serviceKey: string;
  reply(request: ChatRequest): Promise<ChatResponse>;
}

/** Non-retryable policy outcomes — distinct from transport failures */
export const INTAKE_CHAT_POLICY_CODES = ["OFF_TOPIC", "CLINICAL_REFUSAL"] as const;
export type IntakeChatPolicyCode = (typeof INTAKE_CHAT_POLICY_CODES)[number];
