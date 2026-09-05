import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, ShieldX, RefreshCw, Eye } from 'lucide-react';
import { runDemoScenario } from '../services/api';
import type { DemoScenarioResult } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: (txnId: string) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onSelectTransaction }) => {
  const [selectedScenario, setSelectedScenario] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DemoScenarioResult | null>(null);

  if (!isOpen) return null;

  const handleRun = async (scenarioId: number) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    setResult(null);
    try {
      const res = await runDemoScenario(scenarioId);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-600 to-accent-purple flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-mono">90-Second Competition Demo</h3>
              <p className="text-xs text-slate-400">Pre-configured synthetic scenarios demonstrating RecoverIQ decisioning</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scenario Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleRun(1)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === 1
                  ? 'bg-brand-600/10 border-brand-500/50 shadow-md shadow-brand-500/10'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-accent-green">SCENARIO A</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-green/10 text-accent-green font-medium">Auto Recovered</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Temporary Timeout Failure</h4>
              <p className="text-[11px] text-slate-400 mt-1">₹4,999 UPI payment failure. High recovery probability (87%).</p>
            </button>

            <button
              onClick={() => handleRun(2)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === 2
                  ? 'bg-accent-rose/10 border-accent-rose/50 shadow-md shadow-accent-rose/10'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-accent-rose">SCENARIO B</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-rose/10 text-accent-rose font-medium">Policy STOP</span>
              </div>
              <h4 className="text-xs font-semibold text-white">Permanent Account Failure</h4>
              <p className="text-[11px] text-slate-400 mt-1">₹1,200 Debit card failure. 3 prior attempts. AI stops retries.</p>
            </button>

            <button
              onClick={() => handleRun(3)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === 3
                  ? 'bg-accent-amber/10 border-accent-amber/50 shadow-md shadow-accent-amber/10'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-accent-amber">SCENARIO C</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber font-medium">Human Review</span>
              </div>
              <h4 className="text-xs font-semibold text-white">High Value Guardrail</h4>
              <p className="text-[11px] text-slate-400 mt-1">₹25,000 Credit card payment exceeding merchant limit.</p>
            </button>
          </div>

          {/* Workflow Stepper / Results */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Running AI Pipeline & Policy Validation...</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-mono text-slate-400">Transaction ID: <strong className="text-white">{result.transaction_id}</strong></span>
                <button
                  onClick={() => {
                    onClose();
                    onSelectTransaction(result.transaction_id);
                  }}
                  className="flex items-center space-x-1 text-xs text-brand-500 hover:text-brand-400"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Audit Trail</span>
                </button>
              </div>

              {/* Execution Flow Diagram */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-mono">Recovery Prob</p>
                  <p className="text-sm font-bold text-accent-cyan mt-1">{intPct(result.recovery_probability)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-mono">Expected Value</p>
                  <p className="text-sm font-bold text-accent-green mt-1">₹{result.expected_recovery_value.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-mono">AI Action</p>
                  <p className="text-xs font-bold text-brand-400 mt-1 font-mono">{result.recommended_action}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-mono">Policy Status</p>
                  <p className={`text-xs font-bold mt-1 font-mono ${
                    result.policy_status === 'APPROVED' ? 'text-accent-green' : (result.policy_status === 'REJECTED' ? 'text-accent-rose' : 'text-accent-amber')
                  }`}>{result.policy_status}</p>
                </div>
              </div>

              {/* Factors */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">Key Decision Factors:</p>
                <div className="space-y-1.5">
                  {result.decision_factors.map((f, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs">
                      {f.impact === 'POSITIVE' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
                      )}
                      <span className="text-slate-300"><strong>{f.factor}:</strong> {f.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Outcome Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                result.simulation_result.outcome_status === 'RECOVERED'
                  ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                  : (result.simulation_result.outcome_status === 'STOPPED' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber')
              }`}>
                <div className="flex items-center space-x-3">
                  {result.simulation_result.outcome_status === 'RECOVERED' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <ShieldX className="w-5 h-5" />
                  )}
                  <div>
                    <h5 className="text-xs font-bold font-mono">OUTCOME: {result.simulation_result.outcome_status}</h5>
                    <p className="text-[11px] opacity-90">
                      {result.simulation_result.outcome_status === 'RECOVERED'
                        ? `Recovered ₹${result.simulation_result.recovered_amount.toLocaleString()} revenue successfully.`
                        : (result.simulation_result.outcome_status === 'STOPPED' ? 'AI stopped retries to prevent unnecessary bank penalties.' : 'Escalated to merchant queue for manual authorization.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function intPct(val: number) {
  return Math.round(val * 100);
}
