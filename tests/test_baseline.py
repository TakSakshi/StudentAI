"""
Unit Tests for Baseline Model
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
from src.baseline import build_majority_baseline
from src.feature_engineering import get_feature_matrix_and_target
from data.generate_data import generate_student_dataset

def test_majority_baseline_prediction():
    """Verify majority baseline predicts the most common class."""
    df = generate_student_dataset(num_students=50, num_periods=2, random_seed=42)
    X, y = get_feature_matrix_and_target(df)

    baseline = build_majority_baseline()
    baseline.fit(X, y)

    preds = baseline.predict(X)
    majority_class = y.mode()[0]

    assert (preds == majority_class).all(), "Majority baseline must predict the modal class for all samples"
