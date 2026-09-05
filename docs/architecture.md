# RecoverIQ — Architecture & Technical Design Document

## 1. System Context & Overview

**RecoverIQ** is an adaptive AI revenue recovery engine built for the **Razorpay AI Buildathon — AI Revenue Recovery track**.

It replaces static, naive retry rules ("Retry failed payment N times") with an intelligent, multi-layer decision pipeline:

```text
                    PAYMENT EVENTS
                          │
                          ▼
                 EVENT INGESTION & FEATURE EXTRACTOR
                          │
                          ▼
              ┌───────────────────────┐
              │   AI RISK ENGINE      │
              │                       │
              │ Recovery Probability  │
              │ Failure Classification│
              │ Expected Value Calc   │
              └───────────┬───────────┘
                          │
                          ▼
                DECISION ENGINE (Max ERV Action)
                          │
                          ▼
                POLICY GUARDRAILS (Deterministic Merchant Rules)
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
            RETRY      NOTIFY       HUMAN
              │           │           │
              └───────────┼───────────┘
                          ▼
                   OUTCOME SIMULATION ENGINE
                          │
                          ▼
                   SQLITE DB STORAGE & AUDIT LOGS
                          │
                          ▼
                 REACT SaaS MERCHANT DASHBOARD
```

---

## 2. Component Breakdown

### A. Event Ingestion & Feature Engineering Layer (`ml/data_generation/`)
- Ingests raw transaction failure payloads.
- Extracts 11 context features:
  - Financial: `amount`, `payment_method`, `invoice_age_days`
  - Failure: `failure_reason`, `failure_category`, `previous_attempts`
  - Customer: `customer_success_rate`, `customer_tenure_days`, `previous_payment_count`, `previous_successful_payment_count`, `previous_failed_payment_count`

### B. Machine Learning Risk Engine (`backend/app/ai/risk_engine.py`)
- **Model 1: Recovery Probability Model**: Calibrated `RandomForestClassifier` trained on 10,000 synthetic transaction records.
- **Model 2: Failure Classification Model**: `GradientBoostingClassifier` categorizing failures into `TEMPORARY`, `CUSTOMER_ACTION_REQUIRED`, `PERMANENT`, `UNKNOWN`.
- **Explainability**: Extracts key positive & negative factors (e.g. "First attempt failure", "High customer historical success rate (94%)", "Transient gateway disruption").

### C. Decision Engine (`backend/app/ai/decision_engine.py`)
Calculates Expected Recovery Value (ERV) across candidate actions:
$$\text{Expected Recovery Value} = (P(\text{recovery}) \times \text{Amount}) - \text{Intervention Cost} - \text{Risk Penalty}$$

Candidate Actions:
- `RETRY_NOW`
- `RETRY_LATER` (Delay 30-120 mins)
- `CUSTOMER_NOTIFICATION` (Action-required items)
- `HUMAN_REVIEW`
- `STOP` (Permanent failure cutoff)

### D. Deterministic Policy Guardrail Engine (`backend/app/policies/policy_engine.py`)
Merchant-defined rules enforcing safety cutoffs before any action execution:
1. Attempt limit check (`previous_attempts < max_retries`)
2. Permanent failure check (`failure_category != PERMANENT`)
3. Minimum recovery probability check (`prob >= min_probability`)
4. High-value threshold check (`amount < high_value_threshold`) $\rightarrow$ Escalate to Human Review
5. Low confidence check (`confidence >= min_confidence`) $\rightarrow$ Escalate to Human Review

### E. Outcome Simulator (`backend/app/simulation/simulator.py`)
Executes simulated recovery actions probabilistically, updates SQLite database state, and records step-by-step events into `AuditLog`.

### F. Baseline vs RecoverIQ Experimentation Framework (`backend/app/simulation/experiment_engine.py`)
Executes head-to-head A/B experiments on synthetic transaction cohorts comparing:
- **Baseline (Group A)**: Naive retry once strategy
- **RecoverIQ (Group B)**: Adaptive AI + Policy Guardrails + ERV optimization

---

## 3. Database Schema

The SQLite database (`recoveriq.db`) contains 11 tables managed via SQLAlchemy:
- `customers`
- `transactions`
- `payment_attempts`
- `ai_predictions`
- `recovery_decisions`
- `recovery_actions`
- `recovery_outcomes`
- `experiments`
- `experiment_results`
- `audit_logs`
- `policy_settings`
