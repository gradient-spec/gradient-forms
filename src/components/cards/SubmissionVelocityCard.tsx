import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface SubmissionVelocityCardProps {
  count?: number;
  velocityPercent?: number;
}

export const SubmissionVelocityCard: React.FC<SubmissionVelocityCardProps> = ({
  count = 142,
  velocityPercent = 18
}) => {
  return (
    <div className="p-6 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#8B5CF6]/60 transition-all duration-300 shadow-neo relative overflow-hidden flex flex-col justify-between min-h-[190px] group">
      {/* Subtle Top Ambient Violet Glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#8B5CF6]/25 transition-all duration-300" />

      {/* Card Header */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#84A1C0] font-bold">
          SUBMISSIONS
        </span>
        <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
          <BarChart3 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Metric & Integrated SVG Trend Sparkline */}
      <div className="grid grid-cols-12 items-end gap-2 my-2 relative z-10">
        <div className="col-span-5 space-y-0.5">
          <div className="text-4xl font-extrabold font-mono text-white tracking-tight">
            {count}
          </div>
          <div className="text-xs font-mono text-[#8B5CF6] font-semibold">
            Responses
          </div>
        </div>

        {/* Integrated SVG Sparkline Curve */}
        <div className="col-span-7 h-14 relative flex items-end">
          <svg viewBox="0 0 160 50" fill="none" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="violet-spark-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Filled area under curve */}
            <path
              d="M 0 40 Q 30 35, 50 25 T 100 20 T 130 10 T 160 5 L 160 50 L 0 50 Z"
              fill="url(#violet-spark-grad)"
            />

            {/* Glowing trend line */}
            <path
              d="M 0 40 Q 30 35, 50 25 T 100 20 T 130 10 T 160 5"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* End glowing data point */}
            <circle cx="160" cy="5" r="4" fill="#C084FC" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* Footer Indicator */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#2A3647]/60 text-xs font-mono relative z-10">
        <span className="px-2 py-0.5 rounded bg-[#0A9E4A]/15 border border-[#0A9E4A]/30 text-[#0A9E4A] font-bold flex items-center gap-1 text-[11px]">
          <TrendingUp className="w-3 h-3" />
          ↗ {velocityPercent}%
        </span>
        <span className="text-slate-400 text-[11px]">From last 7 days</span>
      </div>
    </div>
  );
};
