import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  FileEdit,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { isFormEdited } from '../../utils/formFilters';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { activeView, setActiveView, forms } = useApp();
  const editedFormsCount = forms.filter(isFormEdited).length;

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Forms', icon: LayoutDashboard, badge: editedFormsCount },
    { id: 'builder', label: 'Builder', icon: FileEdit },
    { id: 'templates', label: 'Templates', icon: Sparkles },
  ];

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] sticky top-0 bg-[#121820] border-r border-[#2A3647] flex flex-col justify-between transition-all duration-200 z-30 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Top Navigation */}
      <div className="p-2 space-y-6 overflow-y-auto">
        <div>
          {!collapsed && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#84A1C0] px-2.5">
              Workspace Nav
            </span>
          )}
          <nav className="mt-1.5 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors relative group ${
                    isActive
                      ? 'bg-[#2563EB]/20 text-white border border-[#2563EB]/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1A2332]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#38BDF8]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {!collapsed && item.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.2 rounded bg-[#1A2332] text-[10px] text-slate-400 font-mono border border-[#2A3647]">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#2563EB] rounded-r" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Collapse Button */}
      <div className="p-2 border-t border-[#2A3647]">
        {/* Toggle Collapse */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] text-slate-400 hover:text-white transition-colors border border-[#2A3647]"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
