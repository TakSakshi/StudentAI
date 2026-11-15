"""
Preprocessing Pipeline Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from src.config import NUMERICAL_FEATURES, CATEGORICAL_FEATURES

def build_preprocessor() -> ColumnTransformer:
    """
    Construct a scikit-learn ColumnTransformer for preprocessing.
    - Imputes and standardizes numerical features.
    - Imputes and one-hot encodes categorical features.
    - Fitted strictly on training data only to prevent data leakage.
    """
    numerical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_pipeline, NUMERICAL_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )

    return preprocessor
