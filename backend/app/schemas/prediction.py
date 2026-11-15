"""
Pydantic Schemas for Prediction Endpoints
StudentInsight AI - Algions AI Labs Private Limited
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any

class PredictionRequest(BaseModel):
    student_id: Optional[str] = Field("STU_NEW", description="Anonymous synthetic student identifier")
    attendance_rate: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage before prediction [0, 100]")
    assignments_completed: int = Field(..., ge=0, description="Completed assignments count")
    total_assignments: int = Field(..., ge=1, description="Total assignments due (minimum 1)")
    previous_score_1: float = Field(..., ge=0.0, le=100.0, description="Latest assessment score [0, 100]")
    previous_score_2: Optional[float] = Field(None, ge=0.0, le=100.0, description="Second most recent score")
    previous_score_3: Optional[float] = Field(None, ge=0.0, le=100.0, description="Third most recent score")
    average_previous_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Historical average score")
    score_trend: Optional[str] = Field("Stable", description="Categorical trend: Improving, Stable, Declining")

    @model_validator(mode="after")
    def validate_completed_vs_total(self):
        if self.assignments_completed > self.total_assignments:
            raise ValueError(
                f"assignments_completed ({self.assignments_completed}) cannot exceed total_assignments ({self.total_assignments})"
            )
        return self

    @field_validator("score_trend")
    @classmethod
    def validate_trend(cls, v):
        allowed = ["Improving", "Stable", "Declining"]
        if v not in allowed:
            raise ValueError(f"score_trend must be one of {allowed}")
        return v

class InfluentialSignal(BaseModel):
    signal: str
    impact: str
    detail: str
    importance: str

class PredictionResponse(BaseModel):
    student_id: str
    predicted_class: int
    is_at_risk: bool
    risk_probability: float
    risk_percentage: float
    advisory_risk_band: str
    risk_band_code: str
    risk_band_color: str
    risk_band_description: str
    decision_threshold: float
    model_name: str
    model_version: str
    prediction_timestamp: str
    influential_signals: List[InfluentialSignal]
    explanation_narrative: str
    human_review_disclaimer: str
