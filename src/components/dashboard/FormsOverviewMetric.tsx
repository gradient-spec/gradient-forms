import React from 'react';
import { FileText } from 'lucide-react';
import { Form } from '../../types';

interface FormsOverviewMetricProps {
  forms: Form[];
}

export const FormsOverviewMetric: React.FC<FormsOverviewMetricProps> = ({ forms }) => {
  const total = forms.length;
  const published = forms.filter(f => f.isPublished).length;
  const draft = forms.filter(f => !f.isPublished).length;
  const publishedPct = total > 0 ? Math.round((published / total) * 100) : 0;
  const draftPct = total > 0 ? 100 - publishedPct : 0;

  return (
    <div className="p-3.5 md:p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] flex flex-col justify-between space-y-2.5 hover:border-[#38BDF8]/30 transition-all duration-200 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8]">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#84A1C0]">
            Total Forms
          </span>
        </div>
        <div className="text-xl font-extrabold font-mono text-white">
          {total}
        </div>
      </div>

      {/* Sleek Mini Inventory Bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-[#121820] overflow-hidden flex">
          {total > 0 ? (
            <>
              <div
                style={{ width: `${publishedPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`${published} Published`}
              />
              <div
                style={{ width: `${draftPct}%` }}
                className="bg-slate-600 h-full transition-all duration-300"
                title={`${draft} Draft`}
              />
            </>
          ) : (
            <div className="w-full bg-[#121820] h-full" />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Published: <strong className="text-white">{published}</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Draft: <strong className="text-white">{draft}</strong></span>
          </span>
        </div>
      </div>
    </div>
  );
};
