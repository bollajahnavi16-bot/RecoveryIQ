import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

import random

import uuid
import pandas as pd
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.database import engine, Base, SessionLocal
from backend.app.models.models import Customer, Transaction, AIPrediction, RecoveryDecision, AuditLog, PolicySetting
from backend.app.api.router import router as api_router
from backend.app.ai.risk_engine import risk_engine
from backend.app.ai.decision_engine import decision_engine
from backend.app.policies.policy_engine import policy_engine
from backend.app.simulation.simulator import simulator

from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="RecoverIQ — Adaptive AI Revenue Recovery API",
    version="1.0.0",
    description="Competition-grade AI Revenue Recovery & Decision Engine for Razorpay AI Buildathon"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# Mount docs/images for static graph images
images_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs", "images")
if os.path.exists(images_dir):
    app.mount("/static/images", StaticFiles(directory=images_dir), name="images")


@app.on_event("startup")
def startup_event():
    # Ensure DB tables are created
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database if empty
    db = SessionLocal()
    try:
        count = db.query(Transaction).count()
        if count == 0:
            print("Database empty. Seeding initial transactions from synthetic dataset...")
            seed_database(db)
            print(f"Database successfully seeded with transactions.")
    finally:
        db.close()

def seed_database(db: Session, num_seed: int = 500):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "..", "ml", "data", "synthetic_transactions.csv")
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path).head(num_seed)
    else:
        from ml.data_generation.synthetic_generator import generate_synthetic_transactions
        df = generate_synthetic_transactions(num_seed, seed=42)

    # Seed Policy Settings defaults
    policy_defaults = [
        ("max_automatic_retries", "3", "Maximum automatic retry attempts permitted."),
        ("min_recovery_probability", "0.15", "Minimum AI recovery probability threshold."),
        ("min_confidence", "0.60", "Minimum AI model confidence required for automatic execution."),
        ("high_value_threshold", "10000.0", "Transaction amount threshold triggering mandatory human review."),
        ("automatic_notifications_enabled", "true", "Automatically dispatch customer notifications."),
        ("human_review_enabled", "true", "Enable human-in-the-loop review workflow.")
    ]
    for k, v, desc in policy_defaults:
        if not db.query(PolicySetting).filter(PolicySetting.key == k).first():
            db.add(PolicySetting(setting_id=f"SET-{uuid.uuid4().hex[:6]}", key=k, value=v, description=desc))

    # Pre-create sample customers
    customers_map = {}
    for i in range(1, 101):
        cid = f"CUST-{1000 + i}"
        cust = Customer(
            customer_id=cid,
            name=f"Customer {i}",
            email=f"customer{i}@example.com",
            tenure_days=random.randint(15, 730),
            historical_success_rate=round(random.uniform(0.60, 0.98), 2),
            total_payments=random.randint(5, 30),
            successful_payments=random.randint(4, 28),
            failed_payments=random.randint(0, 4)
        )
        db.add(cust)
        customers_map[cid] = cust

    db.commit()

    # Seed Transactions, AIPredictions, RecoveryDecisions
    policy_settings = {"max_automatic_retries": 3, "min_recovery_probability": 0.15, "min_confidence": 0.60, "high_value_threshold": 10000.0, "human_review_enabled": True}

    for idx, row in df.iterrows():
        txn_id = row["transaction_id"]
        cid = list(customers_map.keys())[idx % len(customers_map)]
        cust = customers_map[cid]

        dt = datetime.fromisoformat(str(row["timestamp"])) if isinstance(row["timestamp"], str) else datetime.utcnow()

        txn = Transaction(
            transaction_id=txn_id,
            customer_id=cid,
            amount=float(row["amount"]),
            currency="INR",
            payment_method=str(row["payment_method"]),
            timestamp=dt,
            status="FAILED",
            failure_reason=str(row["failure_reason"]),
            failure_category=str(row["failure_category"]),
            previous_attempts=int(row["previous_attempts"]),
            subscription_status=str(row["subscription_status"]),
            invoice_age_days=int(row["invoice_age_days"])
        )
        db.add(txn)

        cust_dict = {
            "historical_success_rate": cust.historical_success_rate,
            "tenure_days": cust.tenure_days,
            "total_payments": cust.total_payments,
            "successful_payments": cust.successful_payments,
            "failed_payments": cust.failed_payments
        }

        prob, conf, cat, factors = risk_engine.analyze_transaction(row.to_dict(), cust_dict)
        action, delay, erv, exp_rev, cost, penalty, req_human = decision_engine.evaluate_actions(
            amount=row["amount"],
            recovery_prob=prob,
            failure_category=cat,
            previous_attempts=row["previous_attempts"],
            confidence=conf
        )

        pol_status, checks = policy_engine.evaluate_policy(row.to_dict(), {"recommended_action": action, "recovery_probability": prob, "confidence": conf}, policy_settings)

        pred = AIPrediction(
            prediction_id=f"PRED-{uuid.uuid4().hex[:6]}",
            transaction_id=txn_id,
            recovery_probability=prob,
            confidence=conf,
            failure_category_pred=cat,
            key_factors=factors
        )
        db.add(pred)

        dec = RecoveryDecision(
            decision_id=f"DEC-{uuid.uuid4().hex[:6]}",
            transaction_id=txn_id,
            prediction_id=pred.prediction_id,
            recommended_action=action,
            retry_delay_minutes=delay,
            expected_recovery_value=erv,
            expected_revenue=exp_rev,
            intervention_cost=cost,
            risk_penalty=penalty,
            requires_human_review=req_human or (pol_status == "REQUIRES_HUMAN"),
            policy_status=pol_status,
            decision_factors=factors
        )
        db.add(dec)

        # Simulate outcomes for initial batch
        if idx % 3 == 0 and pol_status == "APPROVED" and action not in ["STOP"]:
            simulator.execute_simulation(db, txn_id, dec.decision_id, action, prob, actor="SYSTEM_SEED")

    db.commit()

@app.get("/")
def root():
    return {
        "app": "RecoverIQ — Adaptive AI Revenue Recovery & Decision Engine",
        "status": "ONLINE",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
