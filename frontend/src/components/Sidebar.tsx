import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  BrainCircuit, 
  Layers, 
  FlaskConical, 
  BarChart3, 
  FileText, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'decisions', label: 'AI Decisions', icon: BrainCircuit },
    { id: 'queue', label: 'Recovery Queue', icon: Layers },
    { id: 'experiments', label: 'Baseline vs AI', icon: FlaskConical },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'settings', label: 'Policy Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider px-3 mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600/20 text-brand-500 border border-brand-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-ping" />
            <span>AI Risk Engine v1.0</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Expected Recovery Value optimization active.</p>
        </div>
      </div>
    </aside>
  );
};
