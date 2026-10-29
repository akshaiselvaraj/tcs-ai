import io
import pandas as pd
from app.data_processing.validator import DatasetValidator, EXPECTED_COLUMNS
from app.ml.features import FeaturePipeline


def test_validator_detects_empty_csv():
    res = DatasetValidator.parse_and_validate(b"")
    assert not res["is_valid"]
    assert res["error"] is not None


def test_validator_with_synthetic_sample():
    # Build a 35-column valid row
    sample_data = {col: [1] for col in EXPECTED_COLUMNS}
    sample_data["date"] = ["2026-10-01"]
    sample_data["day"] = ["Monday"]
    sample_data["meal_type"] = ["Lunch"]
    sample_data["item_name"] = ["Veg Biryani"]
    sample_data["category"] = ["Main Course"]
    sample_data["veg_nonveg"] = ["Veg"]
    sample_data["qty_prepared"] = [100]
    sample_data["qty_sold"] = [95]
    sample_data["qty_wasted"] = [5]
    sample_data["unmet_demand"] = [0]
    sample_data["price"] = [80.0]
    sample_data["cost"] = [45.0]

    df = pd.DataFrame(sample_data)
    csv_bytes = df.to_csv(index=False).encode("utf-8")

    report = DatasetValidator.parse_and_validate(csv_bytes)
    assert report["is_valid"]
    assert report["total_rows"] == 1
    assert report["unique_items"] == 1


def test_feature_pipeline_no_target_leakage():
    # Length 2 for every column
    sample_data = {col: [10, 10] for col in EXPECTED_COLUMNS}
    sample_data["date"] = ["2026-10-01", "2026-10-02"]
    sample_data["day"] = ["Monday", "Tuesday"]
    sample_data["meal_type"] = ["Lunch", "Lunch"]
    sample_data["item_name"] = ["Veg Biryani", "Dal Makhani"]
    sample_data["category"] = ["Main Course", "Main Course"]
    sample_data["veg_nonveg"] = ["Veg", "Veg"]
    sample_data["qty_prepared"] = [100, 120]
    sample_data["qty_sold"] = [90, 110]
    sample_data["unmet_demand"] = [5, 2]
    sample_data["price"] = [80.0, 70.0]
    sample_data["cost"] = [40.0, 35.0]

    df = pd.DataFrame(sample_data)
    pipe = FeaturePipeline()
    X, y = pipe.fit_transform(df)

    assert "target_demand" not in X.columns
    assert "qty_sold" not in X.columns
    assert "qty_wasted" not in X.columns
    assert "revenue" not in X.columns
    assert "profit" not in X.columns
    assert len(X) == 2
    assert y.iloc[0] == 95  # 90 + 5
