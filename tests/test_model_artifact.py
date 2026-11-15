"""
Unit Tests for Model Artifact Serialization and Integrity
StudentInsight AI - Algions AI Labs Private Limited
"""

import json
import joblib
import pytest
from src.config import BEST_MODEL_PATH, MODEL_METADATA_PATH, EVALUATION_METRICS_PATH, FEATURE_LIST_PATH, THRESHOLD_CONFIG_PATH

def test_model_artifact_loadable():
    """Verify best_model.pkl is loadable by joblib and possesses predict_proba."""
    assert BEST_MODEL_PATH.exists()
    model = joblib.load(BEST_MODEL_PATH)
    assert hasattr(model, "predict"), "Trained artifact must possess predict method"
    assert hasattr(model, "predict_proba"), "Trained artifact must possess predict_proba method"

def test_metadata_consistency():
    """Verify metadata contains required educational audit keys."""
    assert MODEL_METADATA_PATH.exists()
    with open(MODEL_METADATA_PATH, "r") as f:
        meta = json.load(f)

    assert "model_name" in meta
    assert "version" in meta
    assert "score_threshold_for_at_risk" in meta
    assert "selected_probability_threshold" in meta
    assert "global_feature_importance" in meta
    assert meta["score_threshold_for_at_risk"] == 40.0

def test_metrics_consistency():
    """Verify evaluation metrics JSON stores precision, recall, and confusion matrix."""
    assert EVALUATION_METRICS_PATH.exists()
    with open(EVALUATION_METRICS_PATH, "r") as f:
        metrics = json.load(f)

    assert "validation_metrics" in metrics
    assert "test_metrics" in metrics

    test_m = metrics["test_metrics"]
    assert "precision" in test_m
    assert "recall" in test_m
    assert "f1" in test_m
    assert "confusion_matrix" in test_m
    assert 0.0 <= test_m["recall"] <= 1.0
    assert 0.0 <= test_m["precision"] <= 1.0

