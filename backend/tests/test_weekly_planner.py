from datetime import date
from fastapi.testclient import TestClient
from app.main import app


def test_weekly_planner_lifecycle(client):
    # 1. Get latest plan
    get_res = client.get("/api/v1/weekly-menu/latest")
    assert get_res.status_code == 200
    res_data = get_res.json()
    assert res_data["success"] is True
    plan = res_data["data"]
    assert plan is not None
    assert "financial_summary" in plan
    assert len(plan["schedule"]) == 7

    # 2. Export CSV
    csv_res = client.get("/api/v1/weekly-menu/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    csv_lines = csv_res.text.strip().split("\n")
    assert len(csv_lines) > 10  # Has header + dish rows
    assert "Recommended Prep" in csv_lines[0]
