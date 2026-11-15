"""
Unit Tests for Model Prediction Service
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
from src.predict import predict_single

def test_prediction_output_structure():
    """Verify inference output conforms to advisory schema with all required keys."""
    sample = {
        "student_id": "STU_UNIT_TEST",
        "attendance_rate": 72.0,
        "assignments_completed": 7,
        "total_assignments": 10,
        "previous_score_1": 48.0,
        "previous_score_2": 52.0,
        "previous_score_3": 55.0,
        "average_previous_score": 51.7,
        "score_trend": "Declining"
    }

    res = predict_single(sample)

    assert "student_id" in res
    assert "predicted_class" in res
    assert res["predicted_class"] in [0, 1]
    assert "risk_probability" in res
    assert 0.0 <= res["risk_probability"] <= 1.0
    assert "advisory_risk_band" in res
    assert res["advisory_risk_band"] in ["Low Advisory Risk", "Medium Advisory Risk", "High Advisory Risk"]
    assert "influential_signals" in res
    assert isinstance(res["influential_signals"], list)
    assert "human_review_disclaimer" in res
    assert "decision_threshold" in res
