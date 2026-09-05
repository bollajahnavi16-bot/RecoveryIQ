import pytest
from backend.app.ai.decision_engine import decision_engine

def test_expected_recovery_value_calculation():
    action, delay, erv, exp_rev, cost, penalty, req_human = decision_engine.evaluate_actions(
        amount=2500.0,
        recovery_prob=0.80,
        failure_category="TEMPORARY",
        previous_attempts=0,
        confidence=0.90
    )
    assert action in ["RETRY_LATER", "RETRY_NOW"]
    assert erv > 1500.0 # Expected revenue should be substantial
    assert cost > 0.0

def test_permanent_failure_results_in_stop():
    action, delay, erv, exp_rev, cost, penalty, req_human = decision_engine.evaluate_actions(
        amount=2500.0,
        recovery_prob=0.05,
        failure_category="PERMANENT",
        previous_attempts=1,
        confidence=0.95
    )
    assert action == "STOP"
    assert erv == 0.0
