"""
Unit Tests for Feature Engineering & Transformations
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
import pandas as pd
from src.feature_engineering import engineer_features, get_feature_matrix_and_target
from src.config import ALL_MODEL_FEATURES

def test_engineer_features_calculations():
    """Verify feature derivation calculations such as completion rate and trend."""
    raw = pd.DataFrame([{
        "student_id": "STU_9999",
        "assessment_period": 3,
        "attendance_rate": 85.0,
        "assignments_completed": 8,
        "total_assignments": 10,
        "previous_score_1": 45.0,
        "previous_score_2": 40.0,
        "previous_score_3": 35.0,
        "average_previous_score": 40.0,
        "score_std": 5.0,
        "assessments_completed": 3,
        "at_risk": 0
    }])

    feat = engineer_features(raw)

    assert feat["assignment_completion_rate"].iloc[0] == 80.0
    assert feat["latest_score"].iloc[0] == 45.0
    assert feat["score_delta"].iloc[0] == 5.0  # 45 - 40
    assert feat["score_trend"].iloc[0] == "Improving"  # delta > 3.0
    assert feat["min_previous_score"].iloc[0] == 35.0
    assert feat["max_previous_score"].iloc[0] == 45.0

def test_safe_zero_division_assignment_completion():
    """Verify zero total assignments does not throw ZeroDivisionError."""
    raw = pd.DataFrame([{
        "total_assignments": 0,
        "assignments_completed": 0,
        "previous_score_1": 50.0,
        "average_previous_score": 50.0,
        "attendance_rate": 80.0
    }])
    feat = engineer_features(raw)
    assert feat["assignment_completion_rate"].iloc[0] == 0.0

def test_feature_matrix_excludes_target():
    """Verify target and future scores are strictly absent from feature matrix X."""
    raw = pd.DataFrame([{
        "student_id": "STU_0001",
        "assessment_period": 1,
        "prediction_date": "2025-01-01",
        "attendance_rate": 80.0,
        "assignments_completed": 8,
        "total_assignments": 10,
        "previous_score_1": 55.0,
        "previous_score_2": 50.0,
        "previous_score_3": 50.0,
        "average_previous_score": 51.6,
        "latest_score": 55.0,
        "score_trend": "Improving",
        "score_std": 2.5,
        "assessments_completed": 2,
        "next_assessment_score": 58.0,
        "at_risk": 0
    }])

    X, y = get_feature_matrix_and_target(raw)
    assert "at_risk" not in X.columns
    assert "next_assessment_score" not in X.columns
    assert list(X.columns) == ALL_MODEL_FEATURES
    assert y.iloc[0] == 0
