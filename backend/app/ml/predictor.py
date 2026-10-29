import math
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import pandas as pd
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.models.menu_item import MenuItem
from app.models.demand_forecast import DemandForecast
from app.ml.trainer import model_trainer


class DemandPredictor:
    @staticmethod
    def predict_for_meal(
        db: Session,
        forecast_date: date,
        meal_type: str = "Lunch",
        safety_buffer_pct: float = 8.0,
        expected_attendance: Optional[int] = 450,
        persist: bool = True,
    ) -> Dict[str, Any]:
        """Generates item-level demand forecasts and recommended preparation portions."""
        # Ensure model is ready
        if not model_trainer.rf_model or not model_trainer.pipeline:
            loaded = model_trainer.load_artifacts()
            if not loaded:
                raise ValueError("No trained model found. Please train the model in Phase 2 or upload data first.")

        # Query active dishes for the meal type
        items = db.query(MenuItem).filter(MenuItem.is_active == True).all()
        # Filter for relevant meal if applicable
        if meal_type.lower() != "all":
            items = [i for i in items if i.meal_type.lower() in [meal_type.lower(), "all", "any"]]

        if not items:
            items = db.query(MenuItem).filter(MenuItem.is_active == True).all()

        predictions: List[Dict[str, Any]] = []

        for item in items:
            row_dict = {
                "item_name": item.item_name,
                "category": item.category,
                "meal_type": meal_type,
                "veg_nonveg": item.veg_nonveg,
                "price": item.price,
                "cost": item.cost,
                "calories": item.calories,
                "protein_g": item.protein_g,
                "date": forecast_date.isoformat(),
                "attendance": expected_attendance or 450,
                "week_no": forecast_date.isocalendar()[1],
                "is_weekend": forecast_date.weekday() >= 5,
            }

            feat_row = model_trainer.pipeline.transform_single(row_dict)
            raw_pred = float(model_trainer.rf_model.predict(feat_row)[0])
            pred_demand = max(5.0, round(raw_pred, 1))

            # Recommended Preparation = Demand * (1 + safety_buffer) rounded up
            multiplier = 1.0 + (safety_buffer_pct / 100.0)
            rec_prep = int(math.ceil(pred_demand * multiplier))

            # Financial estimates
            expected_revenue = round(pred_demand * item.price, 2)
            prep_cost = round(rec_prep * item.cost, 2)
            estimated_profit = round(expected_revenue - prep_cost, 2)

            pred_data = {
                "item_id": item.id,
                "item_name": item.item_name,
                "category": item.category,
                "meal_type": meal_type,
                "veg_nonveg": item.veg_nonveg,
                "price": item.price,
                "cost": item.cost,
                "calories": item.calories,
                "protein_g": item.protein_g,
                "predicted_demand": pred_demand,
                "recommended_preparation": rec_prep,
                "safety_buffer_pct": safety_buffer_pct,
                "expected_revenue": expected_revenue,
                "prep_cost": prep_cost,
                "estimated_profit": estimated_profit,
                "model_name": "RandomForestRegressor",
                "model_version": "v1.0.0",
            }
            predictions.append(pred_data)

            # Persist to database
            if persist:
                forecast_obj = DemandForecast(
                    item_id=item.id,
                    forecast_date=forecast_date,
                    meal_type=meal_type,
                    predicted_demand=pred_demand,
                    recommended_preparation=rec_prep,
                    model_name="RandomForestRegressor",
                    model_version="v1.0.0",
                    lower_bound=max(0, pred_demand * 0.9),
                    upper_bound=pred_demand * 1.15,
                )
                db.add(forecast_obj)

        if persist:
            db.commit()

        total_demand = sum(p["predicted_demand"] for p in predictions)
        total_prep = sum(p["recommended_preparation"] for p in predictions)
        total_revenue = sum(p["expected_revenue"] for p in predictions)
        total_cost = sum(p["prep_cost"] for p in predictions)

        return {
            "forecast_date": forecast_date.isoformat(),
            "meal_type": meal_type,
            "total_items": len(predictions),
            "summary": {
                "total_predicted_demand": round(total_demand, 1),
                "total_recommended_preparation": total_prep,
                "expected_gross_revenue": round(total_revenue, 2),
                "total_prep_cost": round(total_cost, 2),
                "estimated_net_profit": round(total_revenue - total_cost, 2),
            },
            "predictions": predictions,
        }


demand_predictor = DemandPredictor()
