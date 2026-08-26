import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, FileText, Sparkles, LayoutGrid, BarChart3, Settings, Plus, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isFormEdited } from '../../utils/formFilters';

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { forms, setActiveView, setActiveFormId, createBlankForm } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const editedForms = forms.filter(isFormEdited);
  const filteredForms = editedForms.filter(f =>
    f.title.toLowerCase().includes(query.toLowerCase()) ||
    f.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectForm = (id: string) => {
    setActiveFormId(id);
    setActiveView('builder');
    onClose();
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl glass-panel border border-violet-500/30 rounded-2xl shadow-glow-violet overflow-hidden"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <Search className="w-5 h-5 text-violet-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search forms, templates, commands (Cmd + K)..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
              autoFocus
            />
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-4">
            {/* Quick Actions */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">Quick Commands</span>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => handleAction(() => { createBlankForm(); setActiveView('builder'); })}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-violet-600/20 text-sm text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4 text-violet-400" />
                    <span>Create Blank Form</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-violet-300">Cmd + N</span>
                </button>

                <button
                  onClick={() => handleAction(() => setActiveView('templates'))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-cyan-600/20 text-sm text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Browse Templates Library</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300" />
                </button>

                <button
                  onClick={() => handleAction(() => setActiveView('analytics'))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-magenta-600/20 text-sm text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-magenta-400" />
                    <span>View Response Analytics</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-magenta-300" />
                </button>
              </div>
            </div>

            {/* Forms Search Results */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
                Forms ({filteredForms.length})
              </span>
              <div className="mt-2 space-y-1">
                {filteredForms.length === 0 ? (
                  <p className="text-xs text-slate-500 px-3 py-2">No matching forms found.</p>
                ) : (
                  filteredForms.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleSelectForm(f.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-slate-200 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{f.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{f.description}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {f.responseCount} responses
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
