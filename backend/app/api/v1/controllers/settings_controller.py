from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.optimization_setting import OptimizationSetting
from app.schemas.common import APIResponse

router = APIRouter(prefix="/settings", tags=["Optimization Settings"])


class SettingsUpdateSchema(BaseModel):
    budget_limit: float = Field(default=80000.0, ge=1000.0, le=500000.0)
    max_items_per_meal: int = Field(default=8, ge=2, le=25)
    min_items_per_meal: int = Field(default=4, ge=1, le=10)
    min_veg_items: int = Field(default=3, ge=1, le=10)
    safety_buffer_pct: float = Field(default=8.0, ge=0.0, le=50.0)
    kitchen_capacity: int = Field(default=15000, ge=100, le=50000)
    repetition_cooldown_days: int = Field(default=2, ge=0, le=7)


@router.get("")
def get_settings(db: Session = Depends(get_db)) -> APIResponse[dict]:
    """Retrieves current operational and optimization parameters from database."""
    setting = db.query(OptimizationSetting).first()
    if not setting:
        # Create default
        setting = OptimizationSetting(
            setting_name="default",
            budget_limit=80000.0,
            max_items_per_meal=8,
            min_items_per_meal=4,
            min_veg_items=3,
            weights_json={
                "safety_buffer_pct": 8.0,
                "kitchen_capacity": 15000,
                "repetition_cooldown_days": 2,
            },
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)

    weights = setting.weights_json or {}
    return APIResponse(
        success=True,
        message="Optimization settings retrieved.",
        data={
            "id": setting.id,
            "setting_name": setting.setting_name,
            "budget_limit": setting.budget_limit,
            "max_items_per_meal": setting.max_items_per_meal,
            "min_items_per_meal": setting.min_items_per_meal,
            "min_veg_items": setting.min_veg_items,
            "safety_buffer_pct": weights.get("safety_buffer_pct", 8.0),
            "kitchen_capacity": weights.get("kitchen_capacity", 15000),
            "repetition_cooldown_days": weights.get("repetition_cooldown_days", 2),
        },
    )


@router.post("")
def update_settings(
    payload: SettingsUpdateSchema,
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Updates and persists global optimization settings to Supabase."""
    try:
        setting = db.query(OptimizationSetting).first()
        if not setting:
            setting = OptimizationSetting(setting_name="default")
            db.add(setting)

        setting.budget_limit = payload.budget_limit
        setting.max_items_per_meal = payload.max_items_per_meal
        setting.min_items_per_meal = payload.min_items_per_meal
        setting.min_veg_items = payload.min_veg_items
        setting.weights_json = {
            "safety_buffer_pct": payload.safety_buffer_pct,
            "kitchen_capacity": payload.kitchen_capacity,
            "repetition_cooldown_days": payload.repetition_cooldown_days,
        }

        db.commit()
        db.refresh(setting)

        return APIResponse(
            success=True,
            message="Configuration successfully saved to database.",
            data={
                "id": setting.id,
                "budget_limit": setting.budget_limit,
                "safety_buffer_pct": payload.safety_buffer_pct,
                "kitchen_capacity": payload.kitchen_capacity,
                "repetition_cooldown_days": payload.repetition_cooldown_days,
            },
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )
