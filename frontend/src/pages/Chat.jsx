import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shield, AlertTriangle, DollarSign, Target, BarChart2, FileText, Download, Loader2 } from 'lucide-react';
import api from '../api/client.js';
import ChatMessage from '../components/ChatMessage.jsx';
import MetadataPanel from '../components/MetadataPanel.jsx';
import DecisionCard from '../components/DecisionCard.jsx';

const QUICK_ACTIONS = [
  { icon: '🛡️', label: 'Compliance Audit', query: 'Analyze compliance risks for our enterprise AI deployment handling customer PII data across multiple cloud regions' },
  { icon: '🚨', label: 'Incident Response', query: 'Our production API gateway is showing 5x latency spikes. Assess the incident severity and recommend immediate actions' },
  { icon: '💰', label: 'Cost Optimization', query: 'Evaluate cost optimization strategies for our multi-model AI infrastructure spending $50K/month on inference' },
  { icon: '🔒', label: 'Governance Review', query: 'Review governance implications of deploying an autonomous AI decision system in our financial trading operations' },
  { icon: '📊', label: 'Strategic Analysis', query: 'Analyze the strategic tradeoffs between building vs buying an enterprise AI platform for our 500-person engineering org' },
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastMetadata, setLastMetadata] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage = {
      text: query,
      isUser: true,
      metadata: { timestamp: new Date().toISOString() },
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const r = await api.post('/chat', { query });

      const decision = r.decision || null;
      if (decision && r.memoryReferences?.length > 0) {
        decision._memoryRefs = r.memoryReferences;
      }

      const aiMessage = {
        text: r.response || r.message || 'No response received',
        isUser: false,
        decision,
        rawResponse: r,
        metadata: {
          model: r.model,
          domain: r.domain,
          latency_ms: r.latencyMs ?? r.latency_ms,
          estimated_cost: r.costEstimate ?? r.estimated_cost,
          incident_risk: r.incidentRisk ?? r.incident_risk,
          routing_reason: r.routingReason ?? r.routing_reason,
          complexity_score: r.complexity?.score ?? r.complexity_score,
          complexity_level: r.complexity?.level ?? r.complexity_level,
          confidence_score: decision?.confidenceScore,
          token_usage: r.tokenEstimate
            ? { prompt_tokens: r.tokenEstimate.prompt, completion_tokens: r.tokenEstimate.completion, total_tokens: r.tokenEstimate.total }
            : r.token_usage,
          memory_context: r.memoryContext ?? r.memory_context,
          timestamp: new Date().toISOString(),
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLastMetadata(aiMessage.metadata);
    } catch (err) {
      const errorMessage = {
        text: `Error: ${err.error || err.message || 'Failed to get response'}`,
        isUser: false,
        metadata: { timestamp: new Date().toISOString() },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateReport = async (msg) => {
    if (generatingReport) return;
    setGeneratingReport(true);
    try {
      const r = msg.rawResponse || {};
      const report = await api.post('/reports/generate', {
        interactionId: r.interactionId,
        query: r.query,
        decision: r.decision || msg.decision,
        model: r.model,
        routingReason: r.routingReason,
        latencyMs: r.latencyMs,
        costEstimate: r.costEstimate,
        complexity: r.complexity,
        memoryReferences: r.memoryReferences,
        incidents: r.incidents,
      });

      // Download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentinelops-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report generation failed:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)] animate-fade-up">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
          {messages.length === 0 && !isTyping ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mb-6 border border-white/[0.06]">
                <Target className="w-10 h-10 text-cyan-400/60" />
              </div>
              <h2 className="text-xl font-semibold text-slate-300 mb-1">
                Decision Intelligence Agent
              </h2>
              <p className="text-sm text-slate-500 max-w-lg leading-relaxed mb-6">
                Describe your enterprise decision problem. SentinelOps AI will analyze risk, recommend actions, and flag governance concerns.
              </p>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full max-w-2xl">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.query)}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-cyan-500/20 transition-all duration-200 text-left group"
                  >
                    <span className="text-lg flex-shrink-0">{action.icon}</span>
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.isUser ? (
                    <ChatMessage
                      message={msg.text}
                      isUser={true}
                      metadata={msg.metadata}
                    />
                  ) : msg.decision?._parsed ? (
                    /* Structured Decision Response */
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Target className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <DecisionCard
                          decision={msg.decision}
                          onGenerateReport={() => handleGenerateReport(msg)}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Fallback plain text */
                    <ChatMessage
                      message={msg.text}
                      isUser={false}
                      metadata={msg.metadata}
                    />
                  )}
                </div>
              ))}
              {isTyping && <ChatMessage isTyping />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 pt-3 border-t border-white/[0.06]">
          <div className="glass rounded-2xl flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your enterprise decision problem..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 border-none outline-none resize-none px-3 py-2.5 max-h-32"
              style={{
                height: 'auto',
                minHeight: '40px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Enterprise Decision Intelligence — Adaptive model routing • Governance-aware • Memory-enhanced
          </p>
        </div>
      </div>

      {/* Metadata Panel */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <MetadataPanel interaction={lastMetadata} />
      </div>
    </div>
  );
}
