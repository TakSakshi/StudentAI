"""
Health Check Route
StudentInsight AI - Algions AI Labs Private Limited
"""

from fastapi import APIRouter
from backend.app.services.model_service import ModelService
from backend.app.config import settings

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def check_health():
    """Verify backend and model pipeline readiness."""
    model_svc = ModelService.get_instance()
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "model_loaded": model_svc.is_loaded,
        "model_name": model_svc.model_name,
        "model_version": model_svc.version,
        "decision_threshold": model_svc.threshold
    }

