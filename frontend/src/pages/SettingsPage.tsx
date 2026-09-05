import React, { useEffect, useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { fetchSettings, updateSettings } from '../services/api';
import type { PolicySettings } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PolicySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !settings) return <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading merchant settings...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Merchant Policy Controls</h1>
            <p className="text-xs text-slate-400">Configure AI decision guardrails & autonomy limits</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-xl text-xs font-mono flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Merchant policy settings updated & active in policy engine!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-6 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Maximum Automatic Retries</label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.max_automatic_retries}
              onChange={(e) => setSettings({ ...settings, max_automatic_retries: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
            <p className="text-[11px] text-slate-400">Cease AI automatic retries after N failed attempts.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Minimum Recovery Probability Threshold</label>
            <input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={settings.min_recovery_probability}
              onChange={(e) => setSettings({ ...settings, min_recovery_probability: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
            <p className="text-[11px] text-slate-400">Do not attempt recovery if AI model probability falls below this value.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Minimum Model Confidence Threshold</label>
            <input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={settings.min_confidence}
              onChange={(e) => setSettings({ ...settings, min_confidence: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
            <p className="text-[11px] text-slate-400">Escalate to human review if model confidence is below this cutoff.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">High Value Transaction Threshold (INR)</label>
            <input
              type="number"
              step="500"
              min={500}
              value={settings.high_value_threshold}
              onChange={(e) => setSettings({ ...settings, high_value_threshold: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
            <p className="text-[11px] text-slate-400">Mandatory human approval for transaction amounts exceeding this limit.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-white">Enable Customer Notifications</h4>
              <p className="text-[11px] text-slate-400">Automatically send recovery notification links for action-required failures.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.automatic_notifications_enabled}
              onChange={(e) => setSettings({ ...settings, automatic_notifications_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700 focus:ring-0"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-white">Enable Human-in-the-Loop Workflow</h4>
              <p className="text-[11px] text-slate-400">Route high-risk or ambiguous cases to merchant review queue.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.human_review_enabled}
              onChange={(e) => setSettings({ ...settings, human_review_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700 focus:ring-0"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-brand-600/30"
        >
          <Save className="w-4 h-4" />
          <span>Save Policy Settings</span>
        </button>
      </form>
    </div>
  );
};
