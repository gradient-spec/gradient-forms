import React, { useState } from 'react';
import { Form, FormResponse } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Download,
  CheckSquare,
  Square,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Check,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { formatDuration } from '../../utils/analyticsEngine';
import { GoogleSheetsService } from '../../services/googleSheetsService';

interface ResponseDatasetTabProps {
  form: Form;
  responses: FormResponse[];
  onSelectResponse: (response: FormResponse) => void;
  onDeleteResponse: (responseId: string) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const ResponseDatasetTab: React.FC<ResponseDatasetTabProps> = ({
  form,
  responses,
  onSelectResponse,
  onDeleteResponse,
  showToast
}) => {
  const { integrations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<'submittedAt' | 'respondent' | 'timeSpent'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const questions = form.questions || [];

  // Filter
  const filtered = responses.filter(r => {
    const q = searchQuery.toLowerCase();
    const email = (r.respondentEmail || '').toLowerCase();
    const name = (r.respondentName || '').toLowerCase();
    const id = r.id.toLowerCase();
    const answersStr = JSON.stringify(r.answers || {}).toLowerCase();
    return email.includes(q) || name.includes(q) || id.includes(q) || answersStr.includes(q);
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let valA: any;
    let valB: any;

    if (sortField === 'submittedAt') {
      valA = new Date(a.submittedAt).getTime();
      valB = new Date(b.submittedAt).getTime();
    } else if (sortField === 'respondent') {
      valA = (a.respondentEmail || a.respondentName || '').toLowerCase();
      valB = (b.respondentEmail || b.respondentName || '').toLowerCase();
    } else {
      valA = a.timeSpentSeconds || 0;
      valB = b.timeSpentSeconds || 0;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection helpers
  const isAllPageSelected = paginated.length > 0 && paginated.every(r => selectedIds.has(r.id));

  const handleToggleSelectAllPage = () => {
    const next = new Set(selectedIds);
    if (isAllPageSelected) {
      paginated.forEach(r => next.delete(r.id));
    } else {
      paginated.forEach(r => next.add(r.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExportSelectedCSV = () => {
    const toExport = responses.filter(r => selectedIds.has(r.id));
    if (toExport.length === 0) {
      showToast('Export Selection', 'Please select at least one row to export.', 'info');
      return;
    }
    exportToCSV(form, toExport);
    showToast('Export Complete 📊', `Exported ${toExport.length} selected responses to CSV.`, 'success');
  };

  const handleExportSelectedJSON = () => {
    const toExport = responses.filter(r => selectedIds.has(r.id));
    if (toExport.length === 0) {
      showToast('Export Selection', 'Please select at least one row to export.', 'info');
      return;
    }
    exportToJSON(form, toExport);
    showToast('Export Complete 📄', `Exported ${toExport.length} selected responses to JSON.`, 'success');
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Controls Bar: Search, Bulk Selection Actions, Pagination */}
      <div className="p-4 rounded-2xl bg-[#121820] border border-[#2A3647] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search full answers, email, or respondent..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1A2332] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selected Count & Bulk Export Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 p-1 px-3 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/40 text-xs text-[#38BDF8] animate-fadeIn font-mono">
              <span><strong>{selectedIds.size}</strong> selected</span>
              <button
                type="button"
                onClick={handleExportSelectedCSV}
                className="px-2 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold cursor-pointer transition-colors"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={handleExportSelectedJSON}
                className="px-2 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] text-white text-[11px] font-bold cursor-pointer transition-colors"
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-slate-400 hover:text-white text-[11px] underline cursor-pointer ml-1"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#1A2332] text-xs text-[#38BDF8] font-bold border border-[#2A3647] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{sorted.length}</strong> entries
          </span>

          <button
            type="button"
            onClick={() => {
              const url = GoogleSheetsService.getSpreadsheetUrl(integrations?.googleSheets?.spreadsheetId, form.id);
              if (url && integrations?.googleSheets?.connected) {
                window.open(url, '_blank', 'noopener,noreferrer');
              } else {
                showToast('Google Sheets', "Google Sheets isn't connected to this form yet.", 'info');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title="Open connected spreadsheet in Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open in Google Sheets</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80" />
          </button>
        </div>
      </div>

      {/* Dynamic Multi-Column Grid */}
      <div className="bg-[#121820] border border-[#2A3647] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[560px] relative">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#2A3647] bg-[#161E2B] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 select-none">
                {/* Checkbox column */}
                <th className="p-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllPage}
                    className="text-slate-400 hover:text-white cursor-pointer"
                    title={isAllPageSelected ? 'Deselect Page' : 'Select Page'}
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                <th className="p-3.5 min-w-[140px]">Submitted At</th>
                <th className="p-3.5 min-w-[180px]">Respondent</th>
                <th className="p-3.5 min-w-[100px]">Duration</th>

                {form.settings?.quizMode && (
                  <th className="p-3.5 min-w-[90px]">Score</th>
                )}

                {/* Form Questions as Dynamic Columns */}
                {questions.map((q, idx) => (
                  <th key={q.id} className="p-3.5 min-w-[180px] max-w-[240px]">
                    <div className="truncate" title={q.title}>
                      #{idx + 1}. {q.title}
                    </div>
                  </th>
                ))}

                <th className="p-3.5 text-right w-16 sticky right-0 bg-[#161E2B]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2A3647]/50 text-slate-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5 + questions.length} className="p-8 text-center text-slate-500 font-mono">
                    No response rows matching active query.
                  </td>
                </tr>
              ) : (
                paginated.map((resp) => {
                  const isSelected = selectedIds.has(resp.id);
                  const displayName = resp.respondentEmail || resp.respondentName || 'Anonymous Respondent';

                  return (
                    <tr
                      key={resp.id}
                      onClick={() => onSelectResponse(resp)}
                      className={`hover:bg-[#1A2332]/60 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[#2563EB]/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(resp.id)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Submitted At */}
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        {format(new Date(resp.submittedAt), 'yyyy-MM-dd HH:mm')}
                      </td>

                      {/* Respondent */}
                      <td className="p-3.5 font-medium text-white truncate max-w-[180px]">
                        {displayName}
                      </td>

                      {/* Duration */}
                      <td className="p-3.5 font-mono text-cyan-300 whitespace-nowrap">
                        {resp.timeSpentSeconds ? formatDuration(resp.timeSpentSeconds) : 'N/A'}
                      </td>

                      {/* Score */}
                      {form.settings?.quizMode && (
                        <td className="p-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {resp.score !== undefined ? `${resp.score} pts` : 'N/A'}
                        </td>
                      )}

                      {/* Question Answer Values */}
                      {questions.map((q) => {
                        const rawVal = resp.answers[q.id];
                        let displayVal = '—';
                        if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                          if (Array.isArray(rawVal)) {
                            displayVal = rawVal.join(', ');
                          } else if (typeof rawVal === 'object') {
                            displayVal = JSON.stringify(rawVal);
                          } else {
                            displayVal = String(rawVal);
                          }
                        }

                        return (
                          <td key={q.id} className="p-3.5 truncate max-w-[240px] font-sans text-slate-300" title={displayVal}>
                            {displayVal}
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="p-3.5 text-right sticky right-0 bg-[#121820] group-hover:bg-[#1A2332]/90 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectResponse(resp)}
                            className="p-1 rounded text-[#38BDF8] hover:bg-[#2563EB]/20 transition-colors cursor-pointer"
                            title="Inspect"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteResponse(resp.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#2A3647] flex items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Page <strong className="text-white font-mono">{currentPage}</strong> of <strong className="text-white font-mono">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-[#1A2332] border border-[#2A3647] hover:bg-[#222C3D] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-[#1A2332] border border-[#2A3647] hover:bg-[#222C3D] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
