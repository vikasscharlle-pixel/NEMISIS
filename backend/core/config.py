from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env."""

    APP_NAME: str = "NEMESIS-X API"
    APP_VERSION: str = "1.0.0-phase1"
    ENVIRONMENT: str = "development"

    # Database & Cache
    DATABASE_URL: str = "sqlite:///./nemesis_dev.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Security
    JWT_SECRET_KEY: str = "nemesis-x-dev-secret-change-in-production-32bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5175,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings instance."""
    return Settings()
