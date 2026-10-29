import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_dashboard_analytics_endpoint():
    res = client.get("/api/v1/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    summary = data["data"]["summary"]
    assert "today_predicted_demand" in summary
    assert "total_menu_items" in summary
    assert summary["total_menu_items"] > 0
    assert "historical_waste_rate_pct" in summary
    assert isinstance(data["data"]["trend_data"], list)


def test_waste_analytics_endpoint():
    res = client.get("/api/v1/analytics/waste")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    w = data["data"]
    assert "baseline_waste_rate_pct" in w
    assert "ai_waste_rate_pct" in w
    assert "waste_reduction_pct" in w
    assert "financial_loss_prevented_rs" in w
    assert isinstance(w["waste_by_category"], list)


def test_profitability_analytics_endpoint():
    res = client.get("/api/v1/analytics/profitability")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    p = data["data"]
    assert "total_gross_revenue" in p
    assert "net_profit" in p
    assert "overall_profit_margin_pct" in p
    assert isinstance(p["top_profitable_dishes"], list)


def test_attendance_forecasting_endpoint():
    res = client.get("/api/v1/forecasts/attendance?target_date=2026-10-30")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    att = data["data"]["predicted_attendance"]
    assert isinstance(att, int)
    assert 500 <= att <= 4000


def test_settings_crud_lifecycle():
    # 1. GET settings
    res = client.get("/api/v1/settings")
    assert res.status_code == 200
    initial = res.json()["data"]
    assert "budget_limit" in initial

    # 2. POST update settings
    payload = {
        "budget_limit": 85000.0,
        "max_items_per_meal": 9,
        "min_items_per_meal": 4,
        "min_veg_items": 3,
        "safety_buffer_pct": 10.0,
        "kitchen_capacity": 16000,
        "repetition_cooldown_days": 3,
    }
    update_res = client.post("/api/v1/settings", json=payload)
    assert update_res.status_code == 200
    updated = update_res.json()["data"]
    assert updated["budget_limit"] == 85000.0
    assert updated["safety_buffer_pct"] == 10.0
