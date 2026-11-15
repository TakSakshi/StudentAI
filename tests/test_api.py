"""
Unit & Integration Tests for FastAPI Endpoints
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health_endpoint(client):
    """Verify health endpoint responds 200 with model readiness."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "model_name" in data

def test_dashboard_summary_endpoint(client):
    """Verify dashboard summary returns actual dataset metrics."""
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_unique_students"] == 1600
    assert data["total_prediction_records"] == 8000
    assert data["at_risk_count"] > 0
    assert "human_review_disclaimer" in data

def test_students_list_and_search(client):
    """Verify student listing, filtering and pagination."""
    res = client.get("/api/students?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data["students"]) == 10
    assert data["total_count"] == 1600

    # Search by existing student
    first_id = data["students"][0]["student_id"]
    search_res = client.get(f"/api/students?search={first_id}")
    assert search_res.status_code == 200
    assert search_res.json()["total_count"] >= 1

def test_predict_endpoint_valid_payload(client):
    """Verify predict endpoint produces advisory classification for valid payload."""
    payload = {
        "student_id": "STU_TEST_01",
        "attendance_rate": 60.0,
        "assignments_completed": 4,
        "total_assignments": 10,
        "previous_score_1": 35.0,
        "previous_score_2": 40.0,
        "previous_score_3": 45.0,
        "score_trend": "Declining"
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_at_risk"] is True
    assert data["advisory_risk_band"] == "High Advisory Risk"
    assert len(data["influential_signals"]) > 0

def test_predict_endpoint_invalid_payload(client):
    """Verify predict endpoint rejects out-of-range inputs."""
    # Invalid attendance > 100
    payload = {
        "attendance_rate": 150.0,
        "assignments_completed": 4,
        "total_assignments": 10,
        "previous_score_1": 50.0
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 422  # Pydantic validation error

    # Invalid assignments_completed > total_assignments
    payload2 = {
        "attendance_rate": 80.0,
        "assignments_completed": 15,
        "total_assignments": 10,
        "previous_score_1": 50.0
    }
    res2 = client.post("/api/predict", json=payload2)
    assert res2.status_code == 422

def test_model_metrics_endpoint(client):
    """Verify model performance metrics endpoint returns comparison rows."""
    res = client.get("/api/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "model_comparison" in data
    assert len(data["model_comparison"]) >= 4  # baseline, logistic, rf, xgboost, final
    assert "test_metrics" in data
    assert "trade_off_analysis" in data

