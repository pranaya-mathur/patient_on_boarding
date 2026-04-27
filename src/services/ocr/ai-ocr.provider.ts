import { OpenAI } from "openai";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import { readFile } from "@/lib/storage";
import { failureResult, successResult } from "@/services/shared/adapter-result";
import type { OcrExtractRequest, OcrExtractResult, OcrProvider } from "./types";

const SYSTEM_PROMPT = `You are an insurance card OCR assistant. Extract the following fields from the insurance
   card image and return ONLY valid JSON with these exact keys: payerName, memberId,
   groupNumber, planType, subscriberName, rxBin, rxPcn.
   If a field is not visible, set it to null.
   Do not include any explanation or markdown.`;

export class AiOcrProvider implements OcrProvider {
  readonly providerKey = "ai_vision";

  async extractInsuranceCard(request: OcrExtractRequest): Promise<OcrExtractResult> {
    try {
      const { storageKey } = request;
      if (!storageKey) {
        return failureResult({ code: "OCR_FAILED", message: "Missing storage key", retryable: false, transient: false });
      }

      const imageBuffer = await readFile(storageKey);
      const base64 = imageBuffer.toString("base64");
      
      let raw = "";

      if (process.env.OPENAI_API_KEY) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const res = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: SYSTEM_PROMPT },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
            ]
          }]
        });
        raw = res.choices[0].message.content ?? "";
      } else if (process.env.GROQ_API_KEY) {
        const model = new ChatGroq({ 
          apiKey: process.env.GROQ_API_KEY, 
          model: "llama-3.2-90b-vision-preview" 
        });
        const res = await model.invoke([new HumanMessage({
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
          ]
        })]);
        raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
      } else {
        throw new Error("OCR requires either OPENAI_API_KEY or GROQ_API_KEY");
      }

      const jsonStr = raw.replace(/```json|```/g, "").trim();
      const fields = JSON.parse(jsonStr);
      
      return successResult({ ...fields, rawText: raw });
    } catch (error) {
      console.error("[ocr:ai-provider:error]", error);
      return failureResult({ 
        code: "OCR_FAILED", 
        message: error instanceof Error ? error.message : "AI OCR processing failed",
        retryable: true, 
        transient: true 
      });
    }
  }
}

export function createAiOcrProvider(): OcrProvider {
  return new AiOcrProvider();
}
