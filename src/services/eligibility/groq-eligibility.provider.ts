import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { 
  EligibilityVerificationRequest, 
  EligibilityVerificationResult, 
  EligibilityVerificationProvider 
} from "./types";

const SYSTEM_PROMPT = `You are an insurance eligibility verification assistant. Given patient insurance details,
   return ONLY valid JSON with these exact keys:
   outcome (one of: VERIFIED, NEEDS_REVIEW, FAILED),
   summary (one sentence plain English),
   planName (string or null),
   copayCents (integer in cents or null),
   effectiveDate (YYYY-MM-DD or null),
   terminationDate (YYYY-MM-DD or null),
   reasons (array of strings, empty if VERIFIED).
   Rules: If memberId is 8+ chars and payerName is a recognizable US insurer → VERIFIED.
   If payerName unknown or memberId too short → NEEDS_REVIEW.
   If no data provided → FAILED.
   Do not include explanation or markdown.`;

export class GroqEligibilityVerificationProvider implements EligibilityVerificationProvider {
  readonly providerKey = "groq_langchain";

  async verify(request: EligibilityVerificationRequest): Promise<EligibilityVerificationResult> {
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
      }

      const model = new ChatGroq({ 
        apiKey: process.env.GROQ_API_KEY, 
        model: "llama-3.3-70b-versatile" 
      });

      const res = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(JSON.stringify(request))
      ]);

      const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
      const jsonStr = raw.replace(/```json|```/g, "").trim();
      const fields = JSON.parse(jsonStr);

      return successResult({
        providerKey: this.providerKey,
        outcome: fields.outcome,
        summary: fields.summary,
        normalized: {
          outcome: fields.outcome,
          planName: fields.planName,
          copayCents: fields.copayCents,
          effectiveDate: fields.effectiveDate,
          terminationDate: fields.terminationDate,
        },
        rawResponse: { raw },
      });
    } catch (error) {
      console.error("[eligibility:groq-provider:error]", error);
      return failureResult({ 
        code: "ELIGIBILITY_FAILED", 
        message: error instanceof Error ? error.message : "Groq eligibility check failed",
        retryable: true, 
        transient: true 
      });
    }
  }
}
