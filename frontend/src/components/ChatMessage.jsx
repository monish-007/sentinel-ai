import { Bot, User, Clock, Cpu, DollarSign, AlertTriangle } from 'lucide-react';

export default function ChatMessage({ message, isUser, metadata, isTyping }) {
  if (isTyping) {
    return (
      <div className="flex items-start gap-4 animate-fade-up w-full">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] sm:max-w-[75%] shadow-sm">
          <div className="flex gap-1.5 items-center h-5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-4 animate-fade-up w-full ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${
          isUser
            ? 'bg-slate-800'
            : 'bg-blue-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble Container - prevent overflow */}
      <div className={`flex flex-col min-w-0 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm w-full break-words ${
            isUser
              ? 'bg-slate-800 text-white rounded-tr-sm'
              : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message}</p>
        </div>

        {/* Metadata */}
        {metadata && !isUser && (
          <div className="flex flex-wrap items-center gap-2.5 mt-2 ml-1">
            {metadata.model && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Cpu className="w-3 h-3" />
                {metadata.model}
              </span>
            )}
            {metadata.latency_ms !== undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Clock className="w-3 h-3" />
                {metadata.latency_ms}ms
              </span>
            )}
            {metadata.estimated_cost !== undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <DollarSign className="w-3 h-3" />
                ${metadata.estimated_cost?.toFixed(4)}
              </span>
            )}
            {metadata.incident_risk !== undefined && metadata.incident_risk > 0.3 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                <AlertTriangle className="w-3 h-3" />
                Risk {(metadata.incident_risk * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
