import React, { useState, useRef, useEffect } from 'react';
import { Question, QuestionOption, QuestionType, Section } from '../../types';
import { GoogleFormsFloatingToolbar } from './GoogleFormsFloatingToolbar';
import {
  GripVertical,
  Copy,
  Trash2,
  Plus,
  MessageSquare,
  Star,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
  AlertCircle,
  Layers,
  Upload,
  ShieldCheck,
  PenTool,
  Grid,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDownSquare,
  Sliders,
  Mail,
  Phone,
  Hash,
  Link,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  PlaySquare,
  GitBranch
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ACTION_CONTINUE_NEXT, ACTION_SUBMIT_FORM } from '../../utils/branchingEngine';

export const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'short_answer', label: 'Short Answer', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
  { type: 'multiple_choice', label: 'Radio Button (Single Choice)', icon: CircleDot },
  { type: 'checkboxes', label: 'Checkboxes', icon: CheckSquare },
  { type: 'dropdown', label: 'Dropdown Menu', icon: ChevronDownSquare },
  { type: 'scale', label: 'Linear Scale', icon: Sliders },
  { type: 'rating', label: 'Star Rating', icon: Star },
  { type: 'date', label: 'Date Picker', icon: Calendar },
  { type: 'file_upload', label: 'File Upload', icon: Upload },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'phone', label: 'Phone Number', icon: Phone },
  { type: 'number', label: 'Numeric Input', icon: Hash },
  { type: 'url', label: 'Website / URL', icon: Link },
  { type: 'matrix', label: 'Matrix Grid', icon: Grid },
  { type: 'ranking', label: 'Ranking List', icon: ListOrdered }
];

export const DEFAULT_QUESTION_TITLES: Record<QuestionType, string> = {
  short_answer: 'Short Answer Question',
  paragraph: 'Detailed Response / Feedback',
  multiple_choice: 'Radio Type Question',
  checkboxes: 'Checkboxes (Select all that apply)',
  dropdown: 'Dropdown Selection',
  scale: 'Linear Scale Rating (1-10)',
  rating: 'Star Rating',
  date: 'Date Selection',
  time: 'Time Selection',
  file_upload: 'File Upload',
  email: 'Email Address',
  phone: 'Phone Number',
  number: 'Numeric Input',
  url: 'Website / URL',
  matrix: 'Matrix Grid Rating',
  ranking: 'Ranking Order',
  signature: 'Digital Signature',
  consent: 'Consent Agreement',
  section: 'New Form Section',
  heading: 'Section Header'
};

const DEFAULT_QUESTION_PLACEHOLDERS: Partial<Record<QuestionType, string>> = {
  short_answer: 'Type your answer here...',
  paragraph: 'Type detailed response...',
  email: 'alex@example.com',
  phone: '+1 (555) 000-0000',
  number: '0',
  url: 'https://example.com',
  date: 'Select date...',
  time: 'Select time...',
  file_upload: 'Upload file (PDF, PNG, DOC)...'
};

const ALL_DEFAULT_TITLES = new Set([
  'Short Answer Question',
  'Short Answer',
  'Detailed Response / Feedback',
  'Paragraph',
  'Select an Option',
  'Radio Button (Single Choice)',
  'Radio Type Question',
  'Radio Button Question',
  'Radio Button',
  'Radio Choice',
  'Multiple Choice',
  'Multiple Choice Question',
  'Select all that apply',
  'Checkboxes',
  'Checkboxes (Select all that apply)',
  'Dropdown',
  'Dropdown Menu',
  'Dropdown Selection',
  'Choose from list',
  'Linear Scale',
  'Linear Scale Rating (1-10)',
  'Rate on a scale of 1 to 10',
  'Star Rating',
  'Rating',
  'Date Selection',
  'Select Date',
  'Date Picker',
  'Date',
  'Time Selection',
  'Select Time',
  'Time Picker',
  'Time',
  'File Upload',
  'Upload File / Resume',
  'Email Address',
  'Email',
  'Phone Number',
  'Phone',
  'Numeric Input',
  'Number',
  'Website / URL',
  'Website URL',
  'Website / Portfolio Link',
  'Matrix Rating Grid',
  'Matrix Grid',
  'Matrix',
  'Digital Signature',
  'Signature',
  'Terms & Conditions Agreement',
  'Consent Agreement',
  'Terms Consent',
  'Consent',
  'New Form Section',
  'New Section',
  'Section Header',
  'Ranking Order',
  'Ranking List',
  'Ranking',
  'Rank in order of preference',
  'Untitled Question',
  'New Question',
  'Question Title',
  ''
]);

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
  sections?: Section[];
  onMoveToSection?: (targetSectionId: string) => void;
  onOpenMediaModal?: (type: 'image' | 'video') => void;
  isFormattingActive?: boolean;
  onImportQuestions?: () => void;
  onAddSection?: () => void;
  onToggleFormatting?: () => void;
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
  onAddNextQuestion,
  sections,
  onMoveToSection,
  onOpenMediaModal,
  isFormattingActive,
  onImportQuestions,
  onAddSection,
  onToggleFormatting
}) => {
  const [showFormatting, setShowFormatting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id
  });

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  // Close type dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTypeObj = QUESTION_TYPES.find(t => t.type === question.type) || QUESTION_TYPES[0];
  const CurrentTypeIcon = currentTypeObj.icon;

  const handleTypeChange = (newType: QuestionType) => {
    const updates: Partial<Question> = { type: newType };

    // Dynamically change the question title to match the new question type if current title is default/empty
    const currentTrimmedTitle = (question.title || '').trim();
    if (!currentTrimmedTitle || ALL_DEFAULT_TITLES.has(currentTrimmedTitle)) {
      updates.title = DEFAULT_QUESTION_TITLES[newType] || 'Question Title';
    }

    // Dynamically update placeholder to match the new question type
    if (DEFAULT_QUESTION_PLACEHOLDERS[newType] !== undefined) {
      updates.placeholder = DEFAULT_QUESTION_PLACEHOLDERS[newType];
    }

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
    setIsTypeDropdownOpen(false);
  };

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOptId = 'opt-' + Date.now();
    const newOption: QuestionOption = {
      id: newOptId,
      label: `Option ${currentOptions.length + 1}`
    };
    onUpdate({ options: [...currentOptions, newOption] });

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

  const handleUpdateOptionDestination = (optId: string, destinationSectionId: string) => {
    const updated = (question.options || []).map(opt =>
      opt.id === optId
        ? { ...opt, destinationSectionId: destinationSectionId === ACTION_CONTINUE_NEXT ? undefined : destinationSectionId }
        : opt
    );
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
        <div className="flex items-center gap-2 flex-wrap">
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
              className="p-1 text-slate-400 hover:text-[#38BDF8] hover:bg-[#1A2332] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Shift Question Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3 bg-[#2A3647]" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              disabled={index === totalQuestions - 1}
              className="p-1 text-slate-400 hover:text-[#38BDF8] hover:bg-[#1A2332] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Shift Question Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="w-5 h-5 rounded bg-[#121820] text-[#84A1C0] font-mono text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>

          {/* Sleek Formative Question Type Custom Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121820] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-xs font-semibold text-[#38BDF8] transition-all cursor-pointer shadow-sm group"
            >
              <CurrentTypeIcon className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="font-heading font-bold tracking-wide">{currentTypeObj.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180 text-[#38BDF8]' : ''}`} />
            </button>

            {/* Custom Dropdown Popover List */}
            {isTypeDropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-1.5 w-60 rounded-xl bg-[#121820] border border-[#2A3647] shadow-[0_12px_35px_rgba(0,0,0,0.85)] z-50 p-1.5 space-y-0.5 max-h-72 overflow-y-auto animate-fadeIn backdrop-blur-xl"
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#84A1C0] tracking-wider border-b border-[#2A3647]/60 mb-1">
                  Select Question Type
                </div>
                {QUESTION_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelectedType = question.type === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => handleTypeChange(t.type)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        isSelectedType
                          ? 'bg-[#2563EB]/25 text-[#38BDF8] border border-[#2563EB]/40 font-bold'
                          : 'text-slate-300 hover:bg-[#1A2332] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelectedType ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                      <span>{t.label}</span>
                      {isSelectedType && <span className="ml-auto text-[10px] font-mono text-[#38BDF8]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {question.required && (
            <span className="text-xs text-[#38BDF8] font-medium">* Required</span>
          )}

          {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
            <div className="flex items-center gap-1.5 bg-[#121820] border border-[#2A3647] hover:border-[#38BDF8]/50 rounded-lg px-2.5 py-1" title="Limit how many options respondent can select">
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
                className="bg-transparent text-[11px] font-mono font-bold text-[#38BDF8] focus:outline-none cursor-pointer"
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

          {['multiple_choice', 'dropdown'].includes(question.type) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ enableBranching: !question.enableBranching });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                question.enableBranching
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-white border-[#2A3647]'
              }`}
              title="Go to section based on answer (Conditional Section Routing)"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>{question.enableBranching ? 'Routing Active' : 'Section Routing'}</span>
            </button>
          )}

          {isQuizMode && question.points && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {question.points} pts
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {sections && sections.length > 1 && onMoveToSection && (
            <div
              className="flex items-center gap-1 bg-[#121820] hover:bg-[#1A2332] border border-[#2A3647] hover:border-[#38BDF8]/60 rounded-lg px-2 py-1 transition-colors"
              title="Move question to another section"
              onClick={(e) => e.stopPropagation()}
            >
              <Layers className="w-3 h-3 text-[#38BDF8] shrink-0" />
              <select
                value={question.sectionId}
                onChange={(e) => onMoveToSection(e.target.value)}
                className="bg-transparent text-[10px] font-mono text-slate-300 focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                {sections.map((sec, sIdx) => (
                  <option key={sec.id} value={sec.id} className="bg-[#121820] text-slate-200">
                    Sec {sIdx + 1}: {sec.title || `Section ${sIdx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onOpenComments(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121820] hover:bg-[#222C3D] text-slate-400 hover:text-white text-xs border border-[#2A3647] cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
            {commentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#2563EB] text-white text-[10px] font-mono font-bold">
                {commentCount}
              </span>
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ required: !question.required }); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              question.required
                ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]'
                : 'bg-[#121820] text-slate-400 border-[#2A3647]'
            }`}
          >
            Required
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 rounded-lg hover:bg-[#121820] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Duplicate Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Title & Media Section */}
      <div className="space-y-3">
        {/* Typography Formatting Bar (Headline sizes H1/H2/H3, Bold, Italic, Underline) */}
        {(showFormatting || isFormattingActive) && (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-[#10151E] border border-[#2A3647] rounded-xl text-xs select-none shadow-xs">
            {/* 3 Headline Sizes */}
            <div className="flex items-center bg-[#161D27] rounded-lg p-0.5 border border-[#2A3647]">
              <button
                type="button"
                onClick={() => onUpdate({
                  titleStyle: { ...question.titleStyle, size: 'lg' }
                })}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  question.titleStyle?.size === 'lg'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Headline 1 (Large)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => onUpdate({
                  titleStyle: { ...question.titleStyle, size: 'md' }
                })}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  (!question.titleStyle?.size || question.titleStyle?.size === 'md')
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Headline 2 (Medium)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => onUpdate({
                  titleStyle: { ...question.titleStyle, size: 'sm' }
                })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  question.titleStyle?.size === 'sm'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Headline 3 (Small)"
              >
                H3
              </button>
            </div>

            <div className="h-4 w-px bg-[#2A3647]" />

            {/* Bold, Italic, Underline */}
            <div className="flex items-center bg-[#161D27] rounded-lg p-0.5 border border-[#2A3647]">
              <button
                type="button"
                onClick={() => onUpdate({
                  titleStyle: {
                    ...question.titleStyle,
                    bold: question.titleStyle?.bold !== false ? false : true
                  }
                })}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  question.titleStyle?.bold !== false
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bold (B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onUpdate({
                  titleStyle: {
                    ...question.titleStyle,
                    italic: !question.titleStyle?.italic
                  }
                })}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  question.titleStyle?.italic
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Italic (I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onUpdate({
                  titleStyle: {
                    ...question.titleStyle,
                    underline: !question.titleStyle?.underline
                  }
                })}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  question.titleStyle?.underline
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Underline (U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Media Shortcuts */}
            <div className="h-4 w-px bg-[#2A3647]" />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenMediaModal?.('image')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161D27] hover:bg-[#2563EB]/20 border border-[#2A3647] hover:border-[#38BDF8]/50 text-[11px] text-slate-300 hover:text-[#38BDF8] transition-all cursor-pointer"
                title="Attach image to question"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Image</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenMediaModal?.('video')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161D27] hover:bg-[#2563EB]/20 border border-[#2A3647] hover:border-[#38BDF8]/50 text-[11px] text-slate-300 hover:text-[#38BDF8] transition-all cursor-pointer"
                title="Embed video in question"
              >
                <PlaySquare className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Title Input Row with Google Forms Image Button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={question.title ?? ''}
            onFocus={(e) => {
              if (ALL_DEFAULT_TITLES.has((question.title || '').trim())) {
                e.target.select();
              }
            }}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddNextQuestion?.();
              }
            }}
            placeholder="Enter question title..."
            className={`w-full bg-transparent border-b border-[#2A3647] focus:border-[#2563EB] focus:outline-none pb-1 transition-all placeholder-slate-500 text-white ${
              question.titleStyle?.size === 'lg'
                ? 'text-xl sm:text-2xl'
                : question.titleStyle?.size === 'sm'
                ? 'text-sm sm:text-base'
                : 'text-base sm:text-lg'
            } ${
              question.titleStyle?.bold === false ? 'font-normal' : 'font-bold font-heading'
            } ${
              question.titleStyle?.italic ? 'italic' : ''
            } ${
              question.titleStyle?.underline ? 'underline decoration-[#38BDF8]/80 underline-offset-4' : ''
            }`}
          />

          {/* Direct Image Icon (Google Forms Style) */}
          <button
            type="button"
            onClick={() => onOpenMediaModal?.('image')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
              question.imageUrl
                ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-[#121820] border-transparent hover:border-[#2A3647]'
            }`}
            title="Insert image for this question"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Toggle Typography Bar */}
          <button
            type="button"
            onClick={() => setShowFormatting(!showFormatting)}
            className={`p-1.5 rounded-lg text-xs font-heading font-black transition-all cursor-pointer shrink-0 border ${
              showFormatting || isFormattingActive
                ? 'text-[#38BDF8] bg-[#2563EB]/20 border-[#2563EB]/50'
                : 'text-slate-400 hover:text-white hover:bg-[#121820] border-transparent hover:border-[#2A3647]'
            }`}
            title="Toggle headline sizes & rich text formatting (TT)"
          >
            TT
          </button>
        </div>

        {/* Description / Subtitle */}
        <input
          type="text"
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Add description / subtitle (optional)..."
          className="w-full bg-transparent text-xs text-[#84A1C0] border-b border-transparent focus:border-[#2A3647] focus:outline-none pb-0.5 placeholder-slate-600"
        />

        {/* Attached Image Preview */}
        {question.imageUrl && (
          <div className="p-3 rounded-xl bg-[#121820] border border-[#2A3647] space-y-2 relative group/img">
            <div className="relative rounded-lg overflow-hidden max-h-72 bg-[#0B0F14] flex items-center justify-center">
              <img
                src={question.imageUrl}
                alt={question.imageCaption || 'Question illustration'}
                className="w-full h-auto max-h-72 object-contain rounded-lg"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onOpenMediaModal?.('image')}
                  className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] font-semibold border border-white/20 cursor-pointer shadow-xs"
                  title="Change image"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ imageUrl: undefined, imageCaption: undefined })}
                  className="p-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs cursor-pointer shadow-xs"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={question.imageCaption || ''}
              onChange={(e) => onUpdate({ imageCaption: e.target.value })}
              placeholder="Image caption / alt description (optional)..."
              className="w-full bg-transparent text-xs text-slate-400 italic placeholder-slate-600 border-b border-transparent focus:border-[#2A3647] focus:outline-none"
            />
          </div>
        )}

        {/* Attached Video Preview */}
        {question.videoUrl && (
          <div className="p-3 rounded-xl bg-[#121820] border border-[#2A3647] space-y-2 relative group/vid">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-[#0B0F14] flex items-center justify-center">
              <iframe
                src={question.videoUrl}
                title="Question video"
                className="w-full h-full"
                allowFullScreen
              />
              <button
                type="button"
                onClick={() => onUpdate({ videoUrl: undefined, videoCaption: undefined })}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs cursor-pointer opacity-90 sm:opacity-0 group-hover/vid:opacity-100 transition-opacity shadow-xs"
                title="Remove video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={question.videoCaption || ''}
              onChange={(e) => onUpdate({ videoCaption: e.target.value })}
              placeholder="Video caption / explanation (optional)..."
              className="w-full bg-transparent text-xs text-slate-400 italic placeholder-slate-600 border-b border-transparent focus:border-[#2A3647] focus:outline-none"
            />
          </div>
        )}
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
                <div className={`w-4 h-4 flex items-center justify-center text-slate-500 text-[10px] shrink-0 ${
                  question.type === 'multiple_choice'
                    ? 'rounded-full border-2 border-[#38BDF8] p-0.5'
                    : 'rounded border border-[#2A3647]'
                }`}>
                  {question.type === 'multiple_choice' ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  ) : question.type === 'checkboxes' ? (
                    '□'
                  ) : (
                    `${optIdx + 1}`
                  )}
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
                  className="flex-1 bg-[#121820] px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-[#2A3647] focus:border-[#2563EB] focus:outline-none min-w-[120px]"
                />

                {/* Conditional Destination Section Selector */}
                {question.enableBranching && ['multiple_choice', 'dropdown'].includes(question.type) && (
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GitBranch className="w-3 h-3 text-cyan-400 shrink-0" />
                    <select
                      value={opt.destinationSectionId || ACTION_CONTINUE_NEXT}
                      onChange={(e) => handleUpdateOptionDestination(opt.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono border focus:outline-none cursor-pointer max-w-[170px] truncate ${
                        opt.destinationSectionId && opt.destinationSectionId !== ACTION_CONTINUE_NEXT && opt.destinationSectionId !== ACTION_SUBMIT_FORM && !(sections || []).some(s => s.id === opt.destinationSectionId)
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                          : opt.destinationSectionId && opt.destinationSectionId !== ACTION_CONTINUE_NEXT
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold'
                          : 'bg-[#121820] text-slate-400 border-[#2A3647]'
                      }`}
                      title="Select section to navigate to when this answer is chosen"
                    >
                      <option value={ACTION_CONTINUE_NEXT} className="bg-[#121820] text-slate-300">
                        Continue to next section
                      </option>
                      {(sections || []).map((sec, sIdx) => (
                        <option key={sec.id} value={sec.id} className="bg-[#121820] text-slate-200">
                          Go to Sec {sIdx + 1}: {sec.title || `Section ${sIdx + 1}`}
                        </option>
                      ))}
                      <option value={ACTION_SUBMIT_FORM} className="bg-[#121820] text-amber-300 font-bold">
                        Submit form (End)
                      </option>
                    </select>
                  </div>
                )}

                {isQuizMode && (
                  <button
                    onClick={() => handleSetCorrectAnswer(opt.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
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
                  className="text-slate-500 hover:text-rose-400 p-1 text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}

            {question.allowOther && (
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161D27]/80 border border-dashed border-[#38BDF8]/40">
                <div className={`w-4 h-4 flex items-center justify-center text-[#38BDF8] text-[10px] shrink-0 ${
                  question.type === 'multiple_choice'
                    ? 'rounded-full border-2 border-[#38BDF8]/60 p-0.5'
                    : 'rounded border border-[#38BDF8]/60'
                }`}>
                  {question.type === 'dropdown' ? '▼' : ''}
                </div>
                <span className="text-xs font-semibold text-[#38BDF8]">Other...</span>
                <span className="text-[11px] text-slate-400 italic">Respondents can type custom answers not in predefined choices</span>
                <button
                  type="button"
                  onClick={() => onUpdate({ allowOther: false })}
                  className="ml-auto text-slate-500 hover:text-rose-400 p-1 text-xs cursor-pointer"
                  title="Remove 'Other' option"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1.5 text-[#38BDF8] font-medium hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>

              {!question.allowOther && (
                <>
                  <span className="text-slate-600">or</span>
                  <button
                    type="button"
                    onClick={() => onUpdate({ allowOther: true })}
                    className="text-[#38BDF8] hover:underline font-medium cursor-pointer"
                  >
                    add "Other"
                  </button>
                </>
              )}
            </div>
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

      {/* Google Forms Floating Action Toolbar (Docked right beside the selected question on desktop) */}
      {isSelected && (
        <div
          className="hidden sm:block absolute left-[calc(100%+14px)] top-0 z-30 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <GoogleFormsFloatingToolbar
            onAddQuestion={() => onAddNextQuestion?.()}
            onImportQuestions={() => onImportQuestions?.()}
            onToggleFormatting={() => {
              setShowFormatting(prev => !prev);
              onToggleFormatting?.();
            }}
            onAddImage={() => onOpenMediaModal?.('image')}
            onAddVideo={() => onOpenMediaModal?.('video')}
            onAddSection={() => onAddSection?.()}
            isFormattingActive={isFormattingActive || showFormatting}
            hasActiveMedia={Boolean(question.imageUrl || question.videoUrl)}
          />
        </div>
      )}

      {/* Mobile Toolbar (Docked at bottom of the active question card on mobile) */}
      {isSelected && (
        <div
          className="sm:hidden mt-3 pt-3 border-t border-[#2A3647]/70 flex items-center justify-center animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <GoogleFormsFloatingToolbar
            orientation="horizontal"
            onAddQuestion={() => onAddNextQuestion?.()}
            onImportQuestions={() => onImportQuestions?.()}
            onToggleFormatting={() => {
              setShowFormatting(prev => !prev);
              onToggleFormatting?.();
            }}
            onAddImage={() => onOpenMediaModal?.('image')}
            onAddVideo={() => onOpenMediaModal?.('video')}
            onAddSection={() => onAddSection?.()}
            isFormattingActive={isFormattingActive || showFormatting}
            hasActiveMedia={Boolean(question.imageUrl || question.videoUrl)}
          />
        </div>
      )}
    </div>
  );
};
