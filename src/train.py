"""
Model Training, Validation and Serialization Pipeline for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import json
import joblib
import warnings
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

# Suppress benign macOS Accelerate BLAS matmul warning
warnings.filterwarnings("ignore", category=RuntimeWarning, module="sklearn")

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.calibration import CalibratedClassifierCV

from src.config import (
    PROCESSED_DATA_PATH,
    BEST_MODEL_PATH,
    MODEL_METADATA_PATH,
    EVALUATION_METRICS_PATH,
    FEATURE_LIST_PATH,
    THRESHOLD_CONFIG_PATH,
    MODEL_COMPARISON_CSV,
    ALL_MODEL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    RANDOM_SEED,
    DEFAULT_CLASSIFICATION_THRESHOLD,
    AT_RISK_SCORE_THRESHOLD
)
from src.data_loader import load_data
from src.data_validation import validate_dataset
from src.split import time_based_split
from src.feature_engineering import get_feature_matrix_and_target
from src.preprocessing import build_preprocessor
from src.baseline import build_majority_baseline
from src.metrics import calculate_metrics
from src.explainability import extract_global_feature_importance

def train_and_evaluate_all():
    """
    Execute the complete ML training, model comparison, validation-based selection,
    and held-out test evaluation.
    """
    print("=" * 60)
    print("STARTING ML TRAINING & EVALUATION PIPELINE")
    print("=" * 60)

    # 1. Load and validate data
    df = load_data(PROCESSED_DATA_PATH)
    val_report = validate_dataset(df, strict=True)
    print(f"Data validation passed: {len(df)} records across {val_report['unique_students']} students.")

    # 2. Time-aware chronological split
    train_df, val_df, test_df = time_based_split(df)
    print(f"Split sizes -> Train (Periods {train_df['assessment_period'].unique()}): {len(train_df)}, "
          f"Val (Period {val_df['assessment_period'].unique()}): {len(val_df)}, "
          f"Test (Period {test_df['assessment_period'].unique()}): {len(test_df)}")

    # 3. Extract feature matrices and targets
    X_train, y_train = get_feature_matrix_and_target(train_df)
    X_val, y_val = get_feature_matrix_and_target(val_df)
    X_test, y_test = get_feature_matrix_and_target(test_df)

    print(f"Feature count: {len(ALL_MODEL_FEATURES)}")
    print(f"Train class balance: {y_train.value_counts().to_dict()}")
    print(f"Val class balance: {y_val.value_counts().to_dict()}")
    print(f"Test class balance: {y_test.value_counts().to_dict()}")

    # Calculate class imbalance ratio for tree models
    pos_count = y_train.sum()
    neg_count = len(y_train) - pos_count
    scale_weight = float(neg_count / max(pos_count, 1))

    # 4. Define candidate models
    candidates = {
        "Majority Baseline": build_majority_baseline(),
        "Logistic Regression": Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", LogisticRegression(
                class_weight="balanced",
                max_iter=1000,
                C=0.5,
                random_state=RANDOM_SEED
            ))
        ]),
        "Random Forest": Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", RandomForestClassifier(
                n_estimators=250,
                max_depth=9,
                min_samples_split=6,
                min_samples_leaf=3,
                class_weight="balanced_subsample",
                random_state=RANDOM_SEED,
                n_jobs=1
            ))
        ]),
        "XGBoost": Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", XGBClassifier(
                n_estimators=180,
                max_depth=5,
                learning_rate=0.06,
                scale_pos_weight=scale_weight,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=RANDOM_SEED,
                eval_metric="logloss"
            ))
        ])
    }

    # 5. Train and evaluate on Validation set
    comparison_rows = []
    val_results = {}
    trained_pipelines = {}

    for name, pipe in candidates.items():
        print(f"\nTraining {name}...")
        pipe.fit(X_train, y_train)
        trained_pipelines[name] = pipe

        # Validation prediction
        y_val_pred = pipe.predict(X_val)
        y_val_prob = pipe.predict_proba(X_val)[:, 1] if hasattr(pipe, "predict_proba") else None

        metrics = calculate_metrics(y_val, y_val_pred, y_val_prob)
        val_results[name] = metrics

        comparison_rows.append({
            "model_name": name,
            "split": "validation",
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1": metrics["f1"],
            "accuracy": metrics["accuracy"],
            "roc_auc": metrics["roc_auc"],
            "pr_auc": metrics["pr_auc"],
            "brier_score": metrics["brier_score"],
            "tp": metrics["confusion_matrix"]["tp"],
            "fp": metrics["confusion_matrix"]["fp"],
            "fn": metrics["confusion_matrix"]["fn"],
            "tn": metrics["confusion_matrix"]["tn"]
        })

        print(f"{name} Validation -> F1: {metrics['f1']}, Recall: {metrics['recall']}, Precision: {metrics['precision']}, ROC-AUC: {metrics['roc_auc']}")

    # 6. Model selection based on Validation set F1 score (best balance of precision and recall)
    candidate_names = ["Logistic Regression", "Random Forest", "XGBoost"]
    best_candidate_name = max(candidate_names, key=lambda m: val_results[m]["f1"])
    print(f"\n>>> Selected Winning Candidate: {best_candidate_name} <<<")
    selected_pipeline = trained_pipelines[best_candidate_name]

    # 7. Evaluate classification thresholds on validation set for optimal decision support
    threshold_eval = []
    y_val_probs = selected_pipeline.predict_proba(X_val)[:, 1]

    best_thresh = DEFAULT_CLASSIFICATION_THRESHOLD
    best_thresh_f1 = -1.0

    for thresh in np.arange(0.30, 0.75, 0.05):
        thresh = round(float(thresh), 2)
        y_pred_t = (y_val_probs >= thresh).astype(int)
        m_t = calculate_metrics(y_val, y_pred_t, y_val_probs)
        threshold_eval.append({
            "threshold": thresh,
            "precision": m_t["precision"],
            "recall": m_t["recall"],
            "f1": m_t["f1"]
        })
        # Optimize F1 while maintaining Recall >= 0.80 if possible
        if m_t["recall"] >= 0.75 and m_t["f1"] > best_thresh_f1:
            best_thresh_f1 = m_t["f1"]
            best_thresh = thresh

    print(f"Optimal Decision Threshold selected from Validation: {best_thresh} (F1: {best_thresh_f1:.4f})")

    # 8. Single Final Evaluation of Selected Model on Held-out Test Set (Period 5)
    print("\nEvaluating chosen model once on Held-Out Test Set (Period 5)...")
    y_test_probs = selected_pipeline.predict_proba(X_test)[:, 1]
    y_test_pred = (y_test_probs >= best_thresh).astype(int)
    test_metrics = calculate_metrics(y_test, y_test_pred, y_test_probs)

    print(f"TEST METRICS ({best_candidate_name} @ threshold {best_thresh}):")
    print(f"  Precision: {test_metrics['precision']}")
    print(f"  Recall:    {test_metrics['recall']}")
    print(f"  F1-Score:  {test_metrics['f1']}")
    print(f"  Accuracy:  {test_metrics['accuracy']}")
    print(f"  ROC-AUC:   {test_metrics['roc_auc']}")
    print(f"  PR-AUC:    {test_metrics['pr_auc']}")
    print(f"  Confusion Matrix: TP={test_metrics['confusion_matrix']['tp']}, FP={test_metrics['confusion_matrix']['fp']}, FN={test_metrics['confusion_matrix']['fn']}, TN={test_metrics['confusion_matrix']['tn']}")

    comparison_rows.append({
        "model_name": f"{best_candidate_name} (Selected Final)",
        "split": "test",
        "precision": test_metrics["precision"],
        "recall": test_metrics["recall"],
        "f1": test_metrics["f1"],
        "accuracy": test_metrics["accuracy"],
        "roc_auc": test_metrics["roc_auc"],
        "pr_auc": test_metrics["pr_auc"],
        "brier_score": test_metrics["brier_score"],
        "tp": test_metrics["confusion_matrix"]["tp"],
        "fp": test_metrics["confusion_matrix"]["fp"],
        "fn": test_metrics["confusion_matrix"]["fn"],
        "tn": test_metrics["confusion_matrix"]["tn"]
    })

    # Save Model Comparison CSV
    comp_df = pd.DataFrame(comparison_rows)
    MODEL_COMPARISON_CSV.parent.mkdir(parents=True, exist_ok=True)
    comp_df.to_csv(MODEL_COMPARISON_CSV, index=False)
    print(f"Model comparison saved to: {MODEL_COMPARISON_CSV}")

    # 9. Extract Global Feature Importance
    global_importances = extract_global_feature_importance(selected_pipeline, ALL_MODEL_FEATURES)

    # 10. Save Model Artifacts
    BEST_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(selected_pipeline, BEST_MODEL_PATH)
    print(f"Model artifact saved to: {BEST_MODEL_PATH}")

    # Metadata artifact
    metadata = {
        "model_name": best_candidate_name,
        "version": "1.0.0",
        "trained_at": datetime.now().isoformat(),
        "random_seed": RANDOM_SEED,
        "score_threshold_for_at_risk": AT_RISK_SCORE_THRESHOLD,
        "selected_probability_threshold": best_thresh,
        "default_probability_threshold": DEFAULT_CLASSIFICATION_THRESHOLD,
        "training_periods": list(map(int, train_df["assessment_period"].unique())),
        "validation_period": int(val_df["assessment_period"].iloc[0]),
        "test_period": int(test_df["assessment_period"].iloc[0]),
        "train_samples": int(len(train_df)),
        "val_samples": int(len(val_df)),
        "test_samples": int(len(test_df)),
        "feature_count": len(ALL_MODEL_FEATURES),
        "global_feature_importance": global_importances
    }
    with open(MODEL_METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    # Metrics artifact
    all_metrics = {
        "model_name": best_candidate_name,
        "selected_threshold": best_thresh,
        "validation_metrics": val_results,
        "test_metrics": test_metrics,
        "threshold_exploration": threshold_eval
    }
    with open(EVALUATION_METRICS_PATH, "w") as f:
        json.dump(all_metrics, f, indent=2)

    # Feature list artifact
    with open(FEATURE_LIST_PATH, "w") as f:
        json.dump({
            "features": ALL_MODEL_FEATURES,
            "numerical": NUMERICAL_FEATURES,
            "categorical": CATEGORICAL_FEATURES
        }, f, indent=2)

    # Threshold config artifact
    with open(THRESHOLD_CONFIG_PATH, "w") as f:
        json.dump({
            "score_threshold": AT_RISK_SCORE_THRESHOLD,
            "classification_threshold": best_thresh,
            "risk_bands": {
                "low": {"max": 0.30, "label": "Low Advisory Risk"},
                "medium": {"min": 0.30, "max": 0.65, "label": "Medium Advisory Risk"},
                "high": {"min": 0.65, "label": "High Advisory Risk"}
            }
        }, f, indent=2)

    print("\nAll model artifacts successfully generated and serialized.")
    print("=" * 60)

if __name__ == "__main__":
    train_and_evaluate_all()
