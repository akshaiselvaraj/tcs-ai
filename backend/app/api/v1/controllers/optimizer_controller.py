from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.optimizer_service import optimizer_service
from app.schemas.common import APIResponse

router = APIRouter(prefix="/optimize", tags=["Menu Mix Optimization"])


class OptimizeMenuRequest(BaseModel):
    forecast_date: date
    meal_type: str = Field(default="Lunch", description="Breakfast, Lunch, Dinner, or All")
    budget_limit: float = Field(default=35000.0, ge=1000.0, le=1000000.0)
    min_items: int = Field(default=4, ge=1, le=25)
    max_items: int = Field(default=8, ge=2, le=35)
    min_veg_items: int = Field(default=3, ge=0, le=25)
    kitchen_capacity: int = Field(default=5000, ge=100, le=50000)
    objective_priority: str = Field(default="balanced", description="balanced, profit, or waste")
    safety_buffer_pct: float = Field(default=8.0, ge=0.0, le=50.0)
    expected_attendance: Optional[int] = Field(default=None, ge=50, le=20000)


@router.post("/menu-mix")
def optimize_menu_mix(
    request: OptimizeMenuRequest,
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Solves mathematical Mixed-Integer Linear Programming (MILP) using PuLP CBC solver."""
    try:
        if request.min_items > request.max_items:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="min_items cannot exceed max_items."
            )

        result = optimizer_service.optimize_menu_mix(
            db=db,
            forecast_date=request.forecast_date,
            meal_type=request.meal_type,
            budget_limit=request.budget_limit,
            min_items=request.min_items,
            max_items=request.max_items,
            min_veg_items=request.min_veg_items,
            kitchen_capacity=request.kitchen_capacity,
            objective_priority=request.objective_priority,
            safety_buffer_pct=request.safety_buffer_pct,
            expected_attendance=request.expected_attendance,
        )
        return APIResponse(
            success=True,
            message=f"PuLP MILP solver completed with status: {result['solver_status']}",
            data=result,
        )
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization solver error: {str(e)}",
        )
