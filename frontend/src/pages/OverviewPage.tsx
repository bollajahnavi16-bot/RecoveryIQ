import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { fetchKPIs } from '../services/api';
import type { KPIPayload } from '../types';

interface OverviewPageProps {
  onSelectTransaction: (txnId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = () => {
  const [kpi, setKpi] = useState<KPIPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs()
      .then(setKpi)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !kpi) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading financial intelligence & AI metrics...
      </div>
    );
  }

  const COLORS = ['#0066ff', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border-brand-500/20">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
            <span>Adaptive AI Revenue Recovery Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Expected Recovery Value (ERV) Decision Optimization & Merchant Policy Guardrails
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-accent-green/10 text-accent-green border border-accent-green/20">
            Recovered: ₹{kpi.recovered_revenue.toLocaleString()}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            Recovery Rate: {kpi.recovery_rate}%
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Revenue at Risk</span>
            <DollarSign className="w-4 h-4 text-accent-amber" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">₹{kpi.revenue_at_risk.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across {kpi.total_transactions.toLocaleString()} failed payments</p>
        </div>

        {/* Card 2 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Recovered Revenue</span>
            <TrendingUp className="w-4 h-4 text-accent-green" />
          </div>
          <p className="text-2xl font-extrabold text-accent-green glow-text-green font-mono">₹{kpi.recovered_revenue.toLocaleString()}</p>
          <p className="text-[11px] text-accent-green mt-1 font-medium">+{kpi.recovery_rate}% overall recovery rate</p>
        </div>

        {/* Card 3 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Expected Recovery Value</span>
            <ShieldCheck className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-extrabold text-brand-400 glow-text-blue font-mono">₹{kpi.expected_recovery_value.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Avg ERV per intervention</p>
        </div>

        {/* Card 4 */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">Human Escalations</span>
            <UserCheck className="w-4 h-4 text-accent-purple" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{kpi.human_reviews}</p>
          <p className="text-[11px] text-slate-400 mt-1">High-value / low-confidence cases</p>
        </div>
      </div>

      {/* CHARTS GRID 1: Revenue Over Time & Baseline Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Recovered Revenue Trend</h3>
              <p className="text-xs text-slate-400">Daily financial recovery progression</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400">Live Sync</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.trend_data}>
                <defs>
                  <linearGradient id="colorIQ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'RecoverIQ']}
                />
                <Area type="monotone" dataKey="recovered_revenue" stroke="#0066ff" strokeWidth={3} fillOpacity={1} fill="url(#colorIQ)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Baseline vs RecoverIQ Comparison */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Baseline vs RecoverIQ Lift</h3>
              <p className="text-xs text-slate-400">Naive Retry vs Adaptive AI Decisioning</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold">+38.8% Lift</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpi.trend_data}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="baseline_revenue" name="Naive Retry Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered_revenue" name="RecoverIQ Adaptive AI" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: Action Distribution & Failure Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Distribution */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono">AI Recommended Action Distribution</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpi.action_distribution}
                  dataKey="count"
                  nameKey="action"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {kpi.action_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Categories */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono">Payment Failure Classification</h3>
          <div className="space-y-3">
            {kpi.failure_categories.map((item, idx) => {
              const pct = Math.round((item.count / kpi.total_transactions) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{item.category}</span>
                    <span className="text-slate-400">{item.count} events ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
