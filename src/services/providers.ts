import { createAiChatbotService, createMockChatbotService } from "@/services/chat";
import { createAiEligibilityVerificationProvider, createMockEligibilityVerificationProvider } from "@/services/eligibility";
import { createAiOcrProvider, createMockOcrProvider } from "@/services/ocr";
import { createMockReminderService } from "@/services/reminders";
import type { ChatbotService } from "@/services/chat";
import type { EligibilityVerificationProvider } from "@/services/eligibility";
import type { OcrProvider } from "@/services/ocr";
import type { ReminderService } from "@/services/reminders";

export type AppServiceProviders = {
  ocr: OcrProvider;
  eligibility: EligibilityVerificationProvider;
  reminders: ReminderService;
  chat: ChatbotService;
};

export function createServiceProviders(): AppServiceProviders {
  const useAiBackend = process.env.USE_AI_BACKEND === "true";
  return {
    ocr: useAiBackend ? createAiOcrProvider() : createMockOcrProvider(),
    eligibility: useAiBackend ? createAiEligibilityVerificationProvider() : createMockEligibilityVerificationProvider(),
    reminders: createMockReminderService(),
    chat: useAiBackend ? createAiChatbotService() : createMockChatbotService(),
  };
}

