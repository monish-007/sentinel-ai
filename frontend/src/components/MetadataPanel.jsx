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
  let color = 'bg-emerald-500';
  if (percentage > 60) {
    color = 'bg-rose-500';
  } else if (percentage > 30) {
    color = 'bg-orange-500';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase">Risk Level</span>
        <span className="text-[10px] text-slate-700 font-bold">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ConfidenceMeter({ value = 0.7 }) {
  const pct = Math.round(value * 100);
  let color = 'bg-emerald-500';
  if (pct < 50) color = 'bg-rose-500';
  else if (pct < 75) color = 'bg-amber-500';

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase">Confidence</span>
        <span className="text-[10px] text-slate-700 font-bold">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
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
    <div className="flex items-center justify-between py-2.5 border-b border-slate-200 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <span
        className={`text-xs font-semibold ${valueColor || 'text-slate-800'} text-right max-w-[50%] truncate`}
        title={typeof value === 'object' ? JSON.stringify(value) : value}
      >
        {typeof value === 'object' ? JSON.stringify(value) : value}
      </span>
    </div>
  );
}

export default function MetadataPanel({ interaction }) {
  if (!interaction) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
          <Target className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No decision selected</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Submit a query to see operational metrics and routing data
        </p>
      </div>
    );
  }

  const domainLabel = DOMAIN_LABELS[interaction.domain] || DOMAIN_LABELS.general;

  return (
    <div className="p-5 space-y-5">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
        <BarChart2 className="w-4 h-4 text-blue-600" />
        Decision Metadata
      </h3>

      {/* Domain Badge */}
      {interaction.domain && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-700 font-bold">{domainLabel}</span>
        </div>
      )}

      <div className="space-y-0 text-slate-700">
        <MetaRow icon={Cpu} label="Model" value={interaction.model} valueColor="text-blue-700" />
        <MetaRow icon={Route} label="Routing Reason" value={interaction.routing_reason} />
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
          valueColor="text-purple-700"
        />
        <MetaRow
          icon={DollarSign}
          label="Estimated Cost"
          value={
            interaction.estimated_cost !== undefined
              ? `$${Number(interaction.estimated_cost).toFixed(6)}`
              : undefined
          }
          valueColor="text-emerald-600"
        />
        <MetaRow
          icon={Clock}
          label="Latency"
          value={
            interaction.latency_ms !== undefined
              ? `${interaction.latency_ms}ms`
              : undefined
          }
          valueColor="text-amber-600"
        />
      </div>

      {/* Confidence & Risk Meters */}
      <div className="space-y-4 pt-2 border-b border-slate-200 pb-4">
        {interaction.confidence_score !== undefined && (
          <ConfidenceMeter value={interaction.confidence_score} />
        )}
        {interaction.incident_risk !== undefined && (
          <RiskMeter value={interaction.incident_risk / 100} />
        )}
        {interaction.governance_severity && (
          <div className="pt-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Governance Severity</div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              interaction.governance_severity === 'critical-block' ? 'bg-rose-100 text-rose-700' :
              interaction.governance_severity === 'mandatory' ? 'bg-orange-100 text-orange-700' :
              interaction.governance_severity === 'advisory' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {interaction.governance_severity}
            </span>
          </div>
        )}
        {interaction.escalation_required && (
          <div className="pt-1">
            <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              Escalation Required
            </div>
          </div>
        )}
      </div>

      {/* Memory Context */}
      {interaction.memory_context && (
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2 pt-2">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Memory Context</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed max-h-40 overflow-y-auto break-words scrollbar-thin">
            {(() => {
              const ctx = interaction.memory_context;
              if (typeof ctx === 'string') return ctx;
              if (Array.isArray(ctx)) {
                return ctx.length === 0
                  ? 'No memories'
                  : ctx.map((item, i) => (
                      <div key={i} className="mb-2 last:mb-0 break-words flex items-start gap-1">
                        <span className="text-purple-400 shrink-0">↩</span>
                        <span className="flex-1">
                          {typeof item === 'string'
                            ? item
                            : item?.content || item?.text || item?.fact || JSON.stringify(item)}
                        </span>
                      </div>
                    ));
              }
              if (typeof ctx === 'object' && ctx !== null) {
                const results = Array.isArray(ctx.results) ? ctx.results : null;
                if (results && results.length > 0) {
                  return results.map((r, i) => (
                    <div key={i} className="mb-2 last:mb-0 break-words flex items-start gap-1">
                      <span className="text-purple-400 shrink-0">↩</span>
                      <span className="flex-1">
                        {typeof r === 'string' ? r : r?.content || r?.text || JSON.stringify(r)}
                      </span>
                    </div>
                  ));
                }
                return <pre className="whitespace-pre-wrap break-words font-sans text-xs">{JSON.stringify(ctx, null, 2)}</pre>;
              }
              return String(ctx);
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
