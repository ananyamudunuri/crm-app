"""
Application configuration using environment variables.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Customer CRM API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"

    # API
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Security
    SECRET_KEY: str = "dev-secret-key"
    API_KEY_HEADER: str = "X-API-Key"

    # Feature flags
    ENABLE_AUDIT_LOGS: bool = True
    ENABLE_EMAIL_NOTIFICATIONS: bool = False
    ENABLE_RATE_LIMITING: bool = False

    # Admin
    ADMIN_EMAIL: str = "admin@crm-app.com"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    # GCP
    GCS_BUCKET_NAME: str = "crm-dev-uploads"
    GCS_PROJECT_ID: str = "your-gcp-project-id"

    model_config = SettingsConfigDict(
        env_file="/Users/ananyamudunuri/Desktop/crm-app/backend/.env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()