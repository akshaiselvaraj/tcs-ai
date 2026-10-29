import io
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

EXPECTED_COLUMNS = [
    "date", "day", "week_no", "meal_type", "item_id", "item_name", "category",
    "veg_nonveg", "price", "cost", "calories", "protein_g", "qty_prepared",
    "qty_sold", "qty_wasted", "unmet_demand", "rating", "attendance", "present",
    "absent", "climate", "temperature_c", "rainfall_mm", "humidity_pct",
    "day_marker", "is_weekend", "is_holiday", "is_exam", "is_festival",
    "promotion", "times_served_last_14d", "days_since_last_served",
    "sell_through_pct", "revenue", "profit"
]

OPTIONAL_COLUMNS = ["waste_cost"]


class DatasetValidator:
    @staticmethod
    def parse_and_validate(csv_content: bytes) -> Dict[str, Any]:
        """Validates CSV schema, data types, anomalies, and returns a detailed report."""
        try:
            df = pd.read_csv(io.BytesIO(csv_content))
        except Exception as e:
            return {
                "is_valid": False,
                "error": f"Invalid CSV file format: {str(e)}",
                "total_rows": 0,
                "preview_rows": [],
                "anomalies": [],
            }

        total_rows = len(df)
        if total_rows == 0:
            return {
                "is_valid": False,
                "error": "The uploaded CSV file is empty.",
                "total_rows": 0,
                "preview_rows": [],
                "anomalies": [],
            }

        # Check missing required columns
        df_cols = [c.strip().lower() for c in df.columns]
        df.columns = df_cols

        missing_cols = [col for col in EXPECTED_COLUMNS if col not in df_cols]
        if missing_cols:
            return {
                "is_valid": False,
                "error": f"Missing {len(missing_cols)} required columns: {', '.join(missing_cols[:5])}...",
                "missing_columns": missing_cols,
                "total_rows": total_rows,
                "preview_rows": [],
                "anomalies": [],
            }

        anomalies: List[str] = []

        # 1. Date format check
        try:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            invalid_dates = df["date"].isna().sum()
            if invalid_dates > 0:
                anomalies.append(f"{invalid_dates} rows contain invalid or unparseable dates.")
            min_date = df["date"].min().strftime("%Y-%m-%d") if not df["date"].isna().all() else "N/A"
            max_date = df["date"].max().strftime("%Y-%m-%d") if not df["date"].isna().all() else "N/A"
        except Exception:
            min_date, max_date = "N/A", "N/A"

        # 2. Check quantities consistency: qty_sold <= qty_prepared
        oversold = (df["qty_sold"] > df["qty_prepared"]).sum()
        if oversold > 0:
            anomalies.append(f"{oversold} records have qty_sold > qty_prepared (possible stockout or recording anomaly).")

        # 3. Check negative quantities
        neg_prep = (df["qty_prepared"] < 0).sum()
        neg_sold = (df["qty_sold"] < 0).sum()
        if neg_prep > 0 or neg_sold > 0:
            anomalies.append(f"Detected negative quantities: {neg_prep} prep, {neg_sold} sold.")

        # 4. Attendance reconciliation
        if "present" in df.columns and "absent" in df.columns and "attendance" in df.columns:
            attendance_mismatch = (df["present"].fillna(0) + df["absent"].fillna(0) != df["attendance"].fillna(0)).sum()
            if attendance_mismatch > 0:
                anomalies.append(f"{attendance_mismatch} rows show discrepancy where present + absent != attendance.")

        # 5. Missing promotions
        if "promotion" in df.columns:
            missing_promo = df["promotion"].isna().sum()
            if missing_promo > 0:
                promo_pct = (missing_promo / total_rows) * 100
                anomalies.append(f"{missing_promo} rows ({promo_pct:.1f}%) have null promotion (will be sanitized to 'None').")

        # 6. Duplicate records check
        duplicates = df.duplicated(subset=["date", "meal_type", "item_name"]).sum()
        if duplicates > 0:
            anomalies.append(f"{duplicates} duplicate records found for the same date, meal, and dish.")

        # Unique dishes & categories
        unique_items = df["item_name"].nunique() if "item_name" in df.columns else 0
        categories = df["category"].dropna().unique().tolist() if "category" in df.columns else []

        # Preview rows (5 rows as JSON)
        preview_sample = df.head(5).copy()
        preview_sample["date"] = preview_sample["date"].astype(str)
        preview_sample = preview_sample.replace({np.nan: None})
        preview_data = preview_sample.to_dict(orient="records")

        # Calculate a data quality score (0 to 100)
        quality_score = max(0, 100 - (len(anomalies) * 10) - (duplicates * 2))

        return {
            "is_valid": True,
            "filename": "database.csv",
            "total_rows": total_rows,
            "unique_items": unique_items,
            "categories": categories,
            "date_range": {"start": min_date, "end": max_date},
            "quality_score": quality_score,
            "anomalies": anomalies,
            "preview_rows": preview_data,
        }

    @staticmethod
    def clean_and_sanitize(df: pd.DataFrame) -> pd.DataFrame:
        """Sanitizes columns, normalizes categories, and prepares data for database insertion."""
        clean_df = df.copy()
        clean_df.columns = [c.strip().lower() for c in clean_df.columns]

        # Dates
        clean_df["date"] = pd.to_datetime(clean_df["date"], errors="coerce")
        clean_df = clean_df.dropna(subset=["date", "item_name", "meal_type"])

        # String stripping
        for str_col in ["item_name", "category", "meal_type", "veg_nonveg", "climate", "day_marker"]:
            if str_col in clean_df.columns:
                clean_df[str_col] = clean_df[str_col].astype(str).str.strip()

        # Dietary normalization
        if "veg_nonveg" in clean_df.columns:
            clean_df["veg_nonveg"] = clean_df["veg_nonveg"].apply(
                lambda x: "Non-Veg" if "non" in str(x).lower() else "Veg"
            )

        # Promotion filling
        if "promotion" in clean_df.columns:
            clean_df["promotion"] = clean_df["promotion"].fillna("None").astype(str)

        # Numeric bounds
        for num_col in ["price", "cost", "calories", "protein_g", "qty_prepared", "qty_sold", "qty_wasted", "unmet_demand"]:
            if num_col in clean_df.columns:
                clean_df[num_col] = pd.to_numeric(clean_df[num_col], errors="coerce").fillna(0)
                clean_df[num_col] = clean_df[num_col].apply(lambda x: max(0, x))

        # Boolean flags
        for bool_col in ["is_weekend", "is_holiday", "is_exam", "is_festival"]:
            if bool_col in clean_df.columns:
                clean_df[bool_col] = clean_df[bool_col].astype(bool)

        # Financial reconciliation
        if "revenue" in clean_df.columns:
            clean_df["revenue"] = clean_df["qty_sold"] * clean_df["price"]
        if "waste_cost" in clean_df.columns:
            clean_df["waste_cost"] = clean_df["qty_wasted"] * clean_df["cost"]
        if "profit" in clean_df.columns:
            clean_df["profit"] = clean_df["revenue"] - (clean_df["qty_prepared"] * clean_df["cost"])

        return clean_df
