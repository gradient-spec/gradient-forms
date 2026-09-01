import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { CheckSquare, Layers, Award, Compass, Table, BarChart2, GitFork } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

export const CheckboxesAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'frequency' | 'table' | 'combinations'>('frequency');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const stats = data.optionsStats || [];

  return (
    <div className="space-y-4 pt-1">
      {/* Metrics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {data.mostSelected && (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top Option: <strong>{data.mostSelected.label}</strong> ({data.mostSelected.percentage}%)</span>
            </div>
          )}
          <div className="px-2.5 py-1 rounded-lg bg-[#161E2B] border border-[#2B3B52] text-slate-300 font-mono text-[11px]">
            Total Selections: <strong className="text-white">{data.totalSelections || 0}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#161E2B] border border-[#2B3B52] text-cyan-300 font-mono text-[11px]">
            Avg / Person: <strong>{data.avgSelectionsPerRespondent || 1}</strong>
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
              onClick={() => setExploreView('frequency')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'frequency'
                  ? 'bg-[#2563EB] text-white font-bold'
                  : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Frequencies</span>
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
            <button
              type="button"
              onClick={() => setExploreView('combinations')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'combinations'
                  ? 'bg-[#2563EB] text-white font-bold'
                  : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Combinations</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: Frequency Bar Chart (% of respondents who selected option) */}
      {exploreView === 'frequency' && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.map((opt) => (
              <div key={opt.id} className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white truncate pr-2" title={opt.label}>{opt.label}</span>
                  <span className="font-mono text-[#38BDF8] font-bold">{opt.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${opt.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                  <span>{opt.count} selected</span>
                  <span>{opt.count} of {data.answeredCount} respondents</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Explore: Table */}
      {exploreView === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-[#2B3B52] bg-[#161E2B]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121820] text-slate-400 font-mono text-[10px] uppercase border-b border-[#2B3B52]">
              <tr>
                <th className="px-4 py-2.5">Checkbox Option</th>
                <th className="px-4 py-2.5 text-right">Selection Count</th>
                <th className="px-4 py-2.5 text-right">% of Respondents</th>
                <th className="px-4 py-2.5 text-right">Frequency Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3B52]/50 font-mono text-slate-200">
              {stats.map((opt) => (
                <tr key={opt.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-sans font-medium text-white">{opt.label}</td>
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

      {/* 3. Explore: Combinations */}
      {exploreView === 'combinations' && (
        <div className="space-y-3">
          <div className="text-[11px] font-mono uppercase text-slate-400">
            Top Co-Occurring Option Combinations:
          </div>
          {(!data.combinations || data.combinations.length === 0) ? (
            <div className="p-6 rounded-xl bg-[#161E2B] border border-[#2B3B52] text-center text-xs text-slate-500 font-mono">
              More multi-selection responses needed to calculate meaningful co-occurrence patterns.
            </div>
          ) : (
            <div className="space-y-2">
              {data.combinations.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#161E2B] border border-[#2B3B52] flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {c.combination.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded bg-[#121820] text-slate-200 border border-[#2A3647] font-medium text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-slate-400">{c.count} respondents</span>
                    <span className="font-bold text-[#38BDF8] w-12 text-right">{c.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
