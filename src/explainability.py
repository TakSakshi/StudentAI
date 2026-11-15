"""
Model Explainability Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List
from src.config import HUMAN_REVIEW_DISCLAIMER

# Population benchmark averages (derived from training data)
POPULATION_BENCHMARKS = {
    "attendance_rate": 80.5,
    "assignment_completion_rate": 81.2,
    "latest_score": 62.4,
    "average_previous_score": 62.1,
    "score_delta": 0.0,
    "score_std": 4.5
}

def extract_global_feature_importance(pipeline, feature_names: List[str]) -> List[Dict[str, Any]]:
    """
    Extract global feature importance weights from the trained pipeline classifier.
    """
    classifier = pipeline.named_steps.get("classifier")
    preprocessor = pipeline.named_steps.get("preprocessor")

    try:
        # Get one-hot expanded feature names if possible
        num_features = preprocessor.transformers_[0][2]
        cat_features = preprocessor.transformers_[1][2]
        cat_encoder = preprocessor.named_transformers_["cat"].named_steps["onehot"]
        encoded_cat_names = list(cat_encoder.get_feature_names_out(cat_features))
        all_expanded_names = list(num_features) + encoded_cat_names
    except Exception:
        all_expanded_names = feature_names

    importances = []
    if hasattr(classifier, "feature_importances_"):
        raw_imp = classifier.feature_importances_
        for name, val in zip(all_expanded_names, raw_imp):
            importances.append({"feature": name, "importance": round(float(val), 4)})
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
    elif hasattr(classifier, "coef_"):
        raw_coef = classifier.coef_[0]
        for name, val in zip(all_expanded_names, raw_coef):
            importances.append({"feature": name, "importance": round(float(abs(val)), 4), "coefficient": round(float(val), 4)})
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
    else:
        # Dummy or fallback
        for name in feature_names:
            importances.append({"feature": name, "importance": 0.0})

    return importances

def _safe_float(val, default=0.0) -> float:
    if val is None or pd.isna(val):
        return float(default)
    try:
        return float(val)
    except Exception:
        return float(default)

def generate_local_explanation(
    student_data: Dict[str, Any],
    predicted_class: int,
    risk_probability: float,
    threshold: float = 0.50
) -> Dict[str, Any]:
    """
    Generate an educational, non-punitive, plain-language explanation of the influential signals
    driving a student's risk advisory.

    Differentiates between:
    - Academic risk drivers (e.g. low attendance, missing homework, declining score trend)
    - Protective resilience factors (e.g. high attendance, steady homework completion)
    """
    signals: List[Dict[str, Any]] = []

    att = _safe_float(student_data.get("attendance_rate"), 80.0)
    comp = _safe_float(student_data.get("assignment_completion_rate"), 80.0)
    latest = _safe_float(student_data.get("latest_score", student_data.get("previous_score_1")), 60.0)
    avg = _safe_float(student_data.get("average_previous_score"), latest)
    trend = str(student_data.get("score_trend") or "Stable")
    delta = _safe_float(student_data.get("score_delta"), 0.0)

    # Evaluate Attendance Signal
    if att < 70.0:
        signals.append({
            "signal": "Low Attendance Rate",
            "impact": "Increases Risk",
            "detail": f"Class attendance ({att:.1f}%) is noticeably below the cohort target (80%+). Missed instructional time strongly correlates with learning gaps.",
            "importance": "High"
        })
    elif att >= 88.0:
        signals.append({
            "signal": "Strong Class Attendance",
            "impact": "Protective Factor",
            "detail": f"Consistent attendance ({att:.1f}%) demonstrates active engagement and provides instructional continuity.",
            "importance": "Medium"
        })

    # Evaluate Assignment Completion Signal
    if comp < 65.0:
        signals.append({
            "signal": "Incomplete Assignments",
            "impact": "Increases Risk",
            "detail": f"Assignment submission rate is {comp:.1f}%. Missed formative practice limits mastery and feedback opportunities before the assessment.",
            "importance": "High"
        })
    elif comp >= 90.0:
        signals.append({
            "signal": "High Assignment Diligence",
            "impact": "Protective Factor",
            "detail": f"Assignment completion is {comp:.1f}%, indicating disciplined formative preparation.",
            "importance": "Medium"
        })

    # Evaluate Historical and Latest Assessment Scores
    if latest < 45.0:
        signals.append({
            "signal": "Recent Assessment Deficit",
            "impact": "Increases Risk",
            "detail": f"Most recent assessment score ({latest:.1f}%) was near or below the passing threshold, reflecting immediate conceptual challenges.",
            "importance": "High"
        })
    elif latest >= 75.0:
        signals.append({
            "signal": "Strong Academic Baseline",
            "impact": "Protective Factor",
            "detail": f"Latest assessment score ({latest:.1f}%) is solid, indicating strong foundational subject mastery.",
            "importance": "Medium"
        })

    # Evaluate Score Trend
    if trend == "Declining" or delta < -3.0:
        signals.append({
            "signal": "Downward Performance Momentum",
            "impact": "Increases Risk",
            "detail": f"Performance has declined by {abs(delta):.1f} points between recent assessments, signaling emerging difficulty.",
            "importance": "Medium"
        })
    elif trend == "Improving" or delta > 3.0:
        signals.append({
            "signal": "Positive Academic Momentum",
            "impact": "Protective Factor",
            "detail": f"Scores show an upward trajectory (+{delta:.1f} points), indicating effective adaptation or recent recovery.",
            "importance": "Medium"
        })

    # Summary narrative
    if predicted_class == 1 or risk_probability >= threshold:
        risk_drivers = [s["signal"] for s in signals if s["impact"] == "Increases Risk"]
        if risk_drivers:
            narrative = (
                f"The model flags advisory risk based primarily on: {', '.join(risk_drivers)}. "
                "These signals suggest the student would benefit from proactive educator outreach, "
                "remedial tutoring, or an attendance check-in before the upcoming assessment."
            )
        else:
            narrative = (
                "The model estimated elevated academic vulnerability based on combined subtle patterns "
                "across historical scores and study engagement signals."
            )
    else:
        protective = [s["signal"] for s in signals if s["impact"] == "Protective Factor"]
        if protective:
            narrative = (
                f"Academic indicators remain on track, bolstered by: {', '.join(protective)}. "
                "Continued encouragement and regular check-ins are recommended."
            )
        else:
            narrative = "Performance indicators are within expected stable bounds."

    return {
        "signals": signals,
        "narrative": narrative,
        "risk_probability": round(float(risk_probability), 4),
        "threshold": round(float(threshold), 4),
        "disclaimer": HUMAN_REVIEW_DISCLAIMER
    }
