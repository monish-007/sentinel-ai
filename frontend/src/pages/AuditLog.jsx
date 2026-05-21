import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Cpu,
  Clock,
  DollarSign,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import api from '../api/client.js';

function RiskCell({ risk }) {
  if (risk === undefined || risk === null) return <span className="text-slate-500">—</span>;
  const pct = (risk * 100).toFixed(0);
  let color = 'text-emerald-400';
  if (risk > 0.6) color = 'text-rose-400';
  else if (risk > 0.3) color = 'text-amber-400';
  return <span className={`text-xs font-medium ${color}`}>{pct}%</span>;
}

export default function AuditLog() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const limit = 20;

  useEffect(() => {
    fetchInteractions();
  }, [page]);

  async function fetchInteractions() {
    setLoading(true);
    try {
      const response = await api.get(
        `/interactions?page=${page}&limit=${limit}`
      );
      const data = Array.isArray(response)
        ? response
        : response?.interactions || response?.data || [];
      setInteractions(data);
      setTotalPages(response?.pagination?.pages || response?.totalPages || Math.max(1, Math.ceil((response?.pagination?.total || response?.total || data.length) / limit)));
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const uniqueModels = [...new Set(interactions.map((i) => i.modelUsed || i.model).filter(Boolean))];

  const filteredInteractions = interactions.filter((item) => {
    if (modelFilter && (item.modelUsed || item.model) !== modelFilter) return false;
    if (
      searchQuery &&
      !item.query?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.response?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          Audit Log
        </h1>
        <p className="text-slate-400 mt-1">
          Complete interaction audit trail
        </p>
      </div>

      {/* Search & Filters */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="">All Models</option>
            {uniqueModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredInteractions.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Latency
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Complexity
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredInteractions.map((item, idx) => (
                  <>
                    <tr
                      key={item.id || idx}
                      onClick={() =>
                        setExpandedRow(expandedRow === idx ? null : idx)
                      }
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {item.createdAt || item.timestamp || item.created_at
                          ? new Date(
                              item.createdAt || item.timestamp || item.created_at
                            ).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-200 max-w-[300px] truncate">
                        {item.query || '—'}
                      </td>
                      <td className="px-5 py-3">
                        {(item.modelUsed || item.model) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-[11px] text-cyan-400 font-medium">
                            <Cpu className="w-3 h-3" />
                            {item.modelUsed || item.model}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-amber-400">
                        {(item.latencyMs ?? item.latency_ms) !== undefined
                          ? `${item.latencyMs ?? item.latency_ms}ms`
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-emerald-400">
                        {(() => {
                          const tok = item.tokenEstimate || item.token_estimate;
                          if (!tok) return '—';
                          const model = item.modelUsed || item.model || 'llama-3.1-8b-instant';
                          const rates = model.includes('70b') ? {i:0.59,o:0.79} : {i:0.05,o:0.08};
                          const cost = ((tok.prompt||0)/1e6)*rates.i + ((tok.completion||0)/1e6)*rates.o;
                          return `$${cost.toFixed(6)}`;
                        })()}
                      </td>
                      <td className="px-5 py-3">
                        <RiskCell risk={(item.incidentRisk ?? item.incident_risk) / 100} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {item.complexity?.level || item.complexity_level || (item.complexity?.score ?? item.complexity_score)?.toFixed?.(0) || '—'}
                      </td>
                      <td className="px-5 py-3">
                        {expandedRow === idx ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </td>
                    </tr>
                    {expandedRow === idx && (
                      <tr
                        key={`expanded-${idx}`}
                        className="bg-white/[0.02]"
                      >
                        <td colSpan={8} className="px-5 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-400 mb-2">
                                Full Query
                              </p>
                              <div className="bg-white/[0.03] rounded-lg p-3 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                                {item.query || 'No query data'}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 mb-2">
                                Response
                              </p>
                              <div className="bg-white/[0.03] rounded-lg p-3 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                                {item.response || 'No response data'}
                              </div>
                            </div>
                            {(item.routingReason || item.routing_reason) && (
                              <div className="lg:col-span-2">
                                <p className="text-xs font-semibold text-slate-400 mb-1">
                                  Routing Reason
                                </p>
                                <p className="text-xs text-slate-300">
                                  {item.routingReason || item.routing_reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl flex flex-col items-center justify-center py-20">
          <FileText className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-sm text-slate-500">No interactions found</p>
          <p className="text-xs text-slate-600 mt-1">
            {searchQuery || modelFilter
              ? 'Try adjusting your search or filters'
              : 'Start chatting to generate audit entries'}
          </p>
        </div>
      )}
    </div>
  );
}
