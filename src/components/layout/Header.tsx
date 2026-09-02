import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_AVATAR } from '../../data/seedData';
import { Search } from 'lucide-react';
import { CommandPalette } from '../ui/CommandPalette';
import { GradientLogo } from '../ui/GradientLogo';

export const Header: React.FC<{ onCreateFormClick: () => void }> = () => {
  const { setActiveView, currentUser } = useApp();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-[#2A3647] bg-[#121820] sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 group focus:outline-none cursor-pointer"
          >
            <GradientLogo size={28} showText={false} />
            <div className="hidden xs:block text-left">
              <h1 className="font-heading font-bold text-xs sm:text-sm tracking-wide text-white leading-none">
                GRADIENT <span className="bg-gradient-to-r from-[#FF455B] to-[#3B82F6] bg-clip-text text-transparent font-normal">FORMS</span>
              </h1>
              <span className="text-[8px] sm:text-[9px] text-[#84A1C0] font-mono tracking-wider block">FORM OS</span>
            </div>
          </button>
        </div>

        {/* Center: Enhanced Responsive Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/50 focus:outline-none focus:border-[#38BDF8] text-xs text-slate-300 transition-all duration-200 shadow-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38BDF8] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-slate-400 group-hover:text-slate-200 truncate text-[11px] sm:text-xs">
                <span className="hidden sm:inline">Search forms, templates, logic, responses...</span>
                <span className="inline sm:hidden">Search workspace...</span>
              </span>
            </div>
            <kbd className="hidden md:inline-block px-2 py-0.5 rounded bg-[#121820] text-[10px] font-mono text-[#38BDF8] border border-[#2A3647] shadow-inner font-bold shrink-0">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-2 focus:outline-none group cursor-pointer"
            title={`${currentUser.name} (${currentUser.role}) — Settings`}
          >
            <img
              src={currentUser.avatar || DEFAULT_AVATAR}
              alt={currentUser.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#2A3647] group-hover:border-[#38BDF8] transition-colors bg-[#1A2332]"
            />
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
