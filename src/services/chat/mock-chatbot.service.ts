import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { ChatbotService, ChatRequest, ChatResponse } from "./types";

const FAQ: Record<string, string> = {
  hours: "Most clinics publish hours on your appointment confirmation. This demo cannot look up live hours.",
  parking: "Parking is facility-specific. Check your visit instructions or the location website.",
  insurance: "Bring your physical or digital insurance card. You can upload photos in the intake flow.",
  documents: "Government-issued ID and your insurance card are typically required for new-patient intake.",
};

/**
 * Keyword FAQ bot — swap for HTTP LLM with strict system prompt + guardrails.
 */
export class MockChatbotService implements ChatbotService {
  readonly serviceKey = "mock_intake_chat";

  async reply(request: ChatRequest): Promise<ChatResponse> {
    if (request.message.includes("rate") || request.message.includes("timeout")) {
      return failureResult({
        code: "CHAT_RATE_LIMITED",
        message: "Mock: too many messages — please wait a moment.",
        retryable: true,
        transient: true,
        retryAfterMs: 3000,
      });
    }

    if (request.message.includes("unavailable")) {
      return failureResult({
        code: "CHAT_PROVIDER_UNAVAILABLE",
        message: "Mock: assistant temporarily unavailable — retry shortly.",
        retryable: true,
        transient: true,
        retryAfterMs: 1500,
      });
    }

    const m = request.message.toLowerCase();

    if (/\b(diagnos|symptom|pain|medication|dose|treatment|cure)\b/.test(m)) {
      return failureResult({
        code: "CLINICAL_REFUSAL",
        message:
          "I can help with registration, insurance upload, and visit logistics only — not medical questions. Please contact your care team for clinical concerns.",
        retryable: false,
        transient: false,
      });
    }

    let message = "I can answer short questions about intake steps, insurance upload, and general visit logistics. Try asking about documents, insurance cards, or parking.";
    let suggestedFollowUps: string[] = ["What documents do I need?", "How do I upload my insurance card?"];

    if (m.includes("hour") || m.includes("open")) {
      message = FAQ.hours;
      suggestedFollowUps = ["Is there parking?"];
    } else if (m.includes("park")) {
      message = FAQ.parking;
      suggestedFollowUps = ["What documents do I need?"];
    } else if (m.includes("insurance") || m.includes("card")) {
      message = FAQ.insurance;
      suggestedFollowUps = ["How do I upload my insurance card?"];
    } else if (m.includes("document") || m.includes("id")) {
      message = FAQ.documents;
      suggestedFollowUps = ["Do I need my insurance card?"];
    }

    return successResult({ 
      message, 
      citations: [], 
      suggestedFollowUps 
    });
  }
}

export function createMockChatbotService(): ChatbotService {
  return new MockChatbotService();
}
