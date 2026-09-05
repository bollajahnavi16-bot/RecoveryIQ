import React from 'react';
import { Play, Sparkles, Cpu, ShieldCheck, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenDemo: () => void;
  onToggleAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo, onToggleAssistant }) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Track Badge */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white font-mono">RecoverIQ</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 font-semibold">
                Decision Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">Adaptive AI Revenue Recovery</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-1 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
          <span className="text-slate-300 font-medium">Razorpay AI Buildathon</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">AI Revenue Recovery Track</span>
        </div>
      </div>

      {/* Action Buttons & Status */}
      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 mr-2">
          <Activity className="w-3.5 h-3.5 text-accent-green animate-pulse" />
          <span>System Live</span>
        </div>

        {/* Competition Demo Button */}
        <button
          onClick={onOpenDemo}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-accent-purple hover:from-brand-500 hover:to-accent-purple text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 border border-white/10"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Competition Demo</span>
        </button>

        {/* AI Assistant Drawer Toggle */}
        <button
          onClick={onToggleAssistant}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/80 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
          <span className="hidden sm:inline">AI Merchant Assistant</span>
        </button>
      </div>
    </header>
  );
};
