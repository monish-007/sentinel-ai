import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Loader2,
  XCircle,
  AlertOctagon,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const typeIcons = {
  hallucination: AlertOctagon,
  safety_violation: ShieldAlert,
  high_cost: AlertTriangle,
  latency_spike: AlertTriangle,
  error: XCircle,
  low_confidence: AlertTriangle,
  governance_flag: ShieldAlert,
  routing_failure: XCircle,
  model_mismatch: AlertOctagon,
  compliance_violation: ShieldAlert,
  escalation_required: AlertTriangle,
  default: Info,
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    resolved: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [incidentData, statsData] = await Promise.allSettled([
        api.get('/incidents'),
        api.get('/incidents/stats'),
      ]);

      if (incidentData.status === 'fulfilled') {
        const d = incidentData.value;
        setIncidents(Array.isArray(d) ? d : d?.incidents || d?.data || []);
      }
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
    } catch (err) {
      console.error('Incidents fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = async (id) => {
    try {
      await api.patch(`/incidents/${id}/resolve`);
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === id ? { ...inc, resolved: true } : inc
        )
      );
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filters.type && inc.type !== filters.type) return false;
    if (filters.severity && inc.severity !== filters.severity) return false;
    if (filters.resolved === 'true' && !inc.resolved) return false;
    if (filters.resolved === 'false' && inc.resolved) return false;
    return true;
  });

  const uniqueTypes = [...new Set(incidents.map((i) => i.type).filter(Boolean))];
  const uniqueSeverities = [
    ...new Set(incidents.map((i) => i.severity).filter(Boolean)),
  ];

  const severityVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'neutral';
    }
  };

  // Generate chart data from incidents
  const chartData = (() => {
    if (stats?.timeline) return stats.timeline;
    // Group incidents by date
    const byDate = {};
    incidents.forEach((inc) => {
      const date = inc.timestamp
        ? new Date(inc.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : 'Unknown';
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate).map(([date, count]) => ({ date, count }));
  })();

  const totalIncidents = stats?.total || incidents.length;
  const criticalCount =
    stats?.critical ||
    incidents.filter((i) => i.severity?.toLowerCase() === 'critical').length;
  const unresolvedCount =
    stats?.unresolved || incidents.filter((i) => !i.resolved).length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
          Operational Governance Center
        </h1>
        <p className="text-slate-400 mt-1">
          Monitor policy violations, security threats, and model alignment incidents
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Events"
          value={totalIncidents.toString()}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Critical"
          value={criticalCount.toString()}
          icon={AlertOctagon}
          color="rose"
        />
        <StatCard
          title="Unresolved"
          value={unresolvedCount.toString()}
          icon={XCircle}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
        >
          <option value="">All Types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filters.severity}
          onChange={(e) =>
            setFilters((f) => ({ ...f, severity: e.target.value }))
          }
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
        >
          <option value="">All Severities</option>
          {uniqueSeverities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.resolved}
          onChange={(e) =>
            setFilters((f) => ({ ...f, resolved: e.target.value }))
          }
          className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
        >
          <option value="">All Status</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredIncidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredIncidents.map((incident, idx) => {
            const TypeIcon =
              typeIcons[incident.type] || typeIcons.default;
            return (
              <div
                key={incident.id || idx}
                className={`glass rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.05] ${
                  incident.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="w-4 h-4 text-slate-400" />
                    <StatusBadge
                      label={incident.severity || 'Unknown'}
                      variant={severityVariant(incident.severity)}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {incident.timestamp
                      ? new Date(incident.timestamp).toLocaleString()
                      : '—'}
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-medium mb-1">
                  {incident.type
                    ? incident.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    : 'Incident'}
                </p>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {incident.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  {incident.model && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {incident.model}
                    </span>
                  )}
                  {!incident.resolved ? (
                    <button
                      onClick={() => handleResolve(incident.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Resolve
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl flex flex-col items-center justify-center py-16">
          <AlertTriangle className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-sm text-slate-500">No incidents found</p>
          <p className="text-xs text-slate-600 mt-1">
            {incidents.length > 0
              ? 'Try adjusting your filters'
              : 'All systems operating normally'}
          </p>
        </div>
      )}

      {/* Incidents Over Time Chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Incidents Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Incidents"
                stroke="#f43f5e"
                fill="url(#incidentGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
