"""
Unit Tests for Data Leakage Prevention
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
import pandas as pd
from src.feature_engineering import get_feature_matrix_and_target
from src.split import time_based_split
from data.generate_data import generate_student_dataset

def test_no_future_target_leakage_in_features():
    """Verify that neither next_assessment_score nor at_risk exists in feature matrix X."""
    df = generate_student_dataset(num_students=50, num_periods=3, random_seed=42)
    X, y = get_feature_matrix_and_target(df)

    assert "next_assessment_score" not in X.columns
    assert "at_risk" not in X.columns
    assert "target" not in X.columns

def test_time_split_preserves_temporal_order():
    """Verify time-based split strictly prevents future observations from leaking into train set."""
    df = generate_student_dataset(num_students=50, num_periods=5, random_seed=42)
    train_df, val_df, test_df = time_based_split(df)

    max_train_date = pd.to_datetime(train_df["prediction_date"]).max()
    min_val_date = pd.to_datetime(val_df["prediction_date"]).min()
    min_test_date = pd.to_datetime(test_df["prediction_date"]).min()

    assert max_train_date < min_val_date, "Training dates must strictly precede validation dates"
    assert min_val_date < min_test_date, "Validation dates must strictly precede test dates"
