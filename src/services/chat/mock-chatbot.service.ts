import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { IntakeChatbotService, IntakeChatRequest, IntakeChatResult } from "./types";

const FAQ: Record<string, string> = {
  hours: "Most clinics publish hours on your appointment confirmation. This demo cannot look up live hours.",
  parking: "Parking is facility-specific. Check your visit instructions or the location website.",
  insurance: "Bring your physical or digital insurance card. You can upload photos in the intake flow.",
  documents: "Government-issued ID and your insurance card are typically required for new-patient intake.",
};

/**
 * Keyword FAQ bot — swap for HTTP LLM with strict system prompt + guardrails.
 */
export class MockIntakeChatbotService implements IntakeChatbotService {
  readonly providerKey = "mock_intake_chat";

  async reply(request: IntakeChatRequest): Promise<IntakeChatResult> {
    if (request.message.includes("rate") || request.message.includes("timeout")) {
      return failureResult({
        code: "CHAT_RATE_LIMITED",
        message: "Mock: too many messages — please wait a moment.",
        retryable: true,
        transient: true,
        retryAfterMs: 3000,
        providerRequestId: `mock-chat-${request.correlationId ?? request.sessionId.slice(-8)}`,
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
        details: { sessionId: request.sessionId },
      });
    }

    if (m.includes("hour") || m.includes("open")) {
      return successResult({ message: FAQ.hours, citations: ["faq:hours"] });
    }
    if (m.includes("park")) {
      return successResult({ message: FAQ.parking, citations: ["faq:parking"] });
    }
    if (m.includes("insurance") || m.includes("card")) {
      return successResult({ message: FAQ.insurance });
    }
    if (m.includes("document") || m.includes("id")) {
      return successResult({ message: FAQ.documents });
    }

    return failureResult({
      code: "OFF_TOPIC",
      message:
        "I can answer short questions about intake steps, insurance upload, and general visit logistics. Try asking about documents, insurance cards, or parking.",
      retryable: false,
      transient: false,
    });
  }
}

export function createMockIntakeChatbotService(): IntakeChatbotService {
  return new MockIntakeChatbotService();
}
