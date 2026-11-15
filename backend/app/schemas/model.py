"""
Pydantic Schemas for Model Performance Endpoints
StudentInsight AI - Algions AI Labs Private Limited
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ConfusionMatrixData(BaseModel):
    tp: int
    fp: int
    fn: int
    tn: int
    raw: List[List[int]]

class ModelMetricItem(BaseModel):
    precision: float
    recall: float
    f1: float
    accuracy: float
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None
    brier_score: Optional[float] = None
    confusion_matrix: ConfusionMatrixData
    false_positive_rate: float
    false_negative_rate: float

class ModelComparisonRow(BaseModel):
    model_name: str
    split: str
    precision: float
    recall: float
    f1: float
    accuracy: float
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None
    tp: int
    fp: int
    fn: int
    tn: int

class ModelPerformanceResponse(BaseModel):
    model_name: str
    model_version: str
    selected_threshold: float
    validation_metrics: Dict[str, Any]
    test_metrics: Dict[str, Any]
    model_comparison: List[ModelComparisonRow]
    global_feature_importance: List[Dict[str, Any]]
    evaluation_split_info: Dict[str, Any]
    trade_off_analysis: Dict[str, str]
