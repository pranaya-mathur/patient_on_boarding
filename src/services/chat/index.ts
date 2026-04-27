export type {
  ChatbotService,
  ChatRequest,
  ChatResponse,
  ChatSuccess,
  ChatMessage,
} from "./types";

export { MockChatbotService, createMockChatbotService } from "./mock-chatbot.service";
export { AiChatbotService, createAiChatbotService } from "./ai-chatbot.service";
export { GroqChatbotService } from "./groq-chatbot.service";

import { MockChatbotService } from "./mock-chatbot.service";
import { GroqChatbotService } from "./groq-chatbot.service";
import { ChatbotService } from "./types";

export function createChatbotService(): ChatbotService {
  if (process.env.GROQ_API_KEY) {
    return new GroqChatbotService();
  }
  return new MockChatbotService();
}
