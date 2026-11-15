"""
Data Splitting Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import pandas as pd
from typing import Tuple, Dict, Any
from src.config import PERIOD_COLUMN, STUDENT_ID_COLUMN

def time_based_split(
    df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Perform a chronological, time-aware split based on assessment periods.
    Simulates real-world production deployment:
    - Periods 1, 2, 3: Training set (earliest ~70% observations)
    - Period 4: Validation set (intermediate ~15% observations)
    - Period 5: Final Held-out Test set (latest ~15% observations)

    Ensures zero future-to-past leakage.
    """
    periods = sorted(df[PERIOD_COLUMN].unique())
    if len(periods) < 3:
        raise ValueError(f"Need at least 3 distinct periods for time-based split, found: {periods}")

    train_periods = periods[:-2]  # e.g., [1, 2, 3]
    val_period = periods[-2]      # e.g., 4
    test_period = periods[-1]     # e.g., 5

    train_df = df[df[PERIOD_COLUMN].isin(train_periods)].copy()
    val_df = df[df[PERIOD_COLUMN] == val_period].copy()
    test_df = df[df[PERIOD_COLUMN] == test_period].copy()

    # Leakage check: test periods must strictly be greater than validation, and validation > train
    assert train_df[PERIOD_COLUMN].max() < val_df[PERIOD_COLUMN].min(), "Leakage detected: Training set contains future periods!"
    assert val_df[PERIOD_COLUMN].max() < test_df[PERIOD_COLUMN].min(), "Leakage detected: Validation set contains test periods!"

    return train_df, val_df, test_df

def student_grouped_split(
    df: pd.DataFrame,
    test_ratio: float = 0.20,
    random_seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split dataset by unique students so no student appears in both train and test.
    Useful as a supplementary experiment to test generalization to completely new students.
    """
    unique_students = pd.Series(df[STUDENT_ID_COLUMN].unique())
    test_students = unique_students.sample(frac=test_ratio, random_state=random_seed)

    test_df = df[df[STUDENT_ID_COLUMN].isin(test_students)].copy()
    train_df = df[~df[STUDENT_ID_COLUMN].isin(test_students)].copy()

    # Verify no student overlap
    overlap = set(train_df[STUDENT_ID_COLUMN]).intersection(set(test_df[STUDENT_ID_COLUMN]))
    assert len(overlap) == 0, "Leakage detected: Students overlap across group split!"

    return train_df, test_df

