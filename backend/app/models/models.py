from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    tenure_days = Column(Integer, default=30)
    historical_success_rate = Column(Float, default=0.85)
    total_payments = Column(Integer, default=1)
    successful_payments = Column(Integer, default=1)
    failed_payments = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="customer")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_method = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="FAILED") # FAILED, RECOVERED, UNRECOVERED, PROCESSING
    failure_reason = Column(String, nullable=False)
    failure_category = Column(String, nullable=False) # TEMPORARY, CUSTOMER_ACTION_REQUIRED, PERMANENT, UNKNOWN
    previous_attempts = Column(Integer, default=0)
    subscription_status = Column(String, default="NONE") # ACTIVE, INACTIVE, NONE
    invoice_age_days = Column(Integer, default=0)
    recovery_outcome = Column(String, nullable=True) # RECOVERED, NOT_RECOVERED, STOPPED, REQUIRES_HUMAN
    recovered_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")
    predictions = relationship("AIPrediction", back_populates="transaction")
    decisions = relationship("RecoveryDecision", back_populates="transaction")
    attempts = relationship("PaymentAttempt", back_populates="transaction")
    outcomes = relationship("RecoveryOutcome", back_populates="transaction")
    audit_logs = relationship("AuditLog", back_populates="transaction")


class PaymentAttempt(Base):
    __tablename__ = "payment_attempts"

    attempt_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action_taken = Column(String, nullable=False) # RETRY_NOW, RETRY_LATER, CUSTOMER_NOTIFICATION, HUMAN_REVIEW, STOP
    status = Column(String, nullable=False) # SUCCESS, FAILURE, PENDING
    result = Column(String, nullable=True)
    error_code = Column(String, nullable=True)

    transaction = relationship("Transaction", back_populates="attempts")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    prediction_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=False)
    recovery_probability = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    failure_category_pred = Column(String, nullable=False)
    key_factors = Column(JSON, nullable=True) # List of key positive & negative factors
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="predictions")
    decisions = relationship("RecoveryDecision", back_populates="prediction")


class RecoveryDecision(Base):
    __tablename__ = "recovery_decisions"

    decision_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=False)
    prediction_id = Column(String, ForeignKey("ai_predictions.prediction_id"), nullable=False)
    recommended_action = Column(String, nullable=False) # RETRY_NOW, RETRY_LATER, CUSTOMER_NOTIFICATION, HUMAN_REVIEW, STOP
    retry_delay_minutes = Column(Integer, default=0)
    expected_recovery_value = Column(Float, nullable=False)
    expected_revenue = Column(Float, nullable=False)
    intervention_cost = Column(Float, default=5.0)
    risk_penalty = Column(Float, default=10.0)
    requires_human_review = Column(Boolean, default=False)
    policy_status = Column(String, default="APPROVED") # APPROVED, REJECTED, REQUIRES_HUMAN
    decision_factors = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="decisions")
    prediction = relationship("AIPrediction", back_populates="decisions")
    actions = relationship("RecoveryAction", back_populates="decision")


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    action_id = Column(String, primary_key=True, index=True)
    decision_id = Column(String, ForeignKey("recovery_decisions.decision_id"), nullable=False)
    action_type = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, EXECUTED, REJECTED, CANCELLED
    executed_at = Column(DateTime, nullable=True)
    result = Column(String, nullable=True)

    decision = relationship("RecoveryDecision", back_populates="actions")


class RecoveryOutcome(Base):
    __tablename__ = "recovery_outcomes"

    outcome_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=False)
    action_id = Column(String, ForeignKey("recovery_actions.action_id"), nullable=True)
    final_status = Column(String, nullable=False) # RECOVERED, NOT_RECOVERED, STOPPED, HUMAN_REVIEWED
    recovered_amount = Column(Float, default=0.0)
    net_recovered_value = Column(Float, default=0.0)
    recovery_time_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="outcomes")


class Experiment(Base):
    __tablename__ = "experiments"

    experiment_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="ACTIVE") # ACTIVE, COMPLETED
    baseline_strategy = Column(String, default="Naive Rule-Based Retry")
    treatment_strategy = Column(String, default="RecoverIQ AI Decision Engine")
    cohort_size = Column(Integer, default=5000)
    created_at = Column(DateTime, default=datetime.utcnow)

    results = relationship("ExperimentResult", back_populates="experiment")


class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    result_id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.experiment_id"), nullable=False)
    strategy_name = Column(String, nullable=False) # BASELINE vs RECOVERIQ
    total_transactions = Column(Integer, nullable=False)
    total_attempts = Column(Integer, nullable=False)
    total_recovered = Column(Integer, nullable=False)
    recovery_rate = Column(Float, nullable=False)
    total_recovered_revenue = Column(Float, nullable=False)
    unnecessary_retries = Column(Integer, nullable=False)
    human_escalations = Column(Integer, nullable=False)
    avg_recovery_time_min = Column(Float, default=0.0)
    net_expected_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="results")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=True)
    event_type = Column(String, nullable=False) # PAYMENT_FAILED, AI_ANALYSIS, DECISION_CREATED, POLICY_CHECK, ACTION_APPROVED, RECOVERY_EXECUTED, PAYMENT_RECOVERED, HUMAN_OVERRIDE
    actor = Column(String, default="SYSTEM") # SYSTEM, AI_ENGINE, POLICY_GUARDRAIL, HUMAN_OPERATOR
    timestamp = Column(DateTime, default=datetime.utcnow)
    payload = Column(JSON, nullable=True)
    status = Column(String, default="SUCCESS")

    transaction = relationship("Transaction", back_populates="audit_logs")


class PolicySetting(Base):
    __tablename__ = "policy_settings"

    setting_id = Column(String, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
