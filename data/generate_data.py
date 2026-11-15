"""
Student Data Generator for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment

Generates a realistic, reproducible synthetic dataset of student assessment records
with multiple assessment periods, historical trends, realistic educational personas,
and strict prevention of future-data leakage.
"""

import os
import argparse
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_student_dataset(
    num_students: int = 1600,
    num_periods: int = 5,
    random_seed: int = 42,
    at_risk_threshold: float = 40.0
) -> pd.DataFrame:
    """
    Generate synthetic longitudinal student records across multiple assessment periods.

    Parameters:
    -----------
    num_students : int
        Number of unique synthetic students to generate.
    num_periods : int
        Number of assessment periods (1 to num_periods).
    random_seed : int
        Random seed for full reproducibility.
    at_risk_threshold : float
        Threshold below which next_assessment_score is labeled at_risk=1.

    Returns:
    --------
    pd.DataFrame
        Longitudinal student prediction records.
    """
    np.random.seed(random_seed)

    # Base dates for cutoff periods (e.g. Fall to Spring academic year)
    base_dates = [
        datetime(2025, 9, 20),
        datetime(2025, 11, 10),
        datetime(2026, 1, 15),
        datetime(2026, 3, 20),
        datetime(2026, 5, 15),
    ]

    records = []

    # Assign student latent archetypes
    # Archetype proportions:
    # 0: High Achiever (25%)
    # 1: Steady Average (35%)
    # 2: At-Risk / Disengaged (20%)
    # 3: Struggling but Diligent (10%)
    # 4: Capable but Low Attendance (6%)
    # 5: Volatile / Life Disruption (4%)
    archetype_probs = [0.25, 0.35, 0.20, 0.10, 0.06, 0.04]
    archetypes = np.random.choice(6, size=num_students, p=archetype_probs)

    for i in range(num_students):
        student_id = f"STU_{i+1:04d}"
        archetype = archetypes[i]

        # Latent baseline parameters based on archetype
        if archetype == 0:  # High Achiever
            base_ability = np.random.normal(82, 6)
            base_attendance = np.random.normal(93, 4)
            base_completion = np.random.normal(95, 3)
            trend_drift = np.random.normal(0.5, 0.8)
        elif archetype == 1:  # Steady Average
            base_ability = np.random.normal(62, 7)
            base_attendance = np.random.normal(82, 6)
            base_completion = np.random.normal(84, 6)
            trend_drift = np.random.normal(0.1, 1.0)
        elif archetype == 2:  # At-Risk / Disengaged
            base_ability = np.random.normal(38, 8)
            base_attendance = np.random.normal(58, 10)
            base_completion = np.random.normal(52, 12)
            trend_drift = np.random.normal(-1.2, 1.2)
        elif archetype == 3:  # Struggling but Diligent
            base_ability = np.random.normal(44, 5)
            base_attendance = np.random.normal(88, 5)
            base_completion = np.random.normal(90, 5)
            trend_drift = np.random.normal(0.4, 0.9)
        elif archetype == 4:  # Capable but Low Attendance
            base_ability = np.random.normal(72, 7)
            base_attendance = np.random.normal(54, 8)
            base_completion = np.random.normal(60, 10)
            trend_drift = np.random.normal(-0.5, 1.5)
        else:  # Volatile / Shock
            base_ability = np.random.normal(55, 12)
            base_attendance = np.random.normal(70, 15)
            base_completion = np.random.normal(70, 15)
            trend_drift = np.random.normal(0.0, 3.5)

        # Ensure parameters are within valid logical bounds
        base_ability = np.clip(base_ability, 15.0, 98.0)
        base_attendance = np.clip(base_attendance, 30.0, 100.0)
        base_completion = np.clip(base_completion, 20.0, 100.0)

        # Track history for student across consecutive periods
        historical_scores = []

        # Generate an initial baseline diagnostic score (period 0)
        init_noise = np.random.normal(0, 5)
        init_score = np.clip(base_ability + 0.15 * (base_attendance - 75) + init_noise, 10.0, 100.0)
        historical_scores.append(round(float(init_score), 1))

        for period in range(1, num_periods + 1):
            date_idx = min(period - 1, len(base_dates) - 1)
            pred_date = base_dates[date_idx].strftime("%Y-%m-%d")

            # Dynamic period factors with drift and shocks
            period_drift = trend_drift * period
            shock = np.random.normal(0, 4.5)
            if archetype == 5 and period == 3:
                # Acute disruption at period 3
                shock -= 22.0

            # Current state up to prediction cutoff
            att_noise = np.random.normal(0, 3.5)
            attendance_rate = float(np.clip(base_attendance + period_drift * 0.5 + att_noise, 25.0, 100.0))
            attendance_rate = round(attendance_rate, 1)

            total_assignments = int(np.random.randint(6, 12) + period * 2)
            comp_rate = float(np.clip(base_completion + period_drift * 0.4 + np.random.normal(0, 4), 15.0, 100.0))
            assignments_completed = int(np.clip(np.round((comp_rate / 100.0) * total_assignments), 0, total_assignments))
            assignment_completion_rate = round((assignments_completed / total_assignments) * 100.0, 1)

            # Extract available historical scores at this cutoff
            # previous_score_1 is most recent
            previous_score_1 = historical_scores[-1]
            previous_score_2 = historical_scores[-2] if len(historical_scores) >= 2 else previous_score_1
            previous_score_3 = historical_scores[-3] if len(historical_scores) >= 3 else previous_score_2

            avg_score = float(np.mean(historical_scores))
            score_std = float(np.std(historical_scores)) if len(historical_scores) > 1 else 0.0

            # Trend calculation
            if len(historical_scores) >= 2:
                recent_delta = previous_score_1 - previous_score_2
                if recent_delta > 3.0:
                    score_trend = "Improving"
                elif recent_delta < -3.0:
                    score_trend = "Declining"
                else:
                    score_trend = "Stable"
            else:
                score_trend = "Stable"

            # Latent generation of the upcoming assessment score (Ground Truth)
            # Incorporates previous score momentum, attendance influence, assignment engagement, and noise
            exam_noise = np.random.normal(0, 6.0)
            engagement_factor = (attendance_rate * 0.5 + assignment_completion_rate * 0.5)

            # Combined next score model:
            # 50% persistence from latest and average score
            # 30% from engagement / attendance & assignments
            # 10% from trend momentum
            # 10% stochastic shock / unmeasured variance
            predicted_baseline = (
                0.35 * previous_score_1 +
                0.20 * avg_score +
                0.20 * (engagement_factor * 0.8) +
                0.15 * base_ability +
                0.10 * (1.5 if score_trend == "Improving" else (-2.5 if score_trend == "Declining" else 0.0)) +
                shock + exam_noise
            )
            next_score = float(np.clip(predicted_baseline, 5.0, 99.5))
            next_score = round(next_score, 1)

            # Binary target
            at_risk = 1 if next_score < at_risk_threshold else 0

            records.append({
                "student_id": student_id,
                "assessment_period": period,
                "prediction_date": pred_date,
                "attendance_rate": attendance_rate,
                "assignments_completed": assignments_completed,
                "total_assignments": total_assignments,
                "assignment_completion_rate": assignment_completion_rate,
                "previous_score_1": round(float(previous_score_1), 1),
                "previous_score_2": round(float(previous_score_2), 1),
                "previous_score_3": round(float(previous_score_3), 1),
                "average_previous_score": round(avg_score, 1),
                "latest_score": round(float(previous_score_1), 1),
                "score_trend": score_trend,
                "score_std": round(score_std, 2),
                "assessments_completed": len(historical_scores),
                "next_assessment_score": next_score,
                "at_risk": at_risk
            })

            # Update historical scores for next period
            historical_scores.append(next_score)

    df = pd.DataFrame(records)
    return df

def validate_and_save_dataset(df: pd.DataFrame, output_path: str):
    """Save dataset and log validation summary."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully generated and saved to: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Total unique students: {df['student_id'].nunique()}")
    print(f"Assessment periods: {df['assessment_period'].unique()}")
    print(f"Class distribution:\n{df['at_risk'].value_counts(normalize=True).round(4) * 100}%")
    print(f"At-risk count: {df['at_risk'].sum()} / {len(df)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic student risk prediction dataset.")
    parser.add_argument("--students", type=int, default=1600, help="Number of unique students")
    parser.add_argument("--periods", type=int, default=5, help="Number of assessment periods")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--threshold", type=float, default=40.0, help="At-risk score threshold")
    parser.add_argument("--output", type=str, default="data/processed/student_prediction_data.csv", help="Output CSV path")
    args = parser.parse_args()

    df = generate_student_dataset(
        num_students=args.students,
        num_periods=args.periods,
        random_seed=args.seed,
        at_risk_threshold=args.threshold
    )
    validate_and_save_dataset(df, args.output)

