from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.weekly_planner_service import weekly_planner_service
from app.schemas.common import APIResponse

router = APIRouter(prefix="/weekly-menu", tags=["Weekly Menu Planner"])


class GenerateWeeklyPlanRequest(BaseModel):
    start_date: date
    plan_name: Optional[str] = None
    daily_budget_limit: float = Field(default=75000.0, ge=10000.0, le=500000.0)
    repetition_cooldown_days: int = Field(default=2, ge=0, le=5)


@router.post("/generate")
def generate_weekly_plan(
    request: GenerateWeeklyPlanRequest,
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Generates an automated 7-day schedule with repetition cooldown and MILP optimization."""
    try:
        plan = weekly_planner_service.generate_weekly_plan(
            db=db,
            start_date=request.start_date,
            plan_name=request.plan_name,
            daily_budget_limit=request.daily_budget_limit,
            repetition_cooldown_days=request.repetition_cooldown_days,
        )
        return APIResponse(
            success=True,
            message="7-Day weekly menu schedule successfully generated and saved.",
            data=plan,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weekly plan generation failed: {str(e)}",
        )


@router.get("/latest")
def get_latest_weekly_plan(db: Session = Depends(get_db)) -> APIResponse[Optional[dict]]:
    """Retrieves the latest 7-day schedule matrix."""
    plan = weekly_planner_service.get_latest_plan(db)
    if not plan:
        return APIResponse(
            success=False,
            message="No weekly menu plan found. Click 'Generate Plan' to create one.",
            data=None,
        )
    return APIResponse(
        success=True,
        message="Retrieved latest weekly plan.",
        data=plan,
    )


@router.get("/export-csv")
def export_weekly_plan_csv(
    plan_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Streams the weekly menu plan as a downloadable CSV."""
    try:
        csv_content = weekly_planner_service.export_plan_csv(db, plan_id)
        filename = f"canteen_weekly_menu_{date.today().isoformat()}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV export failed: {str(e)}",
        )
