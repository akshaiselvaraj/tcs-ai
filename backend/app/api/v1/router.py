from fastapi import APIRouter
from app.api.v1.controllers import health_controller, menu_items_controller

api_router = APIRouter()

api_router.include_router(health_controller.router)
api_router.include_router(menu_items_controller.router)
