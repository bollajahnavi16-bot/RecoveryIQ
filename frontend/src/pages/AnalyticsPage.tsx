import React, { useEffect, useState } from 'react';
import { BarChart3, Image as ImageIcon, Sparkles, Maximize2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchAnalytics, fetchEvaluationCharts } from '../services/api';

interface EvaluationChartItem {
  id: string;
  title: string;
  description: string;
  url: string;
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<{ by_failure_category: any[]; by_payment_method: any[] } | null>(null);
  const [pythonCharts, setPythonCharts] = useState<EvaluationChartItem[]>([]);
  const [selectedChart, setSelectedChart] = useState<EvaluationChartItem | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setData).catch(console.error);
    fetchEvaluationCharts()
      .then((res) => setPythonCharts(res.charts || []))
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading financial intelligence & analytics...</div>;

  const COLORS = ['#0066ff', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];
  const backendHost = 'http://localhost:8000';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Deep Revenue Analytics & AI Model Evaluation</h1>
            <p className="text-xs text-slate-400">Interactive live charts & Python Matplotlib/Seaborn model evaluation graphs</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Python Visualizations Active</span>
          </span>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE RECHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
            <span>Recovered Revenue by Failure Category</span>
            <span className="text-[10px] text-slate-400 font-normal">Real-time DB</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_failure_category}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="recovered_revenue" fill="#0066ff" radius={[4, 4, 0, 0]}>
                  {data.by_failure_category.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
            <span>Recovered Revenue by Payment Method</span>
            <span className="text-[10px] text-slate-400 font-normal">Real-time DB</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_payment_method}>
                <XAxis dataKey="payment_method" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="recovered_revenue" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {data.by_payment_method.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2: PYTHON MATPLOTLIB/SEABORN GENERATED GRAPHS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-accent-green" />
              <span>Python Matplotlib / Seaborn Data & Model Graphs</span>
            </h2>
            <p className="text-xs text-slate-400">Generated from synthetic transaction cohort analysis & machine learning model evaluation</p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">
            {pythonCharts.length} High-Res Visualizations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pythonCharts.map((chart) => {
            const imgUrl = chart.url.startsWith('http') ? chart.url : `${backendHost}${chart.url}`;
            return (
              <div
                key={chart.id}
                onClick={() => setSelectedChart(chart)}
                className="glass-card p-4 rounded-2xl border-slate-700/50 hover:border-brand-500/50 cursor-pointer transition-all duration-300 group space-y-3"
              >
                <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={chart.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-mono font-medium flex items-center space-x-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Graph</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono group-hover:text-brand-400 transition-colors">
                    {chart.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {chart.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {selectedChart && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-2xl space-y-4 border-brand-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedChart.title}</h3>
                <p className="text-xs text-slate-400">{selectedChart.description}</p>
              </div>
              <button
                onClick={() => setSelectedChart(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-2 flex justify-center">
              <img
                src={selectedChart.url.startsWith('http') ? selectedChart.url : `${backendHost}${selectedChart.url}`}
                alt={selectedChart.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2">
              <span>Engine: Matplotlib / Seaborn 300 DPI</span>
              <a
                href={selectedChart.url.startsWith('http') ? selectedChart.url : `${backendHost}${selectedChart.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline"
              >
                Open Original Image ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
