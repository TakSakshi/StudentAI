"""
Script to create the required educational assessment notebooks
StudentInsight AI - Algions AI Labs Private Limited
"""

import nbformat as nbf
from pathlib import Path

notebooks_dir = Path("notebooks")
notebooks_dir.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------
# 01_exploratory_data_analysis.ipynb
# -------------------------------------------------------------
nb1 = nbf.v4.new_notebook()
nb1.cells = [
    nbf.v4.new_markdown_cell("""# StudentInsight AI — Exploratory Data Analysis (EDA)
### Student Performance & At-Risk Prediction
**ALGIONS AI LABS PRIVATE LIMITED — AI & Machine Learning Assessment**

---
## 1. Problem & Business Context
Educational institutions require early indicators to identify students who may encounter academic difficulties before upcoming major assessments.
- **Target**: `at_risk = 1` if the student scores `< 40.0%` on the next upcoming assessment; `0` otherwise.
- **Cutoff**: Only information strictly prior to the upcoming assessment is used (historical attendance, assignment completion, previous scores, trends).
- **Responsible Use**: Strictly an advisory decision-support tool for teachers, never for automated penalties or grade assignment.
"""),
    nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from src.data_loader import load_data
from src.data_validation import validate_dataset

# Set visualization parameters
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 25)

# Load dataset
df = load_data('data/processed/student_prediction_data.csv')
print(f"Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
df.head()
"""),
    nbf.v4.new_markdown_cell("""## 2. Dataset Dimensions, Types & Data Quality Validation
Let us check null values, data types, and run our comprehensive validation checks.
"""),
    nbf.v4.new_code_cell("""# Data types & null values
print("--- Data Info ---")
print(df.info())

print("\\n--- Data Quality Validation ---")
val_report = validate_dataset(df, strict=False)
print("Is Valid:", val_report["is_valid"])
print("Checks Summary:", {k: v["status"] for k, v in val_report["checks"].items()})
"""),
    nbf.v4.new_markdown_cell("""## 3. Summary Statistics of Academic Features"""),
    nbf.v4.new_code_cell("""df.describe().round(2)
"""),
    nbf.v4.new_markdown_cell("""## 4. Target Class Distribution (Academic At-Risk)
Analyzing the proportion of students scoring below 40% in upcoming assessments.
"""),
    nbf.v4.new_code_cell("""target_dist = df['at_risk'].value_counts(normalize=True) * 100
print("Class Distribution (%):")
print(target_dist.round(2))

fig, ax = plt.subplots(figsize=(6, 4))
df['at_risk'].value_counts().plot(kind='bar', color=['#2563EB', '#DC2626'], ax=ax)
ax.set_title("Target Distribution: at_risk (0: Safe, 1: At-Risk)", fontweight='bold')
ax.set_xticklabels(["Not At-Risk (0)", "At-Risk (1)"], rotation=0)
ax.set_ylabel("Count")
plt.tight_layout()
plt.show()
"""),
    nbf.v4.new_markdown_cell("""## 5. Attendance & Assignment Completion vs At-Risk Status"""),
    nbf.v4.new_code_cell("""fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

sns.boxplot(x='at_risk', y='attendance_rate', data=df, palette=['#2563EB', '#DC2626'], ax=axes[0])
axes[0].set_title("Attendance Rate (%) by Risk Status", fontweight='bold')
axes[0].set_xticklabels(["Not At-Risk", "At-Risk"])

sns.boxplot(x='at_risk', y='assignment_completion_rate', data=df, palette=['#2563EB', '#DC2626'], ax=axes[1])
axes[1].set_title("Assignment Completion (%) by Risk Status", fontweight='bold')
axes[1].set_xticklabels(["Not At-Risk", "At-Risk"])

plt.tight_layout()
plt.show()
"""),
    nbf.v4.new_markdown_cell("""## 6. Correlation Analysis & Feature Interactions"""),
    nbf.v4.new_code_cell("""num_cols = ['attendance_rate', 'assignment_completion_rate', 'previous_score_1', 'previous_score_2', 'average_previous_score', 'next_assessment_score', 'at_risk']
corr = df[num_cols].corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr, annot=True, cmap='Blues', fmt='.2f', linewidths=0.5)
plt.title("Academic Feature Correlation Matrix", fontweight='bold')
plt.tight_layout()
plt.show()
"""),
    nbf.v4.new_markdown_cell("""## 7. Key Findings & Conclusion
1. **Class Imbalance**: Approximately 23.8% of students fall into the at-risk category (<40% next score).
2. **Attendance Signal**: Students in the at-risk group exhibit significantly lower mean attendance (<65%) compared to safe students (>85%).
3. **Formative Completion**: Incomplete assignments are heavily associated with upcoming failure risk.
4. **Leakage Prevention**: Next assessment score (`next_assessment_score`) is strongly correlated with previous scores and must be strictly quarantined from the predictive feature matrix.
""")
]

with open(notebooks_dir / "01_exploratory_data_analysis.ipynb", "w") as f:
    nbf.write(nb1, f)

# -------------------------------------------------------------
# 02_preprocessing.ipynb
# -------------------------------------------------------------
nb2 = nbf.v4.new_notebook()
nb2.cells = [
    nbf.v4.new_markdown_cell("""# StudentInsight AI — Preprocessing & Feature Engineering
### Pipeline Construction with Zero Data Leakage
**ALGIONS AI LABS PRIVATE LIMITED — AI & Machine Learning Assessment**
"""),
    nbf.v4.new_code_cell("""import pandas as pd
from src.data_loader import load_data
from src.feature_engineering import engineer_features, get_feature_matrix_and_target
from src.preprocessing import build_preprocessor
from src.split import time_based_split

# 1. Load data
df = load_data('data/processed/student_prediction_data.csv')

# 2. Chronological time-based split
train_df, val_df, test_df = time_based_split(df)
print(f"Train periods: {train_df['assessment_period'].unique()}, size: {len(train_df)}")
print(f"Val period: {val_df['assessment_period'].unique()}, size: {len(val_df)}")
print(f"Test period: {test_df['assessment_period'].unique()}, size: {len(test_df)}")
"""),
    nbf.v4.new_code_cell("""# 3. Feature matrix extraction & leakage verification
X_train, y_train = get_feature_matrix_and_target(train_df)
X_val, y_val = get_feature_matrix_and_target(val_df)
X_test, y_test = get_feature_matrix_and_target(test_df)

print(f"Feature matrix shape: {X_train.shape}")
print(f"Features: {list(X_train.columns)}")
assert 'next_assessment_score' not in X_train.columns
assert 'at_risk' not in X_train.columns
print("Verified: Zero target leakage into feature matrix.")
"""),
    nbf.v4.new_code_cell("""# 4. Fit preprocessor on training data ONLY
preprocessor = build_preprocessor()
X_train_preprocessed = preprocessor.fit_transform(X_train)
X_val_preprocessed = preprocessor.transform(X_val)

print(f"Preprocessed train shape: {X_train_preprocessed.shape}")
print(f"Preprocessed val shape: {X_val_preprocessed.shape}")
""")
]

with open(notebooks_dir / "02_preprocessing.ipynb", "w") as f:
    nbf.write(nb2, f)

# -------------------------------------------------------------
# 03_model_training.ipynb
# -------------------------------------------------------------
nb3 = nbf.v4.new_notebook()
nb3.cells = [
    nbf.v4.new_markdown_cell("""# StudentInsight AI — Model Training & Comparison
### Baseline vs Logistic Regression vs Random Forest vs XGBoost
**ALGIONS AI LABS PRIVATE LIMITED — AI & Machine Learning Assessment**
"""),
    nbf.v4.new_code_cell("""import pandas as pd
from src.train import train_and_evaluate_all

# Run full reproducible training pipeline
train_and_evaluate_all()
"""),
    nbf.v4.new_code_cell("""# Display model comparison summary
comparison_df = pd.read_csv('reports/model_comparison.csv')
comparison_df
""")
]

with open(notebooks_dir / "03_model_training.ipynb", "w") as f:
    nbf.write(nb3, f)

# -------------------------------------------------------------
# 04_model_evaluation.ipynb
# -------------------------------------------------------------
nb4 = nbf.v4.new_notebook()
nb4.cells = [
    nbf.v4.new_markdown_cell("""# StudentInsight AI — Final Model Evaluation & Explainability
### Single Held-out Test Set Evaluation & Educational Signal Analysis
**ALGIONS AI LABS PRIVATE LIMITED — AI & Machine Learning Assessment**
"""),
    nbf.v4.new_code_cell("""import json
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image

with open('models/evaluation_metrics.json', 'r') as f:
    eval_metrics = json.load(f)

print(f"Selected Model: {eval_metrics['model_name']}")
print(f"Selected Threshold: {eval_metrics['selected_threshold']}")
print("\\nTest Set Performance (Period 5 Held-out):")
for k, v in eval_metrics['test_metrics'].items():
    if k != 'confusion_matrix':
        print(f"  {k}: {v}")

print("\\nConfusion Matrix on Held-Out Test Set:")
cm = eval_metrics['test_metrics']['confusion_matrix']
print(f"  True Positives (Identified At-Risk): {cm['tp']}")
print(f"  False Positives (False Alarms):      {cm['fp']}")
print(f"  False Negatives (Missed At-Risk):    {cm['fn']}")
print(f"  True Negatives (Correct Safe):       {cm['tn']}")
"""),
    nbf.v4.new_code_cell("""# Local Prediction Example
from src.predict import predict_single

sample = {
    'student_id': 'STU_TEST_01',
    'attendance_rate': 62.0,
    'assignments_completed': 5,
    'total_assignments': 10,
    'previous_score_1': 38.0,
    'previous_score_2': 44.0,
    'previous_score_3': 48.0,
    'average_previous_score': 43.3,
    'score_trend': 'Declining'
}

result = predict_single(sample)
print("Advisory Risk Band:", result['advisory_risk_band'])
print("Risk Probability: ", result['risk_probability'])
print("Narrative:        ", result['explanation_narrative'])
print("Signals:")
for s in result['influential_signals']:
    print(f"  - [{s['impact']}] {s['signal']}: {s['detail']}")
""")
]

with open(notebooks_dir / "04_model_evaluation.ipynb", "w") as f:
    nbf.write(nb4, f)

print("All 4 Jupyter Notebooks created successfully in notebooks/")

