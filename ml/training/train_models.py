import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from ml.data_generation.synthetic_generator import generate_synthetic_transactions

FEATURE_NUMERICAL = [
    "amount",
    "previous_attempts",
    "customer_success_rate",
    "customer_tenure_days",
    "invoice_age_days",
    "previous_payment_count",
    "previous_successful_payment_count",
    "previous_failed_payment_count"
]

FEATURE_CATEGORICAL = [
    "payment_method",
    "subscription_status",
    "failure_category"
]

def train_and_save_models():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    csv_file = os.path.join(data_dir, "synthetic_transactions.csv")
    if os.path.exists(csv_file):
        df = pd.read_csv(csv_file)
    else:
        df = generate_synthetic_transactions(10000, seed=42)
        df.to_csv(csv_file, index=False)

    print(f"Loaded dataset with {len(df)} rows.")

    # 1. Recovery Probability Pipeline
    X = df[FEATURE_NUMERICAL + FEATURE_CATEGORICAL]
    y_rec = df["recovery_outcome"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURE_NUMERICAL),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), FEATURE_CATEGORICAL)
        ]
    )

    rf_base = RandomForestClassifier(n_estimators=120, max_depth=10, random_state=42)
    
    pipeline_prob = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", rf_base)
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y_rec, test_size=0.20, random_state=42, stratify=y_rec)

    pipeline_prob.fit(X_train, y_train)

    train_acc = pipeline_prob.score(X_train, y_train)
    test_acc = pipeline_prob.score(X_test, y_test)
    print(f"[Probability Model] Train Accuracy: {train_acc:.4f} | Test Accuracy: {test_acc:.4f}")

    # 2. Failure Category Classifier
    # Classifies failure category from transaction features + failure_reason text feature
    X_cat_features = df[["payment_method", "amount", "previous_attempts", "failure_reason"]]
    y_cat = df["failure_category"]

    cat_preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), ["amount", "previous_attempts"]),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["payment_method", "failure_reason"])
        ]
    )

    pipeline_cat = Pipeline(steps=[
        ("preprocessor", cat_preprocessor),
        ("classifier", GradientBoostingClassifier(n_estimators=100, random_state=42))
    ])

    Xc_train, Xc_test, yc_train, yc_test = train_test_split(X_cat_features, y_cat, test_size=0.20, random_state=42)
    pipeline_cat.fit(Xc_train, yc_train)
    print(f"[Failure Classifier] Test Accuracy: {pipeline_cat.score(Xc_test, yc_test):.4f}")

    # Save artifact paths
    ml_saved_models = os.path.join(base_dir, "models")
    os.makedirs(ml_saved_models, exist_ok=True)

    backend_saved_models = os.path.join(base_dir, "..", "backend", "app", "ai", "saved_models")
    os.makedirs(backend_saved_models, exist_ok=True)

    prob_path = os.path.join(backend_saved_models, "recovery_probability_model.joblib")
    cat_path = os.path.join(backend_saved_models, "failure_classifier_model.joblib")

    joblib.dump(pipeline_prob, prob_path)
    joblib.dump(pipeline_cat, cat_path)

    # Save duplicate in ml/models
    joblib.dump(pipeline_prob, os.path.join(ml_saved_models, "recovery_probability_model.joblib"))
    joblib.dump(pipeline_cat, os.path.join(ml_saved_models, "failure_classifier_model.joblib"))

    print(f"Models successfully trained & saved to:\n  - {prob_path}\n  - {cat_path}")
    return pipeline_prob, pipeline_cat, X_test, y_test

if __name__ == "__main__":
    train_and_save_models()
