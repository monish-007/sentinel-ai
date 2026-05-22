import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Activity,
  Clock,
  DollarSign,
  AlertTriangle,
  Zap,
  Brain,
  Cpu,
  Loader2,
  Sparkles,
  PieChart,
  BarChart,
} from 'lucide-react';
import api from '../api/client.js';

const FEATURES = [
  {
    icon: Zap,
    title: 'CascadeFlow Routing',
    desc: 'Adaptive model selection based on query complexity — cheap models for simple tasks, powerful models for critical decisions.',
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    icon: Brain,
    title: 'Memory Intelligence',
    desc: 'Hindsight-powered memory that learns from past decisions and improves future routing and risk assessment.',
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    icon: Shield,
    title: 'Governance Engine',
    desc: 'Real-time incident detection, compliance monitoring, and automated risk flagging across all AI interactions.',
    accent: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  {
    icon: DollarSign,
    title: 'Cost Optimization',
    desc: 'Up to 65% cost reduction through intelligent model routing. Every token is tracked and optimized.',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, routingRes] = await Promise.allSettled([
          api.get('/analytics/overview'),
          api.get('/analytics/routing?limit=5'),
        ]);
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
        if (routingRes.status === 'fulfilled') {
          const r = routingRes.value;
          setRecentDecisions(Array.isArray(r) ? r : r?.data || r?.decisions || []);
        }
      } catch (_) {}
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Decisions', value: (overview?.totalQueries ?? 0).toLocaleString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Latency', value: `${(overview?.avgLatency ?? 0).toFixed(0)}ms`, icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Total Cost', value: `$${(overview?.totalCost ?? 0).toFixed(4)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Incidents', value: (overview?.incidentCount ?? 0).toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                SentinelOps AI
              </h1>
              <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mt-1">
                Enterprise Decision Intelligence
              </p>
            </div>
          </div>

          <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-xl">
            An AI-powered decision agent that analyzes enterprise queries across healthcare,
            finance, cybersecurity, and more — with adaptive model routing, governance monitoring,
            and memory-enhanced intelligence.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Start Auditing
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              View Analytics
            </button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">
                  {loading ? '—' : s.value}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h2 className="text-[15px] font-bold text-slate-800">Risk Distribution</h2>
          </div>
          
          <div className="space-y-4">
            {overview?.riskDistribution?.length > 0 ? (
              overview.riskDistribution.map(r => {
                const colors = {
                  critical: 'bg-rose-500',
                  high: 'bg-orange-500',
                  medium: 'bg-amber-500',
                  low: 'bg-emerald-500'
                };
                const maxCount = Math.max(...overview.riskDistribution.map(x => x.count)) || 1;
                const width = `${(r.count / maxCount) * 100}%`;
                return (
                  <div key={r.level} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <span>{r.level} Risk</span>
                      <span>{r.count} incidents</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[r.level] || 'bg-blue-500'}`} style={{ width }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-4">No risk data available.</p>
            )}
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <BarChart className="w-5 h-5 text-blue-600" />
            <h2 className="text-[15px] font-bold text-slate-800">Audit Domains</h2>
          </div>
          
          <div className="space-y-4">
            {overview?.domainBreakdown?.length > 0 ? (
              overview.domainBreakdown.slice(0, 5).map(d => (
                <div key={d.domain} className="flex items-center gap-4">
                  <div className="w-32 truncate text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {d.domain.replace('_', ' ')}
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                  </div>
                  <div className="w-12 text-right text-xs font-bold text-slate-700">{d.percentage}%</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-4">No domain data available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Recent Decisions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Decisions</h2>
          <button
            onClick={() => navigate('/audit')}
            className="text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : recentDecisions.length > 0 ? (
          <div className="space-y-3">
            {recentDecisions.map((d, idx) => (
              <div
                key={d._id || idx}
                className="bg-white border border-slate-200 shadow-sm rounded-xl px-5 py-4 flex items-center gap-4 hover:border-blue-200 hover:bg-blue-50/50 transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <Cpu className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {d.query?.substring(0, 80) || `Decision #${idx + 1}`}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {d.routingReason || d.routing_reason || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {d.latencyMs ?? d.latency_ms ?? '—'}ms
                  </span>
                  <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                    {d.modelSelected || d.model || '—'}
                  </span>
                  <span className="text-slate-400">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-[15px] font-medium text-slate-600">No decisions yet</p>
            <button
              onClick={() => navigate('/chat')}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-lg"
            >
              Make your first decision <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
