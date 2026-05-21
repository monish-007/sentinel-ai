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
} from 'lucide-react';

const RISK_CONFIG = {
  low: { color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'LOW RISK' },
  medium: { color: 'amber', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'MEDIUM RISK' },
  high: { color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'HIGH RISK' },
  critical: { color: 'rose', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', label: 'CRITICAL' },
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
    <div className="w-full space-y-3 animate-fade-up min-w-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      {/* Header: Domain + Risk */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{domain.icon}</span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {domain.label}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${risk.bg} ${risk.text} ${risk.border} border`}>
          {risk.label}
        </span>
      </div>

      {/* Decision Summary */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-start gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Decision Summary</h3>
        </div>
        <p className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
          {decision.decisionSummary || 'Analysis complete.'}
        </p>
      </div>

      {/* Recommended Action */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Recommended Action</h3>
        </div>
        <p className="text-[15px] text-blue-900 leading-relaxed font-medium whitespace-pre-wrap break-words">
          {decision.recommendedAction || 'Review and assess.'}
        </p>
      </div>

      {/* Two-column: Tradeoffs + Governance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        {/* Tradeoffs */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Scale className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tradeoffs</span>
          </div>
          {(decision.tradeoffs || []).length > 0 ? (
            <ul className="space-y-2">
              {decision.tradeoffs.map((t, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2 break-words">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span className="flex-1 break-words leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">No tradeoffs identified</p>
          )}
        </div>

        {/* Governance Concerns */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Governance</span>
          </div>
          {(decision.governanceConcerns || []).length > 0 ? (
            <ul className="space-y-2">
              {decision.governanceConcerns.map((g, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2 break-words">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span className="flex-1 break-words leading-snug">{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-600 italic">No governance concerns</p>
          )}
        </div>
      </div>

      {/* Memory References */}
      {decision._memoryRefs && decision._memoryRefs.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Historical Context Used</span>
          </div>
          <div className="space-y-1.5">
            {decision._memoryRefs.map((ref, i) => (
              <p key={i} className="text-xs text-purple-900 flex items-start gap-1.5 break-words">
                <span className="text-purple-400 mt-0.5 shrink-0">↩</span>
                <span className="flex-1 break-words line-clamp-2">
                  {typeof ref === 'string' ? ref : ref?.content || ref?.text || JSON.stringify(ref)}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar: Cost + Confidence + Report */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-medium text-slate-600">{decision.costImpact || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    confidence >= 80 ? 'bg-emerald-500' : confidence >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-600 font-bold">{confidence}%</span>
            </div>
          </div>
        </div>

        {onGenerateReport && (
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
          >
            <FileText className="w-3 h-3" />
            Generate Report
          </button>
        )}
      </div>
    </div>
  );
}
