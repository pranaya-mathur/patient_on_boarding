from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_port: int = 8001
    # Comma-separated in .env — do not use List[str] here: pydantic-settings JSON-decodes list
    # env values before validators run, which breaks plain URLs and empty values.
    cors_allowed_origins_csv: str = Field(
        default="http://localhost:3000",
        validation_alias="CORS_ALLOWED_ORIGINS",
    )

    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"

    openai_api_key: str = ""
    openai_vision_model: str = "gpt-4o-mini"

    @computed_field
    @property
    def cors_allowed_origins(self) -> list[str]:
        raw = self.cors_allowed_origins_csv.strip()
        if not raw:
            return ["http://localhost:3000"]
        return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

