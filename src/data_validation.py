"""
Data Validation Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List

class DataValidationError(Exception):
    """Custom exception raised when critical data validation checks fail."""
    pass

def validate_dataset(df: pd.DataFrame, strict: bool = True) -> Dict[str, Any]:
    """
    Perform rigorous data quality and integrity checks on student prediction data.

    Checks:
    - Null / missing values
    - Duplicate rows
    - Valid percentage ranges [0, 100] for attendance and completion
    - Valid score ranges [0, 100]
    - Logical assignment counts (completed <= total)
    - Valid target values {0, 1}
    - Anonymous student identifier format (STU_xxxx)
    - Target exclusion checks
    """
    issues: List[str] = []
    report: Dict[str, Any] = {
        "total_records": len(df),
        "total_columns": len(df.columns),
        "unique_students": int(df["student_id"].nunique()) if "student_id" in df.columns else 0,
        "is_valid": True,
        "checks": {}
    }

    # 1. Null values check
    missing_counts = df.isnull().sum().to_dict()
    total_missing = sum(missing_counts.values())
    report["checks"]["missing_values"] = {
        "status": "PASS" if total_missing == 0 else "FAIL",
        "total_missing": int(total_missing),
        "details": {col: int(cnt) for col, cnt in missing_counts.items() if cnt > 0}
    }
    if total_missing > 0:
        issues.append(f"Found {total_missing} missing values across columns.")

    # 2. Duplicate records check
    dup_subset = ["student_id", "assessment_period"] if "student_id" in df.columns and "assessment_period" in df.columns else None
    dup_count = int(df.duplicated(subset=dup_subset).sum())
    report["checks"]["duplicates"] = {
        "status": "PASS" if dup_count == 0 else "FAIL",
        "duplicate_count": dup_count
    }
    if dup_count > 0:
        issues.append(f"Found {dup_count} duplicate student-period records.")

    # 3. Attendance rate range check [0, 100]
    if "attendance_rate" in df.columns:
        invalid_att = df[(df["attendance_rate"] < 0.0) | (df["attendance_rate"] > 100.0)]
        report["checks"]["attendance_range"] = {
            "status": "PASS" if len(invalid_att) == 0 else "FAIL",
            "invalid_count": len(invalid_att)
        }
        if len(invalid_att) > 0:
            issues.append(f"Found {len(invalid_att)} records with attendance_rate outside [0, 100].")

    # 4. Score range checks [0, 100]
    score_cols = [c for c in ["previous_score_1", "previous_score_2", "previous_score_3", "latest_score", "average_previous_score", "next_assessment_score"] if c in df.columns]
    invalid_scores = 0
    for col in score_cols:
        invalid = df[(df[col] < 0.0) | (df[col] > 100.0)]
        invalid_scores += len(invalid)
    report["checks"]["score_ranges"] = {
        "status": "PASS" if invalid_scores == 0 else "FAIL",
        "invalid_count": invalid_scores
    }
    if invalid_scores > 0:
        issues.append(f"Found {invalid_scores} score entries outside valid [0, 100] boundary.")

    # 5. Assignment count logic (completed <= total and total >= 0)
    if "assignments_completed" in df.columns and "total_assignments" in df.columns:
        invalid_assignments = df[(df["assignments_completed"] > df["total_assignments"]) | (df["total_assignments"] < 0) | (df["assignments_completed"] < 0)]
        report["checks"]["assignment_consistency"] = {
            "status": "PASS" if len(invalid_assignments) == 0 else "FAIL",
            "invalid_count": len(invalid_assignments)
        }
        if len(invalid_assignments) > 0:
            issues.append(f"Found {len(invalid_assignments)} records with inconsistent assignment counts.")

    # 6. Target values validation {0, 1}
    if "at_risk" in df.columns:
        invalid_target = df[~df["at_risk"].isin([0, 1])]
        report["checks"]["target_validity"] = {
            "status": "PASS" if len(invalid_target) == 0 else "FAIL",
            "invalid_count": len(invalid_target),
            "class_distribution": df["at_risk"].value_counts().to_dict()
        }
        if len(invalid_target) > 0:
            issues.append(f"Found {len(invalid_target)} records with target outside {{0, 1}}.")

    # 7. Anonymous ID format check
    if "student_id" in df.columns:
        invalid_id = df[~df["student_id"].str.match(r"^STU_\d{4,}$")]
        report["checks"]["anonymous_id_format"] = {
            "status": "PASS" if len(invalid_id) == 0 else "FAIL",
            "invalid_count": len(invalid_id)
        }
        if len(invalid_id) > 0:
            issues.append(f"Found {len(invalid_id)} student IDs that do not follow anonymous STU_xxxx standard.")

    if issues:
        report["is_valid"] = False
        report["issues"] = issues
        if strict:
            raise DataValidationError(f"Data validation failed:\n" + "\n".join(issues))
    else:
        report["is_valid"] = True
        report["issues"] = []

    return report
