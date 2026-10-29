from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

# Pure PostgreSQL engine configuration (with connection pooling)
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Proactively test connection before using from pool
    pool_recycle=300,    # Recycle connections every 5 minutes
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a PostgreSQL session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """Verifies live PostgreSQL database connectivity."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1;")).scalar()
            return {
                "status": "connected" if result == 1 else "unexpected_result",
                "engine": "PostgreSQL",
                "database_url_host": settings.DATABASE_URL.split("@")[-1].split("/")[0] if "@" in settings.DATABASE_URL else "localhost",
                "error": None,
            }
    except Exception as e:
        logger.error(f"PostgreSQL Connection Error: {str(e)}")
        return {
            "status": "disconnected",
            "engine": "PostgreSQL",
            "database_url_host": settings.DATABASE_URL.split("@")[-1].split("/")[0] if "@" in settings.DATABASE_URL else "localhost",
            "error": str(e),
        }
