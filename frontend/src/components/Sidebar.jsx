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
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Agent' },
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
        collapsed ? 'w-[68px]' : 'w-60'
      } h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-50`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-200">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
              SentinelOps
            </h1>
            <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">
              AI Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-150 ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-2.5 py-3 border-t border-slate-200 space-y-2">
        {/* System Status */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600 font-medium">System Operational</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-150 border border-transparent hover:border-slate-200"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
