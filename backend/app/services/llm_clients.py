from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

from app.config import get_settings


def create_groq_chat(temperature: float = 0.1) -> ChatGroq:
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        temperature=temperature,
    )


def create_openai_vision_chat(temperature: float = 0.0) -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        api_key=settings.openai_api_key,
        model=settings.openai_vision_model,
        temperature=temperature,
    )

