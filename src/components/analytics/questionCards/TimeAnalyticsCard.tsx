import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { Clock, Compass, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: QuestionAnalyticsData;
}

export const TimeAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'period' | 'hourly'>('period');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const timeStats = data.timeAnalytics;

  return (
    <div className="space-y-4 pt-1">
      {/* Key Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Earliest Time</span>
            <div className="font-bold text-white font-mono">{timeStats?.earliestTime || 'N/A'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Latest Time</span>
            <div className="font-bold text-white font-mono">{timeStats?.latestTime || 'N/A'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Peak Window</span>
            <div className="font-bold text-cyan-300 font-mono">{timeStats?.peakTime || 'N/A'}</div>
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
              onClick={() => setExploreView('period')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'period' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time-of-Day Periods</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('hourly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'hourly' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Hourly Histogram</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: Time of Day Periods */}
      {exploreView === 'period' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(!timeStats?.timeOfDayStats || timeStats.timeOfDayStats.length === 0) ? (
            <div className="col-span-full p-6 text-center text-xs font-mono text-slate-500">
              No time submissions recorded.
            </div>
          ) : (
            timeStats.timeOfDayStats.map((p) => (
              <div key={p.period} className="p-4 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">{p.period}</span>
                <div className="text-xl font-bold font-mono text-white">{p.count} responses</div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38BDF8]" style={{ width: `${p.percentage}%` }} />
                </div>
                <div className="text-[10px] font-mono text-cyan-300 text-right">{p.percentage}%</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Explore: Hourly Histogram */}
      {exploreView === 'hourly' && timeStats?.hourlyDistribution && (
        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeStats.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#121820', borderColor: '#2A3647', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
