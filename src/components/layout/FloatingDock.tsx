import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  FileEdit,
  Sparkles,
  Database,
  Plus
} from 'lucide-react';
import { isFormEdited } from '../../utils/formFilters';

interface FloatingDockProps {
  onCreateFormClick: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onCreateFormClick }) => {
  const { activeView, setActiveView, forms } = useApp();
  const editedFormsCount = forms.filter(isFormEdited).length;

  const leftItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Forms', icon: LayoutDashboard, badge: editedFormsCount },
    { id: 'templates', label: 'Templates', icon: Sparkles },
  ];

  const rightItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'builder', label: 'Builder', icon: FileEdit },
  ];

  return (
    <>
      {/* Bottom-Center Floating Curved Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
        <div className="flex items-center gap-2 md:gap-3 px-4 py-2.5 rounded-full bg-[#121820]/95 backdrop-blur-xl border border-[#2A3647] shadow-[0_12px_40px_rgba(0,0,0,0.75)] transition-all hover:border-[#38BDF8]/40">
          
          {/* Left Navigation Group (Forms, Templates) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {leftItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`relative group flex items-center justify-center p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-[#1A2332]'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />

                  {/* Optional Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-[#38BDF8] text-[#0B0F14] shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  {/* Floating Tooltip Pill */}
                  <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 transform group-hover:-translate-y-0.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#1A2332] text-[10px] font-bold font-heading text-white border border-[#2A3647] whitespace-nowrap shadow-lg">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center Prominent "Create New Form" Action Button */}
          <div className="relative px-1 border-x border-[#2A3647]/80">
            <button
              onClick={onCreateFormClick}
              className="group relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_28px_rgba(56,189,248,0.7)] transition-all duration-300 transform hover:scale-110 cursor-pointer"
              title="Create New Form"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
              
              {/* Center Button Tooltip */}
              <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 transform group-hover:-translate-y-0.5">
                <span className="px-2.5 py-1 rounded-md bg-[#2563EB] text-[10px] font-bold font-heading text-white border border-[#38BDF8]/40 whitespace-nowrap shadow-xl">
                  Create New Form
                </span>
              </div>
            </button>
          </div>

          {/* Right Navigation Group (Integrations, Builder) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {rightItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id || (item.id === 'integrations' && activeView === 'integrations');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`relative group flex items-center justify-center p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-[#1A2332]'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />

                  {/* Floating Tooltip Pill */}
                  <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 transform group-hover:-translate-y-0.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#1A2332] text-[10px] font-bold font-heading text-white border border-[#2A3647] whitespace-nowrap shadow-lg">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
