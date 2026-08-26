import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResponseDetailModal } from './ResponseDetailModal';
import { FormResponse } from '../../types';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { Search, Download, Trash2, Eye, FileText, ChevronDown, Filter, Calendar, Clock, Inbox } from 'lucide-react';
import { format } from 'date-fns';

import { isFormEdited } from '../../utils/formFilters';

export const ResponsesView: React.FC = () => {
  const { forms, activeFormId, setActiveFormId, responses, deleteResponse, showToast } = useApp();
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const editedForms = forms.filter(isFormEdited);
  const currentForm = editedForms.find(f => f.id === activeFormId) || editedForms[0] || forms[0];
  const formResponses = responses.filter(r => r.formId === currentForm?.id);

  const filteredResponses = formResponses.filter(r =>
    (r.respondentEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.respondentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (formResponses.length === 0) {
      showToast('Export Error', 'No responses to export.', 'error');
      return;
    }
    exportToCSV(currentForm, formResponses);
    showToast('Export Complete', 'CSV file downloaded.', 'success');
  };

  const handleExportJSON = () => {
    if (formResponses.length === 0) {
      showToast('Export Error', 'No responses to export.', 'error');
      return;
    }
    exportToJSON(currentForm, formResponses);
    showToast('Export Complete', 'JSON file downloaded.', 'success');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
            Form <span className="gradient-text">Responses</span> Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            View, filter, inspect, and export collected submissions.
          </p>
        </div>

        {/* Form Selector Dropdown & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={currentForm?.id}
              onChange={(e) => setActiveFormId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-violet-500"
            >
              {editedForms.map(f => (
                <option key={f.id} value={f.id}>{f.title} ({responses.filter(r => r.formId === f.id).length})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Submissions</span>
          <div className="text-2xl font-extrabold font-display text-white">{formResponses.length}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Avg Completion Time</span>
          <div className="text-2xl font-extrabold font-display text-cyan-300">
            {formResponses.length > 0
              ? Math.round(formResponses.reduce((acc, r) => acc + r.timeSpentSeconds, 0) / formResponses.length) + 's'
              : '0s'}
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Completion Rate</span>
          <div className="text-2xl font-extrabold font-display text-emerald-300">94.2%</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search respondent email or ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Response ID</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4">Respondent Email</th>
                <th className="p-4">Time Spent</th>
                {currentForm?.settings.quizMode && <th className="p-4">Score</th>}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-200">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No submissions recorded yet for this form.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((resp) => (
                  <tr key={resp.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-mono text-slate-400">{resp.id}</td>
                    <td className="p-4 font-medium">
                      {format(new Date(resp.submittedAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="p-4 font-semibold text-white">{resp.respondentEmail || 'Anonymous'}</td>
                    <td className="p-4 font-mono text-cyan-300">{resp.timeSpentSeconds}s</td>
                    {currentForm?.settings.quizMode && (
                      <td className="p-4 font-bold text-amber-400">
                        {resp.score !== undefined ? `${resp.score} / ${resp.maxScore}` : 'N/A'}
                      </td>
                    )}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedResponse(resp)}
                        className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-colors"
                        title="View Full Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteResponse(resp.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                        title="Delete Response"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Inspector Modal */}
      <ResponseDetailModal
        response={selectedResponse}
        form={currentForm}
        onClose={() => setSelectedResponse(null)}
      />
    </div>
  );
};
