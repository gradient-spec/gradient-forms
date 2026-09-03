import React from 'react';
import { useApp } from '../../context/AppContext';
import { FilePlus, LayoutGrid, X } from 'lucide-react';

export const CreateFormModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createBlankForm, setActiveView } = useApp();

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#121820] border border-[#2A3647] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2A3647] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-heading text-white">Create New Form</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select how you would like to initiate your form.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creation Options: 2 Cards (Blank Form & Use Template) */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Blank Form */}
          <button
            type="button"
            onClick={handleBlank}
            className="p-5 rounded-2xl bg-[#161D27] hover:bg-[#1E293B] border border-[#2A3647] hover:border-[#38BDF8]/60 text-left transition-all group flex flex-col justify-between h-44 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            <div className="p-3 rounded-xl bg-[#2563EB]/15 text-[#38BDF8] w-fit border border-[#2563EB]/30 group-hover:scale-110 transition-transform">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-[#38BDF8] transition-colors">Blank Form</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Start from scratch with complete visual control and full customization.</p>
            </div>
          </button>

          {/* Option 2: Use Template */}
          <button
            type="button"
            onClick={handleTemplate}
            className="p-5 rounded-2xl bg-[#161D27] hover:bg-[#1E293B] border border-[#2A3647] hover:border-[#38BDF8]/60 text-left transition-all group flex flex-col justify-between h-44 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 w-fit border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">Use Template</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Choose from pre-designed templates in the Marketplace gallery.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
