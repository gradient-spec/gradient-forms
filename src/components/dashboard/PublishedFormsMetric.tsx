import React from 'react';
import { Globe, Radio } from 'lucide-react';
import { Form } from '../../types';

interface PublishedFormsMetricProps {
  forms: Form[];
}

export const PublishedFormsMetric: React.FC<PublishedFormsMetricProps> = ({ forms }) => {
  const total = forms.length;
  const published = forms.filter(f => f.isPublished).length;
  const publicationRate = total > 0 ? Math.round((published / total) * 100) : 0;

  return (
    <div className="p-3.5 md:p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] flex flex-col justify-between space-y-2.5 hover:border-emerald-500/30 transition-all duration-200 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#84A1C0]">
            Live Published
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            <span>ACTIVE</span>
          </div>
        </div>
        <div className="text-xl font-extrabold font-mono text-emerald-400">
          {published}
        </div>
      </div>

      {/* Sleek Mini Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-[#121820] overflow-hidden">
          <div
            style={{ width: `${publicationRate}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Accepting responses</span>
          <span className="text-emerald-400 font-bold">
            {published} / {total} ({publicationRate}%)
          </span>
        </div>
      </div>
    </div>
  );
};
