import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface RespondentTopBarProps {
  draftSavedTime?: string | null;
  isAutoSaveEnabled?: boolean;
}

export const RespondentTopBar: React.FC<RespondentTopBarProps> = ({
  draftSavedTime,
  isAutoSaveEnabled = true
}) => {
  return (
    <header className="w-full max-w-2xl sm:max-w-3xl mx-auto flex items-center justify-between py-4 sm:py-5 px-1 sm:px-2 z-20 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-[#2563EB]/30 rounded-lg blur-sm pointer-events-none" />
          <img
            src="/favicon.svg"
            alt="Gradient Forms"
            className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]"
          />
        </div>
        <span className="font-heading font-bold text-sm sm:text-base tracking-wide text-white flex items-center gap-1.5">
          <span>Gradient Forms</span>
        </span>
      </div>

      {/* Auto-Save & Security Indicator */}
      <div className="flex items-center gap-2">
        {isAutoSaveEnabled && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D1627]/80 backdrop-blur-md border border-[#1E2D45] text-slate-300 text-xs shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-200">
              {draftSavedTime ? `Auto-Saved @ ${draftSavedTime}` : 'Auto-Save Active'}
            </span>
          </div>
        )}
        <div
          className="p-1.5 rounded-full bg-[#0D1627]/60 border border-[#1E2D45]/70 text-slate-400"
          title="TLS 256-bit encrypted submission"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
        </div>
      </div>
    </header>
  );
};
