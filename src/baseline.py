"""
Baseline Model Module for StudentInsight AI
Algions AI Labs Private Limited - Internship Assessment
"""

from sklearn.dummy import DummyClassifier
from sklearn.pipeline import Pipeline
from src.preprocessing import build_preprocessor

def build_majority_baseline() -> Pipeline:
    """
    Construct a majority-class baseline classifier.
    Predicts the most frequent class observed in training data.
    Provides the benchmark lower-bound for all candidate models.
    """
    pipeline = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("classifier", DummyClassifier(strategy="most_frequent"))
    ])
    return pipeline
