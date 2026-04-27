from typing import Any, Literal

from pydantic import BaseModel, Field


class InsuranceOcrResult(BaseModel):
    payer_name_guess: str | None = None
    member_id: str | None = None
    group_number: str | None = None
    subscriber_name: str | None = None
    plan_name: str | None = None
    confidence: dict[str, float] = Field(default_factory=dict)
    raw_text: str | None = None


class OcrExtractResponse(BaseModel):
    provider_key: str = "openai_vision"
    fields: InsuranceOcrResult
    raw: dict[str, Any] = Field(default_factory=dict)


class EligibilityCheckRequest(BaseModel):
    payer_key: str = Field(min_length=1)
    member_id: str = Field(min_length=1)
    group_number: str | None = None
    patient_name: str | None = None
    date_of_service: str | None = None


class EligibilityNormalized(BaseModel):
    outcome: Literal["VERIFIED", "NEEDS_REVIEW", "FAILED"]
    summary: str
    copay_cents: int | None = None
    deductible_remaining_cents: int | None = None
    plan_name: str | None = None
    effective_date: str | None = None
    termination_date: str | None = None
    reasons: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class EligibilityCheckResponse(BaseModel):
    provider_key: str = "groq_langchain"
    normalized: EligibilityNormalized
    raw_response: dict[str, Any] = Field(default_factory=dict)


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1)
    message: str = Field(min_length=1)
    locale: str = "en-US"
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    provider_key: str = "groq_langchain"
    message: str
    citations: list[str] = Field(default_factory=list)
    suggested_follow_ups: list[str] = Field(default_factory=list)

