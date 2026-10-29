import os
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import lightgbm as lgb
from app.core.logging import logger
from app.ml.features import FeaturePipeline, FEATURE_COLUMNS

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)


def calculate_wape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Weighted Absolute Percentage Error = sum(|actual - pred|) / sum(actual) * 100%"""
    sum_actual = np.sum(y_true)
    if sum_actual == 0:
        return 0.0
    return float((np.sum(np.abs(y_true - y_pred)) / sum_actual) * 100.0)


class ModelTrainer:
    def __init__(self):
        self.rf_model: RandomForestRegressor = None
        self.lgb_model: lgb.LGBMRegressor = None
        self.pipeline: FeaturePipeline = None
        self.latest_metrics: Dict[str, Any] = {}

    def train_models(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Trains Random Forest, LightGBM, and Baseline models using chronological holdout."""
        logger.info(f"Initiating model training on {len(df)} records...")
        
        # 1. Sort Chronologically
        df_sorted = df.copy()
        if "date" in df_sorted.columns:
            df_sorted["date"] = pd.to_datetime(df_sorted["date"])
            df_sorted = df_sorted.sort_values(by="date").reset_index(drop=True)

        # 2. Fit Feature Pipeline
        pipeline = FeaturePipeline()
        X, y = pipeline.fit_transform(df_sorted)

        # 3. Chronological Holdout Split (70% Train, 15% Validation, 15% Test)
        n = len(X)
        train_idx = int(n * 0.70)
        val_idx = int(n * 0.85)

        X_train, y_train = X.iloc[:train_idx], y.iloc[:train_idx]
        X_val, y_val = X.iloc[train_idx:val_idx], y.iloc[train_idx:val_idx]
        X_test, y_test = X.iloc[val_idx:], y.iloc[val_idx:]

        logger.info(f"Chronological split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

        # 4. Model 1: Random Forest Regressor
        logger.info("Training Random Forest Regressor...")
        rf = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_leaf=3,
            random_state=42,
            n_jobs=-1,
        )
        rf.fit(X_train, y_train)
        rf_preds = rf.predict(X_test)
        rf_preds = np.maximum(0, rf_preds)

        rf_mae = float(mean_absolute_error(y_test, rf_preds))
        rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_preds)))
        rf_wape = calculate_wape(y_test.values, rf_preds)
        rf_r2 = float(r2_score(y_test, rf_preds))

        # 5. Model 2: LightGBM Regressor
        logger.info("Training LightGBM Regressor...")
        lgbm = lgb.LGBMRegressor(
            n_estimators=100,
            learning_rate=0.05,
            num_leaves=31,
            random_state=42,
            verbosity=-1,
        )
        lgbm.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            callbacks=[lgb.early_stopping(stopping_rounds=15, verbose=False)],
        )
        lgb_preds = lgbm.predict(X_test)
        lgb_preds = np.maximum(0, lgb_preds)

        lgb_mae = float(mean_absolute_error(y_test, lgb_preds))
        lgb_rmse = float(np.sqrt(mean_squared_error(y_test, lgb_preds)))
        lgb_wape = calculate_wape(y_test.values, lgb_preds)
        lgb_r2 = float(r2_score(y_test, lgb_preds))

        # 6. Model 3: Historical Baseline (Item Mean Demand)
        baseline_means = y_train.groupby(X_train["item_code"]).mean()
        overall_mean = float(y_train.mean())
        baseline_preds = X_test["item_code"].map(baseline_means).fillna(overall_mean).values

        base_mae = float(mean_absolute_error(y_test, baseline_preds))
        base_rmse = float(np.sqrt(mean_squared_error(y_test, baseline_preds)))
        base_wape = calculate_wape(y_test.values, baseline_preds)
        base_r2 = float(r2_score(y_test, baseline_preds))

        # 7. Extract Feature Importances (Random Forest)
        importances = rf.feature_importances_
        feature_importance_list = [
            {"feature": f, "importance": round(float(imp), 4)}
            for f, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True)
        ]

        # 8. Save Artifacts with Joblib
        rf_path = os.path.join(ARTIFACTS_DIR, "random_forest_model.joblib")
        lgb_path = os.path.join(ARTIFACTS_DIR, "lightgbm_model.joblib")
        pipe_path = os.path.join(ARTIFACTS_DIR, "feature_pipeline.joblib")

        joblib.dump(rf, rf_path)
        joblib.dump(lgbm, lgb_path)
        joblib.dump(pipeline, pipe_path)

        self.rf_model = rf
        self.lgb_model = lgbm
        self.pipeline = pipeline

        metrics_summary = {
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "records_count": len(df),
            "test_split_size": len(X_test),
            "random_forest": {
                "name": "Random Forest Regressor",
                "mae": round(rf_mae, 2),
                "rmse": round(rf_rmse, 2),
                "wape": round(rf_wape, 2),
                "r2_score": round(rf_r2, 3),
                "artifact": rf_path,
            },
            "lightgbm": {
                "name": "LightGBM Regressor",
                "mae": round(lgb_mae, 2),
                "rmse": round(lgb_rmse, 2),
                "wape": round(lgb_wape, 2),
                "r2_score": round(lgb_r2, 3),
                "artifact": lgb_path,
            },
            "baseline": {
                "name": "Historical Mean Baseline",
                "mae": round(base_mae, 2),
                "rmse": round(base_rmse, 2),
                "wape": round(base_wape, 2),
                "r2_score": round(base_r2, 3),
            },
            "feature_importance": feature_importance_list[:10],
        }

        self.latest_metrics = metrics_summary
        logger.info(f"Training completed successfully! RF WAPE: {rf_wape:.2f}%, LGBM WAPE: {lgb_wape:.2f}%")
        return metrics_summary

    def load_artifacts(self) -> bool:
        """Loads persisted models from disk if available."""
        rf_path = os.path.join(ARTIFACTS_DIR, "random_forest_model.joblib")
        pipe_path = os.path.join(ARTIFACTS_DIR, "feature_pipeline.joblib")
        if os.path.exists(rf_path) and os.path.exists(pipe_path):
            self.rf_model = joblib.load(rf_path)
            self.pipeline = joblib.load(pipe_path)
            return True
        return False


model_trainer = ModelTrainer()
