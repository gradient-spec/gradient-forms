import React from 'react';
import {
  PlusCircle,
  FileDown,
  Image as ImageIcon,
  PlaySquare,
  Rows
} from 'lucide-react';

interface GoogleFormsFloatingToolbarProps {
  onAddQuestion: () => void;
  onImportQuestions: () => void;
  onToggleFormatting: () => void;
  onAddImage: () => void;
  onAddVideo: () => void;
  onAddSection: () => void;
  isFormattingActive?: boolean;
  hasActiveMedia?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export const GoogleFormsFloatingToolbar: React.FC<GoogleFormsFloatingToolbarProps> = ({
  onAddQuestion,
  onImportQuestions,
  onToggleFormatting,
  onAddImage,
  onAddVideo,
  onAddSection,
  isFormattingActive,
  hasActiveMedia,
  orientation = 'vertical'
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <aside
      aria-label="Google Forms action dock"
      className={`bg-[#161F2E]/95 backdrop-blur-xl border border-[#2D3C52] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5 flex items-center transition-all select-none z-30 ${
        isHorizontal ? 'flex-row gap-1.5' : 'flex-col gap-1.5'
      }`}
    >
      {/* 1. Add Question */}
      <div className="relative group">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAddQuestion(); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2563EB]/20 hover:border hover:border-[#2563EB]/50 transition-all cursor-pointer"
          aria-label="Add question"
        >
          <PlusCircle className="w-5 h-5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
        </button>
        <div className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute z-50 bg-[#0F172A] text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md flex items-center ${
          isHorizontal ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'
        }`}>
          {!isHorizontal && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-[#334155] rotate-45" />
          )}
          <span>Add question</span>
        </div>
      </div>

      {/* 2. Import Questions */}
      <div className="relative group">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onImportQuestions(); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2563EB]/20 hover:border hover:border-[#2563EB]/50 transition-all cursor-pointer"
          aria-label="Import questions"
        >
          <FileDown className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
        </button>
        <div className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute z-50 bg-[#0F172A] text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md flex items-center ${
          isHorizontal ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'
        }`}>
          {!isHorizontal && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-[#334155] rotate-45" />
          )}
          <span>Import questions</span>
        </div>
      </div>

      {/* 3. Add Title & Description / Typography (TT) */}
      <div className="relative group">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFormatting(); }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            isFormattingActive
              ? 'bg-[#2563EB] text-white border-[#38BDF8] shadow-[0_0_12px_rgba(37,99,235,0.6)]'
              : 'text-slate-300 hover:text-white hover:bg-[#2563EB]/20 border-transparent hover:border-[#2563EB]/50'
          }`}
          aria-label="Format text and headline sizes"
        >
          <span className="font-heading font-black text-sm tracking-tighter text-cyan-300 group-hover:scale-110 transition-transform flex items-baseline">
            T<span className="text-[10px]">T</span>
          </span>
        </button>
        <div className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute z-50 bg-[#0F172A] text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md flex items-center ${
          isHorizontal ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'
        }`}>
          {!isHorizontal && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-[#334155] rotate-45" />
          )}
          <span>{isFormattingActive ? 'Close formatting' : 'Title & text format'}</span>
        </div>
      </div>

      {/* 4. Add Image */}
      <div className="relative group">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAddImage(); }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            hasActiveMedia
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              : 'text-slate-300 hover:text-white hover:bg-[#2563EB]/20 border-transparent hover:border-[#2563EB]/50'
          }`}
          aria-label="Add image"
        >
          <ImageIcon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>
        <div className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute z-50 bg-[#0F172A] text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md flex items-center ${
          isHorizontal ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'
        }`}>
          {!isHorizontal && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-[#334155] rotate-45" />
          )}
          <span>Add image</span>
        </div>
      </div>

      {/* 5. Add Video */}
      <div className="relative group">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAddVideo(); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2563EB]/20 hover:border hover:border-[#2563EB]/50 transition-all cursor-pointer"
          aria-label="Add video"
        >
          <PlaySquare className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
        </button>
        <div className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute z-50 bg-[#0F172A] text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md flex items-center ${
          isHorizontal ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'
        }`}>
          {!isHorizontal && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-[#334155] rotate-45" />
          )}
          <span>Add YouTube video</span>
        </div>
      </div>

      {/* 6. Add Section */}
      <div className="relative group">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAddSection(); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2563EB]/20 hover:border hover:border-[#2563EB]/50 transition-all cursor-pointer"
          aria-label="Add section"
        >
          <Rows className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
        </button>
        <div className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute z-50 bg-[#0F172A] text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#334155] shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md flex items-center ${
          isHorizontal ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'
        }`}>
          {!isHorizontal && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-[#334155] rotate-45" />
          )}
          <span>Add section</span>
        </div>
      </div>
    </aside>
  );
};
