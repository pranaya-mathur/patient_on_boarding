export type {
  InsuranceCardSide,
  OcrExtractRequest,
  OcrExtractResult,
  OcrExtractSuccess,
  OcrInsuranceFields,
  OcrProvider,
} from "./types";
export { MockOcrProvider, createMockOcrProvider } from "./mock-ocr.provider";
export { AiOcrProvider, createAiOcrProvider } from "./ai-ocr.provider";

import { prisma } from "@/lib/prisma";
import { createMockOcrProvider } from "./mock-ocr.provider";

/**
 * Enqueue and execute an OCR job for a specific insurance card.
 * Updates the card status and populates policy fields on success.
 */
export async function triggerOcr(cardId: string): Promise<void> {
  try {
    const card = await prisma.insuranceCard.findUnique({
      where: { id: cardId },
      include: { policy: true },
    });

    if (!card) return;

    await prisma.insuranceCard.update({
      where: { id: cardId },
      data: { ocrStatus: "PROCESSING" },
    });

    const ocrProvider = createMockOcrProvider();
    const result = await ocrProvider.extractInsuranceCard({
      storageKey: card.storageKey,
      side: card.side,
      correlationId: card.id,
    });

    if (result.ok) {
      const { fields } = result.data;
      
      await prisma.$transaction([
        prisma.insuranceCard.update({
          where: { id: cardId },
          data: {
            ocrStatus: "COMPLETE",
            ocrResponse: result.data as any,
          },
        }),
        // Update policy if fields are empty
        prisma.insurancePolicy.update({
          where: { id: card.policyId },
          data: {
            memberId: card.policy.memberId || fields.memberId || "",
            groupNumber: card.policy.groupNumber || fields.groupNumber || null,
            subscriberName: card.policy.subscriberName || fields.subscriberName || null,
          },
        }),
      ]);
    } else {
      await prisma.insuranceCard.update({
        where: { id: cardId },
        data: {
          ocrStatus: "FAILED",
          ocrErrorMessage: result.error.message,
        },
      });
    }
  } catch (error) {
    console.error(`[ocr:trigger] Error processing card ${cardId}:`, error);
    await prisma.insuranceCard.update({
      where: { id: cardId },
      data: {
        ocrStatus: "FAILED",
        ocrErrorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    }).catch(() => {});
  }
}
