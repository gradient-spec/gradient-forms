import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, TrendingDown, Table, BarChart2, Compass } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

const COLORS = ['#38BDF8', '#2563EB', '#818CF8', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#14B8A6'];

export const DropdownAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'distribution' | 'table'>('distribution');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const stats = data.optionsStats || [];

  return (
    <div className="space-y-4 pt-1">
      {/* Top Highlights Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {data.mostSelected && data.mostSelected.count > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Most Selected: <strong>{data.mostSelected.label}</strong> ({data.mostSelected.percentage}%)</span>
            </div>
          )}
          {data.leastSelected && stats.length > 2 && data.leastSelected.count > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Least: {data.leastSelected.label} ({data.leastSelected.percentage}%)</span>
            </div>
          )}
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
                exploreView === 'distribution'
                  ? 'bg-[#2563EB] text-white font-bold'
                  : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Distribution</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'table'
                  ? 'bg-[#2563EB] text-white font-bold'
                  : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      )}

      {/* Default Horizontal Bar Chart & Breakdown */}
      {exploreView === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          <div className="lg:col-span-7 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#64748B" fontSize={11} fontFamily="JetBrains Mono" width={110} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121820', borderColor: '#2A3647', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]}>
                  {stats.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Options Count &amp; Share</div>
            {stats.map((opt, i) => (
              <div key={opt.id} className="p-2 rounded-lg bg-[#161E2B] border border-[#2B3B52] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-white truncate" title={opt.label}>{opt.label}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 text-[11px]">{opt.count}</span>
                  <span className="font-bold text-cyan-300 w-10 text-right">{opt.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {exploreView === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-[#2B3B52] bg-[#161E2B]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121820] text-slate-400 font-mono text-[10px] uppercase border-b border-[#2B3B52]">
              <tr>
                <th className="px-4 py-2.5">Menu Item</th>
                <th className="px-4 py-2.5 text-right">Count</th>
                <th className="px-4 py-2.5 text-right">Percentage</th>
                <th className="px-4 py-2.5 text-right">Share Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3B52]/50 font-mono text-slate-200">
              {stats.map((opt, i) => (
                <tr key={opt.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-sans font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span>{opt.label}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{opt.count}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-cyan-300">{opt.percentage}%</td>
                  <td className="px-4 py-2.5 text-right w-36">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#38BDF8]" style={{ width: `${opt.percentage}%` }} />
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
