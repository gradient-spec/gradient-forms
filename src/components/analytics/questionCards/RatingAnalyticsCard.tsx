import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { Star, Compass, BarChart2, Table } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

export const RatingAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'distribution' | 'table'>('distribution');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const distribution = [...(data.ratingDistribution || [])].reverse(); // 5 stars to 1 star

  return (
    <div className="space-y-4 pt-1">
      {/* Primary Key Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Average Rating Highlight Box */}
          <div className="p-3 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center gap-2.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Average Rating</div>
              <div className="text-xl font-bold font-mono text-white">
                {data.averageRating || 0} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Positive Ratings (4★+)</div>
            <div className="text-base font-bold font-mono text-emerald-400">{data.positiveRatingPercent || 0}%</div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Median Rating</div>
            <div className="text-base font-bold font-mono text-cyan-300">{data.medianRating || 0}★</div>
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
              onClick={() => setExploreView('distribution')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'distribution' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Star Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'table' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: 5-Star Distribution Bars */}
      {exploreView === 'distribution' && (
        <div className="space-y-2 pt-1">
          {distribution.map((d) => (
            <div key={d.rating} className="p-2.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1 w-20 shrink-0 font-bold text-amber-300">
                <span>{d.rating}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
              <div className="flex items-center gap-3 w-28 justify-end shrink-0">
                <span className="text-slate-400 text-[11px]">{d.count} ratings</span>
                <span className="font-bold text-white w-10 text-right">{d.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Explore: Table */}
      {exploreView === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-[#2B3B52] bg-[#161E2B]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121820] text-slate-400 font-mono text-[10px] uppercase border-b border-[#2B3B52]">
              <tr>
                <th className="px-4 py-2.5">Rating Level</th>
                <th className="px-4 py-2.5 text-right">Ratings Count</th>
                <th className="px-4 py-2.5 text-right">Percentage Share</th>
                <th className="px-4 py-2.5 text-right">Visual Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3B52]/50 font-mono text-slate-200">
              {distribution.map((d) => (
                <tr key={d.rating} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{d.rating} Stars</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{d.count}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-amber-300">{d.percentage}%</td>
                  <td className="px-4 py-2.5 text-right w-36">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${d.percentage}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
