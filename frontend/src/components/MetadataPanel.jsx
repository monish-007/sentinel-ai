import {
  Cpu,
  Route,
  Gauge,
  Hash,
  DollarSign,
  Clock,
  AlertTriangle,
  BrainCircuit,
  BarChart2,
  Globe,
  Shield,
  Target,
} from 'lucide-react';

const DOMAIN_LABELS = {
  healthcare: '🏥 Healthcare',
  finance: '💰 Finance',
  cybersecurity: '🔒 Cybersecurity',
  devops: '⚙️ DevOps',
  product_strategy: '📊 Product Strategy',
  supply_chain: '📦 Supply Chain',
  sales_operations: '📈 Sales Ops',
  compliance: '🛡️ Compliance',
  general: '🧠 General',
};

function RiskMeter({ value = 0 }) {
  const percentage = Math.min(100, Math.max(0, value * 100));
  let color = 'bg-emerald-400';
  let glowColor = 'shadow-emerald-400/30';
  if (percentage > 60) {
    color = 'bg-rose-400';
    glowColor = 'shadow-rose-400/30';
  } else if (percentage > 30) {
    color = 'bg-amber-400';
    glowColor = 'shadow-amber-400/30';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-slate-500">Risk Level</span>
        <span className="text-[10px] text-slate-400 font-medium">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} shadow-sm ${glowColor} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ConfidenceMeter({ value = 0.7 }) {
  const pct = Math.round(value * 100);
  let color = 'bg-emerald-400';
  if (pct < 50) color = 'bg-rose-400';
  else if (pct < 75) color = 'bg-amber-400';

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-slate-500">Confidence</span>
        <span className="text-[10px] text-slate-400 font-medium">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value, valueColor }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span
        className={`text-xs font-medium ${valueColor || 'text-slate-200'}`}
      >
        {typeof value === 'object' ? JSON.stringify(value) : value}
      </span>
    </div>
  );
}

export default function MetadataPanel({ interaction }) {
  if (!interaction) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex flex-col items-center justify-center text-center">
        <Target className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-500">No decision selected</p>
        <p className="text-xs text-slate-600 mt-1">
          Submit a query to see decision intelligence
        </p>
      </div>
    );
  }

  const domainLabel = DOMAIN_LABELS[interaction.domain] || DOMAIN_LABELS.general;

  return (
    <div className="glass rounded-2xl p-5 space-y-4 animate-fade-up">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-cyan-400" />
        Decision Metadata
      </h3>

      {/* Domain Badge */}
      {interaction.domain && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-300 font-medium">{domainLabel}</span>
        </div>
      )}

      <div className="space-y-0.5">
        <MetaRow
          icon={Cpu}
          label="Model"
          value={interaction.model}
          valueColor="text-cyan-400"
        />
        <MetaRow
          icon={Route}
          label="Routing Reason"
          value={interaction.routing_reason}
        />
        <MetaRow
          icon={Gauge}
          label="Complexity"
          value={
            interaction.complexity_level
              ? `${interaction.complexity_level} (${interaction.complexity_score?.toFixed(2) || '—'})`
              : interaction.complexity_score?.toFixed(2)
          }
        />
        <MetaRow
          icon={Hash}
          label="Total Tokens"
          value={interaction.token_usage?.total_tokens?.toLocaleString()}
          valueColor="text-purple-400"
        />
        <MetaRow
          icon={DollarSign}
          label="Estimated Cost"
          value={
            interaction.estimated_cost !== undefined
              ? `$${Number(interaction.estimated_cost).toFixed(6)}`
              : undefined
          }
          valueColor="text-emerald-400"
        />
        <MetaRow
          icon={Clock}
          label="Latency"
          value={
            interaction.latency_ms !== undefined
              ? `${interaction.latency_ms}ms`
              : undefined
          }
          valueColor="text-amber-400"
        />
      </div>

      {/* Confidence Meter */}
      {interaction.confidence_score !== undefined && (
        <div className="pt-1">
          <ConfidenceMeter value={interaction.confidence_score} />
        </div>
      )}

      {/* Incident Risk Meter */}
      {interaction.incident_risk !== undefined && (
        <div className="pt-1">
          <RiskMeter value={interaction.incident_risk / 100} />
        </div>
      )}

      {/* Memory Context */}
      {interaction.memory_context && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400">Memory Context</span>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-xs text-slate-400 leading-relaxed max-h-32 overflow-y-auto">
            {(() => {
              const ctx = interaction.memory_context;
              if (typeof ctx === 'string') return ctx;
              if (Array.isArray(ctx)) {
                return ctx.length === 0
                  ? 'No memories'
                  : ctx.map((item, i) => (
                      <div key={i} className="mb-1.5 last:mb-0">
                        <span className="text-purple-400 mr-1">↩</span>
                        {typeof item === 'string'
                          ? item
                          : item?.content || item?.text || item?.fact || JSON.stringify(item)}
                      </div>
                    ));
              }
              if (typeof ctx === 'object' && ctx !== null) {
                const results = Array.isArray(ctx.results) ? ctx.results : null;
                if (results && results.length > 0) {
                  return results.map((r, i) => (
                    <div key={i} className="mb-1.5 last:mb-0">
                      <span className="text-purple-400 mr-1">↩</span>
                      {typeof r === 'string' ? r : r?.content || r?.text || JSON.stringify(r)}
                    </div>
                  ));
                }
                return <pre className="whitespace-pre-wrap break-words">{JSON.stringify(ctx, null, 2)}</pre>;
              }
              return String(ctx);
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
