"""
Pydantic Schemas for Dashboard and Analytics Endpoints
StudentInsight AI - Algions AI Labs Private Limited
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummaryResponse(BaseModel):
    total_unique_students: int
    total_prediction_records: int
    at_risk_count: int
    not_at_risk_count: int
    at_risk_percentage: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_attendance: float
    average_assignment_completion: float
    average_previous_score: float
    model_name: str
    model_version: str
    decision_threshold: float
    human_review_disclaimer: str

class TrendPoint(BaseModel):
    period: int
    mean_latest_score: float
    mean_attendance: float
    mean_completion: float
    at_risk_rate: float
    total_records: int

class PerformanceTrendsResponse(BaseModel):
    trends: List[TrendPoint]

class DistributionBin(BaseModel):
    range_label: str
    min_val: float
    max_val: float
    total_count: int
    at_risk_count: int
    at_risk_rate: float

class AttendanceAnalyticsResponse(BaseModel):
    average_attendance: float
    distribution: List[DistributionBin]

class AssignmentAnalyticsResponse(BaseModel):
    average_completion_rate: float
    distribution: List[DistributionBin]

class RiskBandCount(BaseModel):
    band: str
    label: str
    count: int
    percentage: float
    color: str

class RiskDistributionResponse(BaseModel):
    total_students: int
    bands: List[RiskBandCount]
