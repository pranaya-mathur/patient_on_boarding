import base64
from typing import Any

from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from app.schemas import InsuranceOcrResult, OcrExtractResponse
from app.services.llm_clients import create_openai_vision_chat


class OcrStructuredOutput(BaseModel):
    payer_name_guess: str | None = Field(default=None)
    member_id: str | None = Field(default=None)
    group_number: str | None = Field(default=None)
    subscriber_name: str | None = Field(default=None)
    plan_name: str | None = Field(default=None)
    confidence: dict[str, float] = Field(default_factory=dict)
    raw_text: str | None = Field(default=None)


async def parse_insurance_card_image(image_bytes: bytes, mime_type: str) -> OcrExtractResponse:
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    llm = create_openai_vision_chat(temperature=0.0)
    structured_llm = llm.with_structured_output(OcrStructuredOutput)

    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": (
                    "Extract insurance details from this card image. "
                    "Return payer name, member id, group number, subscriber name, and plan name. "
                    "Set missing values to null. "
                    "Add confidence score per extracted field (0 to 1). "
                    "Capture visible OCR text in raw_text."
                ),
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{image_b64}"},
            },
        ]
    )

    result = await structured_llm.ainvoke([message])
    fields = InsuranceOcrResult.model_validate(result.model_dump())
    return OcrExtractResponse(
        provider_key="openai_vision",
        fields=fields,
        raw={"model": "openai_vision", "mimeType": mime_type},
    )

