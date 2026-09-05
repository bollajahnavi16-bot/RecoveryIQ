import pytest
from backend.app.policies.policy_engine import policy_engine

def test_permanent_failure_blocked():
    txn = {"amount": 2500.0, "previous_attempts": 0, "failure_category": "PERMANENT"}
    rec = {"recommended_action": "RETRY_LATER", "recovery_probability": 0.05, "confidence": 0.90}
    settings = {"max_automatic_retries": 3, "min_recovery_probability": 0.15, "min_confidence": 0.60, "high_value_threshold": 10000.0}
    
    status, checks = policy_engine.evaluate_policy(txn, rec, settings)
    assert status == "REJECTED"
    assert checks["permanent_failure_check"]["passed"] is False

def test_exceeded_max_retries_blocked():
    txn = {"amount": 2500.0, "previous_attempts": 3, "failure_category": "TEMPORARY"}
    rec = {"recommended_action": "RETRY_LATER", "recovery_probability": 0.75, "confidence": 0.85}
    settings = {"max_automatic_retries": 3, "min_recovery_probability": 0.15, "min_confidence": 0.60, "high_value_threshold": 10000.0}
    
    status, checks = policy_engine.evaluate_policy(txn, rec, settings)
    assert status == "REJECTED"
    assert checks["retry_limit_check"]["passed"] is False

def test_high_value_transaction_triggers_human_review():
    txn = {"amount": 15000.0, "previous_attempts": 0, "failure_category": "TEMPORARY"}
    rec = {"recommended_action": "RETRY_LATER", "recovery_probability": 0.85, "confidence": 0.90}
    settings = {"max_automatic_retries": 3, "min_recovery_probability": 0.15, "min_confidence": 0.60, "high_value_threshold": 10000.0, "human_review_enabled": True}
    
    status, checks = policy_engine.evaluate_policy(txn, rec, settings)
    assert status == "REQUIRES_HUMAN"
    assert checks["high_value_threshold_check"]["passed"] is False

def test_normal_temporary_approved():
    txn = {"amount": 2500.0, "previous_attempts": 0, "failure_category": "TEMPORARY"}
    rec = {"recommended_action": "RETRY_LATER", "recovery_probability": 0.85, "confidence": 0.90}
    settings = {"max_automatic_retries": 3, "min_recovery_probability": 0.15, "min_confidence": 0.60, "high_value_threshold": 10000.0}
    
    status, checks = policy_engine.evaluate_policy(txn, rec, settings)
    assert status == "APPROVED"
