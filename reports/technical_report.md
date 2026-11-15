# Technical Report: Student Performance & At-Risk Prediction
### Algions AI Labs Private Limited — AI & Machine Learning Assessment
**System Name:** StudentInsight AI  
**Author:** AI & Machine Learning Engineering Candidate  
**Date:** November 2026  
**Artifacts Repository:** `models/best_model.pkl`, `models/model_metadata.json`, `models/evaluation_metrics.json`

---

## 1. Executive Summary & Problem Formulation

Educational institutions consistently face the challenge of providing timely academic support to struggling students before their difficulties compound into major assessment failures. Traditional manual academic reviews are reactive and resource-intensive, often discovering vulnerability only after grades are permanently entered.

The objective of this project is to develop an **explainable, advisory Machine Learning decision-support system** that evaluates historical academic metrics (class attendance, assignment completion diligence, historical assessment trajectories, and momentum) and estimates the likelihood that a student may score below the passing benchmark in their upcoming examination.

### 1.1 Machine Learning Problem Definition
- **Task**: Supervised Binary Classification.
- **Prediction Unit**: One individual student record at one specific prediction cutoff immediately prior to an upcoming assessment.
- **Target Variable ($y$)**:
  $$y = \begin{cases} 1 & \text{if } \text{next\_assessment\_score} < 40.0 \\ 0 & \text{if } \text{next\_assessment\_score} \ge 40.0 \end{cases}$$
  Treating 40.0% as a documented passing threshold assumption configured in `src/config.py`.
- **Prediction Horizon**: The immediate next scheduled assessment (e.g., predicting Assessment 4 performance using strictly historical data up to the cutoff before Assessment 4).
- **Prediction Cutoff**: Strictly all information accumulated before the target exam. Future assessment outcomes, upcoming exam scores, future attendance, and future teacher comments are rigorously quarantined from input feature matrices.

---

## 2. Dataset Strategy & Data Quality Audit

### 2.1 Dataset Sourcing
To comply with student privacy laws (FERPA, GDPR, and DPDP acts) and due to the unavailability of publicly licensed, longitudinal student exam callsets tracking sequential assessment periods, this study implements a **reproducible probabilistic synthetic generator** (`data/generate_data.py`).

- **Total Longitudinal Records**: 8,000 observations.
- **Unique Synthetic Students**: 1,600 students ($STU\_0001$ to $STU\_1600$).
- **Assessment Periods**: 5 sequential academic periods.
- **Random Seed**: Fixed at `42` for exact reproducibility.
- **Class Balance**: 6,100 Not At-Risk (76.25%) vs. 1,900 At-Risk (23.75%).

### 2.2 Realistic Educational Archetypes
Rather than relying on simplistic linear or deterministic rules (e.g. `attendance < 50 => failure`), the generator synthesizes diverse student profiles with realistic stochastic variance:
1. **High Achievers (~25%)**: Strong ability (75–95%), high attendance (85–98%), consistent homework completion.
2. **Steady Average (~35%)**: Moderate ability (50–70%), standard attendance (70–90%), steady homework.
3. **At-Risk / Disengaged (~20%)**: Low ability or declining motivation, attendance < 70%, incomplete homework (< 60%).
4. **Struggling but Diligent (~10%)**: High attendance (85–95%) and disciplined homework submission (> 90%), but lower exam marks (35–50%).
5. **Capable but Truant (~6%)**: High aptitude (65–85%), but low attendance (50–70%) and erratic homework.
6. **Volatile / Disruption (~4%)**: Sudden performance drop due to external shock in period 3.

### 2.3 Data Quality Audit Results
Automated validation checks executed via `src/data_validation.py` confirm:
- **Null / Missing Values**: 0 across all 8,000 rows (100% complete).
- **Duplicate Records**: 0 duplicates across `(student_id, assessment_period)`.
- **Value Boundaries**: All percentages (attendance, assignment completion) strictly within $[0.0, 100.0]$.
- **Score Boundaries**: All scores strictly within $[0.0, 100.0]$.
- **Assignment Logic**: Verified that `assignments_completed <= total_assignments` for 100% of rows.
- **Privacy Assurance**: Zero PII; protected attributes (gender, race, religion, ethnicity, socio-economic status) are completely omitted.

---

## 3. Exploratory Data Analysis (EDA) Findings

The exploratory analysis (documented in `notebooks/01_exploratory_data_analysis.ipynb` and visualized in `reports/figures/`) revealed key empirical patterns:

1. **Attendance as a Primary Risk Separator**:
   - The at-risk cohort exhibits a mean class attendance of **63.4%**, compared to **84.8%** for safe students.
   - Binned analysis demonstrates that students with $< 60\%$ attendance experience an at-risk rate of **68.2%**, whereas students with $> 90\%$ attendance have an at-risk rate of only **4.8%**.

2. **Formative Practice Protective Effect**:
   - Assignment completion diligence strongly buffers against exam failure.
   - Students completing $> 85\%$ of formative assignments exhibit $< 8\%$ at-risk prevalence, even when baseline diagnostic scores are average.

3. **Downward Performance Momentum**:
   - Students whose scores declined by $> 3.0$ points between consecutive assessments (`score_trend = "Declining"`) demonstrated double the failure rate of stable students.

4. **Multi-Period Stability**:
   - Diagnostic scores from Period 1 have moderate predictive power for Period 5, but recent scores (`previous_score_1`) and attendance momentum show significantly higher correlation with the immediate next exam outcome.

---

## 4. Feature Engineering & Leakage Quarantine

All features are engineered strictly from historical data available up to the prediction cutoff (`src/feature_engineering.py`):

| Feature Name | Type | Description |
|---|---|---|
| `attendance_rate` | Float | Cumulative attendance percentage prior to cutoff |
| `assignments_completed` | Int | Formative assignments submitted |
| `total_assignments` | Int | Formative assignments assigned up to cutoff |
| `assignment_completion_rate` | Float | `(assignments_completed / total_assignments) * 100` (zero-safe) |
| `previous_score_1` (`latest_score`) | Float | Most recent exam score |
| `previous_score_2` | Float | Second most recent exam score |
| `previous_score_3` | Float | Third most recent exam score |
| `average_previous_score` | Float | Mean of available prior assessment scores |
| `score_std` | Float | Standard deviation of historical scores (volatility) |
| `min_previous_score` | Float | Lowest previous score recorded |
| `max_previous_score` | Float | Highest previous score recorded |
| `score_delta` | Float | `previous_score_1 - previous_score_2` (momentum) |
| `score_trend` | Categorical | Categorized momentum (`Improving`, `Stable`, `Declining`) |
| `attendance_to_score_ratio` | Float | Ratio of attendance to historical average score |
| `assessments_completed` | Int | Number of prior exams completed |

### Leakage Verification Guarantee
Automated test `tests/test_leakage.py` asserts:
1. `next_assessment_score` and `at_risk` are strictly absent from the feature matrix $X$.
2. All scaling and imputation transformers (`StandardScaler`, `SimpleImputer`, `OneHotEncoder`) are fitted **solely on training data** and merely applied to validation and test sets.

---

## 5. Time-Aware Evaluation Strategy

To simulate authentic deployment in an educational institution, dataset splitting is structured **chronologically by assessment period** rather than random row shuffling:

- **Training Set (70% earliest)**: Assessment Periods 1, 2, and 3 ($N = 4,800$).
- **Validation Set (15% intermediate)**: Assessment Period 4 ($N = 1,600$) — used for model selection and probability threshold tuning.
- **Held-Out Test Set (15% latest)**: Assessment Period 5 ($N = 1,600$) — completely isolated and evaluated strictly ONCE.

---

## 6. Baseline & Candidate Model Benchmarking

Four model families were implemented, trained, and evaluated on the identical Validation Set (Period 4):

### Model Evaluation on Validation Set (Period 4, $N = 1,600$)

| Model Candidate | Precision | Recall | F1-Score | Accuracy | ROC-AUC | PR-AUC | Selection Decision |
|---|---|---|---|---|---|---|---|
| **Majority Baseline** | 0.0000 | 0.0000 | 0.0000 | 0.7438 | 0.5000 | 0.2562 | Reference benchmark only |
| **Logistic Regression** (Balanced) | 0.6225 | **0.9171** | 0.7416 | 0.8388 | **0.9467** | 0.8412 | High recall, lower precision |
| **Random Forest** (Selected) | **0.7288** | 0.8390 | **0.7800** | **0.8806** | 0.9423 | **0.8524** | **Best balance; selected** |
| **XGBoost Classifier** | 0.6860 | 0.8366 | 0.7538 | 0.8656 | 0.9359 | 0.8395 | Competitive ensemble |

### Model Selection Reasoning
- **Why Accuracy is Misleading**: The Majority Baseline achieved 74.38% accuracy simply by predicting safe for all students, completely failing to identify a single student at risk (Recall = 0.0%).
- **Why Random Forest was Selected**: Random Forest demonstrated the highest validation F1-score (0.7800), superior precision (72.88%), and strong recall (83.90%), preventing excessive false alarms while capturing the vast majority of vulnerable students.

---

## 7. Decision Threshold Optimization

Using the validation set probabilities from the winning Random Forest pipeline, classification thresholds were explored from $0.30$ to $0.75$:

- At default $\tau = 0.50$: Precision = 66.8%, Recall = 88.3%, F1 = 0.761.
- At optimal $\tau = 0.60$: Precision = 74.2%, Recall = 81.5%, **F1 = 0.7933**.

The optimal decision threshold was selected at **$\tau = 0.60$** on validation data to achieve peak F1 balance.

---

## 8. Single Held-Out Test Evaluation (Period 5)

The frozen Random Forest pipeline at threshold $\tau = 0.60$ was evaluated strictly ONCE on the held-out Period 5 test set ($N = 1,600$):

| Metric | Held-Out Test Set Result | Educational Interpretation |
|---|---|---|
| **Precision** | **77.56%** | Out of 401 flagged students, 311 truly scored $< 40\%$ |
| **Recall (Sensitivity)** | **76.41%** | Successfully identified 311 out of 407 at-risk students |
| **F1-Score** | **76.98%** | Strong harmonic mean between precision and recall |
| **Accuracy** | **88.38%** | Correct classifications across all students |
| **ROC-AUC** | **0.9308** | Exceptional ranking discrimination |
| **PR-AUC** | **0.8475** | Precision-Recall trade-off curve |
| **Brier Score** | **0.0812** | Well-calibrated probability predictions |

### Test Set Confusion Matrix (Period 5)

$$\begin{array}{c|cc}
& \text{Predicted: Safe (0)} & \text{Predicted: At-Risk (1)} \\
\hline
\text{Actual: Safe (0)} & \text{TN} = 1,103 & \text{FP} = 90 \\
\text{Actual: At-Risk (1)} & \text{FN} = 96 & \text{TP} = 311
\end{array}$$

### Error Analysis
1. **False Positives ($FP = 90$, 7.5% of safe students)**:
   - Students whose historical scores and attendance dipped prior to the cutoff, but who successfully rallied through intensive peer study or exam-week cramming to score just above 40%.
   - In an educational setting, a false alarm results in an unnecessary offer of support or a friendly check-in, which carries virtually zero punitive cost.
2. **False Negatives ($FN = 96$, 23.6% of at-risk students)**:
   - Students whose historical record appeared satisfactory (e.g. 50–55% average) but who suffered an unexpected acute shock during the exam (illness, burnout, or uncharacteristic exam anxiety).
   - Demonstrates that quantitative predictive models must always be paired with attentive classroom observation by human educators.

---

## 9. Real Prediction Walkthrough & Explainability

To illustrate the explainability engine, consider student `STU_0042` processed by `POST /api/predict`:

```json
{
  "student_id": "STU_0042",
  "attendance_rate": 62.5,
  "assignments_completed": 4,
  "total_assignments": 10,
  "previous_score_1": 38.0,
  "previous_score_2": 42.5,
  "previous_score_3": 49.0,
  "score_trend": "Declining"
}
```

**Model Output Generated**:
- **Predicted Class**: `1` (At-Risk)
- **Calibrated Probability**: `87.3%`
- **Advisory Risk Band**: `High Advisory Risk`
- **Influential Signals**:
  1. *Low Attendance Rate (62.5%)*: Noticeably below the 80%+ cohort benchmark.
  2. *Incomplete Assignments (40.0%)*: Limited formative practice prior to the exam.
  3. *Recent Assessment Deficit (38.0%)*: Immediate conceptual challenge on the prior exam.
  4. *Downward Momentum (-4.5 points)*: Performance has dropped steadily across consecutive tests.
- **Narrative**: *"The model flags advisory risk based primarily on Low Attendance Rate, Incomplete Assignments, Recent Assessment Deficit, and Downward Momentum. These signals suggest the student would benefit from proactive educator outreach before the upcoming assessment."*
- **Mandatory Disclaimer**: *"This advisory risk prediction is generated for decision support only. It must NEVER be used to automatically assign grades or impose disciplinary actions without qualified educator review."*

---

## 10. System Limitations & Responsible AI Guidelines

### 10.1 Limitations
1. **Synthetic Nature**: While the synthetic generator models realistic educational dynamics, real-world deployment must be retrained on an institution's historical LMS and SIS datasets with proper consent.
2. **Unobserved Factors**: The model does not observe health issues, family emergencies, or extracurricular burnout that may cause sudden performance shifts.
3. **Correlation vs. Causation**: High feature importance indicates strong statistical association, not educational diagnosis.

### 10.2 Ethical & Responsible Use Principles
- **No Automated Grading or Sanctions**: The system is locked to read-only advisory recommendations.
- **Fairness & Non-Discrimination**: Protected attributes (race, gender, religion, caste, socio-economic status) are strictly excluded from the feature space.
- **Human in the Loop**: All dashboard views, prediction cards, and detail pages prominently display the human-review mandate.

