import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { fetchTransactions } from '../services/api';
import type { Transaction } from '../types';

interface TransactionsPageProps {
  onSelectTransaction: (txnId: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onSelectTransaction }) => {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchTransactions({
      search,
      status: statusFilter,
      failure_category: categoryFilter,
      page,
      limit: 15
    })
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-white font-mono">Payment Failure Events</h1>
          <p className="text-xs text-slate-400">Search & inspect transaction intelligence</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search TXN ID or Reason..."
              className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="FAILED">Failed</option>
            <option value="RECOVERED">Recovered</option>
            <option value="STOPPED">Stopped</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="TEMPORARY">TEMPORARY</option>
            <option value="CUSTOMER_ACTION_REQUIRED">ACTION_REQUIRED</option>
            <option value="PERMANENT">PERMANENT</option>
          </select>

          <button type="submit" className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-xl">
            Search
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3.5">Transaction</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Failure Category</th>
                <th className="p-3.5">Recovery Prob</th>
                <th className="p-3.5">Expected Value</th>
                <th className="p-3.5">AI Action</th>
                <th className="p-3.5">Policy</th>
                <th className="p-3.5">Outcome</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-mono">
                    Fetching transactions...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-mono">
                    No transactions match filters.
                  </td>
                </tr>
              ) : (
                data.map((t) => (
                  <tr
                    key={t.transaction_id}
                    onClick={() => onSelectTransaction(t.transaction_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-semibold text-white">{t.transaction_id}</td>
                    <td className="p-3.5 font-mono text-slate-200">₹{t.amount.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-400">{t.payment_method}</td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded ${
                        t.failure_category === 'TEMPORARY' ? 'bg-brand-500/10 text-brand-400' : (t.failure_category === 'PERMANENT' ? 'bg-accent-rose/10 text-accent-rose' : 'bg-accent-amber/10 text-accent-amber')
                      }`}>
                        {t.failure_category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-accent-cyan">
                      {Math.round((t.recovery_probability || 0.65) * 100)}%
                    </td>
                    <td className="p-3.5 font-mono font-bold text-accent-green">
                      ₹{(t.expected_recovery_value || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{t.recommended_action}</td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className={`font-bold ${t.policy_status === 'APPROVED' ? 'text-accent-green' : (t.policy_status === 'REJECTED' ? 'text-accent-rose' : 'text-accent-amber')}`}>
                        {t.policy_status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'RECOVERED' ? 'bg-accent-green/20 text-accent-green' : (t.status === 'STOPPED' ? 'bg-slate-800 text-slate-400' : 'bg-accent-amber/20 text-accent-amber')
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="p-1 text-slate-400 hover:text-brand-400">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing page {page} of {Math.ceil(total / 15) || 1} ({total} total transactions)</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page * 15 >= total}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
