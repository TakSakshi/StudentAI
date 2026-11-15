"""
FastAPI Main Application Entrypoint
StudentInsight AI - Student Performance & At-Risk Prediction
Algions AI Labs Private Limited - Internship Assessment
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.services.data_service import DataService
from backend.app.services.model_service import ModelService

from backend.app.routes import (
    health,
    dashboard,
    students,
    predictions,
    analytics,
    model,
    data
)

# Structured Logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("studentinsight-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown lifecycle hooks."""
    logger.info("Initializing StudentInsight AI Backend services...")
    try:
        # Pre-load data and model artifacts
        data_svc = DataService.get_instance()
        logger.info(f"Loaded dataset: {len(data_svc.df)} records across {data_svc.df['student_id'].nunique()} students.")

        model_svc = ModelService.get_instance()
        logger.info(f"Loaded ML model: {model_svc.model_name} v{model_svc.version} (Threshold: {model_svc.threshold}).")
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")

    yield
    logger.info("StudentInsight AI Backend shutting down.")

app = FastAPI(
    title="StudentInsight AI API",
    description=(
        "Advisory Machine Learning Decision Support System for Student Performance & At-Risk Prediction. "
        "Built for Algions AI Labs Private Limited Assessment."
    ),
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.encoders import jsonable_encoder

# Validation Error Handler (returns standard HTTP 422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": jsonable_encoder(exc.errors())}
    )

# HTTP Exception Handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Global Unexpected Exception Handler (returns HTTP 500)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An error occurred while processing the request. Please verify inputs or contact support.",
            "path": request.url.path
        }
    )

# Register API Routers
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(students.router)
app.include_router(predictions.router)
app.include_router(analytics.router)
app.include_router(model.router)
app.include_router(data.router)

@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/api/docs",
        "status": "online"
    }
