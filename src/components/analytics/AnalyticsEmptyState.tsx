import React from 'react';
import { Inbox, Share2, Plus, ArrowRight } from 'lucide-react';

interface AnalyticsEmptyStateProps {
  title?: string;
  description?: string;
  onShareClick?: () => void;
  formTitle?: string;
}

export const AnalyticsEmptyState: React.FC<AnalyticsEmptyStateProps> = ({
  title = 'NO RESPONSE DATA YET',
  description = 'Analytics and response distributions will appear here as soon as respondents submit this form.',
  onShareClick,
  formTitle
}) => {
  return (
    <div className="p-8 md:p-12 rounded-2xl bg-[#121820] border border-[#2A3647] text-center max-w-2xl mx-auto space-y-5 my-8 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-[#1A2332] border border-[#2A3647] text-[#38BDF8] flex items-center justify-center mx-auto shadow-sm">
        <Inbox className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#38BDF8] uppercase">
          Awaiting Submissions
        </span>
        <h3 className="text-lg md:text-xl font-bold font-heading text-white">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {formTitle && (
        <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#2A3647] text-xs font-mono text-slate-300 max-w-sm mx-auto">
          <span className="text-slate-500 mr-2">Form:</span>
          <span className="text-white font-bold">{formTitle}</span>
        </div>
      )}

      {onShareClick && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onShareClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-indigo-600 hover:from-[#1D4ED8] hover:to-indigo-700 text-white text-xs font-bold shadow-neo transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-cyan-300" />
            <span>Share Form to Collect Responses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
