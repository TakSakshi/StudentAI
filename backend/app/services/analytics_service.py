"""
Analytics Service Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from backend.app.services.data_service import DataService
from backend.app.services.model_service import ModelService
from src.config import HUMAN_REVIEW_DISCLAIMER

class AnalyticsService:

    @staticmethod
    def get_dashboard_summary() -> Dict[str, Any]:
        data_svc = DataService.get_instance()
        model_svc = ModelService.get_instance()
        df = data_svc.df

        # Unique student counts and predictions
        total_unique_students = int(df["student_id"].nunique())
        total_records = len(df)
        at_risk_count = int(df["at_risk"].sum())
        not_at_risk_count = total_records - at_risk_count
        at_risk_pct = round((at_risk_count / total_records) * 100.0, 1)

        # Risk band counts
        band_counts = df["advisory_risk_band"].value_counts().to_dict()
        high_risk = int(band_counts.get("High Advisory Risk", 0))
        med_risk = int(band_counts.get("Medium Advisory Risk", 0))
        low_risk = int(band_counts.get("Low Advisory Risk", 0))

        # Averages across all records
        avg_att = round(float(df["attendance_rate"].mean()), 1)
        avg_comp = round(float(df["assignment_completion_rate"].mean()), 1)
        avg_score = round(float(df["average_previous_score"].mean()), 1)

        return {
            "total_unique_students": total_unique_students,
            "total_prediction_records": total_records,
            "at_risk_count": at_risk_count,
            "not_at_risk_count": not_at_risk_count,
            "at_risk_percentage": at_risk_pct,
            "high_risk_count": high_risk,
            "medium_risk_count": med_risk,
            "low_risk_count": low_risk,
            "average_attendance": avg_att,
            "average_assignment_completion": avg_comp,
            "average_previous_score": avg_score,
            "model_name": model_svc.model_name,
            "model_version": model_svc.version,
            "decision_threshold": model_svc.threshold,
            "human_review_disclaimer": HUMAN_REVIEW_DISCLAIMER
        }

    @staticmethod
    def get_performance_trends() -> List[Dict[str, Any]]:
        df = DataService.get_instance().df
        trends = []

        for period, group in df.groupby("assessment_period"):
            trends.append({
                "period": int(period),
                "mean_latest_score": round(float(group["latest_score"].mean()), 1),
                "mean_attendance": round(float(group["attendance_rate"].mean()), 1),
                "mean_completion": round(float(group["assignment_completion_rate"].mean()), 1),
                "at_risk_rate": round(float(group["at_risk"].mean() * 100.0), 1),
                "total_records": len(group)
            })

        return sorted(trends, key=lambda x: x["period"])

    @staticmethod
    def get_attendance_analytics() -> Dict[str, Any]:
        df = DataService.get_instance().df
        bins = [
            ("< 60%", 0.0, 60.0),
            ("60 - 74%", 60.0, 75.0),
            ("75 - 84%", 75.0, 85.0),
            ("85 - 94%", 85.0, 95.0),
            ("95 - 100%", 95.0, 100.1)
        ]

        dist = []
        for label, low, high in bins:
            sub = df[(df["attendance_rate"] >= low) & (df["attendance_rate"] < high)]
            tot = len(sub)
            risk = int(sub["at_risk"].sum())
            rate = round((risk / tot * 100.0), 1) if tot > 0 else 0.0
            dist.append({
                "range_label": label,
                "min_val": low,
                "max_val": high,
                "total_count": tot,
                "at_risk_count": risk,
                "at_risk_rate": rate
            })

        return {
            "average_attendance": round(float(df["attendance_rate"].mean()), 1),
            "distribution": dist
        }

    @staticmethod
    def get_assignment_analytics() -> Dict[str, Any]:
        df = DataService.get_instance().df
        bins = [
            ("< 50%", 0.0, 50.0),
            ("50 - 69%", 50.0, 70.0),
            ("70 - 84%", 70.0, 85.0),
            ("85 - 100%", 85.0, 100.1)
        ]

        dist = []
        for label, low, high in bins:
            sub = df[(df["assignment_completion_rate"] >= low) & (df["assignment_completion_rate"] < high)]
            tot = len(sub)
            risk = int(sub["at_risk"].sum())
            rate = round((risk / tot * 100.0), 1) if tot > 0 else 0.0
            dist.append({
                "range_label": label,
                "min_val": low,
                "max_val": high,
                "total_count": tot,
                "at_risk_count": risk,
                "at_risk_rate": rate
            })

        return {
            "average_completion_rate": round(float(df["assignment_completion_rate"].mean()), 1),
            "distribution": dist
        }

    @staticmethod
    def get_risk_distribution() -> Dict[str, Any]:
        df = DataService.get_instance().df
        total = len(df)
        counts = df["advisory_risk_band"].value_counts().to_dict()

        bands = [
            {
                "band": "LOW",
                "label": "Low Advisory Risk",
                "count": int(counts.get("Low Advisory Risk", 0)),
                "percentage": round(counts.get("Low Advisory Risk", 0) / total * 100.0, 1),
                "color": "#16A34A"
            },
            {
                "band": "MEDIUM",
                "label": "Medium Advisory Risk",
                "count": int(counts.get("Medium Advisory Risk", 0)),
                "percentage": round(counts.get("Medium Advisory Risk", 0) / total * 100.0, 1),
                "color": "#D97706"
            },
            {
                "band": "HIGH",
                "label": "High Advisory Risk",
                "count": int(counts.get("High Advisory Risk", 0)),
                "percentage": round(counts.get("High Advisory Risk", 0) / total * 100.0, 1),
                "color": "#DC2626"
            }
        ]

        return {
            "total_students": total,
            "bands": bands
        }

