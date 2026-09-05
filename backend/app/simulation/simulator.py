import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session

from backend.app.models.models import (
    Transaction, PaymentAttempt, RecoveryAction, RecoveryOutcome, AuditLog
)

class RecoverySimulator:
    """
    Stochastic simulation engine that executes chosen recovery actions,
    generates probabilistic financial outcomes, updates DB records, and logs audit events.
    """

    def execute_simulation(
        self,
        db: Session,
        transaction_id: str,
        decision_id: str,
        action_type: str,
        recovery_prob: float,
        actor: str = "SYSTEM"
    ) -> Dict[str, Any]:
        txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        if not txn:
            return {"status": "ERROR", "message": f"Transaction {transaction_id} not found."}

        # Create RecoveryAction record
        action_id = f"ACT-{uuid.uuid4().hex[:8]}"
        rec_action = RecoveryAction(
            action_id=action_id,
            decision_id=decision_id,
            action_type=action_type,
            status="EXECUTED",
            executed_at=datetime.utcnow(),
            result="PENDING"
        )
        db.add(rec_action)

        # Log action execution audit event
        audit_act = AuditLog(
            log_id=f"LOG-{uuid.uuid4().hex[:8]}",
            transaction_id=transaction_id,
            event_type="ACTION_EXECUTED",
            actor=actor,
            payload={"action_id": action_id, "action_type": action_type, "timestamp": datetime.utcnow().isoformat()},
            status="SUCCESS"
        )
        db.add(audit_act)

        # Determine outcome probabilistically conditioned on action and transaction recovery_probability
        if action_type == "STOP":
            outcome_status = "STOPPED"
            recovered_amount = 0.0
            is_success = False
        elif action_type in ["RETRY_NOW", "RETRY_LATER", "CUSTOMER_NOTIFICATION"]:
            # Action multiplier
            mult = 1.0 if action_type == "RETRY_LATER" else (0.90 if action_type == "CUSTOMER_NOTIFICATION" else 0.80)
            effective_prob = min(0.95, recovery_prob * mult)
            
            is_success = (random.random() < effective_prob)
            if is_success:
                outcome_status = "RECOVERED"
                recovered_amount = txn.amount
            else:
                outcome_status = "NOT_RECOVERED"
                recovered_amount = 0.0
        elif action_type == "HUMAN_REVIEW":
            outcome_status = "HUMAN_REVIEWED"
            recovered_amount = 0.0
            is_success = False
        else:
            outcome_status = "NOT_RECOVERED"
            recovered_amount = 0.0
            is_success = False

        # Update Transaction DB state
        txn.recovery_outcome = outcome_status
        txn.recovered_amount = recovered_amount
        txn.status = "RECOVERED" if is_success else ("FAILED" if outcome_status != "STOPPED" else "STOPPED")
        txn.previous_attempts += 1 if action_type in ["RETRY_NOW", "RETRY_LATER"] else 0

        # Save Attempt record
        attempt = PaymentAttempt(
            attempt_id=f"ATT-{uuid.uuid4().hex[:8]}",
            transaction_id=transaction_id,
            action_taken=action_type,
            status="SUCCESS" if is_success else "FAILURE",
            result=f"Simulated {outcome_status}",
            error_code=None if is_success else "SIMULATED_RECOVERY_DECLINE"
        )
        db.add(attempt)

        # Save RecoveryOutcome record
        net_val = recovered_amount - (5.0 if action_type != "STOP" else 0.0)
        outcome = RecoveryOutcome(
            outcome_id=f"OUT-{uuid.uuid4().hex[:8]}",
            transaction_id=transaction_id,
            action_id=action_id,
            final_status=outcome_status,
            recovered_amount=recovered_amount,
            net_recovered_value=round(net_val, 2),
            recovery_time_seconds=random.randint(10, 1800) if is_success else 0
        )
        db.add(outcome)

        # Log Outcome audit event
        audit_outcome = AuditLog(
            log_id=f"LOG-{uuid.uuid4().hex[:8]}",
            transaction_id=transaction_id,
            event_type="PAYMENT_RECOVERED" if is_success else "RECOVERY_FAILED",
            actor=actor,
            payload={
                "outcome_status": outcome_status,
                "recovered_amount": recovered_amount,
                "net_value": round(net_val, 2)
            },
            status="SUCCESS"
        )
        db.add(audit_outcome)

        db.commit()

        return {
            "transaction_id": transaction_id,
            "action_type": action_type,
            "outcome_status": outcome_status,
            "recovered_amount": recovered_amount,
            "net_recovered_value": round(net_val, 2)
        }

simulator = RecoverySimulator()
