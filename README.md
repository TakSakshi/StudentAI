# StudentInsight AI — Student Performance & At-Risk Prediction
### ALGIONS AI LABS PRIVATE LIMITED — AI & Machine Learning Assessment Project

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end, production-grade Machine Learning decision-support application that analyzes longitudinal academic records (attendance, assignment completion diligence, historical assessment trajectories, and momentum) to identify students who may benefit from timely pedagogical support before upcoming major examinations.

---

## 1. Project Overview
**StudentInsight AI** is an individual AI & Machine Learning internship assessment project built for **ALGIONS AI LABS PRIVATE LIMITED**. The system couples an empirical, leakage-free machine learning inference pipeline (Random Forest classifier with tuned decision thresholds) with a FastAPI backend and a responsive, light-themed React + TypeScript dashboard.

---

## 2. Business Problem
Educational institutions struggle to identify struggling students early enough to intervene effectively. Traditional manual reviews are retrospective—often discovering learning deficits only after term grades are finalized. Student performance depends on complex, interconnected factors including attendance regularity, homework engagement, historical test variability, and recent score momentum.

---

## 3. Project Objectives
1. Accept longitudinal student academic records.
2. Validate and preprocess information without data leakage.
3. Extract meaningful academic features strictly before prediction cutoffs.
4. Train and benchmark candidate machine learning models against a majority baseline.
5. Produce advisory risk classifications and calibrated probabilities.
6. Provide explainable academic signals in plain educational language.
7. Present actionable cohort and student-level insights through an interactive dashboard.
8. Enforce responsible AI guidelines and human-in-the-loop review.

---

## 4. Prediction Unit
**One student at one particular prediction cutoff immediately prior to an upcoming assessment.** While a student has longitudinal historical data across multiple periods, each record evaluates strictly the information accumulated prior to the next scheduled exam.

---

## 5. Target Definition
The primary machine learning task is binary classification:
- **`at_risk = 1`**: The student scores **below 40.0%** in the upcoming assessment.
- **`at_risk = 0`**: The student scores **40.0% or above** in the upcoming assessment.
The 40.0% threshold is a documented, centralized project configuration (`src/config.py`). The target outcome is generated from the future assessment and is strictly quarantined from input features.

---

## 6. Prediction Horizon
The **immediate next scheduled assessment**. For example, using data available up to Period 3 to predict whether the student will achieve $< 40\%$ on Assessment 4.

---

## 7. Prediction Cutoff
Only information available prior to the upcoming assessment is used:
- Historical class attendance up to the cutoff date.
- Assignments submitted and due prior to the cutoff date.
- Scores from previous examinations.
- **Strictly excluded**: Upcoming exam scores, future attendance, future assignment submissions, and any post-cutoff feedback.

---

## 8. Dataset Strategy & Synthetic Generator
Due to student privacy laws (FERPA, GDPR, DPDP) and the absence of appropriately licensed, longitudinal next-assessment public educational datasets, this project implements a **reproducible probabilistic synthetic generator** (`data/generate_data.py`).
- **Records**: 8,000 longitudinal observations.
- **Students**: 1,600 unique anonymous students (`STU_0001` to `STU_1600`).
- **Periods**: 5 sequential academic evaluation periods.
- **Random Seed**: `42` for exact reproducibility.
- **Class Balance**: 76.25% Not At-Risk vs. 23.75% At-Risk.
- **Archetypes**: High Achievers, Steady Average, At-Risk/Disengaged, Diligent but Struggling, Capable Truants, and Volatile/Life Event Disruption.

---

## 9. Dataset Schema

| Field Name | Type | Description |
|---|---|---|
| `student_id` | String | Anonymous identifier (`STU_xxxx`) |
| `assessment_period` | Integer | Sequential evaluation period (1 to 5) |
| `prediction_date` | Date | Cutoff date for historical data collection |
| `attendance_rate` | Float | Percentage of classes attended prior to cutoff |
| `assignments_completed` | Integer | Formative assignments submitted |
| `total_assignments` | Integer | Formative assignments due prior to cutoff |
| `assignment_completion_rate` | Float | `(assignments_completed / total_assignments) * 100` |
| `previous_score_1` | Float | Most recent assessment score (`latest_score`) |
| `previous_score_2` | Float | Second most recent assessment score |
| `previous_score_3` | Float | Third most recent assessment score |
| `average_previous_score` | Float | Historical mean across available previous assessments |
| `latest_score` | Float | Most recent assessment score prior to cutoff |
| `score_trend` | Categorical | `Improving`, `Stable`, or `Declining` |
| `score_std` | Float | Historical score standard deviation |
| `assessments_completed` | Integer | Count of prior examinations completed |
| `next_assessment_score` | Float | Ground truth future exam score (target generation only) |
| `at_risk` | Integer | Binary target (`1` if next score $< 40.0$, else `0`) |

---

## 10. Feature Engineering
Implemented in `src/feature_engineering.py`:
- `assignment_completion_rate`: Formative diligence with safe zero-denominator handling.
- `latest_score`: Most recent test result (`previous_score_1`).
- `score_delta`: Momentum difference between `previous_score_1` and `previous_score_2`.
- `score_trend`: Categorized momentum: `Improving` ($\Delta > +3.0$), `Declining` ($\Delta < -3.0$), or `Stable`.
- `min_previous_score` & `max_previous_score`: Historical range boundaries.
- `attendance_to_score_ratio`: Interaction between class engagement and exam marks.
- **Leakage Prevention**: Verified via automated assertions that target and future scores never enter $X$.

---

## 11. Exploratory Data Analysis (EDA)
Documented in `notebooks/01_exploratory_data_analysis.ipynb` and visualized in `reports/figures/`:
- **Attendance Impact**: At-risk cohort mean attendance is 63.4% vs 84.8% for safe students.
- **Formative Homework Impact**: Submitting $> 85\%$ of assignments reduces at-risk prevalence to $< 8\%$.
- **Score Momentum**: Declining score trend doubles failure likelihood compared to stable trajectories.

---

## 12. Data Split Strategy
Strict **time-aware chronological splitting** by assessment period:
- **Training Set (70% earliest)**: Periods 1, 2, 3 ($N = 4,800$).
- **Validation Set (15% intermediate)**: Period 4 ($N = 1,600$) — used for model tuning and threshold selection.
- **Held-Out Test Set (15% latest)**: Period 5 ($N = 1,600$) — completely isolated and evaluated strictly ONCE.

---

## 13. Baseline Methodology
**Majority-Class Baseline**: A `DummyClassifier(strategy="most_frequent")` that always predicts class 0.
- Result: 74.38% accuracy, but **0.0% Recall and 0.0% F1-score**. It completely fails to identify any at-risk students, demonstrating why accuracy is an invalid selection metric for imbalanced educational risk tasks.

---

## 14. Candidate Models
1. **Logistic Regression**: Scaled with `StandardScaler`, $L_2$ regularization ($C=0.5$), and balanced class weights.
2. **Random Forest Classifier**: 250 estimators, max depth 9, balanced subsample weights, Gini criterion.
3. **XGBoost Classifier**: 180 estimators, learning rate 0.06, depth 5, `scale_pos_weight` for imbalance.

---

## 15. Model Comparison (Validation Set, Period 4)

| Model Candidate | Precision | Recall | F1-Score | Accuracy | ROC-AUC | PR-AUC | Selection |
|---|---|---|---|---|---|---|---|
| **Majority Baseline** | 0.0000 | 0.0000 | 0.0000 | 0.7438 | 0.5000 | 0.2562 | Reference benchmark |
| **Logistic Regression** | 0.6225 | **0.9171** | 0.7416 | 0.8388 | **0.9467** | 0.8412 | High recall, lower precision |
| **Random Forest** | **0.7288** | 0.8390 | **0.7800** | **0.8806** | 0.9423 | **0.8524** | **Selected Winning Model** |
| **XGBoost Classifier** | 0.6860 | 0.8366 | 0.7538 | 0.8656 | 0.9359 | 0.8395 | Competitive ensemble |

**Selection Reasoning**: Random Forest achieved the highest F1-score (0.7800) with a strong balance of high recall (83.90%) and high precision (72.88%), minimizing educator alert fatigue.

---

## 16. Evaluation Metrics on Held-Out Test Set (Period 5)

Evaluated ONCE with optimal validation-tuned threshold $\tau = 0.60$:
- **Precision**: **77.56%**
- **Recall**: **76.41%**
- **F1-Score**: **76.98%**
- **Accuracy**: **88.38%**
- **ROC-AUC**: **0.9308**
- **PR-AUC**: **0.8475**
- **Brier Score**: **0.0812** (well-calibrated probabilities)

### Held-Out Test Confusion Matrix

$$\begin{array}{c|cc}
& \text{Pred: Safe (0)} & \text{Pred: At-Risk (1)} \\
\hline
\text{Actual: Safe (0)} & \text{TN} = 1,103 & \text{FP} = 90 \\
\text{Actual: At-Risk (1)} & \text{FN} = 96 & \text{TP} = 311
\end{array}$$

---

## 17. Class Imbalance & Threshold Selection
- At-risk prevalence is ~23.8%.
- Class weighting (`balanced_subsample`) was applied during tree fitting.
- The decision threshold was tuned strictly on validation data, selecting **$\tau = 0.60$** to optimize F1 (0.7933) while preserving recall $> 75\%$.

---

## 18. Error Analysis
- **False Positives ($FP = 90$, 7.5% of safe students)**: Students with declining signals who rallied before exams. In education, a false alarm results in benign proactive check-ins with zero punitive impact.
- **False Negatives ($FN = 96$, 23.6% of at-risk students)**: Students with steady historical marks who suffered an acute unobserved exam shock (e.g. illness). Highlights that ML must supplement, not replace, teacher vigilance.

---

## 19. Explainability & Academic Signals
Implemented in `src/explainability.py`:
- **Global Feature Importance**: Top drivers are `latest_score`, `average_previous_score`, and `attendance_rate`.
- **Local Explanations**: Decomposes individual predictions into specific risk drivers (e.g., "Attendance rate (58%) is below 80% cohort benchmark") and protective factors (e.g., "Assignment completion is 95%").
- **Clinical Narrative**: Generates plain-language educator summaries and suggested interventions.

---

## 20. Architecture & Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn.
- **ML & Data**: Scikit-learn, XGBoost, Pandas, NumPy, Joblib.
- **Testing**: Pytest (27 automated tests), HTTPX TestClient.

---

## 21. API Endpoints
- `GET  /api/health`: Service health and model version.
- `GET  /api/dashboard/summary`: Cohort KPI statistics derived from data.
- `GET  /api/students`: Filtered, sorted, paginated student directory.
- `GET  /api/students/{student_id}`: Longitudinal history for a student.
- `POST /api/predict`: Real-time model inference with local explanations.
- `GET  /api/analytics/performance-trends`: Longitudinal multi-period trends.
- `GET  /api/analytics/attendance`: Attendance brackets and failure correlations.
- `GET  /api/analytics/assignment-completion`: Homework completion correlations.
- `GET  /api/analytics/risk-distribution`: Risk band breakdowns.
- `GET  /api/model/metrics`: Model comparison matrix and test metrics.
- `GET  /api/data/preview`: Paginated preview of raw/processed data.

---

## 22. Frontend Pages Implemented
1. **Executive Overview (`/`)**: KPI metric cards, risk donut chart, longitudinal multi-period trend lines, and priority review table.
2. **Student Risk Analysis (`/students`)**: Searchable student table, risk band filters (High, Medium, Low), multi-column sorting, pagination, and detail links.
3. **Individual Student Details (`/students/:studentId`)**: Longitudinal trajectory line chart, live model probability gauge, explainable signals, and suggested action plan.
4. **Performance Analytics (`/analytics`)**: Attendance vs. risk bar charts, homework completion vs. risk, and multi-period score stability analysis.
5. **Model Performance (`/model`)**: Full benchmark comparison table, held-out test confusion matrix, global feature importance chart, and trade-off analysis.
6. **Individual Student Prediction (`/predict`)**: Interactive inference form with 3 realistic presets (At-Risk, High Achiever, Struggling but Diligent), real API inference, and signal breakdown.
7. **Data Explorer (`/data`)**: Paginated dataset browser, column schema audit, and null-check verifications.
8. **About & Responsible AI (`/about`)**: Methodological documentation, privacy guarantees, and prominent responsible-use policies.

---

## 23. Installation Guide

### Prerequisites
- macOS or Linux
- Python 3.11+
- Node.js v18+ and npm v9+

### 1. Clone repository & set up environment
```bash
git clone <repo-url> student-risk-prediction
cd student-risk-prediction

# Create Python 3.11 virtual environment
python3.11 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# Install frontend dependencies
npm install --prefix frontend
```

---

## 24. Running the Project

### Option A: Quick Unified Development Runner (Recommended)
```bash
./run_app.sh
```
Starts both the FastAPI Backend on `http://localhost:8000` and the React Frontend on `http://localhost:5173`.

### Option B: Running Services Separately
**Terminal 1 (Backend):**
```bash
./venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
npm run dev --prefix frontend
```

Open your browser at **`http://localhost:5173`**.

---

## 25. Training the Machine Learning Models
To regenerate synthetic data and train all candidate models from scratch:
```bash
# 1. Generate longitudinal dataset (8,000 records, seed 42)
./venv/bin/python data/generate_data.py --students 1600 --periods 5 --seed 42 --threshold 40.0

# 2. Train baseline and candidates, evaluate on validation set, evaluate winner on held-out test set
./venv/bin/python -m src.train

# 3. Generate visualization figures
MPLCONFIGDIR=/tmp/mpl ./venv/bin/python -m src.generate_figures
```

---

## 26. Running the Automated Test Suite
Execute the full Pytest test suite (27 automated tests):
```bash
./venv/bin/pytest tests/ -v
```

All 27 test cases pass:
- Dataset reproducibility & schema integrity
- Missing value, score, attendance, and assignment validation
- Feature engineering correctness & zero target leakage
- Time-aware chronological splitting
- Model artifact serialization and loading
- Prediction service output conformity
- FastAPI endpoint responses and error handling (422 validation, 404, 200).

---

## 27. Generating Real Predictions via CLI
```bash
./venv/bin/python -c "
from src.predict import predict_single
sample = {
    'student_id': 'STU_CLI_DEMO',
    'attendance_rate': 62.0,
    'assignments_completed': 4,
    'total_assignments': 10,
    'previous_score_1': 36.0,
    'previous_score_2': 42.0,
    'previous_score_3': 48.0,
    'score_trend': 'Declining'
}
res = predict_single(sample)
print('Advisory Risk Band:', res['advisory_risk_band'])
print('Vulnerability Prob:', res['risk_percentage'], '%')
print('Narrative:         ', res['explanation_narrative'])
"
```

---

## 28. Known Limitations
1. **Synthetic Nature**: The models were developed using a probabilistic synthetic dataset designed to replicate realistic classroom dynamics. Real-world institutional deployment requires calibration on historical institutional callsets.
2. **Unobserved External Factors**: Models cannot account for acute life events (illness, bereavement) occurring immediately prior to an exam.
3. **Correlation vs. Causation**: Feature weights represent statistical correlation with failure, not medical or psychological diagnoses.

---

## 29. Responsible AI & Ethical Policy
- **Advisory Only**: The system is strictly an early-warning advisory tool.
- **Zero Automated Sanctions**: Must never automatically assign grades, alter marks, or impose disciplinary penalties.
- **Fairness**: Sensitive protected attributes (gender, race, ethnicity, religion, caste) are completely excluded from predictive modeling.
- **Human in the Loop**: Qualified educators must review all flagged advisories before determining appropriate pedagogical interventions.

---

## 30. Future Improvements
1. Integration with Live Learning Management Systems (Canvas, Moodle, Google Classroom via LTI).
2. Natural language integration for qualitative teacher notes using privacy-preserving NLP.
3. Multi-class prediction horizon forecasting (predicting specific grade bands A, B, C, D, F).
4. Student-facing self-service goal tracking and study habit recommendations.
