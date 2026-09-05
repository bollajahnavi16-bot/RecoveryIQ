import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, User, CreditCard, Loader2 } from 'lucide-react';
import { fetchTransactionDetail, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import type { TransactionDetail } from '../types';

interface TransactionDrawerProps {
  transactionId: string | null;
  onClose: () => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({ transactionId, onClose }) => {
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [payLoading, setPayLoading] = useState<boolean>(false);
  const [payMessage, setPayMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const loadDetail = (id: string) => {
    setLoading(true);
    fetchTransactionDetail(id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!transactionId) return;
    setPayMessage(null);
    loadDetail(transactionId);
  }, [transactionId]);

  const handleRazorpayRetry = async () => {
    if (!detail) return;
    setPayLoading(true);
    setPayMessage({ type: 'info', text: 'Initializing Razorpay order...' });

    try {
      const order = await createRazorpayOrder(detail.transaction.transaction_id);

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'RecoverIQ Revenue Recovery',
        description: `Retry Payment for TXN ${order.transaction_id}`,
        order_id: order.order_id,
        prefill: {
          name: order.customer_name,
          email: order.customer_email
        },
        theme: {
          color: '#6366f1'
        },
        handler: async (response: any) => {
          try {
            setPayLoading(true);
            setPayMessage({ type: 'info', text: 'Verifying payment signature on backend...' });

            const verification = await verifyRazorpayPayment({
              transaction_id: order.transaction_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            setPayMessage({
              type: 'success',
              text: `Payment verified! Status updated to RECOVERED. Payment ID: ${verification.razorpay_payment_id}`
            });

            // Reload transaction details
            loadDetail(order.transaction_id);
          } catch (verifyErr: any) {
            setPayMessage({
              type: 'error',
              text: verifyErr.message || 'Payment signature verification failed.'
            });
          } finally {
            setPayLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPayLoading(false);
            setPayMessage(null);
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setPayMessage({
          type: 'error',
          text: 'Razorpay SDK script not loaded. Please refresh the page.'
        });
        setPayLoading(false);
      }
    } catch (err: any) {
      setPayMessage({
        type: 'error',
        text: err.message || 'Failed to create Razorpay Order.'
      });
      setPayLoading(false);
    }
  };

  if (!transactionId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Transaction Inspection</span>
            <h2 className="text-lg font-bold text-white font-mono">{transactionId}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !detail ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading transaction intelligence...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Amount</p>
                <p className="text-base font-bold text-white mt-0.5">₹{detail.transaction.amount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Recovery Prob</p>
                <p className="text-base font-bold text-accent-cyan mt-0.5">{Math.round(detail.ai_analysis.recovery_probability * 100)}%</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Expected Value</p>
                <p className="text-base font-bold text-accent-green mt-0.5">₹{detail.decision.expected_recovery_value.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Status</p>
                <span className={`inline-block text-[11px] font-bold font-mono px-2 py-0.5 rounded mt-1 ${
                  detail.transaction.status === 'RECOVERED' ? 'bg-accent-green/10 text-accent-green' : 'bg-slate-800 text-slate-300'
                }`}>
                  {detail.transaction.status}
                </span>
              </div>
            </div>

            {/* Razorpay Test Checkout Retry Section */}
            {detail.transaction.status !== 'RECOVERED' ? (
              <div className="p-4 bg-gradient-to-r from-brand-950/40 to-slate-900 border border-brand-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-brand-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">Razorpay Test Mode Recovery</h4>
                      <p className="text-[11px] text-slate-400">Launch real Razorpay Checkout to retry payment & recover revenue</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRazorpayRetry}
                    disabled={payLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold font-mono rounded-xl transition-all shadow-lg shadow-brand-600/20 shrink-0"
                  >
                    {payLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Retry Payment (Razorpay)</span>
                      </>
                    )}
                  </button>
                </div>

                {payMessage && (
                  <div className={`p-3 rounded-lg text-xs font-mono border ${
                    payMessage.type === 'success'
                      ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                      : payMessage.type === 'error'
                      ? 'bg-accent-rose/10 text-accent-rose border-accent-rose/20'
                      : 'bg-brand-500/10 text-brand-300 border-brand-500/20'
                  }`}>
                    {payMessage.text}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center space-x-2 text-xs font-mono text-accent-green">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Transaction fully recovered (₹{(detail.transaction.recovered_amount || detail.transaction.amount || 0).toLocaleString()} revenue captured).</span>
              </div>

            )}

            {/* Payment & Customer Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  <span>Payment Metadata</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p className="flex justify-between"><span>Method:</span> <strong className="text-slate-200">{detail.transaction.payment_method}</strong></p>
                  <p className="flex justify-between"><span>Failure Reason:</span> <strong className="text-slate-200">{detail.transaction.failure_reason}</strong></p>
                  <p className="flex justify-between"><span>Category:</span> <strong className="text-slate-200">{detail.transaction.failure_category}</strong></p>
                  <p className="flex justify-between"><span>Previous Retries:</span> <strong className="text-slate-200">{detail.transaction.previous_attempts}</strong></p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-accent-purple" />
                  <span>Customer Context</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p className="flex justify-between"><span>Name:</span> <strong className="text-slate-200">{detail.customer.name}</strong></p>
                  <p className="flex justify-between"><span>Historical Success:</span> <strong className="text-accent-green">{Math.round(detail.customer.historical_success_rate * 100)}%</strong></p>
                  <p className="flex justify-between"><span>Total Payments:</span> <strong className="text-slate-200">{detail.customer.total_payments}</strong></p>
                  <p className="flex justify-between"><span>Tenure:</span> <strong className="text-slate-200">{detail.customer.tenure_days} days</strong></p>
                </div>
              </div>
            </div>

            {/* AI Factors */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">AI Decision Explainability Factors:</h4>
              <div className="space-y-2">
                {detail.ai_analysis.key_factors.map((f, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs p-2 bg-slate-900/60 rounded-lg">
                    {f.impact === 'POSITIVE' ? (
                      <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200">{f.factor}: </span>
                      <span className="text-slate-400">{f.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Check Table */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Merchant Guardrail Check:</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  detail.decision.policy_status === 'APPROVED' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-rose/10 text-accent-rose'
                }`}>{detail.decision.policy_status}</span>
              </h4>
              <div className="space-y-1 text-xs">
                {Object.entries(detail.policy_checks).map(([key, val]) => {
                  if (typeof val !== 'object' || !val.rule) return null;
                  return (
                    <div key={key} className="flex items-center justify-between p-2 bg-slate-900/40 rounded">
                      <span className="text-slate-400 font-mono text-[11px]">{val.rule}</span>
                      <span className={`font-bold font-mono text-[10px] ${val.passed ? 'text-accent-green' : 'text-accent-rose'}`}>
                        {val.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Execution Timeline</h4>
              <div className="space-y-3 relative pl-4 border-l border-slate-800">
                {detail.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-slate-900" />
                    <div className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(item.time).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

