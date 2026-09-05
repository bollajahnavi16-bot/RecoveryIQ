import React, { useState } from 'react';
import { X, Send, Sparkles, Copy, Check } from 'lucide-react';
import { queryAssistant, generateRecoveryMessage } from '../services/api';

interface NLAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NLAssistantDrawer: React.FC<NLAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'notifications'>('analytics');
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; metrics?: any }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your RecoverIQ Merchant Assistant. Ask me anything about your revenue recovery performance, payment failures, or strategy lift.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Notification generator state
  const [txnIdInput, setTxnIdInput] = useState('TXN-10001');
  const [language, setLanguage] = useState<'English' | 'Hinglish'>('Hinglish');
  const [generatedMsg, setGeneratedMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await queryAssistant(userText);
      setChatHistory(prev => [...prev, { sender: 'bot', text: res.answer, metrics: res.metrics }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Sorry, I could not query the database right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMsg = async () => {
    setLoading(true);
    setGeneratedMsg(null);
    try {
      const res = await generateRecoveryMessage(txnIdInput, language);
      setGeneratedMsg(res.message);
    } catch (err) {
      setGeneratedMsg('Failed to generate notification message.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedMsg) {
      navigator.clipboard.writeText(generatedMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent-amber" />
            <h3 className="text-sm font-semibold text-white font-mono">AI Merchant Assistant</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2.5 text-xs font-semibold font-mono border-b-2 transition-all ${
              activeTab === 'analytics' ? 'border-brand-500 text-brand-400 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics Query
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2.5 text-xs font-semibold font-mono border-b-2 transition-all ${
              activeTab === 'notifications' ? 'border-accent-purple text-accent-purple bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recovery Messages
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.map((item, idx) => (
                <div key={idx} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs space-y-1.5 ${
                    item.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-slate-500 italic font-mono">Querying database...</div>}
            </div>

            {/* Quick Questions & Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button onClick={() => { setQuery("How much revenue did we recover?"); handleSendQuery(); }} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">
                  Revenue recovered?
                </button>
                <button onClick={() => { setQuery("Why are payments failing?"); handleSendQuery(); }} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">
                  Why are payments failing?
                </button>
                <button onClick={() => { setQuery("Which payment method has lowest recovery rate?"); handleSendQuery(); }} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">
                  Payment methods?
                </button>
              </div>

              <form onSubmit={handleSendQuery} className="flex space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask metric question..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button type="submit" className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-200">Generate Customer Recovery Notification</h4>
              <p className="text-[11px] text-slate-400">Creates non-manipulative recovery messages in English or Hinglish.</p>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] text-slate-400 font-mono">Transaction ID</label>
                <input
                  type="text"
                  value={txnIdInput}
                  onChange={(e) => setTxnIdInput(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono">Language</label>
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={() => setLanguage('English')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                      language === 'English' ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('Hinglish')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                      language === 'Hinglish' ? 'bg-accent-purple text-white border-accent-purple' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    Hinglish 🇮🇳
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateMsg}
                className="w-full py-2 bg-gradient-to-r from-brand-600 to-accent-purple text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-90"
              >
                Generate Notification
              </button>
            </div>

            {generatedMsg && (
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[10px] uppercase">Message Preview ({language})</span>
                  <button onClick={handleCopy} className="flex items-center space-x-1 text-brand-400 hover:text-brand-300 text-[11px]">
                    {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 font-sans p-3 bg-slate-900 rounded-lg border border-slate-800/60 leading-relaxed">
                  {generatedMsg}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
