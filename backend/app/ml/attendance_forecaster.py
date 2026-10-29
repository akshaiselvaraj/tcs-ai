import os
from typing import Dict, Any, Optional
from datetime import date
import numpy as np
import pandas as pd
import joblib
import lightgbm as lgb
from app.core.logging import logger

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)


class AttendanceForecaster:
    def __init__(self):
        self.model: Optional[lgb.LGBMRegressor] = None
        self.feature_columns = [
            "day_of_week", "month", "is_weekend", "is_holiday",
            "is_exam", "is_festival", "temperature_c", "rainfall_mm", "humidity_pct"
        ]

    def train(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Trains LightGBM regressor on distinct daily campus attendance records."""
        logger.info("Training Attendance Forecaster model on historical attendance logs...")
        
        # Deduplicate to daily level
        date_col = "date" if "date" in df.columns else "sale_date"
        attendance_col = "present" if "present" in df.columns else ("attendance" if "attendance" in df.columns else None)
        if not attendance_col:
            raise ValueError("Dataset must contain 'present' or 'attendance' column.")

        daily_df = df.groupby(date_col).first().reset_index()
        daily_df["date_dt"] = pd.to_datetime(daily_df[date_col])
        daily_df = daily_df.sort_values("date_dt").reset_index(drop=True)

        daily_df["day_of_week"] = daily_df["date_dt"].dt.day_of_week
        daily_df["month"] = daily_df["date_dt"].dt.month

        # Impute missing weather/context
        for col in ["temperature_c", "rainfall_mm", "humidity_pct"]:
            if col not in daily_df.columns:
                daily_df[col] = 0.0
            daily_df[col] = daily_df[col].fillna(daily_df[col].median() if not daily_df[col].isna().all() else 0.0)

        for col in ["is_weekend", "is_holiday", "is_exam", "is_festival"]:
            if col not in daily_df.columns:
                daily_df[col] = 0
            daily_df[col] = daily_df[col].astype(int)

        X = daily_df[self.feature_columns]
        y = daily_df[attendance_col]

        # Chronological holdout 80/20
        split_idx = int(len(X) * 0.8)
        X_train, y_train = X.iloc[:split_idx], y.iloc[:split_idx]
        X_test, y_test = X.iloc[split_idx:], y.iloc[split_idx:]

        model = lgb.LGBMRegressor(
            n_estimators=80,
            learning_rate=0.08,
            num_leaves=15,
            random_state=42,
            verbosity=-1,
        )
        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        mae = float(np.mean(np.abs(y_test - preds)))
        rmse = float(np.sqrt(np.mean((y_test - preds) ** 2)))
        mape = float(np.mean(np.abs((y_test - preds) / np.maximum(1, y_test))) * 100)

        # Save artifact
        artifact_path = os.path.join(ARTIFACTS_DIR, "attendance_forecaster.joblib")
        joblib.dump(model, artifact_path)
        self.model = model

        logger.info(f"Attendance model trained: Test MAE={mae:.1f} students, MAPE={mape:.2f}%")

        return {
            "model_name": "Attendance LightGBM Regressor",
            "records": len(daily_df),
            "mae": round(mae, 1),
            "rmse": round(rmse, 1),
            "mape": round(mape, 2),
        }

    def predict_attendance(
        self,
        target_date: date,
        is_exam: bool = False,
        is_holiday: bool = False,
        temperature_c: float = 28.0,
        rainfall_mm: float = 0.0,
        humidity_pct: float = 65.0,
    ) -> int:
        """Predicts expected campus student attendance for a given target date."""
        if not self.model:
            artifact_path = os.path.join(ARTIFACTS_DIR, "attendance_forecaster.joblib")
            if os.path.exists(artifact_path):
                self.model = joblib.load(artifact_path)
            else:
                return 2700  # Reasonable default for this campus scale

        date_val = pd.to_datetime(target_date)
        features = pd.DataFrame([{
            "day_of_week": date_val.day_of_week,
            "month": date_val.month,
            "is_weekend": 1 if date_val.day_of_week >= 5 else 0,
            "is_holiday": 1 if is_holiday else 0,
            "is_exam": 1 if is_exam else 0,
            "is_festival": 0,
            "temperature_c": temperature_c,
            "rainfall_mm": rainfall_mm,
            "humidity_pct": humidity_pct,
        }])[self.feature_columns]

        pred = float(self.model.predict(features)[0])
        return max(500, int(round(pred)))


attendance_forecaster = AttendanceForecaster()
