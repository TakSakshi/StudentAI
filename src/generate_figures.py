"""
Generate EDA and Model Evaluation figures for reports and notebooks
StudentInsight AI - Algions AI Labs Private Limited
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from src.config import FIGURES_DIR, PROCESSED_DATA_PATH, EVALUATION_METRICS_PATH, MODEL_METADATA_PATH
from src.data_loader import load_data

# Set styling
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["figure.dpi"] = 150
plt.rcParams["axes.titlesize"] = 12
plt.rcParams["axes.labelsize"] = 10

FIGURES_DIR.mkdir(parents=True, exist_ok=True)
df = load_data(PROCESSED_DATA_PATH)

# 1. Target Class Distribution
fig, ax = plt.subplots(figsize=(6, 4))
counts = df["at_risk"].value_counts()
colors = ["#2563EB", "#DC2626"]
bars = ax.bar(["Not At Risk (0)", "At Risk (1)"], counts.values, color=colors, width=0.5, edgecolor="#E5EAF1")
for bar in bars:
    height = bar.get_height()
    pct = (height / len(df)) * 100
    ax.annotate(f"{height:,} ({pct:.1f}%)",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 3), textcoords="offset points",
                ha="center", va="bottom", fontsize=10, fontweight="bold")
ax.set_title("Target Class Distribution (Next Assessment Score < 40%)", fontweight="bold", pad=12)
ax.set_ylabel("Student-Period Records")
ax.set_ylim(0, len(df) * 0.9)
plt.tight_layout()
plt.savefig(FIGURES_DIR / "target_distribution.png")
plt.close()

# 2. Attendance vs Academic Risk
fig, ax = plt.subplots(figsize=(7, 4.5))
sns.boxplot(x="at_risk", y="attendance_rate", data=df, palette=["#2563EB", "#DC2626"], ax=ax, width=0.4)
ax.set_xticklabels(["Not At Risk (0)", "At Risk (1)"])
ax.set_title("Attendance Rate Distribution by Target Academic Risk", fontweight="bold", pad=12)
ax.set_xlabel("Advisory Risk Status")
ax.set_ylabel("Class Attendance (%)")
plt.tight_layout()
plt.savefig(FIGURES_DIR / "attendance_vs_risk.png")
plt.close()

# 3. Assignment Completion vs Academic Risk
fig, ax = plt.subplots(figsize=(7, 4.5))
sns.boxplot(x="at_risk", y="assignment_completion_rate", data=df, palette=["#2563EB", "#DC2626"], ax=ax, width=0.4)
ax.set_xticklabels(["Not At Risk (0)", "At Risk (1)"])
ax.set_title("Assignment Completion Rate by Target Academic Risk", fontweight="bold", pad=12)
ax.set_xlabel("Advisory Risk Status")
ax.set_ylabel("Assignment Completion (%)")
plt.tight_layout()
plt.savefig(FIGURES_DIR / "assignment_completion_vs_risk.png")
plt.close()

# 4. Correlation Heatmap
fig, ax = plt.subplots(figsize=(10, 8))
numeric_cols = [
    "attendance_rate", "assignment_completion_rate", "previous_score_1",
    "previous_score_2", "average_previous_score", "score_std",
    "next_assessment_score", "at_risk"
]
corr = df[numeric_cols].corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, cmap="Blues", annot=True, fmt=".2f",
            linewidths=0.5, cbar_kws={"shrink": 0.8}, ax=ax)
ax.set_title("Academic Indicator Correlation Matrix", fontweight="bold", pad=14)
plt.tight_layout()
plt.savefig(FIGURES_DIR / "correlation_heatmap.png")
plt.close()

# 5. Score Trends Across Periods
fig, ax = plt.subplots(figsize=(8, 4.5))
period_stats = df.groupby(["assessment_period", "at_risk"])["latest_score"].mean().unstack()
period_stats.columns = ["Not At Risk", "At Risk"]
period_stats.plot(kind="bar", color=["#2563EB", "#DC2626"], width=0.6, ax=ax, edgecolor="#E5EAF1")
ax.set_title("Mean Historical Assessment Score Across Academic Periods", fontweight="bold", pad=12)
ax.set_xlabel("Assessment Period (Cutoff)")
ax.set_ylabel("Mean Latest Score (%)")
ax.set_xticklabels([f"Period {p}" for p in period_stats.index], rotation=0)
ax.legend(title="Risk Label")
plt.tight_layout()
plt.savefig(FIGURES_DIR / "score_trends.png")
plt.close()

# 6. Confusion Matrix for Test Set
if EVALUATION_METRICS_PATH.exists():
    with open(EVALUATION_METRICS_PATH, "r") as f:
        metrics_data = json.load(f)
    cm = metrics_data["test_metrics"]["confusion_matrix"]["raw"]
    cm_array = np.array(cm)

    fig, ax = plt.subplots(figsize=(5, 4.5))
    sns.heatmap(cm_array, annot=True, fmt="d", cmap="Blues", cbar=False,
                xticklabels=["Pred: Not At-Risk", "Pred: At-Risk"],
                yticklabels=["Actual: Not At-Risk", "Actual: At-Risk"], ax=ax)
    ax.set_title(f"Test Set Confusion Matrix ({metrics_data['model_name']})", fontweight="bold", pad=12)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "confusion_matrix.png")
    plt.close()

# 7. Global Feature Importance
if MODEL_METADATA_PATH.exists():
    with open(MODEL_METADATA_PATH, "r") as f:
        meta = json.load(f)
    fi = meta.get("global_feature_importance", [])[:10]
    if fi:
        fig, ax = plt.subplots(figsize=(8, 5))
        features = [item["feature"] for item in reversed(fi)]
        vals = [item["importance"] for item in reversed(fi)]
        ax.barh(features, vals, color="#2563EB", edgecolor="#E5EAF1", height=0.6)
        ax.set_title("Top 10 Global Feature Importances (Random Forest)", fontweight="bold", pad=12)
        ax.set_xlabel("Relative Gini Importance")
        plt.tight_layout()
        plt.savefig(FIGURES_DIR / "feature_importance.png")
        plt.close()

print(f"All figures generated successfully in: {FIGURES_DIR}")

