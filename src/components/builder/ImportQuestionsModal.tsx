import React, { useState } from 'react';
import {
  X,
  FileDown,
  Check,
  Search,
  CheckSquare,
  Square,
  HelpCircle,
  Layers
} from 'lucide-react';
import { Form, Question } from '../../types';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableForms: Form[];
  currentFormId: string;
  targetSectionId: string;
  onImportQuestions: (questions: Question[]) => void;
}

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  availableForms,
  currentFormId,
  targetSectionId,
  onImportQuestions
}) => {
  const otherForms = availableForms.filter(f => f.id !== currentFormId);
  const [selectedFormId, setSelectedFormId] = useState<string>(otherForms[0]?.id || availableForms[0]?.id || '');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const selectedForm = availableForms.find(f => f.id === selectedFormId);
  const questionsToDisplay = (selectedForm?.questions || []).filter(q =>
    (q.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === questionsToDisplay.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(questionsToDisplay.map(q => q.id));
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    if (!selectedForm || selectedQuestionIds.length === 0) return;
    const questionsToClone = selectedForm.questions.filter(q => selectedQuestionIds.includes(q.id));
    const clonedQuestions: Question[] = questionsToClone.map((q, idx) => ({
      ...q,
      id: 'q-imp-' + Date.now() + '-' + idx,
      sectionId: targetSectionId,
      title: q.title
    }));
    onImportQuestions(clonedQuestions);
    setSelectedQuestionIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161D27] border border-[#2A3647] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A3647] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <FileDown className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Import Questions</h3>
              <p className="text-xs text-slate-400">Select questions from another form to reuse in this form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2634] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2A3647]">
          {/* Source Form Picker */}
          <div className="p-4 space-y-3 bg-[#121820] overflow-y-auto">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Select Source Form
            </div>
            <div className="space-y-1.5">
              {availableForms.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedFormId(f.id);
                    setSelectedQuestionIds([]);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    selectedFormId === f.id
                      ? 'bg-[#2563EB]/20 border-[#2563EB] text-white shadow-xs'
                      : 'bg-[#161D27] border-[#2A3647] text-slate-300 hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{f.title || 'Untitled Form'}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {f.questions?.length || 0} questions
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Questions Selector */}
          <div className="p-4 md:col-span-2 flex flex-col gap-3 overflow-hidden">
            {/* Search & Bulk Select */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter questions..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#121820] border border-[#2A3647] focus:border-[#38BDF8] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              {questionsToDisplay.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {selectedQuestionIds.length === questionsToDisplay.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {questionsToDisplay.map((q) => {
                const isChecked = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-[#2563EB]/15 border-[#2563EB] shadow-xs'
                        : 'bg-[#121820] border-[#2A3647] hover:border-slate-500'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{q.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A2332] text-slate-400 border border-[#2A3647]">
                          {q.type.replace('_', ' ')}
                        </span>
                        {q.required && (
                          <span className="text-[10px] text-rose-400 font-mono">Required</span>
                        )}
                        {q.imageUrl && (
                          <span className="text-[10px] text-emerald-400 font-mono">Has Image</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {questionsToDisplay.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No questions found in this form.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A3647] bg-[#121820] flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Selected: <span className="text-white font-bold">{selectedQuestionIds.length}</span> questions
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#242F42] border border-[#2A3647] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedQuestionIds.length === 0}
              onClick={handleImport}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-neo transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Import ({selectedQuestionIds.length}) Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
