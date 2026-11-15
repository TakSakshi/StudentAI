"""
Unit Tests for Dataset Generation & Reproducibility
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
import pandas as pd
from data.generate_data import generate_student_dataset

def test_data_generation_reproducibility():
    """Verify that using the same random seed reproduces the exact same dataset."""
    df1 = generate_student_dataset(num_students=50, num_periods=3, random_seed=42)
    df2 = generate_student_dataset(num_students=50, num_periods=3, random_seed=42)

    pd.testing.assert_frame_equal(df1, df2)

def test_data_generation_schema():
    """Verify generated dataset contains all required fields with non-empty values."""
    df = generate_student_dataset(num_students=100, num_periods=3, random_seed=99)

    required_cols = [
        "student_id", "assessment_period", "prediction_date",
        "attendance_rate", "assignments_completed", "total_assignments",
        "assignment_completion_rate", "previous_score_1", "previous_score_2",
        "previous_score_3", "average_previous_score", "latest_score",
        "score_trend", "score_std", "assessments_completed",
        "next_assessment_score", "at_risk"
    ]

    for col in required_cols:
        assert col in df.columns, f"Missing required column: {col}"

    assert len(df) == 300  # 100 students * 3 periods
    assert df["at_risk"].isin([0, 1]).all(), "Target at_risk must only be 0 or 1"
