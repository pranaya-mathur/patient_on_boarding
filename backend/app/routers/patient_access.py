from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas import ChatRequest, ChatResponse, EligibilityCheckRequest, EligibilityCheckResponse, OcrExtractResponse
from app.services.chat_service import run_patient_access_chat
from app.services.eligibility_service import run_eligibility_reasoning
from app.services.ocr_service import parse_insurance_card_image

router = APIRouter(prefix="/v1/patient-access", tags=["patient-access"])


@router.post("/ocr/insurance-card", response_model=OcrExtractResponse)
async def ocr_insurance_card(file: UploadFile = File(...), side: str = Form(default="FRONT")) -> OcrExtractResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload must be an image file")
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    response = await parse_insurance_card_image(image_bytes=image_bytes, mime_type=file.content_type)
    response.raw["side"] = side.upper()
    return response


@router.post("/eligibility/check", response_model=EligibilityCheckResponse)
async def check_eligibility(payload: EligibilityCheckRequest) -> EligibilityCheckResponse:
    return await run_eligibility_reasoning(payload)


@router.post("/chat/respond", response_model=ChatResponse)
async def patient_access_chat(payload: ChatRequest) -> ChatResponse:
    return await run_patient_access_chat(payload)

