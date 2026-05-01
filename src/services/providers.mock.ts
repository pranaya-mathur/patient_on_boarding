import { createMockChatbotService } from "@/services/chat";
import { createMockEligibilityVerificationProvider } from "@/services/eligibility";
import { createMockOcrProvider } from "@/services/ocr";
import { createMockReminderService } from "@/services/reminders";
import type { ChatbotService } from "@/services/chat";
import type { EligibilityVerificationProvider } from "@/services/eligibility";
import type { OcrProvider } from "@/services/ocr";
import type { ReminderService } from "@/services/reminders";

/** Bundle of MVP adapters — swap this factory for `createProductionProviders()` later. */
export type AppServiceProviders = {
  ocr: OcrProvider;
  eligibility: EligibilityVerificationProvider;
  reminders: ReminderService;
  chat: ChatbotService;
};

export function createMockServiceProviders(): AppServiceProviders {
  return {
    ocr: createMockOcrProvider(),
    eligibility: createMockEligibilityVerificationProvider(),
    reminders: createMockReminderService(),
    chat: createMockChatbotService(),
  };
}
