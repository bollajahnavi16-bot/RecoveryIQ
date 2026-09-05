import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_transactions(num_records: int = 10000, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic synthetic payment failure dataset for RecoverIQ model training.
    
    Features built with realistic correlations:
    - Temporary failures: high base recovery probability (60-90%)
    - Permanent failures: low recovery probability (1-5%)
    - High customer success rate & tenure: higher recovery probability
    - Repeat failures & high invoice age: decaying recovery probability
    """
    np.random.seed(seed)
    random.seed(seed)

    payment_methods = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "NACH_EMANDATE"]
    failure_reasons = {
        "TEMPORARY": ["GATEWAY_TIMEOUT", "NETWORK_INTERRUPT", "BANK_SERVER_DOWN", "PROCESSING_DELAY"],
        "CUSTOMER_ACTION_REQUIRED": ["AUTHENTICATION_FAILED", "INSUFFICIENT_FUNDS", "OTP_EXPIRED", "CARD_LIMIT_EXCEEDED"],
        "PERMANENT": ["INVALID_ACCOUNT", "BLOCKED_CARD", "ACCOUNT_CLOSED", "EXPIRED_CARD_PERMANENT"],
        "UNKNOWN": ["GENERIC_DECLINE", "UNHANDLED_ERROR_CODE"]
    }

    category_weights = [0.45, 0.35, 0.15, 0.05]
    categories = ["TEMPORARY", "CUSTOMER_ACTION_REQUIRED", "PERMANENT", "UNKNOWN"]

    data = []
    base_time = datetime(2026, 8, 1, 10, 0, 0)

    for i in range(1, num_records + 1):
        txn_id = f"TXN-{10000 + i}"
        customer_id = f"CUST-{random.randint(1000, 4000)}"
        
        # Payment amount distribution (skewed towards ₹500 - ₹15,000)
        amount = float(round(np.random.exponential(scale=2500) + 199, 2))

        # Failure category based on defined probability weights
        cat = np.random.choice(categories, p=category_weights)
        failure_reason = random.choice(failure_reasons[cat])
        payment_method = random.choice(payment_methods)

        # Context features
        previous_attempts = int(np.random.choice([0, 1, 2, 3, 4], p=[0.55, 0.25, 0.12, 0.05, 0.03]))
        customer_tenure_days = int(np.random.randint(1, 1200))
        previous_payment_count = int(np.random.poisson(lam=12))
        
        if previous_payment_count > 0:
            succ_ratio = np.random.beta(a=8, b=2) # overall high success rate for existing users
            previous_successful_payment_count = int(round(succ_ratio * previous_payment_count))
            previous_failed_payment_count = previous_payment_count - previous_successful_payment_count
            customer_success_rate = round(previous_successful_payment_count / previous_payment_count, 4)
        else:
            previous_successful_payment_count = 0
            previous_failed_payment_count = 0
            customer_success_rate = 0.50

        subscription_status = random.choice(["ACTIVE", "INACTIVE", "NONE"])
        invoice_age_days = int(np.random.exponential(scale=5)) if subscription_status != "NONE" else 0

        # Calculate true hidden latent recovery probability (ground truth formula with noise)
        base_p = 0.50
        if cat == "TEMPORARY":
            base_p += 0.35
        elif cat == "CUSTOMER_ACTION_REQUIRED":
            base_p += 0.10
        elif cat == "PERMANENT":
            base_p -= 0.45
        elif cat == "UNKNOWN":
            base_p -= 0.15

        # Penalties and boosts
        base_p -= (previous_attempts * 0.18)
        base_p += (customer_success_rate - 0.50) * 0.30
        if subscription_status == "ACTIVE":
            base_p += 0.08
        if invoice_age_days > 14:
            base_p -= 0.15
        if payment_method in ["UPI", "CREDIT_CARD"]:
            base_p += 0.05

        # Add realistic noise (-0.10 to +0.10)
        latent_prob = np.clip(base_p + np.random.normal(0, 0.08), 0.01, 0.98)

        # Determine binary ground truth recovery outcome
        recovery_outcome = 1 if np.random.rand() < latent_prob else 0
        recovered_amount = amount if recovery_outcome == 1 else 0.0

        # Random timestamp over the past 30 days
        timestamp = base_time + timedelta(seconds=random.randint(0, 30 * 86400))

        data.append({
            "transaction_id": txn_id,
            "customer_id": customer_id,
            "amount": amount,
            "currency": "INR",
            "payment_method": payment_method,
            "timestamp": timestamp.isoformat(),
            "status": "FAILED",
            "failure_reason": failure_reason,
            "failure_category": cat,
            "previous_attempts": previous_attempts,
            "customer_success_rate": customer_success_rate,
            "customer_tenure_days": customer_tenure_days,
            "subscription_status": subscription_status,
            "invoice_age_days": invoice_age_days,
            "previous_payment_count": previous_payment_count,
            "previous_successful_payment_count": previous_successful_payment_count,
            "previous_failed_payment_count": previous_failed_payment_count,
            "latent_recovery_prob": round(float(latent_prob), 4),
            "recovery_outcome": recovery_outcome,
            "recovered_amount": recovered_amount
        })

    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    df = generate_synthetic_transactions(10000, seed=42)
    out_file = os.path.join(out_dir, "synthetic_transactions.csv")
    df.to_csv(out_file, index=False)
    print(f"Successfully generated {len(df)} synthetic transactions at: {out_file}")
