import { useState, useEffect } from 'react';
import { Brain, Search, Network, Database, Loader2, Target, Calendar } from 'lucide-react';
import api from '../api/client.js';

export default function Memory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const res = await api.get('/memory');
        const m = Array.isArray(res) ? res : res.memories || res.results || [];
        setMemories(m);
      } catch (err) {
        console.error('Failed to load memory:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMemories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Brain className="w-7 h-7 text-purple-600" />
          Hindsight Memory
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Long-term persistent context extracted from enterprise decisions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Controls & Stats */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search semantic memory..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700">
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-bold">Total Memories</span>
                </div>
                <span className="text-lg font-black text-purple-800">{memories.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-600">
                  <Network className="w-4 h-4" />
                  <span className="text-sm font-bold">Vector Dimensions</span>
                </div>
                <span className="text-sm font-bold text-slate-800">1536</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">How it works</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              SentinelOps AI automatically extracts key facts, decisions, and governance implications from every chat interaction. 
              These are embedded into a vector database (Hindsight) and retrieved dynamically to provide context for future decisions.
            </p>
          </div>
        </div>

        {/* Right Col: Memory Stream */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-slate-700 font-bold">
              <Target className="w-4 h-4 text-purple-600" />
              Memory Stream
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : memories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                  <Brain className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="font-medium text-slate-600">No memories recorded yet.</p>
                  <p className="text-sm">They will appear as you make decisions.</p>
                </div>
              ) : (
                memories.map((mem, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0 border border-purple-200">
                        <span className="text-purple-600 text-xs font-bold">#</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                          {typeof mem === 'string' ? mem : mem.content || mem.text || JSON.stringify(mem)}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {mem.createdAt ? new Date(mem.createdAt).toLocaleDateString() : 'Recorded Context'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
