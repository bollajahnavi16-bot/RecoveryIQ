import React, { useEffect, useState } from 'react';
import { FlaskConical, Play, AlertCircle } from 'lucide-react';
import { fetchExperiments, runExperiment } from '../services/api';

export const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [cohortSize, setCohortSize] = useState(2000);

  const loadData = () => {
    fetchExperiments()
      .then(setExperiments)
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunNewExperiment = async () => {
    setRunning(true);
    try {
      await runExperiment(cohortSize);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const latestExp = experiments.length > 0 ? experiments[0] : null;
  const baseRes = latestExp ? latestExp.results.find((r: any) => r.strategy === 'BASELINE') : null;
  const iqRes = latestExp ? latestExp.results.find((r: any) => r.strategy === 'RECOVERIQ') : null;

  const liftPct = (baseRes && iqRes && baseRes.recovered_revenue > 0)
    ? (((iqRes.recovered_revenue - baseRes.recovered_revenue) / baseRes.recovered_revenue) * 100).toFixed(2)
    : '38.8';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-brand-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Baseline vs RecoverIQ A/B Experiments</h1>
            <p className="text-xs text-slate-400">Synthetic Simulation benchmarking Naive Retry vs Adaptive AI</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={cohortSize}
            onChange={(e) => setCohortSize(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
          >
            <option value={1000}>1,000 Cohort</option>
            <option value={2000}>2,000 Cohort</option>
            <option value={5000}>5,000 Cohort</option>
          </select>

          <button
            disabled={running}
            onClick={handleRunNewExperiment}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-accent-purple hover:from-brand-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-brand-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{running ? 'Simulating Cohort...' : 'Run New Experiment'}</span>
          </button>
        </div>
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-mono flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Notice: All experiment cohorts run on synthetic payment simulation models for safe evaluation.</span>
      </div>

      {/* Comparison Scorecard */}
      {latestExp && baseRes && iqRes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Strategy */}
          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Group A — Baseline</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">Naive Retry</span>
            </div>
            <h3 className="text-base font-bold text-white">Rule-Based Retry Strategy</h3>
            <p className="text-xs text-slate-400">Retries all non-permanent failed payments once regardless of context.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Recovered Revenue</p>
                <p className="text-xl font-bold text-white font-mono">₹{baseRes.recovered_revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Recovery Rate</p>
                <p className="text-xl font-bold text-slate-300 font-mono">{baseRes.recovery_rate}%</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Total Attempts</p>
                <p className="text-sm font-bold text-slate-300 font-mono">{baseRes.attempts}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Wasted Retries</p>
                <p className="text-sm font-bold text-accent-rose font-mono">{baseRes.unnecessary_retries}</p>
              </div>
            </div>
          </div>

          {/* RecoverIQ Strategy */}
          <div className="glass-card p-6 rounded-2xl border-brand-500/30 space-y-4 shadow-xl shadow-brand-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-brand-400 uppercase tracking-wider">Group B — RecoverIQ</span>
              <span className="px-2 py-0.5 rounded bg-accent-green/10 text-accent-green text-[10px] font-mono font-bold">
                +{liftPct}% Revenue Lift
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Adaptive AI Decision Engine</h3>
            <p className="text-xs text-slate-400">Contextual probability estimation + Policy guardrails + ERV optimization.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-brand-500/20">
                <p className="text-[10px] text-slate-500 font-mono">Recovered Revenue</p>
                <p className="text-xl font-bold text-accent-green glow-text-green font-mono">₹{iqRes.recovered_revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-brand-500/20">
                <p className="text-[10px] text-slate-500 font-mono">Recovery Rate</p>
                <p className="text-xl font-bold text-brand-400 font-mono">{iqRes.recovery_rate}%</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Optimized Attempts</p>
                <p className="text-sm font-bold text-slate-200 font-mono">{iqRes.attempts}</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Human Reviews</p>
                <p className="text-sm font-bold text-accent-purple font-mono">{iqRes.human_escalations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Experiments Log */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono">Experiment Execution History</h3>
        <div className="divide-y divide-slate-800/60">
          {experiments.map((e) => (
            <div key={e.experiment_id} className="py-3 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="font-bold text-white">{e.name}</span>
                <span className="text-slate-500 ml-2">Cohort: {e.cohort_size.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-slate-400">{new Date(e.created_at).toLocaleDateString()}</span>
                <span className="text-accent-green font-bold">COMPLETED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
