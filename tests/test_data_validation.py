"""
Unit Tests for Data Validation & Quality Checks
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
import pandas as pd
from src.data_validation import validate_dataset, DataValidationError
from data.generate_data import generate_student_dataset

def test_valid_dataset_passes():
    """Verify clean dataset passes validation."""
    df = generate_student_dataset(num_students=50, num_periods=2, random_seed=42)
    report = validate_dataset(df, strict=True)
    assert report["is_valid"] is True
    assert len(report["issues"]) == 0

def test_invalid_attendance_fails():
    """Verify invalid attendance percentage (> 100 or < 0) is flagged."""
    df = generate_student_dataset(num_students=20, num_periods=2, random_seed=42)
    df.loc[0, "attendance_rate"] = 125.0  # Invalid attendance

    with pytest.raises(DataValidationError, match="outside \\[0, 100\\]"):
        validate_dataset(df, strict=True)

def test_invalid_score_range_fails():
    """Verify scores outside [0, 100] are flagged."""
    df = generate_student_dataset(num_students=20, num_periods=2, random_seed=42)
    df.loc[2, "latest_score"] = -10.0  # Invalid negative score

    with pytest.raises(DataValidationError, match="outside valid \\[0, 100\\]"):
        validate_dataset(df, strict=True)

def test_inconsistent_assignments_fails():
    """Verify assignments_completed > total_assignments is flagged."""
    df = generate_student_dataset(num_students=20, num_periods=2, random_seed=42)
    df.loc[1, "assignments_completed"] = 25
    df.loc[1, "total_assignments"] = 10

    with pytest.raises(DataValidationError, match="inconsistent assignment counts"):
        validate_dataset(df, strict=True)

def test_missing_values_fails():
    """Verify null values are detected."""
    df = generate_student_dataset(num_students=20, num_periods=2, random_seed=42)
    df.loc[0, "attendance_rate"] = None

    with pytest.raises(DataValidationError, match="missing values"):
        validate_dataset(df, strict=True)
