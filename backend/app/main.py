from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers.health import router as health_router
from app.routers.patient_access import router as patient_access_router

settings = get_settings()

app = FastAPI(
    title="Patient Access AI Backend",
    version="0.1.0",
    description="FastAPI + LangChain + Groq/OpenAI backend for patient access automation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(patient_access_router)

