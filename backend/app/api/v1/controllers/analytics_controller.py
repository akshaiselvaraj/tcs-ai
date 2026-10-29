from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.common import APIResponse

router = APIRouter(prefix="/analytics", tags=["Live Business Analytics"])


@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)) -> APIResponse[dict]:
    """Retrieves live dynamic KPIs, demand trends, and category distribution for the Dashboard."""
    try:
        data = AnalyticsService.get_dashboard_metrics(db)
        return APIResponse(
            success=True,
            message="Dashboard analytics computed successfully.",
            data=data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to aggregate dashboard analytics: {str(e)}"
        )


@router.get("/waste")
def get_waste_data(db: Session = Depends(get_db)) -> APIResponse[dict]:
    """Retrieves food waste metrics, reduction percentage, and loss prevented."""
    try:
        data = AnalyticsService.get_waste_metrics(db)
        return APIResponse(
            success=True,
            message="Waste analytics computed successfully.",
            data=data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to aggregate waste analytics: {str(e)}"
        )


@router.get("/profitability")
def get_profitability_data(db: Session = Depends(get_db)) -> APIResponse[dict]:
    """Retrieves gross revenue, prep costs, contribution margins, and top margin dishes."""
    try:
        data = AnalyticsService.get_profitability_metrics(db)
        return APIResponse(
            success=True,
            message="Profitability analytics computed successfully.",
            data=data,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to aggregate profitability analytics: {str(e)}"
        )
