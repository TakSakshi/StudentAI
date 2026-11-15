"""
Prediction Service for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

from typing import Dict, Any
from src.predict import predict_single

def run_prediction(request_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Execute live inference pipeline for an input student payload."""
    return predict_single(request_dict)
