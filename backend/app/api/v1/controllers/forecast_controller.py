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
    expected_attendance: Optional[int] = Field(default=None, ge=50, le=5000)
    model_name: str = Field(default="random_forest", description="ML model to use: random_forest or lightgbm")
    persist: bool = True


@router.get("/attendance")
def predict_attendance(
    target_date: date = Query(..., description="Date to forecast campus attendance for"),
    day_type: Optional[str] = Query(None, description="Optional override for day_type: Regular, Exam, Festival, Weekend"),
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Predicts campus meal attendance using the trained LightGBM Attendance Forecaster."""
    try:
        from app.ml.attendance_forecaster import attendance_forecaster
        is_exam = bool(day_type and "exam" in day_type.lower())
        is_holiday = bool(day_type and ("holiday" in day_type.lower() or "weekend" in day_type.lower()))
        predicted_attendance = attendance_forecaster.predict_attendance(
            target_date=target_date,
            is_exam=is_exam,
            is_holiday=is_holiday,
        )
        return APIResponse(
            success=True,
            message="Campus attendance forecasted successfully.",
            data={
                "date": target_date.isoformat(),
                "day_of_week": target_date.strftime("%A"),
                "predicted_attendance": predicted_attendance,
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Attendance prediction failed: {str(e)}",
        )


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
            model_name=request.model_name,
            persist=request.persist,
        )
        return APIResponse(
            success=True,
            message=f"Generated forecasts for {result['total_items']} menu items using {result.get('model_used', request.model_name)}.",
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
