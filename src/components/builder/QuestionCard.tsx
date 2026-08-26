import React from 'react';
import { Question, QuestionOption, QuestionType } from '../../types';
import { GripVertical, Copy, Trash2, Plus, MessageSquare, Star, ChevronUp, ChevronDown, Calendar, Clock, Upload, ShieldCheck, PenTool, Grid } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'short_answer', label: 'Short Answer' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'checkboxes', label: 'Checkboxes' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'scale', label: 'Linear Scale' },
  { type: 'rating', label: 'Star Rating' },
  { type: 'date', label: 'Date Picker' },
  { type: 'time', label: 'Time Picker' },
  { type: 'file_upload', label: 'File Upload' },
  { type: 'email', label: 'Email Address' },
  { type: 'phone', label: 'Phone Number' },
  { type: 'number', label: 'Numeric Input' },
  { type: 'url', label: 'Website / URL' },
  { type: 'matrix', label: 'Matrix Grid' },
  { type: 'ranking', label: 'Ranking' },
  { type: 'signature', label: 'Digital Signature' },
  { type: 'consent', label: 'Consent Agreement' }
];

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  isSelected: boolean;
  isQuizMode?: boolean;
  commentCount: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpenComments: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddNextQuestion?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  isSelected,
  isQuizMode,
  commentCount,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenComments,
  onMoveUp,
  onMoveDown,
  onAddNextQuestion
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

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

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOptId = 'opt-' + Date.now();
    const newOption: QuestionOption = {
      id: newOptId,
      label: `Option ${currentOptions.length + 1}`
    };
    onUpdate({ options: [...currentOptions, newOption] });

    // Focus newly added option input smoothly
    setTimeout(() => {
      const el = document.querySelector(`input[data-opt-id="${newOptId}"]`) as HTMLInputElement;
      if (el) {
        el.focus();
        el.select();
      }
    }, 50);
  };

  const handleUpdateOptionLabel = (optId: string, label: string) => {
    const updated = (question.options || []).map(opt => opt.id === optId ? { ...opt, label } : opt);
    onUpdate({ options: updated });
  };

  const handleDeleteOption = (optId: string) => {
    const updated = (question.options || []).filter(opt => opt.id !== optId);
    onUpdate({ options: updated });
  };

  const handleSetCorrectAnswer = (optId: string) => {
    onUpdate({ correctAnswer: optId });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`p-5 rounded-xl transition-all duration-150 relative group cursor-pointer ${
        isSelected
          ? 'bg-[#1A2332] border-2 border-[#2563EB] shadow-neo'
          : 'bg-[#1A2332] border border-[#2A3647] hover:border-[#2563EB]/50'
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#121820] text-slate-500 hover:text-slate-200"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Up & Down Reorder Buttons */}
          <div className="flex items-center gap-0.5 border border-[#2A3647] rounded bg-[#121820]">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-[#38BDF8] hover:bg-[#1A2332] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              title="Shift Question Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3 bg-[#2A3647]" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              disabled={index === totalQuestions - 1}
              className="p-1 text-slate-400 hover:text-[#38BDF8] hover:bg-[#1A2332] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              title="Shift Question Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="w-5 h-5 rounded bg-[#121820] text-[#84A1C0] font-mono text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>

          {/* Interactive Question Type Selector */}
          <select
            value={question.type}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              handleTypeChange(e.target.value as QuestionType);
            }}
            className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#38BDF8] bg-[#121820] border border-[#2A3647] hover:border-[#38BDF8]/50 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#38BDF8] cursor-pointer"
          >
            {QUESTION_TYPES.map(t => (
              <option key={t.type} value={t.type} className="bg-[#121820] text-slate-200">
                {t.label}
              </option>
            ))}
          </select>

          {question.required && (
            <span className="text-xs text-[#38BDF8] font-medium">* Required</span>
          )}

          {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
            <div className="flex items-center gap-1 bg-[#121820] border border-[#2A3647] hover:border-[#38BDF8]/50 rounded px-2 py-0.5" title="Limit how many options respondent can select">
              <span className="text-[10px] text-slate-400 font-mono">Limit:</span>
              <select
                value={question.maxSelections || question.validation?.maxSelections || 0}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  const val = parseInt(e.target.value) || undefined;
                  onUpdate({
                    maxSelections: val,
                    validation: { ...question.validation, required: question.required, maxSelections: val }
                  });
                }}
                className="bg-transparent text-[10px] font-mono font-bold text-[#38BDF8] focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-[#121820] text-slate-300">Any (No Limit)</option>
                {Array.from({ length: (question.options || []).length || 1 }).map((_, idx) => {
                  const num = idx + 1;
                  return (
                    <option key={num} value={num} className="bg-[#121820] text-slate-200">
                      Select Only {num} {num === 1 ? 'Option' : 'Options'}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {isQuizMode && question.points && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {question.points} pts
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenComments(); }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#121820] hover:bg-[#222C3D] text-slate-400 hover:text-white text-xs border border-[#2A3647]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {commentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#2563EB] text-white text-[10px] font-mono font-bold">
                {commentCount}
              </span>
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ required: !question.required }); }}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              question.required
                ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]'
                : 'bg-[#121820] text-slate-400 border-[#2A3647]'
            }`}
          >
            Required
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 rounded hover:bg-[#121820] text-slate-400 hover:text-slate-200 transition-colors"
            title="Duplicate Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Title Input */}
      <div className="space-y-2">
        <input
          type="text"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddNextQuestion?.();
            }
          }}
          placeholder="Enter question title..."
          className="w-full bg-transparent text-base font-bold font-heading text-white border-b border-[#2A3647] focus:border-[#2563EB] focus:outline-none pb-1 transition-colors placeholder-slate-500"
        />

        <input
          type="text"
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Add description / subtitle (optional)..."
          className="w-full bg-transparent text-xs text-[#84A1C0] border-b border-transparent focus:border-[#2A3647] focus:outline-none pb-0.5 placeholder-slate-600"
        />
      </div>

      {/* Question Type Body Previews */}
      <div className="mt-4 pt-3 border-t border-[#2A3647]">
        {['short_answer', 'email', 'phone', 'url', 'number'].includes(question.type) && (
          <input
            type="text"
            disabled
            placeholder={question.placeholder || `Respondent ${question.type.replace('_', ' ')} input preview...`}
            className="w-full px-3 py-2 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-500 cursor-not-allowed"
          />
        )}

        {question.type === 'paragraph' && (
          <textarea
            disabled
            rows={3}
            placeholder={question.placeholder || 'Respondent detailed response area...'}
            className="w-full px-3 py-2 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-500 cursor-not-allowed resize-none"
          />
        )}

        {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
          <div className="space-y-2">
            {(question.options || []).map((opt, optIdx) => (
              <div key={opt.id} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded border border-[#2A3647] flex items-center justify-center text-slate-500 text-[10px]">
                  {question.type === 'multiple_choice' ? '○' : question.type === 'checkboxes' ? '□' : `${optIdx + 1}`}
                </div>
                <input
                  type="text"
                  data-opt-id={opt.id}
                  value={opt.label}
                  onChange={(e) => handleUpdateOptionLabel(opt.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 bg-[#121820] px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-[#2A3647] focus:border-[#2563EB] focus:outline-none"
                />

                {isQuizMode && (
                  <button
                    onClick={() => handleSetCorrectAnswer(opt.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      question.correctAnswer === opt.id
                        ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]'
                        : 'bg-[#121820] text-slate-500 border-[#2A3647] hover:text-slate-300'
                    }`}
                  >
                    {question.correctAnswer === opt.id ? '✓ Correct Key' : 'Set Correct'}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteOption(opt.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={handleAddOption}
              className="flex items-center gap-1.5 text-xs text-[#38BDF8] font-medium hover:underline pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          </div>
        )}

        {question.type === 'scale' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#84A1C0] font-mono">
              <span>Min ({question.scaleMin || 1}): {question.scaleMinLabel || 'Min'}</span>
              <span>Max ({question.scaleMax || 10}): {question.scaleMaxLabel || 'Max'}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {Array.from({ length: (question.scaleMax || 10) - (question.scaleMin || 1) + 1 }).map((_, i) => (
                <div key={i} className="flex-1 py-1.5 rounded bg-[#121820] border border-[#2A3647] text-center text-xs font-mono text-slate-400">
                  {(question.scaleMin || 1) + i}
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === 'rating' && (
          <div className="flex items-center gap-1.5 text-yellow-500">
            {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-500/20 stroke-yellow-500" />
            ))}
          </div>
        )}

        {question.type === 'date' && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
            <span>Select Date (YYYY-MM-DD)</span>
          </div>
        )}

        {question.type === 'time' && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-400">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span>Select Time (HH:MM AM/PM)</span>
          </div>
        )}

        {question.type === 'file_upload' && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-[#121820] border border-dashed border-[#2A3647] text-xs text-slate-400">
            <Upload className="w-4 h-4 text-[#38BDF8]" />
            <span>Attach File (PDF, PNG, DOCX - Max 10MB)</span>
          </div>
        )}

        {question.type === 'signature' && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-[#121820] border border-dashed border-[#2A3647] text-xs text-slate-400">
            <PenTool className="w-4 h-4 text-[#38BDF8]" />
            <span>Digital Signature Canvas Area</span>
          </div>
        )}

        {question.type === 'consent' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            <span>I agree to the Terms & Conditions and Privacy Policy</span>
          </div>
        )}

        {(question.type === 'matrix' || question.type === 'ranking') && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-400">
            <Grid className="w-4 h-4 text-[#38BDF8]" />
            <span>{question.type === 'matrix' ? 'Matrix Rating Grid Preview' : 'Drag & Drop Ranking Grid Preview'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
