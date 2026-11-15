"""
Metrics and Evaluation Helper Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import numpy as np
from typing import Dict, Any, Union
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    brier_score_loss
)

def calculate_metrics(
    y_true: Union[np.ndarray, list],
    y_pred: Union[np.ndarray, list],
    y_prob: Union[np.ndarray, list] = None
) -> Dict[str, Any]:
    """
    Compute comprehensive classification metrics.
    Includes educational safety considerations (recall prioritization, false alarms vs missed at-risk).
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    precision = float(precision_score(y_true, y_pred, zero_division=0))
    recall = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    accuracy = float(accuracy_score(y_true, y_pred))

    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

    metrics = {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "accuracy": round(accuracy, 4),
        "confusion_matrix": {
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "tp": tp,
            "raw": [[tn, fp], [fn, tp]]
        },
        "false_positive_rate": round(fp / (fp + tn), 4) if (fp + tn) > 0 else 0.0,
        "false_negative_rate": round(fn / (fn + tp), 4) if (fn + tp) > 0 else 0.0
    }

    if y_prob is not None:
        y_prob = np.array(y_prob)
        try:
            metrics["roc_auc"] = round(float(roc_auc_score(y_true, y_prob)), 4)
        except Exception:
            metrics["roc_auc"] = None

        try:
            metrics["pr_auc"] = round(float(average_precision_score(y_true, y_prob)), 4)
        except Exception:
            metrics["pr_auc"] = None

        try:
            metrics["brier_score"] = round(float(brier_score_loss(y_true, y_prob)), 4)
        except Exception:
            metrics["brier_score"] = None
    else:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None
        metrics["brier_score"] = None

    return metrics
