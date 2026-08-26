import React from 'react';
import { Question, QuestionType } from '../../types';
import { Sliders, Shield, Award, X, FileQuestion } from 'lucide-react';
import { QUESTION_TYPES } from './QuestionCard';

interface QuestionPropertiesProps {
  question: Question | undefined;
  isQuizMode?: boolean;
  onUpdate: (updates: Partial<Question>) => void;
  onClose: () => void;
}

export const QuestionProperties: React.FC<QuestionPropertiesProps> = ({
  question,
  isQuizMode,
  onUpdate,
  onClose
}) => {
  if (!question) {
    return (
      <aside className="w-64 bg-[#121820] border-l border-[#2A3647] p-6 flex flex-col items-center justify-center text-center text-slate-500 hidden xl:flex h-[calc(100vh-3.5rem)]">
        <Sliders className="w-6 h-6 mb-2 text-[#84A1C0]" />
        <p className="text-xs font-sans">Select a question to inspect properties & validation rules.</p>
      </aside>
    );
  }

  const handleTypeChange = (newType: QuestionType) => {
    const updates: Partial<Question> = { type: newType };
    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(newType)) {
      if (!question.options || question.options.length === 0) {
        updates.options = [
          { id: 'opt-1', label: 'Option 1' },
          { id: 'opt-2', label: 'Option 2' },
          { id: 'opt-3', label: 'Option 3' }
        ];
      }
    }
    if (newType === 'scale') {
      if (!question.scaleMin) updates.scaleMin = 1;
      if (!question.scaleMax) updates.scaleMax = 10;
    }
    if (newType === 'rating') {
      if (!question.ratingMax) updates.ratingMax = 5;
    }
    onUpdate(updates);
  };

  return (
    <aside className="w-72 bg-[#121820] border-l border-[#2A3647] p-4 space-y-5 overflow-y-auto hidden xl:block h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between border-b border-[#2A3647] pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">Inspector Panel</h3>
          <p className="text-[10px] text-[#84A1C0] mt-0.5 line-clamp-1 font-mono">{question.title}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question Type Selector Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[#38BDF8]">
          <FileQuestion className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
            Question Type
          </span>
        </div>
        <select
          value={question.type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
          className="w-full bg-[#1A2332] px-2.5 py-2 rounded-lg text-xs font-bold font-mono text-[#38BDF8] border border-[#2A3647] focus:border-[#38BDF8] focus:outline-none cursor-pointer"
        >
          {QUESTION_TYPES.map(t => (
            <option key={t.type} value={t.type} className="bg-[#121820] text-slate-200 font-sans">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* General Content Section */}
      <div className="space-y-3 pt-3 border-t border-[#2A3647]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#84A1C0]">
          Content & Tooltips
        </span>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1">Placeholder Text</label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Type placeholder..."
            className="w-full bg-[#1A2332] px-2.5 py-1.5 rounded-lg text-xs text-white border border-[#2A3647] focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-300 mb-1 font-sans">Help Tooltip Subtext</label>
          <input
            type="text"
            value={question.helpText || ''}
            onChange={(e) => onUpdate({ helpText: e.target.value })}
            placeholder="Add subtext..."
            className="w-full bg-[#1A2332] px-2.5 py-1.5 rounded-lg text-xs text-white border border-[#2A3647] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      {/* Quiz Scoring Section */}
      {isQuizMode && (
        <div className="space-y-3 pt-3 border-t border-[#2A3647]">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Quiz Points & Scoring
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Point Value</label>
            <input
              type="number"
              value={question.points || 0}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#1A2332] px-2.5 py-1.5 rounded-lg text-xs text-white font-mono border border-[#2A3647] focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Validation Rules */}
      <div className="space-y-3 pt-3 border-t border-[#2A3647]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#84A1C0]">
            Field Validation Limits
          </span>
        </div>

        {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Max Selectable Options</label>
            <select
              value={question.maxSelections || question.validation?.maxSelections || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value) || undefined;
                onUpdate({
                  maxSelections: val,
                  validation: { ...question.validation, required: question.required, maxSelections: val }
                });
              }}
              className="w-full bg-[#1A2332] px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono text-[#38BDF8] border border-[#2A3647] focus:border-[#38BDF8] focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-[#121820] text-slate-300">Any (Unlimited)</option>
              {Array.from({ length: (question.options || []).length || 1 }).map((_, idx) => {
                const num = idx + 1;
                return (
                  <option key={num} value={num} className="bg-[#121820] text-slate-200 font-sans">
                    Select Only {num} {num === 1 ? 'Option' : 'Options'}
                  </option>
                );
              })}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Limits respondent selection to at most {question.maxSelections || question.validation?.maxSelections || 'unlimited'} {((question.maxSelections || question.validation?.maxSelections) === 1) ? 'option' : 'options'} out of {question.options?.length || 0}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-[#84A1C0] mb-1 font-mono">Min Length</label>
            <input
              type="number"
              value={question.validation?.minLength || ''}
              onChange={(e) => onUpdate({ validation: { ...question.validation, required: question.required, minLength: parseInt(e.target.value) || undefined } })}
              placeholder="0"
              className="w-full bg-[#1A2332] px-2 py-1 rounded text-xs text-white font-mono border border-[#2A3647]"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#84A1C0] mb-1 font-mono">Max Length</label>
            <input
              type="number"
              value={question.validation?.maxLength || ''}
              onChange={(e) => onUpdate({ validation: { ...question.validation, required: question.required, maxLength: parseInt(e.target.value) || undefined } })}
              placeholder="500"
              className="w-full bg-[#1A2332] px-2 py-1 rounded text-xs text-[#84A1C0] font-mono border border-[#2A3647]"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
