import { postJson } from "@/services/shared/ai-backend-client";
import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { IntakeChatRequest, IntakeChatResult, IntakeChatbotService } from "./types";

type ChatBackendResponse = {
  provider_key: string;
  message: string;
  citations?: string[];
  suggested_follow_ups?: string[];
};

export class AiIntakeChatbotService implements IntakeChatbotService {
  readonly providerKey = "groq_langchain";

  async reply(request: IntakeChatRequest): Promise<IntakeChatResult> {
    const response = await postJson<ChatBackendResponse, Record<string, unknown>>("/v1/patient-access/chat/respond", {
      session_id: request.sessionId,
      message: request.message,
      locale: request.locale ?? "en-US",
      history: [],
      correlation_id: request.correlationId,
    });

    if (!response.ok) return failureResult(response.error);
    return successResult({
      message: response.data.message,
      citations: response.data.citations ?? [],
      suggestedFollowUps: response.data.suggested_follow_ups ?? [],
    });
  }
}

export function createAiIntakeChatbotService(): IntakeChatbotService {
  return new AiIntakeChatbotService();
}

