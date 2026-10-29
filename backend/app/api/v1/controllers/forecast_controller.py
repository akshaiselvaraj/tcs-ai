from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.demand_forecast import DemandForecast
from app.models.menu_item import MenuItem
from app.ml.predictor import demand_predictor
from app.schemas.common import APIResponse

router = APIRouter(prefix="/forecasts", tags=["Demand Forecasting"])


class ForecastGenerateRequest(BaseModel):
    forecast_date: date
    meal_type: str = Field(default="Lunch")
    safety_buffer_pct: float = Field(default=8.0, ge=0.0, le=50.0)
    expected_attendance: Optional[int] = Field(default=450, ge=50, le=5000)
    persist: bool = True


@router.post("/generate")
def generate_forecast(
    request: ForecastGenerateRequest,
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Generates item-level predicted demand and recommended preparation portions."""
    try:
        result = demand_predictor.predict_for_meal(
            db=db,
            forecast_date=request.forecast_date,
            meal_type=request.meal_type,
            safety_buffer_pct=request.safety_buffer_pct,
            expected_attendance=request.expected_attendance,
            persist=request.persist,
        )
        return APIResponse(
            success=True,
            message=f"Generated forecasts for {result['total_items']} menu items.",
            data=result,
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@router.get("")
def list_forecasts(
    limit: int = Query(50, ge=1, le=200),
    meal_type: Optional[str] = None,
    db: Session = Depends(get_db),
) -> APIResponse[list]:
    """Retrieves recent saved demand forecasts."""
    query = db.query(DemandForecast, MenuItem.item_name, MenuItem.category).join(
        MenuItem, DemandForecast.item_id == MenuItem.id
    )
    if meal_type and meal_type.lower() != "all":
        query = query.filter(DemandForecast.meal_type.ilike(meal_type))

    records = query.order_by(DemandForecast.generated_at.desc()).limit(limit).all()

    items = []
    for f, item_name, category in records:
        items.append({
            "id": f.id,
            "forecast_date": f.forecast_date.isoformat(),
            "meal_type": f.meal_type,
            "item_name": item_name,
            "category": category,
            "predicted_demand": f.predicted_demand,
            "recommended_preparation": f.recommended_preparation,
            "model_name": f.model_name,
            "generated_at": f.generated_at.isoformat() if f.generated_at else None,
        })

    return APIResponse(
        success=True,
        message=f"Retrieved {len(items)} forecasts",
        data=items,
    )
