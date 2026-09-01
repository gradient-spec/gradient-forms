import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { FileUp, File, Download, Compass, Table, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  data: QuestionAnalyticsData;
}

export const FileUploadAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'summary' | 'files'>('summary');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const fileStats = data.fileAnalytics;
  const filesList = fileStats?.filesList || [];

  return (
    <div className="space-y-4 pt-1">
      {/* Primary Key Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Total Uploads</span>
            <div className="font-bold text-white font-mono text-base">{fileStats?.totalFiles || 0} files</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Respondents w/ Files</span>
            <div className="font-bold text-cyan-300 font-mono text-base">{fileStats?.respondentsWithUploads || 0}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#161E2B] border border-[#2B3B52]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Avg Files / Person</span>
            <div className="font-bold text-slate-300 font-mono text-base">{fileStats?.avgFilesPerRespondent || 0}</div>
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
              onClick={() => setExploreView('summary')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'summary' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>File Types</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('files')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'files' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>File Browser ({filesList.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: File Type Breakdown */}
      {exploreView === 'summary' && (
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase text-slate-400">File Extensions &amp; Format Distribution:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(!fileStats?.fileTypeDistribution || fileStats.fileTypeDistribution.length === 0) ? (
              <div className="col-span-full p-6 text-center text-xs font-mono text-slate-500">
                No file attachments submitted yet.
              </div>
            ) : (
              fileStats.fileTypeDistribution.map((ft) => (
                <div key={ft.type} className="p-3.5 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono flex items-center gap-1.5">
                      <File className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>.{ft.type}</span>
                    </span>
                    <span className="font-mono text-[#38BDF8] font-bold">{ft.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#38BDF8]" style={{ width: `${ft.percentage}%` }} />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 text-right">{ft.count} files</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Explore: File Browser Table */}
      {exploreView === 'files' && (
        <div className="overflow-x-auto rounded-xl border border-[#2B3B52] bg-[#161E2B]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121820] text-slate-400 font-mono text-[10px] uppercase border-b border-[#2B3B52]">
              <tr>
                <th className="px-4 py-2.5">File Name</th>
                <th className="px-4 py-2.5">Format</th>
                <th className="px-4 py-2.5">Respondent</th>
                <th className="px-4 py-2.5">Size</th>
                <th className="px-4 py-2.5">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3B52]/50 font-mono text-slate-200">
              {filesList.map((f, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-sans font-medium text-white flex items-center gap-2">
                    <File className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span className="truncate max-w-[200px]" title={f.name}>{f.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-cyan-300">.{f.type}</td>
                  <td className="px-4 py-2.5 text-slate-300 truncate max-w-[180px]">{f.respondent}</td>
                  <td className="px-4 py-2.5 text-slate-400">{f.size}</td>
                  <td className="px-4 py-2.5 text-slate-400">{format(new Date(f.submittedAt), 'MMM dd • HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
