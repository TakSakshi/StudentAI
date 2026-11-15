"""
Unit Tests for Model Training Execution
StudentInsight AI - Algions AI Labs Private Limited
"""

import pytest
from src.config import BEST_MODEL_PATH, MODEL_METADATA_PATH, EVALUATION_METRICS_PATH
from src.train import train_and_evaluate_all

def test_training_pipeline_generates_artifacts():
    """Verify train_and_evaluate_all runs without exceptions and updates model artifacts."""
    train_and_evaluate_all()

    assert BEST_MODEL_PATH.exists(), "best_model.pkl must exist after training"
    assert MODEL_METADATA_PATH.exists(), "model_metadata.json must exist after training"
    assert EVALUATION_METRICS_PATH.exists(), "evaluation_metrics.json must exist after training"

