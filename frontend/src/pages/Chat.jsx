import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  MessageSquare,
  Clock,
  Target,
  Loader2,
  History,
  AlertTriangle,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import api from '../api/client.js';
import ChatMessage from '../components/ChatMessage.jsx';
import MetadataPanel from '../components/MetadataPanel.jsx';
import DecisionCard from '../components/DecisionCard.jsx';

const QUICK_ACTIONS = [
  {
    icon: '🛡️',
    label: 'Compliance Audit',
    query:
      'Analyze compliance risks for our enterprise AI deployment handling customer PII data across multiple cloud regions',
  },
  {
    icon: '🚨',
    label: 'Incident Response',
    query:
      'Our production API gateway is showing 5x latency spikes. Assess the incident severity and recommend immediate actions',
  },
  {
    icon: '💰',
    label: 'Cost Optimization',
    query:
      'Evaluate cost optimization strategies for our multi-model AI infrastructure spending $50K/month on inference',
  },
  {
    icon: '🔒',
    label: 'Governance Review',
    query:
      'Review governance implications of deploying an autonomous AI decision system in our financial trading operations',
  },
  {
    icon: '📊',
    label: 'Strategic Analysis',
    query:
      'Analyze the strategic tradeoffs between building vs buying an enterprise AI platform for our 500-person engineering org',
  },
];

function formatRelativeTime(dateString) {
  if (!dateString) return 'Unknown';

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

  return date.toLocaleDateString();
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastMetadata, setLastMetadata] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeInteractionId, setActiveInteractionId] = useState(null);
  const [paramsOpen, setParamsOpen] = useState(false);
  
  // Advanced parameters
  const [financialContext, setFinancialContext] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [sensitivityLevel, setSensitivityLevel] = useState('internal');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);

    try {
      const data = await api.get('/interactions?limit=20');

      setInteractions(data?.interactions || []);
    } catch (err) {
      console.error('History fetch failed:', err);
      setInteractions([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setLastMetadata(null);
    setActiveInteractionId(null);
    setDecisionOpen(false);

    inputRef.current?.focus();
  };

  const loadInteraction = (interaction) => {
    if (!interaction) return;

    const userMessage = {
      text: interaction.query || '',
      isUser: true,
      metadata: {
        timestamp: interaction.createdAt,
      },
    };

    const aiMessage = {
      text: interaction.response || 'No response recorded',
      isUser: false,
      decision: interaction.decision || null,
      rawResponse: interaction,
      metadata: {
        model: interaction.modelUsed,
        domain: interaction.domain,
        latency_ms: interaction.latencyMs,
        incident_risk: interaction.incidentRisk,
        routing_reason: interaction.routingReason,
        complexity_score: interaction?.complexity?.score,
        complexity_level: interaction?.complexity?.level,
        timestamp: interaction.createdAt,
      },
    };

    setMessages([userMessage, aiMessage]);
    setLastMetadata(aiMessage.metadata);
    setActiveInteractionId(interaction._id);
    setDecisionOpen(true);
  };

  const handleSend = async () => {
    const query = input.trim();

    if (!query || isTyping) return;

    const userMessage = {
      text: query,
      isUser: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput('');
    setIsTyping(true);
    setDecisionOpen(true);

    try {
      const r = await api.post('/chat', { 
        query,
        financialContext: financialContext.trim() || undefined,
        urgency,
        sensitivityLevel
      });

      console.log('API RESPONSE:', r);

      const aiMessage = {
        text:
          r?.response ||
          r?.message ||
          'No response received from SentinelOps AI',

        isUser: false,

        decision: r?.decision || null,

        rawResponse: r,

        metadata: {
          model: r?.model,
          domain: r?.domain,
          latency_ms: r?.latencyMs,
          estimated_cost: r?.costEstimate,
          incident_risk: r?.incidentRisk,
          routing_reason: r?.routingReason,
          complexity_score: r?.complexity?.score,
          complexity_level: r?.complexity?.level,
          timestamp: new Date().toISOString(),
        },
      };

      setMessages((prev) => [...prev, aiMessage]);

      setLastMetadata(aiMessage.metadata);

      if (r?.interactionId) {
        setActiveInteractionId(r.interactionId);
      }

      fetchHistory();
    } catch (err) {
      console.error('CHAT ERROR:', err);

      const readableError =
        typeof err === 'string'
          ? err
          : err?.error?.message ||
            err?.error ||
            err?.message ||
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            'Failed to get response from SentinelOps AI';

      const errorMessage = {
        text: `Error: ${readableError}`,
        isUser: false,
        metadata: {
          timestamp: new Date().toISOString(),
          error: true,
        },
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

  return (
    <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      {/* LEFT SIDEBAR */}
      {historyOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-slate-900/20 z-20"
          onClick={() => setHistoryOpen(false)}
        />
      )}
      <div
        className={`transition-all duration-300 border-r border-slate-200 bg-slate-50 md:relative absolute left-0 top-0 bottom-0 z-30 ${
          historyOpen ? 'w-64' : 'w-0'
        } overflow-hidden flex flex-col`}
      >
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Audit
          </button>
        </div>

        <div className="px-4 py-3 flex items-center gap-2 text-slate-500">
          <History className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase">
            Recent Audits
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {loadingHistory && (
            <div className="p-4 text-center text-slate-400 text-sm">
              Loading...
            </div>
          )}

          {!loadingHistory &&
            interactions.map((item) => (
              <button
                key={item._id}
                onClick={() => loadInteraction(item)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="text-xs font-medium truncate">
                  {item.query}
                </div>

                <div className="text-[10px] text-slate-400 mt-1">
                  {formatRelativeTime(item.createdAt)}
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Decision Agent
          </div>

          <button
            onClick={() => setDecisionOpen(!decisionOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100"
          >
            {decisionOpen ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelRightOpen className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isTyping ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-12 animate-fade-up">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  How can I assist your enterprise today?
                </h2>
                <p className="text-slate-500 font-medium max-w-lg mb-8">
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
                      <span className="text-sm text-slate-600 group-hover:text-blue-700 font-semibold line-clamp-2">
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
                    ) : msg.decision ? (
                      <DecisionCard decision={msg.decision} />
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

        {/* INPUT */}
        <div className="p-4 border-t border-slate-200 bg-white z-10">
          <div className="max-w-4xl mx-auto">
            {/* Advanced Parameters Toggle */}
            <button 
              onClick={() => setParamsOpen(!paramsOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 px-2 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Audit Parameters
              {paramsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Advanced Parameters Panel */}
            {paramsOpen && (
              <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-up">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Financial Impact Context</label>
                  <p className="text-[10px] text-slate-500 leading-snug mb-1">How much money is at risk? (e.g. "$50k monthly loss", "$2M budget")</p>
                  <input 
                    type="text" 
                    value={financialContext}
                    onChange={e => setFinancialContext(e.target.value)}
                    placeholder="Enter financial context..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Required Urgency</label>
                  <p className="text-[10px] text-slate-500 leading-snug mb-1">How quickly does this need resolution?</p>
                  <select 
                    value={urgency}
                    onChange={e => setUrgency(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
                  >
                    <option value="low">Low - Routine</option>
                    <option value="medium">Medium - Normal</option>
                    <option value="high">High - Priority</option>
                    <option value="critical">Critical - Immediate</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Data Sensitivity</label>
                  <p className="text-[10px] text-slate-500 leading-snug mb-1">What kind of data are we dealing with?</p>
                  <select 
                    value={sensitivityLevel}
                    onChange={e => setSensitivityLevel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
                  >
                    <option value="public">Public - Safe to share globally</option>
                    <option value="internal">Internal - Company staff only</option>
                    <option value="confidential">Confidential - Leadership/NDAs only</option>
                    <option value="secret">Secret - Strictly regulated (PII/PHI)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message SentinelOps AI for audit intelligence..."
                rows={1}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl pl-4 pr-14 py-3.5 text-sm resize-none transition-all outline-none shadow-sm"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 transition-opacity hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      {decisionOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-slate-900/20 z-20"
          onClick={() => setDecisionOpen(false)}
        />
      )}
      <div
        className={`transition-all duration-300 border-l border-slate-200 bg-slate-50 md:relative absolute right-0 top-0 bottom-0 z-30 ${
          decisionOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="w-80 h-full overflow-y-auto">
          <MetadataPanel interaction={lastMetadata} />
        </div>
      </div>
    </div>
  );
}