import { postJson } from "@/services/shared/ai-backend-client";
import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { ChatRequest, ChatResponse, ChatbotService } from "./types";

type ChatBackendResponse = {
  provider_key: string;
  message: string;
  citations?: string[];
  suggested_follow_ups?: string[];
};

export class AiChatbotService implements ChatbotService {
  readonly serviceKey = "ai_backend";

  async reply(request: ChatRequest): Promise<ChatResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const history = (request.history || []).slice(-12);

      const response = await postJson<ChatBackendResponse, Record<string, unknown>>("/v1/patient-access/chat/respond", {
        session_id: request.sessionId,
        message: request.message,
        locale: request.locale ?? "en-US",
        history: history,
        correlation_id: request.correlationId,
      });

      clearTimeout(timeoutId);

      if (!response.ok) return failureResult(response.error);
      
      // Task 3: Sanitize (strip HTML/scripts)
      const sanitizedMessage = response.data.message.replace(/<[^>]*>?/gm, "").trim();

      return successResult({
        message: sanitizedMessage,
        citations: response.data.citations ?? [],
        suggestedFollowUps: response.data.suggested_follow_ups ?? [],
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        return failureResult({ 
          code: "CHAT_TIMEOUT", 
          message: "Response timed out", 
          retryable: true, 
          transient: true 
        });
      }
      throw error;
    }
  }
}

export function createAiChatbotService(): ChatbotService {
  return new AiChatbotService();
}
