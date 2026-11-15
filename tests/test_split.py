"""
Unit Tests for Data Splitting & Leakage Prevention
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
import pandas as pd
from src.split import time_based_split, student_grouped_split
from data.generate_data import generate_student_dataset

def test_time_based_split_chronology():
    """Verify chronological split guarantees training periods precede validation and test periods."""
    df = generate_student_dataset(num_students=60, num_periods=5, random_seed=42)
    train_df, val_df, test_df = time_based_split(df)

    # Train periods: 1, 2, 3
    # Val period: 4
    # Test period: 5
    assert set(train_df["assessment_period"].unique()) == {1, 2, 3}
    assert set(val_df["assessment_period"].unique()) == {4}
    assert set(test_df["assessment_period"].unique()) == {5}

    assert train_df["assessment_period"].max() < val_df["assessment_period"].min()
    assert val_df["assessment_period"].max() < test_df["assessment_period"].min()

def test_student_grouped_split_no_overlap():
    """Verify group split guarantees zero student ID overlap."""
    df = generate_student_dataset(num_students=80, num_periods=3, random_seed=42)
    train_df, test_df = student_grouped_split(df, test_ratio=0.25, random_seed=42)

    train_students = set(train_df["student_id"])
    test_students = set(test_df["student_id"])

    assert len(train_students.intersection(test_students)) == 0

