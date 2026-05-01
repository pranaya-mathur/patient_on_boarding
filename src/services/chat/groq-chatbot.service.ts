import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
      }

      const model = new ChatGroq({ 
        apiKey: process.env.GROQ_API_KEY, 
        model: "llama-3.3-70b-versatile",
      });

      // Task 2: Build message array with capped history
      const history = (request.history || []).slice(-12); // Last 6 exchanges
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...history.map((m) => 
          m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
        ),
        new HumanMessage(request.message)
      ];

      // Task 3: 10s timeout
      const res = await Promise.race([
        model.invoke(messages, { signal: controller.signal }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 10000)
        )
      ]);

      clearTimeout(timeoutId);

      // Task 3: Extract text block content
      let content = "";
      if (typeof res.content === "string") {
        content = res.content;
      } else if (Array.isArray(res.content)) {
        // Extract first text block if present
        const textBlock = res.content.find(
          (b) => typeof b === "string" || (typeof b === "object" && b !== null && "text" in b)
        );
        if (typeof textBlock === "string") {
          content = textBlock;
        } else if (
          textBlock &&
          typeof textBlock === "object" &&
          "text" in textBlock &&
          typeof (textBlock as { text: unknown }).text === "string"
        ) {
          content = (textBlock as { text: string }).text;
        }
      }

      // Task 3: Sanitize (strip HTML/scripts)
      const sanitizedMessage = content.replace(/<[^>]*>?/gm, "").trim();

      // suggestedFollowUps via keyword matching
      const suggestedFollowUps: string[] = [];
      const lowerMsg = sanitizedMessage.toLowerCase();
      if (lowerMsg.includes("upload")) suggestedFollowUps.push("How do I upload my insurance card?");
      if (lowerMsg.includes("arrival") || lowerMsg.includes("check-in")) suggestedFollowUps.push("What do I bring on arrival day?");
      if (lowerMsg.includes("reminder")) suggestedFollowUps.push("When will I get a reminder?");

      return successResult({ 
        message: sanitizedMessage, 
        citations: [], 
        suggestedFollowUps 
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("[chat:groq-service:error]", error);
      
      if (error instanceof Error && (error.name === "AbortError" || error.message === "Timeout")) {
        return failureResult({ 
          code: "CHAT_TIMEOUT", 
          message: "Response timed out", 
          retryable: true, 
          transient: true 
        });
      }

      return failureResult({ 
        code: "CHAT_FAILED", 
        message: error instanceof Error ? error.message : "Chat failed",
        retryable: true, 
        transient: true 
      });
    }
  }
}
