from fastapi import APIRouter
from app.api.v1.controllers import (
    health_controller,
    menu_items_controller,
    data_controller,
    model_controller,
    forecast_controller,
    optimizer_controller,
    weekly_planner_controller,
    analytics_controller,
    settings_controller,
)

api_router = APIRouter()

api_router.include_router(health_controller.router)
api_router.include_router(menu_items_controller.router)
api_router.include_router(data_controller.router)
api_router.include_router(model_controller.router)
api_router.include_router(forecast_controller.router)
api_router.include_router(optimizer_controller.router)
api_router.include_router(weekly_planner_controller.router)
api_router.include_router(analytics_controller.router)
api_router.include_router(settings_controller.router)
