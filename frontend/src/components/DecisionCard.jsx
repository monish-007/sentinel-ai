import {
  Shield,
  Target,
  AlertTriangle,
  DollarSign,
  Scale,
  Brain,
  TrendingUp,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react';

const RISK_CONFIG = {
  low: { color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'LOW RISK' },
  medium: { color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'MEDIUM RISK' },
  high: { color: 'orange', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: 'HIGH RISK' },
  critical: { color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'CRITICAL' },
};

const DOMAIN_CONFIG = {
  healthcare: { icon: '🏥', label: 'Healthcare' },
  finance: { icon: '💰', label: 'Finance' },
  cybersecurity: { icon: '🔒', label: 'Cybersecurity' },
  devops: { icon: '⚙️', label: 'DevOps' },
  product_strategy: { icon: '📊', label: 'Product Strategy' },
  supply_chain: { icon: '📦', label: 'Supply Chain' },
  sales_operations: { icon: '📈', label: 'Sales Operations' },
  compliance: { icon: '🛡️', label: 'Compliance' },
  general: { icon: '🧠', label: 'General Intelligence' },
};

export default function DecisionCard({ decision, onGenerateReport }) {
  if (!decision) return null;

  const risk = RISK_CONFIG[decision.riskLevel] || RISK_CONFIG.medium;
  const domain = DOMAIN_CONFIG[decision.domain] || DOMAIN_CONFIG.general;
  const confidence = Math.round((decision.confidenceScore ?? 0.7) * 100);

  return (
    <div className="w-full space-y-3 animate-fade-up">
      {/* Header: Domain + Risk */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{domain.icon}</span>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {domain.label}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${risk.bg} ${risk.text} ${risk.border} border`}>
          {risk.label}
        </span>
      </div>

      {/* Decision Summary */}
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
        <div className="flex items-start gap-2 mb-2">
          <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Decision Summary</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {decision.decisionSummary || 'Analysis complete.'}
        </p>
      </div>

      {/* Recommended Action */}
      <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl p-4 border border-cyan-500/10">
        <div className="flex items-start gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Recommended Action</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {decision.recommendedAction || 'Review and assess.'}
        </p>
      </div>

      {/* Two-column: Tradeoffs + Governance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tradeoffs */}
        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tradeoffs</span>
          </div>
          {(decision.tradeoffs || []).length > 0 ? (
            <ul className="space-y-1.5">
              {decision.tradeoffs.map((t, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No tradeoffs identified</p>
          )}
        </div>

        {/* Governance Concerns */}
        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Governance</span>
          </div>
          {(decision.governanceConcerns || []).length > 0 ? (
            <ul className="space-y-1.5">
              {decision.governanceConcerns.map((g, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-400/60 italic">No governance concerns</p>
          )}
        </div>
      </div>

      {/* Bottom bar: Cost + Confidence + Report */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <div className="flex items-center gap-4">
          {/* Cost Impact */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">{decision.costImpact || 'N/A'}</span>
          </div>
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    confidence >= 80 ? 'bg-emerald-400' : confidence >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{confidence}%</span>
            </div>
          </div>
        </div>

        {/* Generate Report */}
        {onGenerateReport && (
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all"
          >
            <FileText className="w-3 h-3" />
            Generate Report
          </button>
        )}
      </div>

      {/* Memory References */}
      {decision._memoryRefs && decision._memoryRefs.length > 0 && (
        <div className="bg-purple-500/5 rounded-xl p-3 border border-purple-500/10">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Historical References</span>
          </div>
          {decision._memoryRefs.map((ref, i) => (
            <p key={i} className="text-xs text-slate-400 mb-1 last:mb-0">
              <span className="text-purple-400 mr-1">↩</span>
              {typeof ref === 'string' ? ref : ref?.content || ref?.text || JSON.stringify(ref)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
