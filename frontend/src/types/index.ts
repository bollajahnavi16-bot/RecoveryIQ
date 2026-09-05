export interface Transaction {
  transaction_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  timestamp: string;
  status: 'FAILED' | 'RECOVERED' | 'STOPPED' | 'PROCESSING';
  failure_reason: string;
  failure_category: 'TEMPORARY' | 'CUSTOMER_ACTION_REQUIRED' | 'PERMANENT' | 'UNKNOWN';
  previous_attempts: number;
  recovery_probability: number;
  expected_recovery_value: number;
  recommended_action: string;
  policy_status: 'APPROVED' | 'REJECTED' | 'REQUIRES_HUMAN';
  recovery_outcome?: string;
  recovered_amount?: number;
}

export interface KPIPayload {
  revenue_at_risk: number;
  recovered_revenue: number;
  unrecovered_revenue: number;
  recovery_rate: number;
  total_transactions: number;
  successful_recoveries: number;
  stopped_recoveries: number;
  human_reviews: number;
  expected_recovery_value: number;
  trend_data: Array<{ date: string; recovered_revenue: number; baseline_revenue: number }>;
  failure_categories: Array<{ category: string; count: number }>;
  action_distribution: Array<{ action: string; count: number }>;
}

export interface KeyFactor {
  factor: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
}

export interface TransactionDetail {
  transaction: Transaction;
  customer: {
    customer_id: string;
    name: string;
    email: string;
    tenure_days: number;
    historical_success_rate: number;
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
  };
  ai_analysis: {
    recovery_probability: number;
    confidence: number;
    failure_category: string;
    key_factors: KeyFactor[];
  };
  decision: {
    recommended_action: string;
    retry_delay_minutes: number;
    expected_recovery_value: number;
    expected_revenue: number;
    intervention_cost: number;
    risk_penalty: number;
    requires_human_review: boolean;
    policy_status: string;
  };
  policy_checks: Record<string, any>;
  attempts: Array<{ attempt_id: string; action: string; status: string; result: string; time: string }>;
  timeline: Array<{ title: string; time: string; status: string; detail: string }>;
  audit_logs: Array<{ log_id: string; event: string; actor: string; time: string; payload: any }>;
}

export interface PolicySettings {
  max_automatic_retries: number;
  min_recovery_probability: number;
  min_confidence: number;
  high_value_threshold: number;
  automatic_notifications_enabled: boolean;
  human_review_enabled: boolean;
}

export interface DemoScenarioResult {
  scenario_id: number;
  transaction_id: string;
  amount: number;
  failure_reason: string;
  recovery_probability: number;
  confidence: number;
  failure_category: string;
  expected_recovery_value: number;
  recommended_action: string;
  policy_status: string;
  policy_checks: Record<string, any>;
  decision_factors: KeyFactor[];
  simulation_result: {
    outcome_status: string;
    recovered_amount: number;
    net_recovered_value?: number;
  };
}
