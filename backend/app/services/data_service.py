"""
Data Service Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import pandas as pd
from typing import Dict, Any, List, Optional
from backend.app.config import settings
from src.data_loader import load_data

class DataService:
    _instance = None
    _df: Optional[pd.DataFrame] = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance._load()
        return cls._instance

    def _load(self):
        if not settings.data_path.exists():
            raise FileNotFoundError(f"Dataset not found at {settings.data_path}")
        self._df = load_data(settings.data_path)

        # Precompute advisory bands for historical records based on previous score & attendance
        # for quick filtering in student list
        risk_condition_high = (self._df["at_risk"] == 1) | (self._df["latest_score"] < 40.0)
        risk_condition_med = (self._df["attendance_rate"] < 70.0) | (self._df["score_trend"] == "Declining")

        self._df["advisory_risk_band"] = "Low Advisory Risk"
        self._df.loc[risk_condition_med, "advisory_risk_band"] = "Medium Advisory Risk"
        self._df.loc[risk_condition_high, "advisory_risk_band"] = "High Advisory Risk"

    @property
    def df(self) -> pd.DataFrame:
        if self._df is None:
            self._load()
        return self._df

    def get_student_records(
        self,
        search: Optional[str] = None,
        risk_band: Optional[str] = None,
        period: Optional[int] = None,
        sort_by: str = "student_id",
        ascending: bool = True,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Filter, sort, and paginate student records."""
        sub_df = self.df.copy()

        # By default in student list, show the latest available period for each student
        if period is not None:
            sub_df = sub_df[sub_df["assessment_period"] == period]
        else:
            # Latest period per student
            idx = sub_df.groupby("student_id")["assessment_period"].idxmax()
            sub_df = sub_df.loc[idx]

        if search:
            sub_df = sub_df[sub_df["student_id"].str.contains(search.strip(), case=False, na=False)]

        if risk_band and risk_band.upper() != "ALL":
            sub_df = sub_df[sub_df["advisory_risk_band"].str.contains(risk_band, case=False, na=False)]

        if sort_by in sub_df.columns:
            sub_df = sub_df.sort_values(by=sort_by, ascending=ascending)

        total_count = len(sub_df)
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = sub_df.iloc[start_idx:end_idx].to_dict(orient="records")

        # Convert date to string
        for r in page_records:
            if isinstance(r.get("prediction_date"), pd.Timestamp):
                r["prediction_date"] = r["prediction_date"].strftime("%Y-%m-%d")

        return {
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "students": page_records
        }

    def get_student_detail(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full history and latest risk profile for a single student."""
        sub = self.df[self.df["student_id"] == student_id].sort_values("assessment_period")
        if sub.empty:
            return None

        history = sub.to_dict(orient="records")
        for r in history:
            if isinstance(r.get("prediction_date"), pd.Timestamp):
                r["prediction_date"] = r["prediction_date"].strftime("%Y-%m-%d")

        latest = history[-1]

        # Calculate student trajectory summary
        scores = [h["latest_score"] for h in history]
        attendances = [h["attendance_rate"] for h in history]

        summary = {
            "total_periods_tracked": len(history),
            "historical_mean_score": round(float(pd.Series(scores).mean()), 1),
            "historical_mean_attendance": round(float(pd.Series(attendances).mean()), 1),
            "score_volatility": round(float(pd.Series(scores).std() if len(scores) > 1 else 0.0), 2),
            "min_recorded_score": min(scores),
            "max_recorded_score": max(scores)
        }

        # Recommendation based on latest profile
        is_high = latest.get("advisory_risk_band") == "High Advisory Risk"
        recommendation = {
            "suggested_action": "Schedule 1-on-1 Academic Consultation" if is_high else "Routine Progress Monitoring",
            "priority": "HIGH" if is_high else "NORMAL",
            "focus_areas": [
                "Attendance reinforcement" if latest["attendance_rate"] < 75 else "Maintain engagement",
                "Assignment completion support" if latest["assignment_completion_rate"] < 70 else "Formative practice on track",
                "Conceptual tutoring on recent topics" if latest["latest_score"] < 50 else "Reinforce current study strategies"
            ]
        }

        return {
            "student_id": student_id,
            "latest_record": latest,
            "history": history,
            "summary": summary,
            "advisory_recommendation": recommendation,
            "human_review_disclaimer": "This advisory evaluation requires human educator review before taking any pedagogical action."
        }

