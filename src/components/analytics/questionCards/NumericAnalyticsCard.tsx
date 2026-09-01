import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Compass, BarChart2, Calculator, Table } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

export const NumericAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'histogram' | 'stats' | 'table'>('histogram');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const num = data.numericSummary;
  const distribution = num?.distribution || [];

  return (
    <div className="space-y-4 pt-1">
      {/* Primary Key Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Average</span>
            <span className="text-lg font-bold font-mono text-cyan-300">{num?.average ?? 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Median</span>
            <span className="text-base font-bold font-mono text-white">{num?.median ?? 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Range</span>
            <span className="text-sm font-mono text-slate-300">{num?.min ?? 0} — {num?.max ?? 0}</span>
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
        <div className="p-3 rounded-xl bg-[#16202E] border border-[#2B3B52] flex items-center justify-between gap-2 animate-fadeIn flex-wrap">
          <span className="text-[11px] font-mono uppercase text-slate-400">Select View:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExploreView('histogram')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'histogram' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Histogram Distribution</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('stats')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'stats' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Detailed Statistics</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'table' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Buckets Table</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: Histogram Distribution */}
      {exploreView === 'histogram' && (
        <div className="space-y-2 pt-1">
          {distribution.length > 0 ? (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121820', borderColor: '#2A3647', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              No numerical values submitted yet.
            </div>
          )}
        </div>
      )}

      {/* 2. Explore: Detailed Statistics */}
      {exploreView === 'stats' && num && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Mean (Avg)</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{num.average}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Median</div>
            <div className="text-xl font-bold font-mono text-white">{num.median}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Mode</div>
            <div className="text-xl font-bold font-mono text-white">{num.mode}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Std Deviation</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{num.stdDev}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Minimum</div>
            <div className="text-lg font-bold font-mono text-slate-300">{num.min}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Q1 (25th %)</div>
            <div className="text-lg font-bold font-mono text-slate-300">{num.q1}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Q3 (75th %)</div>
            <div className="text-lg font-bold font-mono text-slate-300">{num.q3}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Maximum</div>
            <div className="text-lg font-bold font-mono text-slate-300">{num.max}</div>
          </div>
        </div>
      )}

      {/* 3. Explore: Table */}
      {exploreView === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-[#2B3B52] bg-[#161E2B]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121820] text-slate-400 font-mono text-[10px] uppercase border-b border-[#2B3B52]">
              <tr>
                <th className="px-4 py-2.5">Numeric Range Bucket</th>
                <th className="px-4 py-2.5 text-right">Count</th>
                <th className="px-4 py-2.5 text-right">Percentage</th>
                <th className="px-4 py-2.5 text-right">Distribution Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3B52]/50 font-mono text-slate-200">
              {distribution.map((d, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-bold text-white">{d.range}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{d.count}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-cyan-300">{d.percentage}%</td>
                  <td className="px-4 py-2.5 text-right w-36">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#38BDF8]" style={{ width: `${d.percentage}%` }} />
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
