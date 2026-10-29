import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
from app.db.session import get_db
from app.models.sales_history import SalesHistory
from app.models.menu_item import MenuItem
from app.ml.trainer import model_trainer
from app.schemas.common import APIResponse

router = APIRouter(prefix="/models", tags=["Machine Learning"])


@router.post("/train")
def train_demand_models(
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    """Trains Random Forest, LightGBM, and Baseline models on available sales data."""
    # 1. Fetch from Database
    query = db.query(
        SalesHistory.sale_date.label("date"),
        SalesHistory.meal_type,
        MenuItem.item_name,
        MenuItem.category,
        MenuItem.veg_nonveg,
        MenuItem.price,
        MenuItem.cost,
        MenuItem.calories,
        MenuItem.protein_g,
        SalesHistory.qty_prepared,
        SalesHistory.qty_sold,
        SalesHistory.qty_wasted,
        SalesHistory.unmet_demand,
        SalesHistory.rating,
        SalesHistory.attendance,
        SalesHistory.temperature_c,
        SalesHistory.rainfall_mm,
        SalesHistory.humidity_pct,
        SalesHistory.is_weekend,
        SalesHistory.is_holiday,
        SalesHistory.is_exam,
        SalesHistory.is_festival,
        SalesHistory.times_served_last_14d,
        SalesHistory.days_since_last_served,
    ).join(MenuItem, SalesHistory.item_id == MenuItem.id)

    records = query.all()
    
    # Check if database has data
    if records and len(records) >= 50:
        df = pd.DataFrame([r._asdict() for r in records])
    else:
        # Fallback check for local data file if database not yet loaded
        local_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "database.csv")
        if not os.path.exists(local_csv):
            local_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "datasets.csv")
        
        if os.path.exists(local_csv):
            df = pd.read_csv(local_csv)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient data to train models. Please upload 'database.csv' via the Data Management portal first."
            )

    try:
        metrics = model_trainer.train_models(df)
        return APIResponse(
            success=True,
            message="Models successfully trained and evaluated with chronological holdout split.",
            data=metrics,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )


@router.get("/metrics")
def get_model_metrics() -> APIResponse[dict]:
    """Returns the latest chronological holdout evaluation metrics for Random Forest and LightGBM."""
    if not model_trainer.latest_metrics:
        # Attempt to load saved models from disk
        loaded = model_trainer.load_artifacts()
        if not loaded:
            return APIResponse(
                success=False,
                message="No trained model currently found. Please trigger model training first.",
                data={},
            )

    return APIResponse(
        success=True,
        message="Model evaluation benchmarks retrieved",
        data=model_trainer.latest_metrics,
    )


@router.get("/feature-importance")
def get_feature_importance() -> APIResponse[list]:
    """Returns top ranked features from the Random Forest model."""
    if not model_trainer.latest_metrics or "feature_importance" not in model_trainer.latest_metrics:
        return APIResponse(
            success=False,
            message="Feature importances not yet available. Please train models first.",
            data=[],
        )

    return APIResponse(
        success=True,
        message="Feature importances retrieved",
        data=model_trainer.latest_metrics["feature_importance"],
    )


@router.get("/shap-importance")
def get_shap_importance(
    model_name: str = "random_forest",
) -> APIResponse[list]:
    """Computes and returns global SHAP TreeExplainer feature attributions."""
    try:
        from app.ml.explainer import model_explainer
        ranking = model_explainer.get_global_shap(model_name=model_name)
        return APIResponse(
            success=True,
            message=f"SHAP feature attributions computed for {model_name}",
            data=ranking,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute SHAP values: {str(e)}"
        )
