from pydantic import BaseModel, Field

from app.schemas import ChatRequest, ChatResponse
from app.services.llm_clients import create_groq_chat


class ChatStructuredOutput(BaseModel):
    message: str
    citations: list[str] = Field(default_factory=list)
    suggested_follow_ups: list[str] = Field(default_factory=list)


SAFETY_SYSTEM_PROMPT = (
    "You are a patient access virtual assistant for healthcare front-end automation. "
    "Help with registration, insurance verification questions, payment planning logistics, "
    "appointment intake steps, and non-clinical operational guidance. "
    "Do not provide diagnosis or clinical advice. "
    "If the user requests medical advice, politely redirect to a clinician."
)


async def run_patient_access_chat(payload: ChatRequest) -> ChatResponse:
    llm = create_groq_chat(temperature=0.25)
    structured_llm = llm.with_structured_output(ChatStructuredOutput)

    history_text = "\n".join([f"{m.role}: {m.content}" for m in payload.history[-12:]])
    prompt = (
        f"{SAFETY_SYSTEM_PROMPT}\n\n"
        f"Session: {payload.session_id}\n"
        f"Locale: {payload.locale}\n"
        f"Recent chat history:\n{history_text if history_text else '(none)'}\n\n"
        f"User message: {payload.message}\n"
        "Respond with concise, helpful operational guidance."
    )
    result = await structured_llm.ainvoke(prompt)
    return ChatResponse(
        provider_key="groq_langchain",
        message=result.message,
        citations=result.citations,
        suggested_follow_ups=result.suggested_follow_ups,
    )

