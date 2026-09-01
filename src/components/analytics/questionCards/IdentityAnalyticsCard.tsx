import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { User, Mail, Search, Compass, List } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  data: QuestionAnalyticsData;
}

export const IdentityAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const answers = data.textAnswers || [];
  const idStats = data.identityAnalytics;

  const filteredAnswers = answers.filter(a =>
    a.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.respondent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pt-1">
      {/* Identity Summary KPIs (No meaningless statistical averages!) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Unique Entries</span>
            <div className="font-bold text-white font-mono text-base">{idStats?.uniqueCount || data.answeredCount}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Duplicates</span>
            <div className="font-bold text-slate-300 font-mono text-base">{idStats?.duplicateCount || 0}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Missing / Skipped</span>
            <div className="font-bold text-slate-400 font-mono text-base">{data.skippedCount}</div>
          </div>
        </div>

        {/* Explore Button */}
        <button
          type="button"
          onClick={() => setIsExploreOpen(!isExploreOpen)}
          className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isExploreOpen
              ? 'bg-[#2563EB]/20 border-[#2563EB]/50 text-[#38BDF8]'
              : 'bg-[#1A2332] hover:bg-[#222C3D] border-[#2A3647] text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{isExploreOpen ? 'Hide Explore' : 'Explore All'}</span>
        </button>
      </div>

      {/* 1. Default: Recent Responses Snippet */}
      {!isExploreOpen ? (
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase text-slate-400">Recent Respondent Values:</div>
          <div className="space-y-1.5">
            {answers.slice(0, 3).map((a, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center justify-between text-xs">
                <span className="text-white font-mono font-medium truncate">{a.answer}</span>
                <span className="text-slate-400 text-[10px] font-mono shrink-0">{format(new Date(a.submittedAt), 'MMM dd • HH:mm')}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 2. Explore: Searchable Full List */
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121820] border border-[#2B3B52] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredAnswers.map((a, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center justify-between text-xs">
                <span className="text-white font-mono font-medium truncate">{a.answer}</span>
                <span className="text-slate-400 text-[10px] font-mono shrink-0">{format(new Date(a.submittedAt), 'MMM dd, yyyy • HH:mm')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
