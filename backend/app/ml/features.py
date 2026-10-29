from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from app.core.logging import logger

LEAKAGE_COLUMNS = [
    "qty_sold", "qty_wasted", "sell_through_pct", "revenue", "waste_cost", "profit"
]

FEATURE_COLUMNS = [
    "item_code", "category_code", "meal_type_code", "veg_code",
    "price", "cost", "calories", "protein_g",
    "day_of_week", "month", "week_no",
    "is_weekend", "is_holiday", "is_exam", "is_festival",
    "attendance", "temperature_c", "rainfall_mm", "humidity_pct",
    "times_served_last_14d", "days_since_last_served"
]


class FeaturePipeline:
    def __init__(self):
        self.encoders: Dict[str, LabelEncoder] = {}
        self.medians: Dict[str, float] = {}

    def fit_transform(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Fits encoders/imputers and transforms historical dataframe into X, y."""
        df_clean = df.copy()

        # 1. Target Construction: estimated_demand = qty_sold + unmet_demand
        if "qty_sold" in df_clean.columns:
            unmet = df_clean.get("unmet_demand", pd.Series(0, index=df_clean.index)).fillna(0)
            df_clean["target_demand"] = df_clean["qty_sold"] + unmet
            # Floor target at 0
            df_clean["target_demand"] = df_clean["target_demand"].apply(lambda v: max(0, v))
        else:
            raise ValueError("Historical dataframe must contain 'qty_sold' to construct demand target.")

        # 2. Prevent Target Leakage
        for col in LEAKAGE_COLUMNS:
            if col in df_clean.columns and col != "target_demand":
                df_clean = df_clean.drop(columns=[col])

        # 3. Categorical Encodings
        for cat_col in ["item_name", "category", "meal_type", "veg_nonveg"]:
            encoder = LabelEncoder()
            # Ensure string & strip
            clean_series = df_clean[cat_col].astype(str).str.strip()
            df_clean[f"{cat_col}_code" if cat_col != "item_name" else "item_code"] = encoder.fit_transform(clean_series)
            self.encoders[cat_col] = encoder

        # Rename for standard names
        if "veg_nonveg_code" in df_clean.columns:
            df_clean["veg_code"] = df_clean["veg_nonveg_code"]

        # 4. Temporal Features
        if "date" in df_clean.columns:
            dt_series = pd.to_datetime(df_clean["date"], errors="coerce")
            df_clean["day_of_week"] = dt_series.dt.dayofweek
            df_clean["month"] = dt_series.dt.month
        else:
            df_clean["day_of_week"] = 0
            df_clean["month"] = 1

        # 5. Missing Value Imputation with Medians
        numeric_fill_cols = [
            "price", "cost", "calories", "protein_g", "week_no",
            "attendance", "temperature_c", "rainfall_mm", "humidity_pct",
            "times_served_last_14d", "days_since_last_served"
        ]
        for col in numeric_fill_cols:
            if col not in df_clean.columns:
                df_clean[col] = 0.0
            med = float(df_clean[col].median()) if not df_clean[col].isna().all() else 0.0
            self.medians[col] = med
            df_clean[col] = df_clean[col].fillna(med)

        # 6. Boolean Coercion
        for b_col in ["is_weekend", "is_holiday", "is_exam", "is_festival"]:
            if b_col not in df_clean.columns:
                df_clean[b_col] = 0
            df_clean[b_col] = df_clean[b_col].astype(int)

        X = df_clean[FEATURE_COLUMNS].copy()
        y = df_clean["target_demand"].copy()

        logger.info(f"Feature matrix constructed: X shape = {X.shape}, y shape = {y.shape}")
        return X, y

    def transform_single(self, row_dict: Dict[str, Any]) -> pd.DataFrame:
        """Transforms a single prediction request context into a feature row."""
        transformed: Dict[str, Any] = {}

        for cat_col, target_key in [
            ("item_name", "item_code"),
            ("category", "category_code"),
            ("meal_type", "meal_type_code"),
            ("veg_nonveg", "veg_code"),
        ]:
            val = str(row_dict.get(cat_col, "Unknown")).strip()
            encoder = self.encoders.get(cat_col)
            if encoder and val in encoder.classes_:
                transformed[target_key] = int(encoder.transform([val])[0])
            else:
                transformed[target_key] = 0

        # Numerics
        for col in ["price", "cost", "calories", "protein_g", "week_no",
                    "attendance", "temperature_c", "rainfall_mm", "humidity_pct",
                    "times_served_last_14d", "days_since_last_served"]:
            med = self.medians.get(col, 0.0)
            transformed[col] = float(row_dict.get(col, med))

        # Temporal
        date_val = pd.to_datetime(row_dict.get("date", pd.Timestamp.now()))
        transformed["day_of_week"] = date_val.dayofweek
        transformed["month"] = date_val.month

        # Booleans
        for b_col in ["is_weekend", "is_holiday", "is_exam", "is_festival"]:
            transformed[b_col] = 1 if row_dict.get(b_col, False) else 0

        return pd.DataFrame([transformed])[FEATURE_COLUMNS]
