import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilePlus, Sparkles, LayoutGrid, Upload, X, ArrowRight } from 'lucide-react';
import { AiGeneratorModal } from '../ai/AiGeneratorModal';

export const CreateFormModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createBlankForm, setActiveView } = useApp();
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (!isOpen) return null;

  const handleBlank = () => {
    createBlankForm();
    setActiveView('builder');
    onClose();
  };

  const handleTemplate = () => {
    setActiveView('templates');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-xl glass-panel border border-violet-500/30 rounded-2xl shadow-glow-violet overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-display text-white">Create New Form</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select how you would like to initiate your form.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Creation Options Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blank Form */}
            <button
              onClick={handleBlank}
              className="p-5 rounded-2xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/50 text-left transition-all group flex flex-col justify-between h-44"
            >
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 w-fit border border-violet-500/20 group-hover:scale-110 transition-transform">
                <FilePlus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-violet-300">Blank Form</h4>
                <p className="text-xs text-slate-400 mt-1">Start from scratch with complete visual control.</p>
              </div>
            </button>

            {/* AI Form Generator */}
            <button
              onClick={() => { setIsAiOpen(true); }}
              className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-violet-950/30 to-transparent hover:border-cyan-500/50 border border-cyan-500/30 text-left transition-all group flex flex-col justify-between h-44 relative overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-glow-cyan">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">AI Generator</h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-500 text-black uppercase">Instant</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Prompt AI to construct questions and logic automatically.</p>
              </div>
            </button>

            {/* Template Gallery */}
            <button
              onClick={handleTemplate}
              className="p-5 rounded-2xl bg-white/5 hover:bg-magenta-600/20 border border-white/10 hover:border-magenta-500/50 text-left transition-all group flex flex-col justify-between h-44"
            >
              <div className="p-3 rounded-xl bg-magenta-500/10 text-magenta-400 w-fit border border-magenta-500/20 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-magenta-300">Use Template</h4>
                <p className="text-xs text-slate-400 mt-1">Choose from 12+ pre-designed futuristic forms.</p>
              </div>
            </button>

            {/* Import Form */}
            <button
              onClick={() => { alert('Import Form architecture initialized. You can upload Google Forms JSON or CSV export.'); }}
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group flex flex-col justify-between h-44"
            >
              <div className="p-3 rounded-xl bg-white/10 text-slate-300 w-fit border border-white/10 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Import Existing</h4>
                <p className="text-xs text-slate-400 mt-1">Import from Google Forms, Typeform JSON or CSV.</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AiGeneratorModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
};
