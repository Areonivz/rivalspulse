"""
Application configuration loaded from environment variables / .env file.
All settings are read once at startup via pydantic-settings.
"""
from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    # Database — asyncpg async driver (MVP 3+)
    # Override in .env: DATABASE_URL=postgresql+asyncpg://user:pw@host:5432/rivalspulse
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/rivalspulse"

    # CORS — accepts a comma-separated string and splits it into a list
    cors_origins: str = "http://localhost:3000"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors(cls, v: str) -> str:
        # Keep as raw string; property below handles the split so the
        # field itself stays a plain str (simpler serialisation).
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Single shared instance — import this everywhere, do not re-instantiate.
settings = Settings()
