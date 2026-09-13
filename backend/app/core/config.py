from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "National Digital Platform for Land Governance"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Databases
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    DATABASE_URL: str = "sqlite:///./data/landgov.db"

    # Auth
    JWT_SECRET_KEY: str = "landgov_national_platform_secret_key_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"

    # AI / LLM
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"

    # WhatsApp & Multi-Modal
    WHATSAPP_TOKEN: str = "demo_token"
    WHATSAPP_PHONE_NUMBER_ID: str = "123456789"
    WHATSAPP_VERIFY_TOKEN: str = "landgov_verify_token"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent / ".env",
        extra="ignore"
    )


settings = Settings()
