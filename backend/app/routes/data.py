"""
Dataset Explorer API Route
StudentInsight AI - Algions AI Labs Private Limited
"""

from fastapi import APIRouter, Query
from typing import Optional, Dict, Any
from backend.app.services.data_service import DataService

router = APIRouter(prefix="/api/data", tags=["Dataset"])

@router.get("/preview")
def get_data_preview(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """Retrieve paginated preview of the dataset and summary schema information."""
    df = DataService.get_instance().df.copy()

    if search:
        df = df[df["student_id"].str.contains(search.strip(), case=False, na=False)]

    total_records = len(df)
    total_pages = max(1, (total_records + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    rows = df.iloc[start_idx:end_idx].to_dict(orient="records")
    for r in rows:
        if hasattr(r.get("prediction_date"), "strftime"):
            r["prediction_date"] = r["prediction_date"].strftime("%Y-%m-%d")

    # Column metadata
    columns = []
    for col in df.columns:
        dtype_str = str(df[col].dtype)
        columns.append({
            "name": col,
            "dtype": dtype_str,
            "non_null_count": int(df[col].notnull().sum()),
            "null_count": int(df[col].isnull().sum())
        })

    return {
        "total_records": total_records,
        "total_columns": len(df.columns),
        "total_students": int(df["student_id"].nunique()),
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "columns": columns,
        "records": rows
    }

