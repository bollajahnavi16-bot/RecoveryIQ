import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle2, XCircle, RefreshCw, UserCheck } from 'lucide-react';
import { fetchRecoveryQueue, approveRecoveryAction, rejectRecoveryAction } from '../services/api';

export const RecoveryQueuePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'auto' | 'human'>('human');
  const [queue, setQueue] = useState<{ auto_approved_count: number; human_review_count: number; auto_queue: any[]; human_queue: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadQueue = () => {
    setLoading(true);
    fetchRecoveryQueue()
      .then(setQueue)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (txnId: string, actionType: string) => {
    try {
      const res = await approveRecoveryAction(txnId, actionType);
      setActionMessage(`Approved ${txnId}: Outcome ${res.outcome_status} (₹${res.recovered_amount})`);
      loadQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (txnId: string) => {
    try {
      await rejectRecoveryAction(txnId, "Operator rejected human review task.");
      setActionMessage(`Stopped ${txnId} successfully.`);
      loadQueue();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !queue) {
    return <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading recovery queue...</div>;
  }

  const items = activeTab === 'human' ? queue.human_queue : queue.auto_queue;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-accent-purple/20 text-accent-purple rounded-xl border border-accent-purple/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Recovery Queue & Human-in-the-Loop</h1>
            <p className="text-xs text-slate-400">Manage AI recommendations requiring operator validation</p>
          </div>
        </div>

        <button onClick={loadQueue} className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center space-x-1 font-mono">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-xl text-xs font-mono flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('human')}
          className={`px-5 py-3 font-mono text-xs font-bold border-b-2 flex items-center space-x-2 ${
            activeTab === 'human' ? 'border-accent-amber text-accent-amber bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Human Review Queue ({queue.human_review_count})</span>
        </button>

        <button
          onClick={() => setActiveTab('auto')}
          className={`px-5 py-3 font-mono text-xs font-bold border-b-2 flex items-center space-x-2 ${
            activeTab === 'auto' ? 'border-accent-green text-accent-green bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Auto Approved Actions ({queue.auto_approved_count})</span>
        </button>
      </div>

      {/* Queue List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Queue empty for this category.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <div key={item.decision_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white text-sm">{item.transaction_id}</span>
                    <span className="text-xs font-mono text-slate-400">₹{item.amount.toLocaleString()} ({item.payment_method})</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      item.policy_status === 'REQUIRES_HUMAN' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-accent-green/10 text-accent-green'
                    }`}>
                      {item.policy_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Failure: <strong>{item.failure_reason}</strong> ({item.failure_category})
                  </p>
                  <p className="text-xs font-mono text-slate-300">
                    Recommended Action: <strong className="text-brand-400">{item.recommended_action}</strong> | ERV: <strong className="text-accent-green">₹{item.expected_recovery_value}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApprove(item.transaction_id, item.recommended_action)}
                    className="px-3.5 py-2 bg-accent-green hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Execute</span>
                  </button>
                  <button
                    onClick={() => handleReject(item.transaction_id)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-accent-rose font-medium text-xs rounded-xl flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject / Stop</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
