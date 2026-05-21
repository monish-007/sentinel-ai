import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ChevronDown,
  Shield,
  Loader2,
  XCircle,
} from 'lucide-react';
import api from '../api/client.js';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [resolvingId, setResolvingId] = useState(null);

  const fetchIncidents = async () => {
    try {
      const [incRes, statRes] = await Promise.all([
        api.get('/incidents?limit=50'),
        api.get('/incidents/stats'),
      ]);
      setIncidents(incRes.incidents || []);
      setStats(statRes);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const resolveIncident = async (id) => {
    setResolvingId(id);
    try {
      await api.post(`/incidents/${id}/resolve`, {
        resolutionNotes: 'Resolved by Governance Team via dashboard.',
      });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to resolve:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = incidents.filter((i) => {
    if (filter === 'active') return !i.resolved;
    if (filter === 'resolved') return i.resolved;
    if (filter === 'critical') return i.severity === 'critical';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const criticalCount =
    stats?.critical ||
    incidents.filter((i) => i.severity?.toLowerCase() === 'critical').length;
  const unresolvedCount =
    stats?.unresolved || incidents.filter((i) => !i.resolved).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-rose-600" />
          Governance
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Policy violations, security threats & model alignment incidents
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Incidents</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.total || incidents.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-rose-200 shadow-sm rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Critical Alerts</p>
            <p className="text-2xl font-bold text-rose-700">{criticalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 relative z-10">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-amber-200 shadow-sm rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">Unresolved</p>
            <p className="text-2xl font-bold text-amber-700">{unresolvedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50">
          <div className="flex gap-2">
            {['all', 'active', 'critical', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Shield className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">No incidents found</p>
              <p className="text-sm">Everything is running smoothly.</p>
            </div>
          ) : (
            filtered.map((inc) => (
              <div
                key={inc._id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                {/* Status/Severity Icon */}
                <div className="flex-shrink-0">
                  {inc.resolved ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  ) : inc.severity === 'critical' || inc.severity === 'high' ? (
                    <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center relative">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-rose-400 opacity-20 animate-ping" />
                      <AlertTriangle className="w-5 h-5 text-rose-600 relative" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        inc.severity === 'critical'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : inc.severity === 'high'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : inc.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      {inc.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {inc.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(inc.createdAt).toLocaleString()}
                    </span>
                    {inc.interactionId && (
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        View Interaction #{inc.interactionId.slice(-6)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {!inc.resolved && (
                    <button
                      onClick={() => resolveIncident(inc._id)}
                      disabled={resolvingId === inc._id}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {resolvingId === inc._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Mark Resolved
                    </button>
                  )}
                  {inc.resolved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
