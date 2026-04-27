from pydantic import BaseModel, Field

from app.schemas import EligibilityCheckRequest, EligibilityCheckResponse, EligibilityNormalized
from app.services.llm_clients import create_groq_chat


class EligibilityStructuredOutput(BaseModel):
    outcome: str = Field(description="One of VERIFIED, NEEDS_REVIEW, FAILED")
    summary: str
    copay_cents: int | None = None
    deductible_remaining_cents: int | None = None
    plan_name: str | None = None
    effective_date: str | None = None
    termination_date: str | None = None
    reasons: list[str] = Field(default_factory=list)
    confidence: float = 0.0


def _normalize_outcome(value: str) -> str:
    normalized = value.strip().upper()
    if normalized not in {"VERIFIED", "NEEDS_REVIEW", "FAILED"}:
        return "NEEDS_REVIEW"
    return normalized


async def run_eligibility_reasoning(payload: EligibilityCheckRequest) -> EligibilityCheckResponse:
    llm = create_groq_chat(temperature=0.1)
    structured_llm = llm.with_structured_output(EligibilityStructuredOutput)
    prompt = (
        "You are an eligibility verification reasoning assistant for patient access operations. "
        "Given payer/member inputs, infer a likely verification outcome for workflow triage. "
        "Do not fabricate certainty: return NEEDS_REVIEW when details are incomplete. "
        f"Input: {payload.model_dump_json()}"
    )
    result = await structured_llm.ainvoke(prompt)

    normalized = EligibilityNormalized(
        outcome=_normalize_outcome(result.outcome),  # type: ignore[arg-type]
        summary=result.summary,
        copay_cents=result.copay_cents,
        deductible_remaining_cents=result.deductible_remaining_cents,
        plan_name=result.plan_name,
        effective_date=result.effective_date,
        termination_date=result.termination_date,
        reasons=result.reasons,
        confidence=max(0.0, min(1.0, result.confidence)),
    )
    return EligibilityCheckResponse(
        provider_key="groq_langchain",
        normalized=normalized,
        raw_response={"model": "groq", "input": payload.model_dump(mode="json")},
    )

