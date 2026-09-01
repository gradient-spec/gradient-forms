import React from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

export const ConsentAnalyticsCard: React.FC<Props> = ({ data }) => {
  const bool = data.booleanDistribution || { yes: 0, no: 0, yesPercent: 0, noPercent: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Agreed / Consented</span>
        </span>
        <div className="text-2xl font-bold font-mono text-white">{bool.yes}</div>
        <div className="text-xs text-emerald-400 font-mono">{bool.yesPercent}% of submissions</div>
      </div>

      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1">
        <span className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center justify-center gap-1">
          <XCircle className="w-3.5 h-3.5" />
          <span>Declined / Skipped</span>
        </span>
        <div className="text-2xl font-bold font-mono text-white">{bool.no}</div>
        <div className="text-xs text-rose-400 font-mono">{bool.noPercent}% of submissions</div>
      </div>
    </div>
  );
};
