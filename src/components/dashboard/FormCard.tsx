import React, { useState, useRef, useEffect } from 'react';
import { Form } from '../../types';
import { useApp } from '../../context/AppContext';
import { MoreVertical, Eye, Share2, Copy, Trash2, Edit3, MessageSquare, User, Clock, AlertCircle, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getEffectiveFormStatus, formatExpiryDescription } from '../../utils/formStatus';

interface FormCardProps {
  form: Form;
  onShareClick: (formId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (formId: string) => void;
  isSelectionMode?: boolean;
}

export const FormCard: React.FC<FormCardProps> = ({
  form,
  onShareClick,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false
}) => {
  const { setActiveFormId, setActiveView, deleteForm, duplicateForm, publishFormToggle, responses } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const questionCount = form.questions?.length || 0;
  const responseCount = responses.filter(r => r.formId === form.id).length || form.responseCount || 0;
  const effectiveStatus = getEffectiveFormStatus(form);
  const expiryInfo = (form.expiresAt || form.settings?.expiresAt)
    ? formatExpiryDescription(form.expiresAt || form.settings?.expiresAt!)
    : null;

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAnalytics = () => {
    setActiveFormId(form.id);
    setActiveView('analytics');
  };

  const handleOpenBuilder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFormId(form.id);
    setActiveView('builder');
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFormId(form.id);
    setActiveView('preview');
  };

  const getBorderColor = () => {
    if (isSelected) {
      return 'border-[#38BDF8] ring-2 ring-[#38BDF8]/60 bg-[#172234]/95 shadow-[0_0_20px_rgba(56,189,248,0.2)]';
    }
    switch (effectiveStatus) {
      case 'OPEN': return 'border-emerald-500 hover:border-emerald-400';
      case 'EXPIRED': return 'border-amber-500 hover:border-amber-400';
      case 'CLOSED': return 'border-slate-600 hover:border-slate-500';
      default: return 'border-rose-500 hover:border-rose-400';
    }
  };

  return (
    <div
      onClick={handleOpenAnalytics}
      className={`p-6 rounded-2xl bg-[#121820]/90 backdrop-blur-2xl border-2 relative group cursor-pointer flex flex-col justify-between min-h-[210px] md:min-h-[220px] shadow-none transition-all duration-300 transform ${
        isMenuOpen ? 'z-40 scale-[1.01]' : 'z-0 hover:z-10 hover:scale-[1.01]'
      } ${getBorderColor()}`}
    >
      {/* Card Face: Form Title, Description & 3-Dots Menu Button */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Multi-select Checkbox */}
            {onToggleSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(form.id);
                }}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] border-[#38BDF8] text-white shadow-sm ring-2 ring-[#38BDF8]/40'
                    : isSelectionMode
                    ? 'bg-[#1A2332] border-[#475569] hover:border-[#38BDF8] text-transparent'
                    : 'bg-[#1A2332]/80 border-[#334155] opacity-0 group-hover:opacity-100 hover:border-[#38BDF8] text-transparent'
                }`}
                title={isSelected ? 'Deselect Form' : 'Select Form'}
                aria-label={`Select ${form.title}`}
              >
                <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100 stroke-[3]' : 'opacity-0'}`} />
              </button>
            )}

            <h3 className="font-display font-bold text-lg md:text-xl text-white group-hover:text-[#38BDF8] transition-colors line-clamp-1 pr-1 tracking-tight">
              {form.title}
            </h3>
          </div>

          {/* 3-Dots Menu Button & Popover */}
          <div className="relative shrink-0 z-50" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Form Options & Data"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* 3-Dots Menu Dropdown with all Options & Data */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 rounded-2xl bg-[#121820]/95 border border-[#2A3647] p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 z-50 space-y-2 backdrop-blur-xl animate-fadeIn text-slate-100">
                {/* Status & Submissions Data Panel */}
                <div className="p-3 rounded-xl bg-gradient-to-b from-[#182333] to-[#0E1520] border border-[#2B3A4F] shadow-sm space-y-2.5">
                  {/* Status Badge & Action Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
                      effectiveStatus === 'OPEN'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : effectiveStatus === 'EXPIRED'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                        : effectiveStatus === 'CLOSED'
                        ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/35'
                    }`}>
                      {effectiveStatus === 'OPEN' ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      ) : effectiveStatus === 'EXPIRED' ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      ) : effectiveStatus === 'CLOSED' ? (
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                      )}
                      <span>
                        {effectiveStatus === 'OPEN'
                          ? 'OPEN'
                          : effectiveStatus === 'EXPIRED'
                          ? 'EXPIRED'
                          : effectiveStatus === 'CLOSED'
                          ? 'CLOSED'
                          : 'DRAFT'}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        publishFormToggle(form.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                        form.isPublished
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border-rose-500/25 hover:border-rose-500/40'
                          : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border-emerald-500/30'
                      }`}
                    >
                      {form.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>

                  {/* Clean Divider Line */}
                  <div className="h-px bg-white/5" />

                  {/* Metadata Rows: Responses & Author */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Responses</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#16202D] border border-[#27374D] text-xs font-semibold text-white font-mono shadow-sm">
                        {responseCount}
                        <span className="text-[10px] text-slate-400 font-normal font-sans ml-1">
                          {responseCount === 1 ? 'submission' : 'submissions'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Author</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#2563EB]/25 border border-[#2563EB]/40 text-[9px] font-bold text-[#38BDF8] flex items-center justify-center uppercase">
                          {form.authorName?.charAt(0) || 'A'}
                        </span>
                        <span className="truncate max-w-[110px] text-xs font-medium text-slate-200">
                          {form.authorName || 'Anonymous'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-1" />

                {/* Form Options */}
                <button
                  type="button"
                  onClick={() => { handleOpenAnalytics(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A2536] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>View Analytics & Responses</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { handleOpenBuilder(e); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A2536] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Edit in Builder</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { handleOpenPreview(e); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A2536] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Preview Form</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onShareClick(form.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A2536] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Share Link & QR</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); duplicateForm(form.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1A2536] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Duplicate Form</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteForm(form.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/15 text-xs font-medium text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Delete Form</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed pt-1 font-medium">
          {form.description || 'No description provided for this form.'}
        </p>
      </div>

      {/* Meta Stats Row: Number of Questions & Responses */}
      <div className="pt-3 border-t border-white/10 space-y-2.5 mt-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            <strong className="text-slate-200 font-bold">{questionCount}</strong> {questionCount === 1 ? 'question' : 'questions'}
          </span>
          <span>
            <strong className="text-slate-200 font-bold">{responseCount}</strong> {responseCount === 1 ? 'response' : 'responses'}
          </span>
        </div>

        {/* Subtle Bottom Accent Indicator Line */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
          {expiryInfo ? (
            <span className={`flex items-center gap-1.5 font-bold ${
              expiryInfo.isExpired ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{expiryInfo.shortLabel}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Edited {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}</span>
            </span>
          )}
          <span className="text-[#38BDF8] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Analytics ➔
          </span>
        </div>
      </div>
    </div>
  );
};
