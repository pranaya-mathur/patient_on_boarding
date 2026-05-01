import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerOcr } from "@/services/ocr";
import { uploadFile } from "@/lib/storage";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const formData = await req.formData();
    
    const file = formData.get("file") as File | null;
    const side = formData.get("side") as "FRONT" | "BACK" | null;
    const policyId = formData.get("policyId") as string | null;

    if (!file || !side || !policyId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "File too large. Max size is 10MB." },
        { status: 400 }
      );
    }

    // Verify patient and policy
    const patient = await prisma.patient.findUnique({
      where: { intakeToken: token },
    });

    if (!patient) {
      return NextResponse.json({ ok: false, error: "Patient not found" }, { status: 404 });
    }

    const policy = await prisma.insurancePolicy.findFirst({
      where: { id: policyId, patientId: patient.id },
    });

    if (!policy) {
      return NextResponse.json({ ok: false, error: "Policy not found" }, { status: 404 });
    }

    // Upload to local storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadFile(buffer, file.name, "insurance-cards");

    // Create InsuranceCard record
    const card = await prisma.insuranceCard.upsert({
      where: {
        policyId_side: {
          policyId: policy.id,
          side: side,
        },
      },
      update: {
        storageKey: uploadResult.storageKey,
        mimeType: file.type,
        ocrStatus: "PENDING",
        ocrErrorMessage: null,
      },
      create: {
        policyId: policy.id,
        side,
        storageKey: uploadResult.storageKey,
        mimeType: file.type,
        ocrStatus: "PENDING",
      },
    });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        action: "INSURANCE_CARD_UPLOADED",
        entityType: "InsuranceCard",
        entityId: card.id,
        metadata: {
          side,
          mimeType: file.type,
          storageKey: uploadResult.storageKey,
        },
      },
    });

    // Enqueue OCR job (async)
    triggerOcr(card.id).catch((err) =>
      console.error(`[api:intake:upload:ocr:error] ${card.id}`, err)
    );

    return NextResponse.json({ 
      ok: true, 
      cardId: card.id, 
      ocrStatus: "PENDING",
      publicUrl: uploadResult.publicUrl 
    });
  } catch (error) {
    console.error("[api:intake:upload-card:error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
