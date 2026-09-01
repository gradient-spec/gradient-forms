import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { Calendar, Compass, BarChart2, Table } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

export const DateAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'timeline' | 'day_of_week'>('timeline');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const dateStats = data.dateAnalytics;

  return (
    <div className="space-y-4 pt-1">
      {/* Primary Key Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Earliest Date</span>
            <div className="font-bold text-white font-mono">{dateStats?.earliestDate || 'N/A'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Latest Date</span>
            <div className="font-bold text-white font-mono">{dateStats?.latestDate || 'N/A'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Peak Date</span>
            <div className="font-bold text-cyan-300 font-mono">{dateStats?.mostCommonDate || 'N/A'}</div>
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
          <span>{isExploreOpen ? 'Hide Explore' : 'Explore'}</span>
        </button>
      </div>

      {/* Explore Menu */}
      {isExploreOpen && (
        <div className="p-3 rounded-xl bg-[#16202E] border border-[#2B3B52] flex items-center justify-between gap-2 animate-fadeIn">
          <span className="text-[11px] font-mono uppercase text-slate-400">Select View:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExploreView('timeline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'timeline' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('day_of_week')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'day_of_week' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Day-of-Week</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: Date Timeline List */}
      {exploreView === 'timeline' && (
        <div className="space-y-2">
          {(!dateStats?.distribution || dateStats.distribution.length === 0) ? (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              No date submissions recorded.
            </div>
          ) : (
            dateStats.distribution.map((d, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">{d.dateLabel}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{d.count} responses</span>
                  <span className="font-bold text-cyan-300 w-10 text-right">{d.percentage}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Explore: Day of Week Distribution */}
      {exploreView === 'day_of_week' && dateStats?.dayOfWeekStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {dateStats.dayOfWeekStats.map((day) => (
            <div key={day.day} className="p-3 rounded-xl bg-[#161E2B] border border-[#2B3B52] text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">{day.day}</span>
              <div className="text-lg font-bold font-mono text-white">{day.count}</div>
              <div className="text-[11px] font-mono text-cyan-300">{day.percentage}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
