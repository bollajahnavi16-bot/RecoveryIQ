from typing import Dict, Any, Tuple, List

class PolicyEngine:
    """
    Deterministic Guardrail System enforcing merchant policy rules.
    AI recommends, Policy Engine decides whether execution is permitted.
    """

    def evaluate_policy(
        self,
        transaction: Dict[str, Any],
        ai_recommendation: Dict[str, Any],
        policy_settings: Dict[str, Any]
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Evaluates merchant rules step-by-step.
        Returns (policy_status, policy_checks_dict)
        policy_status: 'APPROVED' | 'REJECTED' | 'REQUIRES_HUMAN'
        """
        max_retries = int(policy_settings.get("max_automatic_retries", 3))
        min_prob = float(policy_settings.get("min_recovery_probability", 0.15))
        min_conf = float(policy_settings.get("min_confidence", 0.60))
        high_val = float(policy_settings.get("high_value_threshold", 10000.0))
        human_enabled = bool(policy_settings.get("human_review_enabled", True))

        prev_attempts = int(transaction.get("previous_attempts", 0))
        cat = str(transaction.get("failure_category", "TEMPORARY"))
        amount = float(transaction.get("amount", 0.0))
        
        prob = float(ai_recommendation.get("recovery_probability", 0.0))
        conf = float(ai_recommendation.get("confidence", 0.0))
        action = str(ai_recommendation.get("recommended_action", "STOP"))

        checks = {
            "retry_limit_check": {"rule": f"Attempts < {max_retries}", "passed": prev_attempts < max_retries},
            "permanent_failure_check": {"rule": "Category != PERMANENT", "passed": cat != "PERMANENT"},
            "confidence_threshold_check": {"rule": f"Confidence >= {min_conf:.2f}", "passed": conf >= min_conf},
            "probability_threshold_check": {"rule": f"Recovery Prob >= {min_prob:.2f}", "passed": prob >= min_prob},
            "high_value_threshold_check": {"rule": f"Amount < ₹{high_val:,.2f}", "passed": amount < high_val}
        }

        # Rule 1: STOP if recommendation is STOP
        if action == "STOP":
            return "REJECTED", checks

        # Rule 2: Exceeded max retries -> STOP
        if not checks["retry_limit_check"]["passed"]:
            checks["override_reason"] = f"Exceeded maximum automatic retries limit ({max_retries})."
            return "REJECTED", checks

        # Rule 3: Permanent failure -> STOP
        if not checks["permanent_failure_check"]["passed"]:
            checks["override_reason"] = "Permanent account or payment instrument failure detected."
            return "REJECTED", checks

        # Rule 4: Probability below minimum merchant threshold -> STOP
        if not checks["probability_threshold_check"]["passed"]:
            checks["override_reason"] = f"Recovery probability ({prob:.2f}) below threshold ({min_prob:.2f})."
            return "REJECTED", checks

        # Rule 5: High transaction value -> REQUIRE HUMAN REVIEW
        if not checks["high_value_threshold_check"]["passed"] and human_enabled:
            checks["override_reason"] = f"Transaction amount (₹{amount:,.2f}) exceeds high-value threshold (₹{high_val:,.2f})."
            return "REQUIRES_HUMAN", checks

        # Rule 6: Low model confidence -> REQUIRE HUMAN REVIEW
        if not checks["confidence_threshold_check"]["passed"] and human_enabled:
            checks["override_reason"] = f"Model confidence ({conf:.2f}) below required threshold ({min_conf:.2f})."
            return "REQUIRES_HUMAN", checks

        # All checks passed
        return "APPROVED", checks

policy_engine = PolicyEngine()
