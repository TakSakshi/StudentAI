"""
Student Records Route
StudentInsight AI - Algions AI Labs Private Limited
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.app.schemas.student import StudentListResponse, StudentDetailResponse
from backend.app.services.data_service import DataService

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("", response_model=StudentListResponse)
def list_students(
    search: Optional[str] = Query(None, description="Search by anonymous Student ID"),
    risk_band: Optional[str] = Query("ALL", description="Filter by risk band (Low, Medium, High, or ALL)"),
    period: Optional[int] = Query(None, description="Filter by specific assessment period"),
    sort_by: str = Query("student_id", description="Column to sort by"),
    ascending: bool = Query(True, description="Sort direction"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Records per page")
):
    """Retrieve filtered, searchable and paginated student records."""
    data_svc = DataService.get_instance()
    result = data_svc.get_student_records(
        search=search,
        risk_band=risk_band,
        period=period,
        sort_by=sort_by,
        ascending=ascending,
        page=page,
        page_size=page_size
    )
    return result

@router.get("/{student_id}", response_model=StudentDetailResponse)
def get_student_details(student_id: str):
    """Retrieve full longitudinal history and trajectory for a single student."""
    data_svc = DataService.get_instance()
    result = data_svc.get_student_detail(student_id.strip())
    if not result:
        raise HTTPException(status_code=404, detail=f"Student ID '{student_id}' not found.")
    return result
