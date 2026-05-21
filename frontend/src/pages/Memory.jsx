import { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Send,
  Loader2,
  Database,
  ArrowDownCircle,
  ArrowUpCircle,
  Wifi,
  WifiOff,
  Clock,
  Sparkles,
  Tag,
  FileText,
  Layers,
  AlertCircle,
} from 'lucide-react';
import api from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';

/* ------------------------------------------------------------------ */
/*  Safe stringifier — never lets a raw object reach React's renderer  */
/* ------------------------------------------------------------------ */
function safeRender(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  // Arrays / objects → pretty JSON inside a <pre>
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function Memory() {
  const [recallQuery, setRecallQuery] = useState('');
  const [recallResults, setRecallResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalling, setRecalling] = useState(false);
  const [connected, setConnected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/memory/history');

      // Backend returns { operations: [...], total } OR legacy shapes
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.operations)) {
        data = response.operations;
      } else if (Array.isArray(response?.history)) {
        data = response.history;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      }

      setHistory(data);
      setConnected(true);
    } catch (err) {
      console.error('Memory fetch error:', err);
      setConnected(false);
      setError(err?.message || 'Failed to load memory history');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecall() {
    if (!recallQuery.trim() || recalling) return;
    setRecalling(true);
    setRecallResults(null);
    try {
      const response = await api.post('/memory/recall', {
        query: recallQuery.trim(),
      });
      setRecallResults(response ?? { results: [] });
    } catch (err) {
      console.error('Recall error:', err);
      setRecallResults({
        error: err?.error || err?.message || 'Recall failed',
      });
    } finally {
      setRecalling(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRecall();
    }
  };

  /* ------------------------------------------------ */
  /*  Render helpers for Hindsight recall response     */
  /* ------------------------------------------------ */

  /** Render the `results` array (or fallback to raw display) */
  function renderResults(data) {
    // data.results can be an array from Hindsight
    const results = Array.isArray(data?.results) ? data.results : null;

    if (results && results.length > 0) {
      return (
        <div className="space-y-2">
          <h4 className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <Search className="w-3 h-3" />
            Results ({results.length})
          </h4>
          {results.map((r, i) => (
            <div
              key={i}
              className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]"
            >
              <p className="text-[10px] text-slate-500 mb-1">
                Match #{i + 1}
                {typeof r?.score === 'number'
                  ? ` — score: ${r.score.toFixed(3)}`
                  : ''}
                {typeof r?.similarity === 'number'
                  ? ` — similarity: ${(r.similarity * 100).toFixed(1)}%`
                  : ''}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {typeof r === 'string'
                  ? r
                  : r?.content || r?.text || r?.fact || safeRender(r)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }

  /** Render the `entities` object */
  function renderEntities(data) {
    const entities = data?.entities;
    if (!entities || typeof entities !== 'object') return null;

    const entries = Object.entries(entities);
    if (entries.length === 0) return null;

    return (
      <div className="mt-3">
        <h4 className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          Entities ({entries.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {entries.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300"
            >
              <span className="font-medium text-purple-400">{safeRender(key)}</span>
              {value !== null && value !== undefined && value !== key && (
                <span className="text-purple-300/60">
                  : {typeof value === 'object' ? safeRender(value) : String(value)}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /** Render source_facts if present */
  function renderSourceFacts(data) {
    const facts = data?.source_facts;
    if (!facts) return null;

    const factList = Array.isArray(facts) ? facts : [facts];
    if (factList.length === 0) return null;

    return (
      <div className="mt-3">
        <h4 className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          Source Facts
        </h4>
        <div className="space-y-1.5">
          {factList.map((fact, i) => (
            <div
              key={i}
              className="bg-white/[0.02] rounded-lg p-2.5 text-xs text-slate-400 border border-white/[0.04]"
            >
              {typeof fact === 'string' ? fact : safeRender(fact)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /** Render trace/chunks as collapsible debug info */
  function renderDebugInfo(data) {
    const trace = data?.trace;
    const chunks = data?.chunks;
    if (!trace && !chunks) return null;

    return (
      <details className="mt-3 group">
        <summary className="text-[11px] uppercase tracking-wider text-slate-600 cursor-pointer hover:text-slate-400 transition-colors flex items-center gap-1.5">
          <Layers className="w-3 h-3" />
          Debug Info
        </summary>
        <pre className="mt-2 bg-white/[0.02] rounded-lg p-3 text-[10px] text-slate-500 leading-relaxed max-h-40 overflow-auto border border-white/[0.04] whitespace-pre-wrap break-words">
          {safeRender({ trace, chunks })}
        </pre>
      </details>
    );
  }

  /** Master recall renderer — handles all Hindsight response shapes */
  function renderRecallResults(data) {
    if (!data) return null;
    if (data.error) {
      return (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-400">{safeRender(data.error)}</p>
        </div>
      );
    }

    // If the response is a plain string
    if (typeof data === 'string') {
      return (
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
          <p className="text-sm text-slate-300">{data}</p>
        </div>
      );
    }

    // Hindsight rich response: { results, entities, trace, chunks, source_facts }
    const hasResults = Array.isArray(data?.results) && data.results.length > 0;
    const hasEntities =
      data?.entities &&
      typeof data.entities === 'object' &&
      Object.keys(data.entities).length > 0;
    const hasFacts = data?.source_facts;
    const hasDebug = data?.trace || data?.chunks;

    // Nothing meaningful to display
    if (!hasResults && !hasEntities && !hasFacts && !hasDebug) {
      // Check for legacy shapes: context, data, count
      const fallbackText =
        data?.context || data?.message || data?.data;
      if (fallbackText) {
        return (
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {typeof fallbackText === 'string'
                ? fallbackText
                : safeRender(fallbackText)}
            </p>
          </div>
        );
      }

      return (
        <div className="bg-slate-500/5 rounded-xl p-4 border border-white/[0.06] text-center">
          <Brain className="w-6 h-6 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            No memories found for this query
          </p>
          {typeof data?.count === 'number' && (
            <p className="text-[10px] text-slate-600 mt-1">
              {data.count} results returned
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] space-y-0">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Recall Results
          {typeof data?.count === 'number' && (
            <span className="text-slate-600 font-normal ml-1">
              ({data.count})
            </span>
          )}
        </h3>
        {renderResults(data)}
        {renderEntities(data)}
        {renderSourceFacts(data)}
        {renderDebugInfo(data)}
      </div>
    );
  }

  /* ------------------------------------------------ */
  /*  Main Render                                      */
  /* ------------------------------------------------ */
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Memory
          </h1>
          <p className="text-slate-400 mt-1">
            Hindsight memory recall & history
          </p>
        </div>

        {/* Connection Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connected === true
              ? 'bg-emerald-500/10 text-emerald-400'
              : connected === false
              ? 'bg-rose-500/10 text-rose-400'
              : 'bg-slate-500/10 text-slate-400'
          }`}
        >
          {connected === true ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              Hindsight Connected
            </>
          ) : connected === false ? (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              Hindsight Disconnected
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking...
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-2 animate-fade-up">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-rose-400">{error}</p>
            <button
              onClick={fetchHistory}
              className="text-xs text-rose-300 underline mt-1 hover:text-rose-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Recall Search */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          Memory Recall
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={recallQuery}
              onChange={(e) => setRecallQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search memory for relevant context..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <button
            onClick={handleRecall}
            disabled={!recallQuery.trim() || recalling}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
          >
            {recalling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Recall
          </button>
        </div>

        {/* Recall Results */}
        {recallResults && (
          <div className="mt-4 animate-fade-up">
            {renderRecallResults(recallResults)}
          </div>
        )}
      </div>

      {/* Memory History */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Memory Operations
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {history.map((entry, idx) => {
              const op = entry?.operation || entry?.type || '';
              const isRetain = op === 'retain';
              const isReflect = op === 'reflect';
              return (
                <div
                  key={entry?.id || idx}
                  className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isRetain ? (
                        <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                      ) : isReflect ? (
                        <Brain className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-cyan-400" />
                      )}
                      <StatusBadge
                        label={isRetain ? 'Retain' : isReflect ? 'Reflect' : 'Recall'}
                        variant={isRetain ? 'success' : isReflect ? 'warning' : 'info'}
                      />
                      {entry?.success === true && (
                        <span className="text-[10px] text-emerald-500">✓</span>
                      )}
                      {entry?.success === false && (
                        <span className="text-[10px] text-rose-500">✗</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {entry?.timestamp
                        ? new Date(entry.timestamp).toLocaleString()
                        : '—'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-1">
                    {safeRender(
                      entry?.detail || entry?.query || entry?.content || entry?.text || '—'
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry?.bankName && (
                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {safeRender(entry.bankName)}
                      </span>
                    )}
                    {entry?.model && (
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        {safeRender(entry.model)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Brain className="w-10 h-10 mb-3 text-slate-600" />
            <p className="text-sm">No memory operations yet</p>
            <p className="text-xs text-slate-600 mt-1">
              Memory events will appear here as interactions occur
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
