import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CanteenIQ — Menu Mix Optimization"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Pure PostgreSQL Database URL (No SQLite fallback)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/canteen_iq"
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            raise ValueError("DATABASE_URL must be provided and must be a valid PostgreSQL connection string.")
        
        # Normalize postgres:// and postgresql:// to postgresql+psycopg2:// for SQLAlchemy 2.0 compatibility
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+psycopg2://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
            
        if not (v.startswith("postgresql://") or v.startswith("postgresql+psycopg2://") or v.startswith("postgresql+psycopg://")):
            raise ValueError(
                f"Invalid DATABASE_URL scheme '{v.split('://')[0]}'. "
                f"CanteenIQ strictly requires a PostgreSQL database (e.g. Supabase or local PostgreSQL). SQLite is not allowed."
            )
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return ["*"]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
