import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  FileText,
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Command Center' },
  { to: '/chat', icon: MessageSquare, label: 'Decision Agent' },
  { to: '/incidents', icon: AlertTriangle, label: 'Governance' },
  { to: '/audit', icon: FileText, label: 'Audit Log' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/memory', icon: Brain, label: 'Memory' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } h-screen sticky top-0 flex flex-col bg-sentinel-dark/80 backdrop-blur-xl border-r border-white/[0.06] transition-all duration-300 ease-in-out z-50`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-sentinel-emerald rounded-full border-2 border-sentinel-dark animate-pulse-glow" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in overflow-hidden">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              SentinelOps
            </h1>
            <p className="text-[10px] font-medium text-cyan-400 tracking-widest uppercase">
              AI Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-sm shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border-l-2 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                {!collapsed && (
                  <span className="animate-slide-in truncate">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-3">
        {/* System Status */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-xs text-slate-500">System Operational</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          </div>
        )}

        {/* Version */}
        {!collapsed && (
          <p className="text-[10px] text-slate-600 px-3">v1.0.0</p>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
