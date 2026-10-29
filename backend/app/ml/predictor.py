import math
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import pandas as pd
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.models.menu_item import MenuItem
from app.models.demand_forecast import DemandForecast
from app.ml.trainer import model_trainer
from app.ml.attendance_forecaster import attendance_forecaster


class DemandPredictor:
    @staticmethod
    def predict_for_meal(
        db: Session,
        forecast_date: date,
        meal_type: str = "Lunch",
        model_name: str = "random_forest",
        safety_buffer_pct: float = 8.0,
        expected_attendance: Optional[int] = None,
        persist: bool = True,
    ) -> Dict[str, Any]:
        """
        Generates item-level demand forecasts and recommended preparation portions.
        Supports LightGBM and Random Forest inference with empirical confidence bounds
        and automated attendance forecasting.
        """
        # 1. Ensure models & pipeline are ready
        if not model_trainer.rf_model or not model_trainer.pipeline:
            loaded = model_trainer.load_artifacts()
            if not loaded:
                raise ValueError("No trained model found. Please train models in Data Management or Model Performance first.")

        # 2. Automated Attendance Forecast if not provided
        if not expected_attendance:
            expected_attendance = attendance_forecaster.predict_attendance(
                target_date=forecast_date,
                is_exam=False,
                is_holiday=forecast_date.weekday() >= 5,
            )

        # 3. Model selection (Random Forest vs. LightGBM)
        use_lgb = "light" in model_name.lower()
        if use_lgb and model_trainer.lgb_model:
            active_model = model_trainer.lgb_model
            chosen_model_name = "LightGBM Regressor"
            rmse = model_trainer.latest_metrics.get("lightgbm", {}).get("rmse", 119.67)
        else:
            active_model = model_trainer.rf_model
            chosen_model_name = "Random Forest Regressor"
            rmse = model_trainer.latest_metrics.get("random_forest", {}).get("rmse", 117.65)

        # Empirical 90% confidence interval margin: 1.645 * standard_error
        ci_margin = round(1.645 * float(rmse), 1)

        # 4. Query candidate dishes for the meal type
        items = db.query(MenuItem).filter(MenuItem.is_active == True).all()
        if meal_type.lower() != "all":
            filtered = [i for i in items if i.meal_type.lower() in [meal_type.lower(), "all", "any"]]
            if filtered:
                items = filtered

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
                "attendance": expected_attendance,
                "week_no": forecast_date.isocalendar()[1],
                "is_weekend": forecast_date.weekday() >= 5,
            }

            feat_row = model_trainer.pipeline.transform_single(row_dict)
            raw_pred = float(active_model.predict(feat_row)[0])
            pred_demand = max(5.0, round(raw_pred, 1))

            # Recommended Preparation = Demand * (1 + safety_buffer) rounded up
            multiplier = 1.0 + (safety_buffer_pct / 100.0)
            rec_prep = int(math.ceil(pred_demand * multiplier))

            # Empirical 90% confidence bounds
            lower_b = max(0.0, round(pred_demand - ci_margin, 1))
            upper_b = round(pred_demand + ci_margin, 1)

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
                "lower_bound": lower_b,
                "upper_bound": upper_b,
                "expected_revenue": expected_revenue,
                "prep_cost": prep_cost,
                "estimated_profit": estimated_profit,
                "model_name": chosen_model_name,
                "model_version": "v1.2.0",
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
                    model_name=chosen_model_name,
                    model_version="v1.2.0",
                    lower_bound=lower_b,
                    upper_bound=upper_b,
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
            "model_name": chosen_model_name,
            "predicted_attendance": expected_attendance,
            "confidence_interval_level": "90% Empirical",
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
