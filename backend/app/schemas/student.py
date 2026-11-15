"""
Pydantic Schemas for Student Records Endpoints
StudentInsight AI - Algions AI Labs Private Limited
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class StudentRecord(BaseModel):
    student_id: str
    assessment_period: int
    prediction_date: str
    attendance_rate: float
    assignments_completed: int
    total_assignments: int
    assignment_completion_rate: float
    previous_score_1: float
    previous_score_2: float
    previous_score_3: float
    average_previous_score: float
    latest_score: float
    score_trend: str
    score_std: float
    assessments_completed: int
    next_assessment_score: Optional[float] = None
    at_risk: Optional[int] = None
    advisory_risk_band: Optional[str] = None
    risk_probability: Optional[float] = None

class StudentListResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    total_pages: int
    students: List[StudentRecord]

class StudentDetailResponse(BaseModel):
    student_id: str
    latest_record: StudentRecord
    history: List[StudentRecord]
    summary: Dict[str, Any]
    advisory_recommendation: Dict[str, Any]
    human_review_disclaimer: str
