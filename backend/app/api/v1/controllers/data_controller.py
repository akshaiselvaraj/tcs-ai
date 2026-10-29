from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
from app.db.session import get_db
from app.models.sales_history import SalesHistory
from app.models.menu_item import MenuItem
from app.data_processing.validator import DatasetValidator
from app.data_processing.ingestion_service import ingestion_service
from app.schemas.common import APIResponse

router = APIRouter(prefix="/data", tags=["Data Pipeline"])


@router.post("/validate")
async def validate_dataset(file: UploadFile = File(...)) -> APIResponse[dict]:
    """Validates CSV format, required 35 columns, anomalies, and returns a pre-import report."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid .csv file."
        )

    content = await file.read()
    report = DatasetValidator.parse_and_validate(content)
    return APIResponse(
        success=report["is_valid"],
        message="CSV validation completed" if report["is_valid"] else report["error"],
        data=report,
    )


@router.post("/import")
async def import_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Validates, cleans, and batch-ingests dataset into PostgreSQL."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid .csv file."
        )

    content = await file.read()
    result = ingestion_service.process_and_ingest(db, content, filename=file.filename)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result["message"]
        )

    return APIResponse(
        success=True,
        message=result["message"],
        data=result,
    )


@router.get("/summary")
def get_data_summary(db: Session = Depends(get_db)) -> APIResponse[dict]:
    """Returns overview metrics of stored historical sales data."""
    total_sales = db.query(SalesHistory).count()
    total_items = db.query(MenuItem).filter(MenuItem.is_active == True).count()
    
    date_bounds = db.query(
        func.min(SalesHistory.sale_date),
        func.max(SalesHistory.sale_date)
    ).first()

    min_date = date_bounds[0].isoformat() if date_bounds and date_bounds[0] else None
    max_date = date_bounds[1].isoformat() if date_bounds and date_bounds[1] else None

    # Totals
    aggregates = db.query(
        func.sum(SalesHistory.qty_sold),
        func.sum(SalesHistory.qty_wasted),
        func.sum(SalesHistory.revenue),
        func.sum(SalesHistory.profit),
    ).first()

    return APIResponse(
        success=True,
        message="Data summary retrieved",
        data={
            "total_records": total_sales,
            "active_dishes": total_items,
            "date_range": {"start": min_date, "end": max_date},
            "lifetime_portions_sold": aggregates[0] or 0,
            "lifetime_portions_wasted": aggregates[1] or 0,
            "lifetime_revenue": round(aggregates[2] or 0.0, 2),
            "lifetime_profit": round(aggregates[3] or 0.0, 2),
        },
    )


@router.get("/sales")
def get_sales_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    meal_type: Optional[str] = None,
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Returns paginated sales history records."""
    query = db.query(SalesHistory, MenuItem.item_name, MenuItem.category).join(
        MenuItem, SalesHistory.item_id == MenuItem.id
    )
    if meal_type and meal_type.lower() != "all":
        query = query.filter(SalesHistory.meal_type.ilike(meal_type))

    total = query.count()
    skip = (page - 1) * page_size
    records = query.order_by(SalesHistory.sale_date.desc()).offset(skip).limit(page_size).all()

    items_data = []
    for sale, dish_name, category in records:
        items_data.append({
            "id": sale.id,
            "date": sale.sale_date.isoformat(),
            "meal_type": sale.meal_type,
            "item_name": dish_name,
            "category": category,
            "qty_prepared": sale.qty_prepared,
            "qty_sold": sale.qty_sold,
            "qty_wasted": sale.qty_wasted,
            "unmet_demand": sale.unmet_demand,
            "revenue": sale.revenue,
            "profit": sale.profit,
        })

    return APIResponse(
        success=True,
        message=f"Retrieved {len(items_data)} sales records",
        data={
            "items": items_data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
        },
    )
