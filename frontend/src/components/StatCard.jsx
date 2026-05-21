import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  cyan: {
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/10',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/10',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/10',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    glow: 'group-hover:shadow-rose-500/10',
    trendUp: 'text-rose-400',
    trendDown: 'text-emerald-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/10',
    trendUp: 'text-emerald-400',
    trendDown: 'text-rose-400',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'cyan',
  glowClass,
}) {
  const colors = colorMap[color] || colorMap.cyan;

  return (
    <div
      className={`group relative glass rounded-2xl p-5 animate-fade-up transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.05] hover:shadow-lg ${
        glowClass || colors.glow
      } cursor-default`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trendDirection === 'up' ? colors.trendUp : colors.trendDown
            }`}
          >
            {trendDirection === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend}%</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Subtle gradient accent line at bottom */}
      <div
        className={`absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent ${
          color === 'cyan'
            ? 'via-cyan-500/20'
            : color === 'amber'
            ? 'via-amber-500/20'
            : color === 'emerald'
            ? 'via-emerald-500/20'
            : color === 'rose'
            ? 'via-rose-500/20'
            : 'via-purple-500/20'
        } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </div>
  );
}
