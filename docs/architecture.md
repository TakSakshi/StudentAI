# StudentInsight AI — System Architecture & Data Flow
**Student Performance & At-Risk Prediction**
*Algions AI Labs Private Limited — AI & Machine Learning Assessment*

---

## 1. High-Level Architectural Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    REACT + TYPESCRIPT FRONTEND (Vite)                              |
|                                                                                                    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  | Executive Overview |  | Student Risk Table |  | Student Details    |  | Performance Charts |    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  | Live Prediction UI |  | Model Benchmarks   |  | Data Explorer      |  | About & Ethics     |    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
+-------------------------------------------------+--------------------------------------------------+
                                                  | JSON / REST (Axios)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                    FASTAPI PYTHON 3.11 BACKEND                                     |
|                                                                                                    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  | /api/health        |  | /api/dashboard     |  | /api/students      |  | /api/predict       |    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
|  | /api/analytics     |  | /api/model/metrics |  | /api/data/preview  |  | Pydantic Schemas   |    |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+    |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                    +-----------------------------+-----------------------------+
                    |                                                           |
                    v                                                           v
+-----------------------------------------------+   +-----------------------------------------------+
|             DATA SERVICE (In-Memory)          |   |             INFERENCE PIPELINE                |
|                                               |   |                                               |
|  - Processed Student Records (8,000 rows)     |   |  - Feature Engineering (Strictly Pre-Cutoff)  |
|  - Search, Filter, Sort, Paginate             |   |  - Preprocessor (SimpleImputer, Scaler, OHE)  |
|  - Data Validation Checks                     |   |  - Selected Winning Model (Random Forest)     |
|  - Longitudinal Analytics Aggregators         |   |  - Probability Calibrator & Risk Threshold    |
|                                               |   |  - Local Signal Explainability Service        |
+-----------------------------------------------+   +-----------------------------------------------+
                    |                                                           |
                    v                                                           v
+-----------------------------------------------+   +-----------------------------------------------+
|         PROCESSED DATA (data/processed/)      |   |            MODEL ARTIFACTS (models/)          |
|                                               |   |                                               |
|  - student_prediction_data.csv                |   |  - best_model.pkl (Trained Pipeline)          |
|  - raw_student_data.csv                       |   |  - model_metadata.json (Params & Importance)  |
|                                               |   |  - evaluation_metrics.json (Test Metrics)     |
|                                               |   |  - threshold_config.json (&tau; = 0.60)       |
+-----------------------------------------------+   +-----------------------------------------------+
```

---

## 2. Longitudinal Prediction Horizon & Cutoff Flow

To guarantee **zero future-data leakage**, predictions are framed strictly around pre-assessment boundaries:

```
Timeline:
|-------------- Period 1 --------------|-------------- Period 2 --------------|-------------- Period 3 --------------|  ...
   [Historical diagnostic & exams]         [Formative HW & Attendance]              [PREDICTION CUTOFF]
                                                                                            |
                                            INFERENCE INPUT FEATURES:                       |
                                            - Attendance prior to cutoff: 62%               |
                                            - Homework completed: 4/10                      |
                                            - Previous Score 1 (Latest): 38%                |
                                            - Historical Average: 43.2%                     |
                                            - Score Trend: Declining (-4.5 pts)             |
                                                                                            v
                                                                                [MODEL INFERENCE PIPELINE]
                                                                                            |
                                                                                            v
                                                                                Advisory Risk Prediction:
                                                                                - Risk Band: High Advisory Risk
                                                                                - Probability: 87.3%
                                                                                - Signals: Low attendance, missing HW
                                                                                - Mandate: Human Review Required
                                                                                            |
                                                                    ------------------------+------------------------
                                                                    |
                                                                    v
                                                     [UPCOMING ASSESSMENT EXAM]
                                                     Actual score: 36.5% (< 40%)
                                                     Ground Truth Label: at_risk = 1
                                                     (Quarantined strictly for post-hoc evaluation)
```

---

## 3. Machine Learning Pipeline Architecture

1. **Data Sourcing & Synthetic Generator**:
   - Probabilistic latent student capabilities with diverse educational archetypes (High Achiever, Steady Average, At-Risk Disengaged, Diligent Struggling, Capable Truant, Volatile Disruption).
   - 8,000 longitudinal records across 1,600 unique students and 5 sequential assessment periods.
   - At-risk prevalence: ~23.8% (realistic educational class imbalance).

2. **Validation Engine**:
   - Enforces anonymous format `STU_xxxx`.
   - Rejects null values, invalid score boundaries ($[0, 100]$), invalid attendance percentages ($[0, 100]$), and illogical assignment counts (`assignments_completed <= total_assignments`).

3. **Time-Aware Chronological Splitting**:
   - **Training Set (70%)**: Periods 1, 2, 3 (4,800 observations).
   - **Validation Set (15%)**: Period 4 (1,600 observations) — used for hyperparameter tuning, model comparison, and decision threshold optimization.
   - **Held-Out Test Set (15%)**: Period 5 (1,600 observations) — evaluated strictly ONCE after final pipeline freeze.

4. **Candidate Modeling & Tuning**:
   - Model 1: Majority-Class Baseline (0% Recall, 0% F1 benchmark).
   - Model 2: Balanced Logistic Regression ($C=0.5$).
   - Model 3: Random Forest Classifier ($n=250$, depth$=9$, class-weighted).
   - Model 4: XGBoost Classifier ($n=180$, depth$=5$, scale_pos_weight).
   - Winner: Random Forest selected based on highest validation F1 (0.7800) and balanced high recall (0.8390).
   - Tuned Decision Threshold: $\tau = 0.60$ (optimizing validation F1 to 0.7933 while maintaining recall $> 75\%$).

5. **Inference & Explainability Engine**:
   - Computes global feature importances via Gini impurity.
   - Computes local prediction explanations by contrasting student metrics against cohort benchmarks.
   - Automatically outputs protective factors and risk drivers in plain educational language.
   - Appends mandatory human-review disclaimer.
