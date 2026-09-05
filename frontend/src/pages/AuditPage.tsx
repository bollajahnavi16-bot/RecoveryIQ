import React, { useEffect, useState } from 'react';
import { FileText, Activity } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchAuditLogs(100).then(data => setLogs(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-600/20 text-brand-400 rounded-xl border border-brand-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">Immutable Audit Trail</h1>
            <p className="text-xs text-slate-400">Step-by-step event logging for compliance and explainability</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Activity className="w-4 h-4 text-accent-green" />
          <span>{Array.isArray(logs) ? logs.length : 0} Events Logged</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {Array.isArray(logs) && logs.length > 0 ? (
            logs.map((l) => (
              <div key={l.log_id || Math.random()} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-slate-800/30 p-2 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-mono">{l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'N/A'}</span>
                    <span className="font-bold text-brand-400">{l.event_type}</span>
                    {l.transaction_id && <span className="text-slate-400 font-semibold">[{l.transaction_id}]</span>}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Actor: <strong className="text-slate-300">{l.actor}</strong> | Payload: {JSON.stringify(l.payload)}
                  </p>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded font-bold self-start md:self-center ${
                  l.status === 'SUCCESS' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-rose/10 text-accent-rose'
                }`}>
                  {l.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">No audit logs found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
