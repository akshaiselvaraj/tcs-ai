from datetime import date
from fastapi.testclient import TestClient
from app.main import app


def test_optimizer_menu_mix_endpoint(client):
    payload = {
        "forecast_date": "2026-11-05",
        "meal_type": "Lunch",
        "budget_limit": 80000.0,
        "kitchen_capacity": 15000,
        "min_items": 4,
        "max_items": 6,
        "min_veg_items": 3,
        "objective_priority": "balanced",
        "safety_buffer_pct": 5.0,
    }
    response = client.post("/api/v1/optimize/menu-mix", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["solver_status"] in ["Optimal", "Feasible", "Heuristic_Relaxed"]
    assert len(data["selected_dishes"]) >= 4
    assert len(data["selected_dishes"]) <= 6
    assert data["summary"]["total_prep_cost"] <= 80000.0
    assert data["summary"]["total_recommended_preparation"] <= 15000


def test_optimizer_validation_bounds(client):
    # min_items > max_items must fail with 422
    payload = {
        "forecast_date": "2026-11-05",
        "meal_type": "Lunch",
        "budget_limit": 50000.0,
        "min_items": 8,
        "max_items": 4,
    }
    response = client.post("/api/v1/optimize/menu-mix", json=payload)
    assert response.status_code == 422
