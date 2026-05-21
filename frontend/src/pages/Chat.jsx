import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  MessageSquare,
  Clock,
  Target,
  Loader2,
  History,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Menu,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
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

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastMetadata, setLastMetadata] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeInteractionId, setActiveInteractionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await api.get('/interactions?limit=20');
      setInteractions(data.interactions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadInteraction = (interaction) => {
    const userMessage = {
      text: interaction.query,
      isUser: true,
      metadata: { timestamp: interaction.createdAt },
    };

    const aiMessage = {
      text: interaction.response || 'No response recorded',
      isUser: false,
      decision: null,
      rawResponse: interaction,
      metadata: {
        model: interaction.modelUsed,
        domain: interaction.domain,
        latency_ms: interaction.latencyMs,
        incident_risk: interaction.incidentRisk,
        routing_reason: interaction.routingReason,
        complexity_score: interaction.complexity?.score,
        complexity_level: interaction.complexity?.level,
        token_usage: interaction.tokenEstimate
          ? { prompt_tokens: interaction.tokenEstimate.prompt, completion_tokens: interaction.tokenEstimate.completion, total_tokens: interaction.tokenEstimate.total }
          : undefined,
        timestamp: interaction.createdAt,
      },
    };

    setMessages([userMessage, aiMessage]);
    setLastMetadata(aiMessage.metadata);
    setActiveInteractionId(interaction._id);
    setDecisionOpen(true); // Auto-open decision panel when loading history
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setLastMetadata(null);
    setActiveInteractionId(null);
    setDecisionOpen(false);
    inputRef.current?.focus();
  };

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
    setActiveInteractionId(null);
    setDecisionOpen(true); // Auto-open decision panel when user asks

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
      if (r.interactionId) setActiveInteractionId(r.interactionId);

      fetchHistory();
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
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up">
      {/* ─── Left Sidebar: Conversation History (Collapsible) ─── */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out border-r border-slate-200 bg-slate-50 ${
          historyOpen ? 'w-64' : 'w-0 border-r-0'
        } overflow-hidden flex flex-col`}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Audit
          </button>
        </div>

        {/* History Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <History className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Recent Audits
            </span>
          </div>
          {loadingHistory && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
        </div>

        {/* Interaction List */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1 scrollbar-thin">
          {interactions.length === 0 && !loadingHistory && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-xs text-slate-500">No audits yet</p>
            </div>
          )}

          {interactions.map((item) => (
            <button
              key={item._id}
              onClick={() => loadInteraction(item)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                activeInteractionId === item._id
                  ? 'bg-blue-50 border border-blue-100 shadow-sm'
                  : 'hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <MessageSquare
                  className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                    activeInteractionId === item._id
                      ? 'text-blue-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs leading-snug truncate ${
                      activeInteractionId === item._id
                        ? 'text-blue-900 font-medium'
                        : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {item.query}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    {item.incidentRisk > 0.5 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-orange-500">
                        <AlertTriangle className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Chat Area (ChatGPT style) ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Top Bar for toggles on mobile / when collapsed */}
        <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="text-slate-500 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Toggle History Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Decision Agent
          </div>
          <button
            onClick={() => setDecisionOpen(!decisionOpen)}
            className={`text-slate-500 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors ${decisionOpen ? 'bg-slate-100 text-blue-600' : ''}`}
            title="Toggle Decision Metadata"
          >
            {decisionOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isTyping ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  How can I assist your enterprise today?
                </h2>
                <p className="text-slate-500 max-w-lg mb-8">
                  I specialize in audit, compliance, and governance decision intelligence.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setInput(action.query)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group shadow-sm bg-white"
                    >
                      <span className="text-xl flex-shrink-0">{action.icon}</span>
                      <span className="text-sm text-slate-600 group-hover:text-blue-700 font-medium line-clamp-2">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className="w-full">
                    {msg.isUser ? (
                      <ChatMessage message={msg.text} isUser={true} metadata={msg.metadata} />
                    ) : msg.decision?._parsed ? (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 max-w-[calc(100%-2.5rem)]">
                          <DecisionCard
                            decision={msg.decision}
                            onGenerateReport={() => handleGenerateReport(msg)}
                          />
                        </div>
                      </div>
                    ) : (
                      <ChatMessage message={msg.text} isUser={false} metadata={msg.metadata} />
                    )}
                  </div>
                ))}
                {isTyping && <ChatMessage isTyping />}
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message SentinelOps AI for audit intelligence..."
              rows={1}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-14 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
              style={{
                minHeight: '52px',
                maxHeight: '200px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            AI can make mistakes. Always verify audit and compliance decisions.
          </p>
        </div>
      </div>

      {/* ─── Right Sidebar: Metadata/Decision Panel (Collapsible) ─── */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out border-l border-slate-200 bg-slate-50 ${
          decisionOpen ? 'w-80' : 'w-0 border-l-0'
        } overflow-hidden flex flex-col`}
      >
        <div className="w-80 h-full overflow-y-auto">
          <MetadataPanel interaction={lastMetadata} />
        </div>
      </div>
    </div>
  );
}
