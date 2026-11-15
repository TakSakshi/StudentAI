"""
Inference & Prediction Service Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Union, List

from src.config import (
    BEST_MODEL_PATH,
    MODEL_METADATA_PATH,
    THRESHOLD_CONFIG_PATH,
    ALL_MODEL_FEATURES,
    RISK_BANDS,
    HUMAN_REVIEW_DISCLAIMER
)
from src.feature_engineering import engineer_features
from src.explainability import generate_local_explanation

class PredictionPipeline:
    """Singleton-style cached prediction pipeline loader."""
    _instance = None
    _model = None
    _metadata = None
    _threshold_config = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance._load_artifacts()
        return cls._instance

    def _load_artifacts(self):
        if not BEST_MODEL_PATH.exists():
            raise FileNotFoundError(f"Model artifact not found at {BEST_MODEL_PATH}. Run training first.")

        self._model = joblib.load(BEST_MODEL_PATH)

        if MODEL_METADATA_PATH.exists():
            with open(MODEL_METADATA_PATH, "r") as f:
                self._metadata = json.load(f)
        else:
            self._metadata = {"model_name": "Trained Classifier", "version": "1.0.0"}

        if THRESHOLD_CONFIG_PATH.exists():
            with open(THRESHOLD_CONFIG_PATH, "r") as f:
                self._threshold_config = json.load(f)
        else:
            self._threshold_config = {"classification_threshold": 0.50}

    @property
    def model(self):
        return self._model

    @property
    def metadata(self):
        return self._metadata

    @property
    def threshold(self) -> float:
        return float(self._threshold_config.get("classification_threshold", 0.50))


def assign_risk_band(probability: float) -> Dict[str, str]:
    """Map calibrated probability to advisory risk band."""
    if probability < RISK_BANDS["LOW"]["max"]:
        return {
            "band": "LOW",
            "label": RISK_BANDS["LOW"]["label"],
            "color": RISK_BANDS["LOW"]["color"],
            "description": "Student performance indicators are within expected passing ranges."
        }
    elif probability < RISK_BANDS["MEDIUM"]["max"]:
        return {
            "band": "MEDIUM",
            "label": RISK_BANDS["MEDIUM"]["label"],
            "color": RISK_BANDS["MEDIUM"]["color"],
            "description": "Student exhibits mixed or emerging vulnerability signals. Proactive check-in advised."
        }
    else:
        return {
            "band": "HIGH",
            "label": RISK_BANDS["HIGH"]["label"],
            "color": RISK_BANDS["HIGH"]["color"],
            "description": "Student shows strong historical signals of academic risk. Priority educator review recommended."
        }


def predict_single(student_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an advisory prediction and local explanation for a single student.

    Parameters:
    -----------
    student_dict : Dict[str, Any]
        Student academic record containing attendance, assignments, and previous scores.

    Returns:
    --------
    Dict[str, Any]
        Comprehensive advisory prediction response.
    """
    pipeline = PredictionPipeline.get_instance()
    model = pipeline.model
    threshold = pipeline.threshold
    metadata = pipeline.metadata

    # Convert to DataFrame for feature engineering
    df = pd.DataFrame([student_dict])

    # Ensure required input fields exist or default safely
    if "assignments_completed" in df.columns and "total_assignments" in df.columns:
        if "assignment_completion_rate" not in df.columns or pd.isnull(df["assignment_completion_rate"].iloc[0]):
            tot = df["total_assignments"].iloc[0]
            comp = df["assignments_completed"].iloc[0]
            df["assignment_completion_rate"] = (comp / tot * 100.0) if tot > 0 else 0.0

    if "previous_score_1" in df.columns:
        df["latest_score"] = df["previous_score_1"]
        if "previous_score_2" not in df.columns or pd.isnull(df["previous_score_2"].iloc[0]):
            df["previous_score_2"] = df["previous_score_1"]
        if "previous_score_3" not in df.columns or pd.isnull(df["previous_score_3"].iloc[0]):
            df["previous_score_3"] = df["previous_score_2"]

    if "average_previous_score" not in df.columns or pd.isnull(df["average_previous_score"].iloc[0]):
        df["average_previous_score"] = (
            (df["previous_score_1"] + df["previous_score_2"] + df["previous_score_3"]) / 3.0
        ).round(2)

    if "assessments_completed" not in df.columns:
        df["assessments_completed"] = 3

    # Run feature engineering
    engineered_df = engineer_features(df)

    # Align feature matrix strictly to training order
    X = engineered_df[ALL_MODEL_FEATURES].copy()

    # Model inference
    probs = model.predict_proba(X)[0]
    prob_at_risk = float(probs[1]) if len(probs) > 1 else float(probs[0])

    predicted_class = int(prob_at_risk >= threshold)
    risk_band_info = assign_risk_band(prob_at_risk)

    # Generate localized explainability signals
    explanation = generate_local_explanation(
        student_data=engineered_df.iloc[0].to_dict(),
        predicted_class=predicted_class,
        risk_probability=prob_at_risk,
        threshold=threshold
    )

    return {
        "student_id": str(student_dict.get("student_id", "ANONYMOUS")),
        "predicted_class": predicted_class,
        "is_at_risk": bool(predicted_class == 1),
        "risk_probability": round(prob_at_risk, 4),
        "risk_percentage": round(prob_at_risk * 100.0, 1),
        "advisory_risk_band": risk_band_info["label"],
        "risk_band_code": risk_band_info["band"],
        "risk_band_color": risk_band_info["color"],
        "risk_band_description": risk_band_info["description"],
        "decision_threshold": round(threshold, 4),
        "model_name": metadata.get("model_name", "Trained Classifier"),
        "model_version": metadata.get("version", "1.0.0"),
        "prediction_timestamp": datetime.now().isoformat(),
        "influential_signals": explanation["signals"],
        "explanation_narrative": explanation["narrative"],
        "human_review_disclaimer": HUMAN_REVIEW_DISCLAIMER
    }
