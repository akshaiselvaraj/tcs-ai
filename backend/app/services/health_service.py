from datetime import datetime, timezone
from app.core.config import settings
from app.db.session import check_db_connection
from app.schemas.health import HealthResponse, DatabaseHealth


class HealthService:
    @staticmethod
    def get_system_health() -> HealthResponse:
        db_info = check_db_connection()
        db_health = DatabaseHealth(
            status=db_info["status"],
            engine=db_info["engine"],
            database_url_host=db_info["database_url_host"],
            error=db_info["error"],
        )
        
        system_status = "healthy" if db_info["status"] == "connected" else "degraded"

        return HealthResponse(
            status=system_status,
            project_name=settings.PROJECT_NAME,
            version="1.0.0",
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc),
            database=db_health,
        )


health_service = HealthService()
