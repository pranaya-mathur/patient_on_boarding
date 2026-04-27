import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GroqChatbotService } from "@/services/chat/groq-chatbot.service";
import { MockChatbotService } from "@/services/chat/mock-chatbot.service";

const MEDICAL_KEYWORDS = [
  "diagnose", "symptom", "medication", "prescribe", "treatment", "dose",
  "pain", "chest", "emergency", "doctor", "nurse", "clinical", "bleed", "fever", "surgery"
];

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { message, sessionId } = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { intakeToken: token },
    });

    if (!patient) {
      return NextResponse.json({ ok: false, error: "Patient not found" }, { status: 404 });
    }

    // Guardrail check
    const lowerMessage = message.toLowerCase();
    if (MEDICAL_KEYWORDS.some(k => lowerMessage.includes(k))) {
      return NextResponse.json({ 
        ok: true, 
        data: { 
          message: "For medical questions or emergencies, please contact your clinic directly or call 911.", 
          suggestedFollowUps: [], 
          isGuardrail: true 
        } 
      });
    }

    // Provider selection
    const service = process.env.GROQ_API_KEY 
      ? new GroqChatbotService() 
      : new MockChatbotService();

    const result = await service.reply({ message, sessionId, patientId: patient.id });

    if (result.ok) {
      return NextResponse.json({ 
        ok: true, 
        data: { 
          message: result.data.message, 
          suggestedFollowUps: result.data.suggestedFollowUps, 
          isGuardrail: false 
        } 
      });
    } else {
      return NextResponse.json({ 
        ok: true, 
        data: { 
          message: "I'm having trouble right now. Please contact the clinic directly.", 
          suggestedFollowUps: [], 
          isGuardrail: true 
        } 
      });
    }
  } catch (error) {
    console.error("[api:intake:chat:error]", error);
    return NextResponse.json({ 
      ok: true, 
      data: { 
        message: "I'm having trouble right now. Please contact the clinic directly.", 
        suggestedFollowUps: [], 
        isGuardrail: true 
      } 
    });
  }
}
