import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Bell, ChevronDown } from 'lucide-react';
import { CommandPalette } from '../ui/CommandPalette';
import { GradientLogo } from '../ui/GradientLogo';

export const Header: React.FC<{ onCreateFormClick: () => void }> = ({ onCreateFormClick }) => {
  const { setActiveView, workspace } = useApp();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-[#2A3647] bg-[#121820] sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Brand Logo & Workspace Selector */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <GradientLogo size={32} showText={false} />
            <div className="hidden sm:block text-left">
              <h1 className="font-heading font-bold text-sm tracking-wide text-white leading-none">
                GRADIENT <span className="bg-gradient-to-r from-[#FF455B] to-[#3B82F6] bg-clip-text text-transparent font-normal">FORMS</span>
              </h1>
              <span className="text-[9px] text-[#84A1C0] font-mono tracking-wider">FORM OS</span>
            </div>
          </button>

          <div className="h-4 w-px bg-[#2A3647] hidden md:block" />

          {/* Workspace Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-medium text-slate-200 transition-colors"
            >
              <span className="text-sm">{workspace.logo}</span>
              <span>{workspace.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 rounded-xl bg-[#1A2332] border border-[#2A3647] p-2 shadow-neo z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-[#84A1C0]">WORKSPACES</div>
                <div className="p-2 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center gap-2 text-xs text-white">
                  <span>⚡</span>
                  <span className="font-medium">{workspace.name}</span>
                  <span className="ml-auto text-[10px] text-[#38BDF8] font-mono">Active</span>
                </div>
                <button
                  onClick={() => { setActiveView('settings'); setIsWorkspaceMenuOpen(false); }}
                  className="w-full mt-2 px-2.5 py-1.5 rounded hover:bg-[#121820] text-xs text-slate-400 hover:text-white transition-colors text-left"
                >
                  + Create Workspace
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar Trigger */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#84A1C0]" />
              <span>Search forms, responses, commands...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#121820] text-[10px] font-mono text-slate-400 border border-[#2A3647]">
              Cmd + K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateFormClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-neo transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Form</span>
          </button>

          <button
            onClick={() => setIsCommandOpen(true)}
            className="lg:hidden p-1.5 rounded-lg bg-[#1A2332] text-slate-300 border border-[#2A3647]"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className="p-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] text-slate-300 border border-[#2A3647] relative transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="User Avatar"
              className="w-7 h-7 rounded object-cover border border-[#2A3647]"
            />
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
