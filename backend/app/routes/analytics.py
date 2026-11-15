"""
Analytics API Routes
StudentInsight AI - Algions AI Labs Private Limited
"""

from fastapi import APIRouter
from backend.app.schemas.analytics import (
    PerformanceTrendsResponse,
    AttendanceAnalyticsResponse,
    AssignmentAnalyticsResponse,
    RiskDistributionResponse
)
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/performance-trends", response_model=PerformanceTrendsResponse)
def get_performance_trends():
    """Retrieve academic performance and risk trends across sequential periods."""
    trends = AnalyticsService.get_performance_trends()
    return {"trends": trends}

@router.get("/attendance", response_model=AttendanceAnalyticsResponse)
def get_attendance_analytics():
    """Retrieve cohort attendance rate distribution and risk correlation."""
    return AnalyticsService.get_attendance_analytics()

@router.get("/assignment-completion", response_model=AssignmentAnalyticsResponse)
def get_assignment_analytics():
    """Retrieve assignment completion patterns and risk rates."""
    return AnalyticsService.get_assignment_analytics()

@router.get("/risk-distribution", response_model=RiskDistributionResponse)
def get_risk_distribution():
    """Retrieve overall distribution across Low, Medium, and High advisory risk bands."""
    return AnalyticsService.get_risk_distribution()
