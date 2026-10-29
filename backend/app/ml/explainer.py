import os
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import shap
from app.core.logging import logger
from app.ml.trainer import model_trainer
from app.ml.features import FEATURE_COLUMNS


class ModelExplainer:
    def __init__(self):
        self._explainers: Dict[str, shap.TreeExplainer] = {}
        self._global_shap_cache: Dict[str, List[Dict[str, Any]]] = {}

    def _ensure_model_and_explainer(self, model_name: str = "random_forest"):
        """Ensures artifacts are loaded and TreeExplainer initialized."""
        if not model_trainer.rf_model or not model_trainer.pipeline:
            model_trainer.load_artifacts()

        is_lgb = "light" in model_name.lower()
        key = "lightgbm" if is_lgb else "random_forest"

        if key not in self._explainers:
            model = model_trainer.lgb_model if is_lgb else model_trainer.rf_model
            if model is None:
                raise ValueError(f"Model '{key}' is not available. Please train models first.")
            logger.info(f"Initializing SHAP TreeExplainer for {key}...")
            self._explainers[key] = shap.TreeExplainer(model)

        return self._explainers[key], key

    def get_global_shap(self, model_name: str = "random_forest", max_samples: int = 200) -> List[Dict[str, Any]]:
        """
        Computes global mean |SHAP| feature attributions over a sample background set.
        """
        explainer, key = self._ensure_model_and_explainer(model_name)
        if key in self._global_shap_cache:
            return self._global_shap_cache[key]

        pipeline = model_trainer.pipeline
        if not pipeline:
            return []

        feature_names = FEATURE_COLUMNS

        # Load reference dataset
        data_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "database.csv")
        if not os.path.exists(data_csv):
            data_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "datasets.csv")

        if os.path.exists(data_csv):
            df = pd.read_csv(data_csv)
            sample_df = df.sample(min(len(df), max_samples), random_state=42)
            X = pipeline.transform_df(sample_df)
        else:
            # Generate synthetic matrix
            X = pd.DataFrame(np.zeros((10, len(FEATURE_COLUMNS))), columns=FEATURE_COLUMNS)

        try:
            shap_vals = explainer.shap_values(X)
            # TreeExplainer for regression returns ndarray (n_samples, n_features)
            if isinstance(shap_vals, list):
                shap_vals = shap_vals[0]
            
            mean_abs_shap = np.mean(np.abs(shap_vals), axis=0)
            total = float(np.sum(mean_abs_shap)) or 1.0

            ranking = []
            for name, val in zip(FEATURE_COLUMNS, mean_abs_shap):
                ranking.append({
                    "feature": name.replace("_", " ").title(),
                    "raw_feature": name,
                    "mean_abs_shap": round(float(val), 3),
                    "importance_pct": round(float(val) / total * 100.0, 2),
                })

            ranking.sort(key=lambda x: x["mean_abs_shap"], reverse=True)
            self._global_shap_cache[key] = ranking
            return ranking
        except Exception as e:
            logger.error(f"Error computing SHAP values for {key}: {e}")
            return []

    def explain_instance(
        self,
        features_df: pd.DataFrame,
        model_name: str = "random_forest",
    ) -> Dict[str, Any]:
        """
        Computes local waterfall SHAP explanation for a single prediction row.
        """
        explainer, key = self._ensure_model_and_explainer(model_name)
        pipeline = model_trainer.pipeline

        X = pipeline.transform_df(features_df)
        shap_vals = explainer.shap_values(X)
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[0]

        row_shap = shap_vals[0]
        base_value = float(explainer.expected_value if not isinstance(explainer.expected_value, list) else explainer.expected_value[0])
        feature_names = FEATURE_COLUMNS

        contributions = []
        for name, val in zip(feature_names, row_shap):
            contributions.append({
                "feature": name.replace("_", " ").title(),
                "impact_portions": round(float(val), 2),
                "direction": "increases_demand" if val >= 0 else "decreases_demand",
            })

        contributions.sort(key=lambda x: abs(x["impact_portions"]), reverse=True)

        return {
            "model_used": key,
            "base_value_portions": round(base_value, 1),
            "predicted_portions": round(base_value + float(np.sum(row_shap)), 1),
            "top_drivers": contributions[:8],
        }


model_explainer = ModelExplainer()
