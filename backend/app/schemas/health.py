from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DatabaseHealth(BaseModel):
    status: str  # connected, disconnected
    engine: str  # PostgreSQL
    database_url_host: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    project_name: str
    version: str
    environment: str
    timestamp: datetime
    database: DatabaseHealth
