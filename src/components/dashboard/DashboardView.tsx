import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  CheckSquare,
  Square,
  Trash2,
  X,
  AlertTriangle,
  Sparkles,
  Check
} from 'lucide-react';
import { FormCard } from './FormCard';
import { ShareModal } from '../export/ShareModal';
import { FormsOverviewMetric } from './FormsOverviewMetric';
import { PublishedFormsMetric } from './PublishedFormsMetric';

export const DashboardView: React.FC = () => {
  const {
    forms,
    createBlankForm,
    setActiveView,
    bulkDeleteForms
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [shareFormId, setShareFormId] = useState<string | null>(null);

  // Multi-selection state
  const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'published' && form.isPublished) ||
                          (filterStatus === 'draft' && !form.isPublished);
    return matchesSearch && matchesStatus;
  });

  const isSelectionMode = selectedFormIds.size > 0;
  const isAllFilteredSelected = filteredForms.length > 0 && filteredForms.every(f => selectedFormIds.has(f.id));

  const handleToggleSelect = (formId: string) => {
    setSelectedFormIds(prev => {
      const next = new Set(prev);
      if (next.has(formId)) {
        next.delete(formId);
      } else {
        next.add(formId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedFormIds(new Set());
    } else {
      setSelectedFormIds(new Set(filteredForms.map(f => f.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedFormIds(new Set());
  };

  const handleConfirmBulkDelete = () => {
    const idsToDelete = Array.from(selectedFormIds);
    bulkDeleteForms(idsToDelete);
    setSelectedFormIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  const selectedFormsList = forms.filter(f => selectedFormIds.has(f.id));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-28">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-white">
            Workspace <span className="text-[#38BDF8]">Forms Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage forms, publish respondent links, select multiple forms to manage or delete, and monitor response data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('templates')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Templates Marketplace</span>
          </button>

          <button
            onClick={() => { createBlankForm(); setActiveView('builder'); }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-neo transition-all transform hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Blank Form</span>
          </button>
        </div>
      </div>

      {/* Redesigned 2-Panel Forms Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <FormsOverviewMetric forms={forms} />
        <PublishedFormsMetric forms={forms} />
      </div>

      {/* Filter Toolbar & Multi-Select Options */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121820] p-3 rounded-xl border border-[#2A3647]">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#84A1C0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms by title or description..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#1A2332] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5">
            {(['all', 'published', 'draft'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#2563EB] text-white font-bold'
                    : 'bg-[#1A2332] text-slate-400 border border-[#2A3647] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Select All Toggle Button */}
          {filteredForms.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAllFilteredSelected
                  ? 'bg-[#2563EB] text-white border border-[#38BDF8] shadow-sm'
                  : isSelectionMode
                  ? 'bg-[#1A2332] text-cyan-300 border border-[#38BDF8]/60 hover:bg-[#222C3D]'
                  : 'bg-[#1A2332] text-slate-300 border border-[#2A3647] hover:border-slate-500 hover:text-white'
              }`}
              title={isAllFilteredSelected ? 'Deselect All' : 'Select All'}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {isAllFilteredSelected
                  ? 'Deselect All'
                  : isSelectionMode
                  ? `Selected (${selectedFormIds.size})`
                  : 'Select Multiple'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="p-12 text-center bg-[#121820] rounded-2xl border border-[#2A3647] space-y-3">
          <p className="text-slate-400 text-xs">
            {forms.length === 0 ? 'No forms in your workspace yet.' : 'No forms matched your search filter.'}
          </p>
          <button onClick={() => { createBlankForm(); setActiveView('builder'); }} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-bold cursor-pointer">
            Create Form Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              isSelected={selectedFormIds.has(form.id)}
              onToggleSelect={handleToggleSelect}
              isSelectionMode={isSelectionMode}
              onShareClick={(id) => setShareFormId(id)}
            />
          ))}
        </div>
      )}

      {/* Sticky Floating Bulk Actions Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slideUp w-[92%] max-w-lg">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-[#0F172A]/95 border border-[#38BDF8]/40 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38BDF8]" />
              </span>
              <span className="text-xs font-bold text-cyan-300">
                {selectedFormIds.size} {selectedFormIds.size === 1 ? 'form' : 'forms'} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer hidden xs:inline-block"
              >
                {isAllFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>

              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedFormIds.size})</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Cancel selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-rose-500/40 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 border-b border-[#2A3647] pb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-white">
                  Delete {selectedFormIds.size} {selectedFormIds.size === 1 ? 'Form' : 'Forms'}?
                </h3>
                <p className="text-xs text-slate-400">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300">
                The following forms and all their submitted responses will be permanently deleted:
              </p>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 bg-[#161D27] p-2.5 rounded-xl border border-[#2A3647]">
                {selectedFormsList.map(f => (
                  <div key={f.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#121820] border border-[#2A3647]/50">
                    <span className="text-white font-medium truncate max-w-[240px]">{f.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {f.questions?.length || 0} qs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A3647]">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedFormIds.size} {selectedFormIds.size === 1 ? 'Form' : 'Forms'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {shareFormId && (
        <ShareModal formId={shareFormId} isOpen={!!shareFormId} onClose={() => setShareFormId(null)} />
      )}
    </div>
  );
};
