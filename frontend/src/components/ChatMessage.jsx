import { Bot, User, Clock, Cpu, DollarSign, AlertTriangle } from 'lucide-react';

export default function ChatMessage({ message, isUser, metadata, isTyping }) {
  if (isTyping) {
    return (
      <div className="flex items-start gap-3 animate-fade-up">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%]">
          <div className="flex gap-1.5 items-center h-5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 animate-fade-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-cyan-600/80 to-blue-700/80 text-white rounded-tr-sm'
              : 'glass text-slate-200 rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>

        {/* Metadata */}
        {metadata && !isUser && (
          <div className="flex flex-wrap items-center gap-2 mt-2 ml-1">
            {metadata.model && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <Cpu className="w-3 h-3" />
                {metadata.model}
              </span>
            )}
            {metadata.latency_ms !== undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <Clock className="w-3 h-3" />
                {metadata.latency_ms}ms
              </span>
            )}
            {metadata.estimated_cost !== undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <DollarSign className="w-3 h-3" />
                ${metadata.estimated_cost?.toFixed(4)}
              </span>
            )}
            {metadata.incident_risk !== undefined && metadata.incident_risk > 0.3 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                Risk {(metadata.incident_risk * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        {metadata?.timestamp && (
          <p className="text-[10px] text-slate-600 mt-1 ml-1">
            {new Date(metadata.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
