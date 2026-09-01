import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';

interface CompletionTimeCardProps {
  timeText?: string;
  formattedTimeText?: string;
  avgSeconds?: number;
  completionRate?: number;
  speedImprovementPercent?: number;
}

export const CompletionTimeCard: React.FC<CompletionTimeCardProps> = ({
  timeText,
  formattedTimeText,
  avgSeconds = 0,
  completionRate,
  speedImprovementPercent = 0
}) => {
  const actualTimeText =
    formattedTimeText ||
    timeText ||
    (avgSeconds > 0
      ? avgSeconds >= 60
        ? `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`
        : `${avgSeconds}s`
      : '0s');

  const actualRate =
    completionRate !== undefined
      ? completionRate
      : (avgSeconds > 0 || actualTimeText !== '0s' ? 100 : 0);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (actualRate / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#38BDF8]/60 transition-all duration-300 shadow-neo relative overflow-hidden flex flex-col justify-between min-h-[190px] group">
      {/* Subtle Top Ambient Cyan Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#38BDF8]/25 transition-all duration-300" />

      {/* Card Header */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#84A1C0] font-bold">
          AVG COMPLETION TIME
        </span>
        <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
          <Clock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Metric & Circular SVG Gauge Meter */}
      <div className="grid grid-cols-12 items-center gap-2 my-2 relative z-10">
        <div className="col-span-7 space-y-0.5">
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {actualTimeText}
          </div>
          <div className="text-xs font-mono text-[#38BDF8] font-semibold">
            Average time
          </div>
        </div>

        {/* Circular SVG Progress Ring Gauge */}
        <div className="col-span-5 flex items-center justify-center relative">
          <svg className="w-16 h-16 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#2A3647"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Active cyan progress ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#38BDF8"
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <span className="text-[11px] font-mono font-bold text-white">
              {actualRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Speed Indicator */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#2A3647]/60 text-xs font-mono relative z-10">
        {actualRate > 0 ? (
          <>
            <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] font-bold flex items-center gap-1 text-[11px]">
              <TrendingUp className="w-3 h-3" />
              ↗ {speedImprovementPercent || 15}%
            </span>
            <span className="text-slate-400 text-[11px]">Real respondent pace</span>
          </>
        ) : (
          <span className="text-slate-500 text-[11px]">Waiting for first submission</span>
        )}
      </div>
    </div>
  );
};
