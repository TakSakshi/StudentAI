"""
Unit Tests for Preprocessing Pipeline
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
import numpy as np
import pandas as pd
from src.preprocessing import build_preprocessor
from src.feature_engineering import get_feature_matrix_and_target
from data.generate_data import generate_student_dataset

def test_preprocessing_pipeline_fit_transform():
    """Verify preprocessor handles imputation and standardization cleanly."""
    df = generate_student_dataset(num_students=50, num_periods=2, random_seed=42)
    X, _ = get_feature_matrix_and_target(df)

    preprocessor = build_preprocessor()
    X_trans = preprocessor.fit_transform(X)

    # Check transformed array properties
    assert isinstance(X_trans, np.ndarray)
    assert not np.isnan(X_trans).any(), "Preprocessed matrix should contain no NaNs"
    assert not np.isinf(X_trans).any(), "Preprocessed matrix should contain no Infs"
    assert X_trans.shape[0] == len(X)
    assert X_trans.shape[1] >= len(X.columns)  # Categorical one-hot expansion

