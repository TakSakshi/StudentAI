"""
Dashboard Summary Route
StudentInsight AI - Algions AI Labs Private Limited
"""

from fastapi import APIRouter
from backend.app.schemas.analytics import DashboardSummaryResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary():
    """Retrieve comprehensive cohort overview KPI metrics derived from actual data."""
    return AnalyticsService.get_dashboard_summary()
