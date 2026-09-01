import React, { useState } from 'react';
import { Form, FormResponse } from '../../types';
import {
  Search,
  ArrowUpDown,
  Clock,
  User,
  Award,
  Eye,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { formatDuration } from '../../utils/analyticsEngine';

interface ByRespondentTabProps {
  form: Form;
  responses: FormResponse[];
  onSelectResponse: (response: FormResponse) => void;
  onDeleteResponse: (responseId: string) => void;
}

type SortField = 'submittedAt' | 'respondentEmail' | 'timeSpentSeconds' | 'score' | 'answeredCount';
type SortOrder = 'asc' | 'desc';

export const ByRespondentTab: React.FC<ByRespondentTabProps> = ({
  form,
  responses,
  onSelectResponse,
  onDeleteResponse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalQuestionsCount = form.questions?.length || 0;

  // Filtered responses
  const filtered = responses.filter(r => {
    const q = searchQuery.toLowerCase();
    const email = (r.respondentEmail || '').toLowerCase();
    const name = (r.respondentName || '').toLowerCase();
    const id = r.id.toLowerCase();
    return email.includes(q) || name.includes(q) || id.includes(q);
  });

  // Sorted responses
  const sorted = [...filtered].sort((a, b) => {
    let valA: any;
    let valB: any;

    if (sortField === 'submittedAt') {
      valA = new Date(a.submittedAt).getTime();
      valB = new Date(b.submittedAt).getTime();
    } else if (sortField === 'respondentEmail') {
      valA = (a.respondentEmail || a.respondentName || 'Anonymous').toLowerCase();
      valB = (b.respondentEmail || b.respondentName || 'Anonymous').toLowerCase();
    } else if (sortField === 'timeSpentSeconds') {
      valA = a.timeSpentSeconds || 0;
      valB = b.timeSpentSeconds || 0;
    } else if (sortField === 'score') {
      valA = a.score !== undefined ? a.score : -1;
      valB = b.score !== undefined ? b.score : -1;
    } else if (sortField === 'answeredCount') {
      valA = Object.keys(a.answers || {}).length;
      valB = Object.keys(b.answers || {}).length;
    } else {
      valA = a.id;
      valB = b.id;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Controls Bar: Search, Page Size & Count */}
      <div className="p-4 rounded-2xl bg-[#121820] border border-[#2A3647] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by respondent email, name, or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1A2332] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Rows per page:</span>
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
            Showing <strong className="text-white">{sorted.length}</strong> respondents
          </span>
        </div>
      </div>

      {/* Respondent Records Table */}
      <div className="bg-[#121820] border border-[#2A3647] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A3647] bg-[#161E2B] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 select-none">
                <th
                  onClick={() => handleSort('respondentEmail')}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Respondent</span>
                    {sortField === 'respondentEmail' && (
                      <span className="text-[#38BDF8]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('submittedAt')}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Submitted At</span>
                    {sortField === 'submittedAt' && (
                      <span className="text-cyan-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('timeSpentSeconds')}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration</span>
                    {sortField === 'timeSpentSeconds' && (
                      <span className="text-cyan-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('answeredCount')}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Answered</span>
                    {sortField === 'answeredCount' && (
                      <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                {form.settings?.quizMode && (
                  <th
                    onClick={() => handleSort('score')}
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quiz Score</span>
                      {sortField === 'score' && (
                        <span className="text-amber-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                )}

                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2A3647]/50 text-xs text-slate-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    No respondent records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((resp) => {
                  const answeredCount = Object.keys(resp.answers || {}).length;
                  const displayName = resp.respondentEmail || resp.respondentName || 'Anonymous Respondent';
                  const initial = displayName.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={resp.id}
                      onClick={() => onSelectResponse(resp)}
                      className="hover:bg-[#1A2332]/60 transition-colors cursor-pointer group"
                    >
                      {/* Respondent column with Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563EB] to-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initial}
                          </div>
                          <div className="truncate max-w-[200px] sm:max-w-xs">
                            <div className="font-semibold text-white truncate">{displayName}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">{resp.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="p-4 font-mono text-slate-300">
                        {format(new Date(resp.submittedAt), 'MMM dd, yyyy • HH:mm:ss')}
                      </td>

                      {/* Duration */}
                      <td className="p-4 font-mono text-cyan-300">
                        {resp.timeSpentSeconds ? formatDuration(resp.timeSpentSeconds) : 'N/A'}
                      </td>

                      {/* Answered Ratio */}
                      <td className="p-4 font-mono">
                        <span className="text-white font-bold">{answeredCount}</span>
                        <span className="text-slate-500"> / {totalQuestionsCount}</span>
                      </td>

                      {/* Score (If Quiz Mode) */}
                      {form.settings?.quizMode && (
                        <td className="p-4 font-mono font-bold text-amber-400">
                          {resp.score !== undefined ? `${resp.score} / ${resp.maxScore || 100}` : 'N/A'}
                        </td>
                      )}

                      {/* Status pill */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Completed</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectResponse(resp)}
                          className="p-1.5 rounded-lg bg-[#2563EB]/15 hover:bg-[#2563EB]/30 text-[#38BDF8] transition-colors cursor-pointer"
                          title="Inspect submission payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteResponse(resp.id)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                          title="Delete response"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
