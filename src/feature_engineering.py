"""
Feature Engineering Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import pandas as pd
import numpy as np
from typing import List, Tuple
from src.config import NUMERICAL_FEATURES, CATEGORICAL_FEATURES, ALL_MODEL_FEATURES

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute academic indicators and features strictly from historical data
    available up to the prediction cutoff.

    Ensures zero future-data leakage:
    - Target column 'at_risk' and 'next_assessment_score' are NEVER used to engineer features.
    - Zero-denominator division is safely guarded.
    """
    df = df.copy()

    # 1. Assignment completion rate
    if "total_assignments" in df.columns and "assignments_completed" in df.columns:
        df["assignment_completion_rate"] = np.where(
            df["total_assignments"] > 0,
            (df["assignments_completed"] / df["total_assignments"]) * 100.0,
            0.0
        )
        df["assignment_completion_rate"] = df["assignment_completion_rate"].round(2)

    # 2. Latest score
    if "previous_score_1" in df.columns:
        df["latest_score"] = df["previous_score_1"]

    # 3. Minimum and maximum previous scores
    score_cols = [c for c in ["previous_score_1", "previous_score_2", "previous_score_3"] if c in df.columns]
    if score_cols:
        df["min_previous_score"] = df[score_cols].min(axis=1).round(2)
        df["max_previous_score"] = df[score_cols].max(axis=1).round(2)
        if "average_previous_score" not in df.columns:
            df["average_previous_score"] = df[score_cols].mean(axis=1).round(2)
        if "score_std" not in df.columns:
            df["score_std"] = df[score_cols].std(axis=1).fillna(0.0).round(2)

    # 4. Score delta (momentum)
    if "previous_score_1" in df.columns and "previous_score_2" in df.columns:
        df["score_delta"] = (df["previous_score_1"] - df["previous_score_2"]).round(2)
    else:
        df["score_delta"] = 0.0

    # 5. Score trend categorization if not already present
    if "score_trend" not in df.columns or df["score_trend"].isnull().any():
        conditions = [
            df["score_delta"] > 3.0,
            df["score_delta"] < -3.0
        ]
        choices = ["Improving", "Declining"]
        df["score_trend"] = np.select(conditions, choices, default="Stable")

    # 6. Interaction: attendance to historical score ratio (guarded against division by zero)
    if "attendance_rate" in df.columns and "average_previous_score" in df.columns:
        safe_avg = np.maximum(df["average_previous_score"].fillna(50.0), 1.0)
        df["attendance_to_score_ratio"] = (df["attendance_rate"].fillna(80.0) / safe_avg).clip(0.0, 10.0).round(3)

    return df

def get_feature_matrix_and_target(
    df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Extract the clean model feature matrix X and target y.
    Strictly verifies that neither 'next_assessment_score' nor 'at_risk' leaks into X.
    """
    engineered = engineer_features(df)

    # Check for target existence
    if "at_risk" not in engineered.columns:
        raise ValueError("Target column 'at_risk' not found in dataset.")

    y = engineered["at_risk"].copy()

    # Filter strictly to the documented feature list
    missing_features = [f for f in ALL_MODEL_FEATURES if f not in engineered.columns]
    if missing_features:
        raise KeyError(f"Expected features missing from engineered dataset: {missing_features}")

    X = engineered[ALL_MODEL_FEATURES].copy()

    # Integrity assertion against target leakage
    assert "at_risk" not in X.columns, "CRITICAL ERROR: Target column 'at_risk' leaked into feature matrix!"
    assert "next_assessment_score" not in X.columns, "CRITICAL ERROR: Future outcome 'next_assessment_score' leaked into feature matrix!"

    return X, y
