from typing import Dict, Any, List, Tuple

class DecisionEngine:
    """
    Selects the safest and highest-value recovery action using Expected Recovery Value (ERV):
    
    Expected Recovery Value = (Recovery Probability * Amount) - Intervention Cost - Risk Penalty
    """
    
    ACTION_COSTS = {
        "RETRY_NOW": 5.0,
        "RETRY_LATER": 5.0,
        "CUSTOMER_NOTIFICATION": 2.0,
        "HUMAN_REVIEW": 50.0,
        "STOP": 0.0
    }

    ACTION_RISK_PENALTIES = {
        "RETRY_NOW": 25.0,           # Risk of immediate duplicate failure or bank throttle
        "RETRY_LATER": 10.0,         # Optimal timing penalty lower
        "CUSTOMER_NOTIFICATION": 15.0,# Customer contact noise
        "HUMAN_REVIEW": 5.0,         # Human overhead
        "STOP": 0.0
    }

    def evaluate_actions(
        self,
        amount: float,
        recovery_prob: float,
        failure_category: str,
        previous_attempts: int,
        confidence: float
    ) -> Tuple[str, int, float, float, float, float, bool]:
        """
        Evaluates candidate actions and picks the action maximizing ERV while adhering to strategy constraints.
        Returns:
        (recommended_action, retry_delay_minutes, max_erv, expected_revenue, cost, risk_penalty, requires_human)
        """
        candidate_actions = ["RETRY_NOW", "RETRY_LATER", "CUSTOMER_NOTIFICATION", "HUMAN_REVIEW", "STOP"]
        
        best_action = "STOP"
        best_erv = -999999.0
        best_rev = 0.0
        best_cost = 0.0
        best_penalty = 0.0
        best_delay = 0

        # Adjust action probabilities based on failure category
        prob_multipliers = {
            "RETRY_NOW": 0.85 if failure_category == "TEMPORARY" else 0.20,
            "RETRY_LATER": 1.00 if failure_category == "TEMPORARY" else 0.40,
            "CUSTOMER_NOTIFICATION": 0.95 if failure_category == "CUSTOMER_ACTION_REQUIRED" else 0.30,
            "HUMAN_REVIEW": 0.70,
            "STOP": 0.0
        }

        if failure_category == "PERMANENT":
            # Permanent failures have near-zero recovery chance regardless of retry
            return "STOP", 0, 0.0, 0.0, 0.0, 0.0, False

        for action in candidate_actions:
            if action == "STOP":
                erv = 0.0
                exp_rev = 0.0
                cost = 0.0
                penalty = 0.0
                delay = 0
            else:
                effective_prob = min(0.98, max(0.01, recovery_prob * prob_multipliers[action]))
                exp_rev = effective_prob * amount
                cost = self.ACTION_COSTS[action]
                penalty = self.ACTION_RISK_PENALTIES[action] + (previous_attempts * 15.0)
                erv = exp_rev - cost - penalty
                
                if action == "RETRY_LATER":
                    delay = 30 if previous_attempts == 0 else 120
                elif action == "RETRY_NOW":
                    delay = 0
                elif action == "CUSTOMER_NOTIFICATION":
                    delay = 15
                else:
                    delay = 0

            if erv > best_erv:
                best_erv = erv
                best_action = action
                best_rev = exp_rev
                best_cost = cost
                best_penalty = penalty
                best_delay = delay

        # If ERV <= 0, defaulting to STOP is safer
        if best_erv <= 0.0 and best_action != "STOP":
            best_action = "STOP"
            best_erv = 0.0
            best_rev = 0.0
            best_cost = 0.0
            best_penalty = 0.0
            best_delay = 0

        requires_human = (best_action == "HUMAN_REVIEW")

        return (
            best_action,
            best_delay,
            round(best_erv, 2),
            round(best_rev, 2),
            round(best_cost, 2),
            round(best_penalty, 2),
            requires_human
        )

decision_engine = DecisionEngine()
