"""
Prediction API Route
StudentInsight AI - Algions AI Labs Private Limited
"""

from fastapi import APIRouter, HTTPException
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse
from backend.app.services.prediction_service import run_prediction

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

@router.post("", response_model=PredictionResponse)
def predict_student_risk(payload: PredictionRequest):
    """
    Generate advisory academic risk prediction using the trained model pipeline.
    Validates all inputs, computes features strictly before cutoff, and returns
    calibrated advisory probabilities, influential signals, and human-review disclaimer.
    """
    try:
        req_dict = payload.model_dump()
        result = run_prediction(req_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
