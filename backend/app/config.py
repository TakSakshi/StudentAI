"""
Backend Configuration for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "StudentInsight AI"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = True
    port: int = 8000
    host: str = "0.0.0.0"

    # Base path resolution (project root)
    base_dir: Path = Path(__file__).resolve().parent.parent.parent

    # Data & Artifact paths
    data_path: Path = base_dir / "data" / "processed" / "student_prediction_data.csv"
    model_path: Path = base_dir / "models" / "best_model.pkl"
    metadata_path: Path = base_dir / "models" / "model_metadata.json"
    metrics_path: Path = base_dir / "models" / "evaluation_metrics.json"
    threshold_path: Path = base_dir / "models" / "threshold_config.json"
    comparison_csv_path: Path = base_dir / "reports" / "model_comparison.csv"

    # CORS configuration
    cors_origins: list = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
