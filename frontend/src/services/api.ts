import type { KPIPayload, Transaction, TransactionDetail, PolicySettings, DemoScenarioResult } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchKPIs(): Promise<KPIPayload> {
  const res = await fetch(`${API_BASE}/dashboard/kpis`);
  if (!res.ok) throw new Error('Failed to fetch dashboard KPIs');
  return res.json();
}

export async function fetchTransactions(params: {
  search?: string;
  status?: string;
  failure_category?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; data: Transaction[] }> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.failure_category) query.append('failure_category', params.failure_category);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionDetail(txnId: string): Promise<TransactionDetail> {
  const res = await fetch(`${API_BASE}/transactions/${txnId}`);
  if (!res.ok) throw new Error(`Failed to fetch transaction detail for ${txnId}`);
  return res.json();
}

export async function fetchRecoveryQueue(): Promise<{
  auto_approved_count: number;
  human_review_count: number;
  auto_queue: any[];
  human_queue: any[];
}> {
  const res = await fetch(`${API_BASE}/recovery-queue`);
  if (!res.ok) throw new Error('Failed to fetch recovery queue');
  return res.json();
}

export async function approveRecoveryAction(transaction_id: string, action_type?: string) {
  const res = await fetch(`${API_BASE}/recovery/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id, action_type })
  });
  if (!res.ok) throw new Error('Failed to approve action');
  return res.json();
}

export async function rejectRecoveryAction(transaction_id: string, override_reason?: string) {
  const res = await fetch(`${API_BASE}/recovery/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id, override_reason })
  });
  if (!res.ok) throw new Error('Failed to reject action');
  return res.json();
}

export async function fetchExperiments() {
  const res = await fetch(`${API_BASE}/experiments`);
  if (!res.ok) throw new Error('Failed to fetch experiments');
  return res.json();
}

export async function runExperiment(cohort_size: number = 2000) {
  const res = await fetch(`${API_BASE}/experiments/run?cohort_size=${cohort_size}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run experiment');
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchEvaluationCharts() {
  const res = await fetch(`${API_BASE}/charts`);
  if (!res.ok) throw new Error('Failed to fetch evaluation charts');
  return res.json();
}


export async function fetchAuditLogs(limit: number = 50) {
  const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchSettings(): Promise<PolicySettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: PolicySettings): Promise<PolicySettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function runDemoScenario(scenarioId: number): Promise<DemoScenarioResult> {
  const res = await fetch(`${API_BASE}/demo/run-scenario/${scenarioId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to execute scenario ${scenarioId}`);
  return res.json();
}

export async function queryAssistant(query: string) {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to query assistant');
  return res.json();
}

export async function generateRecoveryMessage(transaction_id: string, language: string) {
  const res = await fetch(`${API_BASE}/assistant/generate-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id, language })
  });
  if (!res.ok) throw new Error('Failed to generate recovery message');
  return res.json();
}

export async function createRazorpayOrder(transaction_id: string): Promise<{
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  transaction_id: string;
  customer_name: string;
  customer_email: string;
}> {
  const res = await fetch(`${API_BASE}/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to create Razorpay order' }));
    throw new Error(errorData.detail || 'Failed to create Razorpay order');
  }
  return res.json();
}

export async function verifyRazorpayPayment(payload: {
  transaction_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await fetch(`${API_BASE}/razorpay/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Razorpay payment verification failed' }));
    throw new Error(errorData.detail || 'Razorpay payment verification failed');
  }
  return res.json();
}

