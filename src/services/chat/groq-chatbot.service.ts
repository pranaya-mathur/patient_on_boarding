import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { ChatRequest, ChatResponse, ChatbotService } from "./types";

const SYSTEM_PROMPT = `You are a patient intake assistant for a medical clinic. You ONLY help with:
   - Questions about filling out this registration form
   - What documents or information the patient needs
   - How to upload an insurance card photo
   - What to expect on arrival (parking, check-in, wait times)
   - General logistics (reminders, rescheduling contact info)
   NEVER answer medical, clinical, diagnostic, or treatment questions.
   If asked anything medical, say: 'For medical questions, please contact your clinic directly.'
   Keep responses under 3 sentences. Be warm and clear.`;

export class GroqChatbotService implements ChatbotService {
  readonly serviceKey = "groq_langchain";

  async reply(request: ChatRequest): Promise<ChatResponse> {
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
      }

      const model = new ChatGroq({ 
        apiKey: process.env.GROQ_API_KEY, 
        model: "llama3-70b-8192" 
      });

      const res = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(request.message)
      ]);

      const message = typeof res.content === "string" ? res.content : JSON.stringify(res.content);

      // suggestedFollowUps via keyword matching
      const suggestedFollowUps: string[] = [];
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("upload")) suggestedFollowUps.push("How do I upload my insurance card?");
      if (lowerMsg.includes("arrival") || lowerMsg.includes("check-in")) suggestedFollowUps.push("What do I bring on arrival day?");
      if (lowerMsg.includes("reminder")) suggestedFollowUps.push("When will I get a reminder?");

      return successResult({ 
        message, 
        citations: [], 
        suggestedFollowUps 
      });
    } catch (error) {
      console.error("[chat:groq-service:error]", error);
      return failureResult({ 
        code: "CHAT_FAILED", 
        message: error instanceof Error ? error.message : "Chat failed",
        retryable: true, 
        transient: true 
      });
    }
  }
}
