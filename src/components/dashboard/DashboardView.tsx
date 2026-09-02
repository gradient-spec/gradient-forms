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
import { FormCard } from './FormCard';
import { ShareModal } from '../export/ShareModal';
import { isFormEdited } from '../../utils/formFilters';
import { FormsOverviewMetric } from './FormsOverviewMetric';
import { PublishedFormsMetric } from './PublishedFormsMetric';

export const DashboardView: React.FC = () => {
  const {
    forms,
    createBlankForm,
    setActiveFormId,
    setActiveView
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [shareFormId, setShareFormId] = useState<string | null>(null);

  const editedForms = forms.filter(isFormEdited);

  const filteredForms = editedForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'published' && form.isPublished) ||
                          (filterStatus === 'draft' && !form.isPublished);
    return matchesSearch && matchesStatus;
  });

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
        <FormsOverviewMetric forms={editedForms} />
        <PublishedFormsMetric forms={editedForms} />
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
              onShareClick={(id) => setShareFormId(id)}
            />
          ))}
        </div>
      )}

      {shareFormId && (
        <ShareModal formId={shareFormId} isOpen={!!shareFormId} onClose={() => setShareFormId(null)} />
      )}
    </div>
  );
};
