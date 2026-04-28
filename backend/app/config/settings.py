from functools import lru_cache
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Founder Decision Engine"
    api_prefix: str = ""
    cors_origins: list[str] = ["*"]
    database_url: str = (
        os.getenv("DATABASE_URL")
        or (
            "sqlite:////tmp/autopilot_ai.db"
            if os.getenv("VERCEL")
            else f"sqlite:///{(Path(__file__).resolve().parents[3] / 'autopilot_ai.db').as_posix()}"
        )
    )
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"


@lru_cache
def get_settings() -> Settings:
    return Settings()