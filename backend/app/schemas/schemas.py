from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class CustomerSchema(BaseModel):
    customer_id: str
    name: str
    email: str
    tenure_days: int
    historical_success_rate: float
    total_payments: int
    successful_payments: int
    failed_payments: int

    class Config:
        from_attributes = True

class TransactionSchema(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    currency: str
    payment_method: str
    timestamp: datetime
    status: str
    failure_reason: str
    failure_category: str
    previous_attempts: int
    subscription_status: str
    invoice_age_days: int
    recovery_outcome: Optional[str] = None
    recovered_amount: Optional[float] = 0.0

    class Config:
        from_attributes = True

class KeyFactorSchema(BaseModel):
    factor: str
    impact: str # POSITIVE, NEGATIVE, NEUTRAL
    description: str

class DecisionObjectSchema(BaseModel):
    transaction_id: str
    recovery_probability: float
    confidence: float
    failure_category: str
    recommended_action: str
    retry_delay_minutes: int
    expected_recovery_value: float
    expected_revenue: float
    intervention_cost: float
    risk_penalty: float
    requires_human_review: bool
    policy_status: str
    decision_factors: List[KeyFactorSchema]
    policy_checks: Dict[str, Any]

class RecoveryActionRequest(BaseModel):
    transaction_id: str
    action_type: Optional[str] = None
    override_reason: Optional[str] = None

class PolicySettingUpdate(BaseModel):
    max_automatic_retries: int = Field(default=3, ge=1, le=10)
    min_recovery_probability: float = Field(default=0.15, ge=0.0, le=1.0)
    min_confidence: float = Field(default=0.60, ge=0.0, le=1.0)
    high_value_threshold: float = Field(default=10000.0, ge=500.0)
    automatic_notifications_enabled: bool = True
    human_review_enabled: bool = True

class NLQueryRequest(BaseModel):
    query: str

class RecoveryMessageRequest(BaseModel):
    transaction_id: str
    language: str = "English" # English or Hinglish
    custom_context: Optional[str] = None

class RazorpayCreateOrderRequest(BaseModel):
    transaction_id: str

class RazorpayVerifyPaymentRequest(BaseModel):
    transaction_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

