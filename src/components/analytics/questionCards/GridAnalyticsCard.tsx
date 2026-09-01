import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { Grid, Compass, Table, Layers, BarChart2 } from 'lucide-react';

interface Props {
  data: QuestionAnalyticsData;
}

export const GridAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'heatmap' | 'row_summary' | 'stacked'>('heatmap');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const rows = data.matrixHeatmap || [];
  const cols = data.matrixColLabels || [];

  // Helper for heatmap cell color intensity
  const getCellBg = (percentage: number) => {
    if (percentage === 0) return 'bg-[#121820] text-slate-600';
    if (percentage < 20) return 'bg-[#2563EB]/20 text-slate-300 border border-[#2563EB]/30';
    if (percentage < 40) return 'bg-[#2563EB]/40 text-white border border-[#2563EB]/50';
    if (percentage < 60) return 'bg-[#2563EB]/60 text-white font-bold border border-[#38BDF8]/60';
    if (percentage < 80) return 'bg-[#2563EB]/80 text-white font-bold border border-[#38BDF8]';
    return 'bg-[#38BDF8] text-slate-950 font-black shadow-[0_0_12px_rgba(56,189,248,0.4)]';
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Top Highlights Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {data.mostSelectedCell && (
            <div className="px-2.5 py-1 rounded-lg bg-[#161E2B] border border-[#2B3B52] text-slate-300 font-mono text-[11px]">
              Peak Cell: <strong className="text-[#38BDF8]">{data.mostSelectedCell.row} → {data.mostSelectedCell.col}</strong> ({data.mostSelectedCell.percentage}%)
            </div>
          )}
          <div className="px-2.5 py-1 rounded-lg bg-[#161E2B] border border-[#2B3B52] text-slate-400 font-mono text-[11px]">
            Grid Dimensions: <span className="text-white">{rows.length} Rows × {cols.length} Columns</span>
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
              onClick={() => setExploreView('heatmap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'heatmap' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2D Heatmap</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('row_summary')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'row_summary' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Row Breakdown</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: Interactive 2D Heatmap */}
      {exploreView === 'heatmap' && (
        <div className="overflow-x-auto rounded-xl border border-[#2B3B52] bg-[#161E2B]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#121820] text-slate-400 font-mono text-[10px] uppercase border-b border-[#2B3B52]">
              <tr>
                <th className="px-4 py-3 min-w-[140px]">Criteria / Row</th>
                {cols.map((col, cIdx) => (
                  <th key={cIdx} className="px-3 py-3 text-center min-w-[70px]">{col}</th>
                ))}
                <th className="px-4 py-3 text-right">Row Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3B52]/50 font-mono">
              {rows.map((row) => (
                <tr key={row.rowId} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-sans font-medium text-white max-w-[180px] truncate" title={row.rowLabel}>
                    {row.rowLabel}
                  </td>
                  {row.cols.map((c, cIdx) => (
                    <td key={cIdx} className="p-1.5 text-center">
                      <div
                        className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${getCellBg(c.percentage)}`}
                        title={`${row.rowLabel} - ${c.colLabel}: ${c.count} responses (${c.percentage}%)`}
                      >
                        <span className="text-xs font-mono">{c.percentage}%</span>
                        <span className="text-[9px] opacity-75 font-mono">({c.count})</span>
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-sans text-xs text-slate-300">
                    {row.rowAverage ? (
                      <span className="text-cyan-300 font-mono font-bold">Avg: {row.rowAverage}</span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">Top: {row.mostSelectedCol}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Explore: Row Summary */}
      {exploreView === 'row_summary' && (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.rowId} className="p-4 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{row.rowLabel}</span>
                {row.rowAverage && <span className="font-mono text-cyan-300 font-bold">Average: {row.rowAverage}</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {row.cols.map((c, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#121820] border border-[#2A3647] text-center font-mono text-xs">
                    <div className="text-slate-400 text-[10px] truncate">{c.colLabel}</div>
                    <div className="font-bold text-white">{c.percentage}% <span className="text-[10px] text-slate-400 font-normal">({c.count})</span></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
