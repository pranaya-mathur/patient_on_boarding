import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createChatbotService } from "@/services/chat";

// In-memory rate limiting Map
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Validate intake token against DB
    const patient = await prisma.patient.findUnique({
      where: { intakeToken: token },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { ok: false, error: "Invalid session" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { message, history } = body;

    // Validate message
    if (!message || typeof message !== "string" || message.length > 500) {
      return NextResponse.json(
        { ok: false, error: "Message too long or empty" },
        { status: 400 }
      );
    }

    // Rate limiting: 20 per hour
    const now = Date.now();
    const limit = rateLimitMap.get(patient.id);

    if (limit && now < limit.resetAt) {
      if (limit.count >= 20) {
        return NextResponse.json(
          { ok: false, error: "Too many messages" },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      rateLimitMap.set(patient.id, {
        count: 1,
        resetAt: now + 3600000, // 1 hour
      });
    }

    const service = createChatbotService();
    const result = await service.reply({
      message,
      history,
      sessionId: token,
    });

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        message: result.data.message,
        suggestedFollowUps: result.data.suggestedFollowUps || [],
      });
    } else {
      return NextResponse.json(
        { ok: false, error: result.error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[api:chat:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
