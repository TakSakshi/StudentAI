"""
Model Service Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import json
import joblib
import pandas as pd
from typing import Dict, Any, Optional, List
from backend.app.config import settings

class ModelService:
    _instance = None
    _model = None
    _metadata: Optional[Dict[str, Any]] = None
    _metrics: Optional[Dict[str, Any]] = None
    _threshold_config: Optional[Dict[str, Any]] = None
    _comparison_data: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.load_artifacts()
        return cls._instance

    def load_artifacts(self):
        """Load trained model and evaluation artifacts from disk."""
        if settings.model_path.exists():
            self._model = joblib.load(settings.model_path)

        if settings.metadata_path.exists():
            with open(settings.metadata_path, "r") as f:
                self._metadata = json.load(f)

        if settings.metrics_path.exists():
            with open(settings.metrics_path, "r") as f:
                self._metrics = json.load(f)

        if settings.threshold_path.exists():
            with open(settings.threshold_path, "r") as f:
                self._threshold_config = json.load(f)

        if settings.comparison_csv_path.exists():
            comp_df = pd.read_csv(settings.comparison_csv_path)
            self._comparison_data = comp_df.to_dict(orient="records")

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def model_name(self) -> str:
        return self._metadata.get("model_name", "Random Forest") if self._metadata else "Random Forest"

    @property
    def version(self) -> str:
        return self._metadata.get("version", "1.0.0") if self._metadata else "1.0.0"

    @property
    def threshold(self) -> float:
        return float(self._threshold_config.get("classification_threshold", 0.60)) if self._threshold_config else 0.60

    @property
    def metadata(self) -> Dict[str, Any]:
        return self._metadata or {}

    @property
    def metrics(self) -> Dict[str, Any]:
        return self._metrics or {}

    @property
    def comparison_data(self) -> List[Dict[str, Any]]:
        return self._comparison_data or []
