import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  SlidersHorizontal,
  FileEdit,
  Eye,
  BarChart3,
  MoreVertical,
  Globe,
  Lock,
  Copy,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ShareModal } from '../export/ShareModal';
import { isFormEdited } from '../../utils/formFilters';

export const DashboardView: React.FC = () => {
  const {
    forms,
    createBlankForm,
    deleteForm,
    duplicateForm,
    setActiveFormId,
    setActiveView,
    publishFormToggle
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [activeMenuFormId, setActiveMenuFormId] = useState<string | null>(null);
  const [shareFormId, setShareFormId] = useState<string | null>(null);

  const editedForms = forms.filter(isFormEdited);
  const totalFormsCount = editedForms.length;
  const publishedFormsCount = editedForms.filter(f => f.isPublished).length;
  const totalResponsesCount = editedForms.reduce((acc, f) => acc + (f.responseCount || 0), 0);

  const filteredForms = editedForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'published' && form.isPublished) ||
                          (filterStatus === 'draft' && !form.isPublished);
    return matchesSearch && matchesStatus;
  });

  const handleEditForm = (formId: string) => {
    setActiveFormId(formId);
    setActiveView('builder');
  };

  const handleViewResponses = (formId: string) => {
    setActiveFormId(formId);
    setActiveView('responses');
  };

  const handleViewAnalytics = (formId: string) => {
    setActiveFormId(formId);
    setActiveView('analytics');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-white">
            Workspace <span className="text-[#38BDF8]">Forms Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage forms, publish respondent links, and monitor response data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('templates')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-medium text-slate-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Templates Marketplace</span>
          </button>

          <button
            onClick={() => { createBlankForm(); setActiveView('builder'); }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-neo transition-all transform hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create Blank Form</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#84A1C0]">Total Forms</span>
          <div className="text-2xl font-bold font-mono text-white">{totalFormsCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#84A1C0]">Live Published</span>
          <div className="text-2xl font-bold font-mono text-[#38BDF8]">
            {publishedFormsCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#84A1C0]">Total Responses</span>
          <div className="text-2xl font-bold font-mono text-white">
            {totalResponsesCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#84A1C0]">Active Workspace</span>
          <div className="text-sm font-bold font-heading text-slate-200 truncate">Engineering Team</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121820] p-3 rounded-xl border border-[#2A3647]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#84A1C0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms by title or description..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#1A2332] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'published', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-[#2563EB] text-white font-bold'
                  : 'bg-[#1A2332] text-slate-400 border border-[#2A3647] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="p-12 text-center bg-[#121820] rounded-2xl border border-[#2A3647] space-y-3">
          <p className="text-slate-400 text-xs">No forms matched your search filter.</p>
          <button onClick={() => { createBlankForm(); setActiveView('builder'); }} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-bold">
            Create Form Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="p-5 rounded-xl bg-[#1A2332] border border-[#2A3647] hover:border-[#2563EB]/60 transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-neo relative"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    form.isPublished
                      ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]/40'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}>
                    {form.isPublished ? '● Published' : '○ Draft'}
                  </span>

                  <button
                    onClick={() => setActiveMenuFormId(activeMenuFormId === form.id ? null : form.id)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#121820]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Context Menu Dropdown */}
                  {activeMenuFormId === form.id && (
                    <div className="absolute top-10 right-4 w-44 rounded-xl bg-[#121820] border border-[#2A3647] p-1.5 shadow-neo z-30 text-xs">
                      <button
                        onClick={() => { handleEditForm(form.id); setActiveMenuFormId(null); }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1A2332] text-slate-200 flex items-center gap-2"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Edit Form</span>
                      </button>
                      <button
                        onClick={() => { duplicateForm(form.id); setActiveMenuFormId(null); }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1A2332] text-slate-200 flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => { setShareFormId(form.id); setActiveMenuFormId(null); }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1A2332] text-slate-200 flex items-center gap-2"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Share & QR</span>
                      </button>
                      <button
                        onClick={() => { publishFormToggle(form.id); setActiveMenuFormId(null); }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1A2332] text-slate-200 flex items-center gap-2"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>{form.isPublished ? 'Unpublish' : 'Publish Form'}</span>
                      </button>
                      <div className="h-px bg-[#2A3647] my-1" />
                      <button
                        onClick={() => { deleteForm(form.id); setActiveMenuFormId(null); }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Form</span>
                      </button>
                    </div>
                  )}
                </div>

                <h3
                  onClick={() => handleEditForm(form.id)}
                  className="text-base font-bold font-heading text-white hover:text-[#38BDF8] cursor-pointer transition-colors line-clamp-1"
                >
                  {form.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{form.description || 'No description added.'}</p>
              </div>

              {/* Meta Info & Actions */}
              <div className="pt-3 border-t border-[#2A3647] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#84A1C0] font-mono">
                  <span>{form.questions.length} questions</span>
                  <span>{form.responseCount || 0} responses</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEditForm(form.id)}
                    className="py-1.5 rounded-lg bg-[#121820] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileEdit className="w-3 h-3 text-[#38BDF8]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleViewResponses(form.id)}
                    className="py-1.5 rounded-lg bg-[#121820] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>Data</span>
                  </button>

                  <button
                    onClick={() => handleViewAnalytics(form.id)}
                    className="py-1.5 rounded-lg bg-[#121820] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <BarChart3 className="w-3 h-3 text-[#38BDF8]" />
                    <span>Charts</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {shareFormId && (
        <ShareModal formId={shareFormId} isOpen={!!shareFormId} onClose={() => setShareFormId(null)} />
      )}
    </div>
  );
};
