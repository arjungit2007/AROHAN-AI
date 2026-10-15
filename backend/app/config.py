import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AROHAN AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "arohan-secure-development-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database - Default SQLite for zero-friction local run; switchable to PostgreSQL via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./arohan.db")
    
    # CORS
    # Can be provided as comma-separated string, JSON array, or list of origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://arohan-phi.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            parsed = [origin.strip() for origin in v.split(",") if origin.strip()]
            return parsed if parsed else ["*"]
        return v
    
    # AI Providers
    # Options: "auto", "gemini", "openai", "rule_based"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Bhashini / Speech Service
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")
    BHASHINI_PIPELINE_ID: str = os.getenv("BHASHINI_PIPELINE_ID", "")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
