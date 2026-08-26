import React from 'react';
import { CheckCircle2, ArrowRight, Table } from 'lucide-react';

export const GoogleSheetsSyncCard: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#10B981]/60 transition-all duration-300 shadow-neo relative overflow-hidden flex flex-col justify-between min-h-[190px] group">
      {/* Subtle Top Ambient Emerald Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#10B981]/25 transition-all duration-300" />

      {/* Card Header */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#84A1C0] font-bold">
          GOOGLE SHEETS SYNC
        </span>
        <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
          <Table className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Metric & 3D Spreadsheet Graphic */}
      <div className="grid grid-cols-12 items-center gap-2 my-2 relative z-10">
        <div className="col-span-7 space-y-0.5">
          <div className="text-3xl font-extrabold font-mono text-[#10B981] tracking-tight">
            100%
          </div>
          <div className="text-xs font-mono text-slate-300 font-semibold">
            Synced
          </div>
        </div>

        {/* Isometric 3D Spreadsheet Icon Graphic */}
        <div className="col-span-5 flex items-center justify-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] p-2.5 shadow-neo border border-[#34D399]/40 flex flex-col justify-between transform group-hover:scale-105 transition-transform">
            <div className="grid grid-cols-3 gap-1">
              <div className="h-1.5 bg-white/80 rounded-sm" />
              <div className="h-1.5 bg-white/80 rounded-sm" />
              <div className="h-1.5 bg-white/80 rounded-sm" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-1.5 bg-white/50 rounded-sm" />
              <div className="h-1.5 bg-white/50 rounded-sm" />
              <div className="h-1.5 bg-white/50 rounded-sm" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-1.5 bg-white/50 rounded-sm" />
              <div className="h-1.5 bg-white/50 rounded-sm" />
              <div className="h-1.5 bg-white/50 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sync Status & Connection Pipeline */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2A3647]/60 text-xs font-mono relative z-10">
        <span className="px-2 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-bold flex items-center gap-1 text-[11px]">
          <CheckCircle2 className="w-3 h-3" />
          ✓ All good
        </span>
        <span className="text-slate-400 text-[11px]">Last sync: just now</span>
      </div>
    </div>
  );
};
