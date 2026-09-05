import React from 'react';
import { BrainCircuit, Zap } from 'lucide-react';

export const AIDecisionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border-brand-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">AI Decision Center</h1>
            <p className="text-xs text-slate-400">Scikit-learn RandomForest & Calibrated Classifier Model Intelligence</p>
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MODEL 1 — RECOVERY PROBABILITY</span>
            <span className="px-2 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold">AUC: 0.8675</span>
          </div>
          <h3 className="text-sm font-bold text-white">RandomForestClassifier + Calibration</h3>
          <p className="text-xs text-slate-400">Evaluates customer tenure, historical payment success, invoice age, and retry decay.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MODEL 2 — FAILURE CLASSIFIER</span>
            <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-bold">Acc: 100%</span>
          </div>
          <h3 className="text-sm font-bold text-white">GradientBoosting Multi-Class</h3>
          <p className="text-xs text-slate-400">Categorizes error reasons into TEMPORARY, ACTION_REQUIRED, PERMANENT, UNKNOWN.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MODEL 3 — EXPECTED VALUE</span>
            <span className="px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple font-bold">Optimization</span>
          </div>
          <h3 className="text-sm font-bold text-white">Expected Recovery Value (ERV)</h3>
          <p className="text-xs text-slate-400">ERV = (P(recovery) × Amount) − Intervention Cost − Risk Penalty</p>
        </div>
      </div>

      {/* ERV Formula Interactive Explanation */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
          <Zap className="w-5 h-5 text-accent-amber" />
          <span>Expected Recovery Value (ERV) Decision Framework</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Unlike legacy recovery bots that repeatedly attempt failed payments until hard limits are reached, RecoverIQ calculates the net economic expected value for every intervention option:
        </p>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs text-brand-300 space-y-1">
          <p className="font-bold">Expected Recovery Value = (Recovery Probability × Recoverable Amount) − Intervention Cost − Risk Penalty</p>
          <p className="text-[11px] text-slate-400 font-sans">
            Example: ₹2,499 failure with 82% probability $\rightarrow$ ₹2,049 Expected Revenue − ₹5 Retry Cost − ₹30 Risk Penalty = <strong>₹2,014 Net ERV</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-mono text-accent-green font-bold block">RETRY_NOW</span>
            <span className="text-[11px] text-slate-400">Immediate retry for transient bank gateway glitches.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-mono text-brand-400 font-bold block">RETRY_LATER</span>
            <span className="text-[11px] text-slate-400">Delayed retry (30–120 mins) allowing gateway recovery.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-mono text-accent-purple font-bold block">CUSTOMER_NOTIFY</span>
            <span className="text-[11px] text-slate-400">SMS/WhatsApp for card limit or OTP issues.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-mono text-accent-amber font-bold block">HUMAN_REVIEW</span>
            <span className="text-[11px] text-slate-400">Escalate high-value or ambiguous transactions.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-mono text-accent-rose font-bold block">STOP</span>
            <span className="text-[11px] text-slate-400">Cease retries on permanent account failures.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
