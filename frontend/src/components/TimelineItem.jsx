import { Clock, Cpu, DollarSign, Zap } from 'lucide-react';

const typeColors = {
  routing: 'bg-cyan-400',
  incident: 'bg-rose-400',
  memory: 'bg-purple-400',
  default: 'bg-slate-400',
};

export default function TimelineItem({
  time,
  title,
  description,
  model,
  cost,
  latency,
  type = 'routing',
}) {
  const dotColor = typeColors[type] || typeColors.default;

  return (
    <div className="group relative flex gap-4 pb-6 last:pb-0">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${dotColor} ring-4 ring-sentinel-dark flex-shrink-0 z-10 transition-transform duration-200 group-hover:scale-125`}
        />
        <div className="w-[1px] flex-1 bg-white/[0.06] group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 -mt-0.5 pb-2">
        {/* Time */}
        <p className="text-[11px] text-slate-500 font-medium mb-1">
          {time
            ? new Date(time).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : '—'}
        </p>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">
          {title || 'Untitled Event'}
        </h4>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-400 mb-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2">
          {model && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-[11px] text-cyan-400 font-medium">
              <Cpu className="w-3 h-3" />
              {model}
            </span>
          )}
          {cost !== undefined && cost !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px] text-emerald-400 font-medium">
              <DollarSign className="w-3 h-3" />
              ${typeof cost === 'number' ? cost.toFixed(4) : cost}
            </span>
          )}
          {latency !== undefined && latency !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-[11px] text-amber-400 font-medium">
              <Zap className="w-3 h-3" />
              {typeof latency === 'number' ? latency.toFixed(0) : latency}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
