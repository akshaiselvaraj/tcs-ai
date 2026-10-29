from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app.core.logging import logger
from app.db.base import Base
from app.db.session import engine, check_db_connection
from app.models import (
    MenuItem,
    SalesHistory,
    DemandForecast,
    WeeklyMenuPlan,
    WeeklyMenuItem,
    OptimizationSetting,
    ImportJob,
)
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize PostgreSQL tables on startup."""
    logger.info("Initializing CanteenIQ application...")
    logger.info(f"Target Database URL: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    
    # Check DB Connection
    db_check = check_db_connection()
    if db_check["status"] == "connected":
        logger.info("PostgreSQL connection verified successfully. Ensuring tables exist...")
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables initialized successfully.")
        except Exception as e:
            logger.error(f"Error creating PostgreSQL tables: {e}")
    else:
        logger.warning(f"PostgreSQL connection is currently {db_check['status']}: {db_check['error']}")
    
    yield
    logger.info("Shutting down CanteenIQ...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Menu Mix Optimization, Demand Forecasting, and Weekly Planner for College Canteens.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
def root():
    """Redirect root path directly to Swagger documentation."""
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")
