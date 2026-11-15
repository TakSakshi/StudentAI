"""
Data Loader Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import pandas as pd
from pathlib import Path
from typing import Union
from src.config import PROCESSED_DATA_PATH

def load_data(file_path: Union[str, Path] = PROCESSED_DATA_PATH) -> pd.DataFrame:
    """
    Load student assessment dataset from disk.

    Parameters:
    -----------
    file_path : Union[str, Path]
        Path to the CSV data file.

    Returns:
    --------
    pd.DataFrame
        Loaded and formatted student dataset.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {path}")

    df = pd.read_csv(path)

    # Ensure correct data types
    df["student_id"] = df["student_id"].astype(str)
    df["assessment_period"] = df["assessment_period"].astype(int)
    df["prediction_date"] = pd.to_datetime(df["prediction_date"])
    df["attendance_rate"] = df["attendance_rate"].astype(float)
    df["assignments_completed"] = df["assignments_completed"].astype(int)
    df["total_assignments"] = df["total_assignments"].astype(int)
    df["assignment_completion_rate"] = df["assignment_completion_rate"].astype(float)
    df["previous_score_1"] = df["previous_score_1"].astype(float)
    df["previous_score_2"] = df["previous_score_2"].astype(float)
    df["previous_score_3"] = df["previous_score_3"].astype(float)
    df["average_previous_score"] = df["average_previous_score"].astype(float)
    df["latest_score"] = df["latest_score"].astype(float)
    df["score_trend"] = df["score_trend"].astype(str)
    df["score_std"] = df["score_std"].astype(float)
    df["assessments_completed"] = df["assessments_completed"].astype(int)

    if "next_assessment_score" in df.columns:
        df["next_assessment_score"] = df["next_assessment_score"].astype(float)
    if "at_risk" in df.columns:
        df["at_risk"] = df["at_risk"].astype(int)

    return df
