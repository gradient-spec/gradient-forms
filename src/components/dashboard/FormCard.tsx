import React, { useState } from 'react';
import { Form } from '../../types';
import { useApp } from '../../context/AppContext';
import { FileText, MoreVertical, Eye, Share2, Copy, Trash2, Edit3, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const FormCard: React.FC<{ form: Form; onShareClick: (formId: string) => void }> = ({ form, onShareClick }) => {
  const { setActiveFormId, setActiveView, deleteForm, duplicateForm, publishFormToggle } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenBuilder = () => {
    setActiveFormId(form.id);
    setActiveView('builder');
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFormId(form.id);
    setActiveView('preview');
  };

  return (
    <div
      onClick={handleOpenBuilder}
      className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/10 relative group cursor-pointer flex flex-col justify-between h-56 transition-all duration-300"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                form.isPublished
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${form.isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {form.isPublished ? 'Live' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Quick Menu Button */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 rounded-xl glass-panel border border-white/10 p-1.5 shadow-2xl z-50 space-y-1">
                <button
                  onClick={() => { handleOpenBuilder(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs text-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Edit Builder</span>
                </button>

                <button
                  onClick={(e) => { handleOpenPreview(e); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs text-slate-200"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview Form</span>
                </button>

                <button
                  onClick={() => { onShareClick(form.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs text-slate-200"
                >
                  <Share2 className="w-3.5 h-3.5 text-magenta-400" />
                  <span>Share Link & QR</span>
                </button>

                <button
                  onClick={() => { duplicateForm(form.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs text-slate-200"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate Form</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  onClick={() => { deleteForm(form.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 text-xs text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Form</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3 space-y-1">
          <h3 className="font-display font-bold text-base text-white group-hover:text-violet-300 transition-colors line-clamp-1">
            {form.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {form.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <img
            src={form.authorAvatar}
            alt={form.authorName}
            className="w-5 h-5 rounded-full object-cover border border-violet-500/30"
          />
          <span className="text-[11px] truncate max-w-[90px]">{form.authorName}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 font-mono">
            {form.responseCount} responses
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); publishFormToggle(form.id); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
              form.isPublished
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border-violet-500/40'
            }`}
          >
            {form.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};
