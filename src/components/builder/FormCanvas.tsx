import React, { useState } from 'react';
import { Form, Question, QuestionType } from '../../types';
import { QuestionCard } from './QuestionCard';
import { Plus, Save, Layers, ChevronUp, ChevronDown, Copy, Trash2, Mail, FileCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleFormsFloatingToolbar } from './GoogleFormsFloatingToolbar';
import { MediaAttachmentModal } from './MediaAttachmentModal';
import { ImportQuestionsModal } from './ImportQuestionsModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

interface FormCanvasProps {
  form: Form;
  selectedQuestionId: string | null;
  commentsCountMap: Record<string, number>;
  onSelectQuestion: (id: string) => void;
  onUpdateForm: (updates: Partial<Form>) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onAddQuestion: (type: QuestionType, sectionId?: string, afterIndex?: number) => void;
  onOpenComments: (questionId: string) => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  form,
  selectedQuestionId,
  commentsCountMap,
  onSelectQuestion,
  onUpdateForm,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onAddQuestion,
  onOpenComments
}) => {
  const {
    forms,
    setActiveView,
    showToast,
    addSection,
    updateSection,
    deleteSection,
    duplicateSection,
    reorderSections,
    moveQuestionToSection
  } = useApp();

  const [formattingQuestionId, setFormattingQuestionId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    type: 'image' | 'video';
    questionId: string | null;
    initialUrl?: string;
    initialCaption?: string;
  }>({
    isOpen: false,
    type: 'image',
    questionId: null
  });

  const sections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];

  const effectiveSelectedId = selectedQuestionId || form.questions[0]?.id;
  const activeQuestion = form.questions.find(q => q.id === effectiveSelectedId) || form.questions[0];

  const handleSaveAndExit = () => {
    onUpdateForm({ updatedAt: new Date().toISOString() });
    showToast('Form Saved 💾', `"${form.title || 'Untitled Form'}" saved. Redirecting to Forms Panel...`, 'success');
    setActiveView('dashboard');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = form.questions.findIndex(q => q.id === active.id);
      const newIndex = form.questions.findIndex(q => q.id === over.id);
      const newQuestions = arrayMove(form.questions, oldIndex, newIndex);
      onUpdateForm({ questions: newQuestions });
    }
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.questions.length) return;
    const newQuestions = arrayMove(form.questions, fromIndex, toIndex);
    onUpdateForm({ questions: newQuestions });
  };

  const handleOpenMediaModal = (type: 'image' | 'video', questionId?: string) => {
    const targetQId = questionId || activeQuestion?.id;
    if (!targetQId) {
      showToast('Select a Question', 'Please click on a question to attach media.', 'info');
      return;
    }
    const targetQ = form.questions.find(q => q.id === targetQId);
    setMediaModal({
      isOpen: true,
      type,
      questionId: targetQId,
      initialUrl: type === 'image' ? targetQ?.imageUrl : targetQ?.videoUrl,
      initialCaption: type === 'image' ? targetQ?.imageCaption : targetQ?.videoCaption
    });
  };

  const handleSaveMedia = (url: string, caption?: string) => {
    if (!mediaModal.questionId) return;
    if (mediaModal.type === 'image') {
      onUpdateQuestion(mediaModal.questionId, {
        imageUrl: url,
        imageCaption: caption
      });
      showToast('Image Attached 🖼️', 'Question image updated.', 'success');
    } else {
      onUpdateQuestion(mediaModal.questionId, {
        videoUrl: url,
        videoCaption: caption
      });
      showToast('Video Embedded ▶️', 'Question video updated.', 'success');
    }
  };

  const handleRemoveMedia = () => {
    if (!mediaModal.questionId) return;
    if (mediaModal.type === 'image') {
      onUpdateQuestion(mediaModal.questionId, {
        imageUrl: undefined,
        imageCaption: undefined
      });
      showToast('Image Removed', 'Attached image removed.', 'info');
    } else {
      onUpdateQuestion(mediaModal.questionId, {
        videoUrl: undefined,
        videoCaption: undefined
      });
      showToast('Video Removed', 'Attached video removed.', 'info');
    }
  };

  const handleImportQuestions = (imported: Question[]) => {
    onUpdateForm({
      questions: [...form.questions, ...imported]
    });
    showToast('Questions Imported 📥', `Added ${imported.length} questions to form.`, 'success');
  };

  return (
    <main className="flex-1 w-full h-full overflow-y-auto bg-[#0B0F14] bg-grid-neo p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-6 relative">
        {/* Form Header Card */}
        <div className="p-6 rounded-xl bg-[#1A2332] border border-[#2A3647] shadow-neo space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563EB]" />

        <input
          type="text"
          value={form.title ?? ''}
          onFocus={(e) => {
            if (form.title === 'Untitled Form') {
              e.target.select();
            }
          }}
          onChange={(e) => onUpdateForm({ title: e.target.value })}
          placeholder="Form Title..."
          className="w-full bg-transparent text-2xl font-bold font-heading text-white border-b border-transparent focus:border-[#2563EB] focus:outline-none pb-1 transition-colors"
        />

        <textarea
          rows={2}
          value={form.description ?? ''}
          onChange={(e) => onUpdateForm({ description: e.target.value })}
          placeholder="Add a description to guide respondents..."
          className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-500 border-b border-transparent focus:border-[#2A3647] focus:outline-none resize-none"
        />
      </div>

        {/* Google Forms Dedicated Email Collection Banner Card */}
        {form.settings.collectEmail ? (
          <div className="p-4 rounded-xl bg-[#161E2B] border border-[#2B3B52] shadow-sm space-y-2.5 relative transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 font-heading">
                  <Mail className="w-4 h-4 text-[#38BDF8]" />
                  <span>Email</span>
                  <span className="text-rose-400 font-bold text-sm ml-0.5">*</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-[#121820] border border-[#2A3647]">
                  Valid email address
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateForm({
                      settings: {
                        ...form.settings,
                        collectEmail: false
                      }
                    });
                    showToast('Email Collection Disabled', 'Form will not collect email addresses.', 'info');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Do not collect
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This form is collecting email addresses. Responders will be required to provide a valid email before submitting.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-[#2A3647]/60">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Mode:</span>
                <select
                  value={form.settings.emailCollectionMode || 'responder_input'}
                  onChange={(e) => {
                    onUpdateForm({
                      settings: {
                        ...form.settings,
                        emailCollectionMode: e.target.value as 'responder_input' | 'verified'
                      }
                    });
                    showToast('Mode Updated', `Set to ${e.target.value === 'verified' ? 'Verified Account' : 'Responder Input'}.`, 'success');
                  }}
                  className="bg-[#121820] text-xs text-[#38BDF8] border border-[#2A3647] rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="responder_input">Responder input (Manual)</option>
                  <option value="verified">Verified (Account Verified)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Response Receipt:</span>
                <select
                  value={form.settings.sendResponseCopy || 'when_requested'}
                  onChange={(e) => {
                    onUpdateForm({
                      settings: {
                        ...form.settings,
                        sendResponseCopy: e.target.value as 'off' | 'when_requested' | 'always'
                      }
                    });
                  }}
                  className="bg-[#121820] text-xs text-white border border-[#2A3647] rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="when_requested">When requested</option>
                  <option value="always">Always</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#161E2B]/60 border border-dashed border-[#2A3647] flex items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Email collection is turned off for this form.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateForm({
                  settings: {
                    ...form.settings,
                    collectEmail: true
                  }
                });
                showToast('Email Collection Enabled', 'Form will collect respondent email addresses.', 'success');
              }}
              className="text-xs font-semibold text-[#38BDF8] hover:text-white px-3 py-1.5 rounded-lg bg-[#2563EB]/20 hover:bg-[#2563EB]/40 border border-[#2563EB]/40 transition-colors cursor-pointer"
            >
              + Collect Email Addresses
            </button>
          </div>
        )}

      {/* Sections & Questions */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={form.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
            {sections.map((section, sIdx) => {
              const sectionQuestions = form.questions.filter(q => q.sectionId === section.id);

              return (
                <div key={section.id} className="space-y-3.5">
                  {/* Distinct Section Header Card */}
                  <div className="p-5 rounded-2xl bg-[#161D27] border-2 border-[#2A3647] hover:border-[#38BDF8]/40 shadow-neo space-y-3 relative overflow-hidden transition-all duration-200">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                    {/* Section Controls Bar */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#38BDF8] text-[11px] font-mono font-bold">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span>SECTION {sIdx + 1} OF {sections.length}</span>
                          <span className="text-slate-400 font-normal">• PAGE {sIdx + 1}</span>
                        </span>
                        {sections.length > 1 && (
                          <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                            {sectionQuestions.length} {sectionQuestions.length === 1 ? 'question' : 'questions'}
                          </span>
                        )}
                      </div>

                      {/* Section Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => reorderSections(form.id, sIdx, sIdx - 1)}
                          className="p-1.5 rounded-lg bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-white border border-[#2A3647] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move Section Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={sIdx === sections.length - 1}
                          onClick={() => reorderSections(form.id, sIdx, sIdx + 1)}
                          className="p-1.5 rounded-lg bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-white border border-[#2A3647] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move Section Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicateSection(form.id, section.id)}
                          className="p-1.5 rounded-lg bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-white border border-[#2A3647] cursor-pointer transition-colors"
                          title="Duplicate Section & Questions"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#38BDF8]" />
                        </button>

                        <button
                          type="button"
                          disabled={sections.length <= 1}
                          onClick={() => deleteSection(form.id, section.id)}
                          className="p-1.5 rounded-lg bg-[#121820] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-[#2A3647] hover:border-rose-500/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title={sections.length <= 1 ? "Cannot delete the only section" : "Delete Section"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Title */}
                    <input
                      type="text"
                      value={section.title}
                      onFocus={(e) => {
                        if (section.title === 'Main Section' || section.title.startsWith('Section ')) {
                          e.target.select();
                        }
                      }}
                      onChange={(e) => updateSection(form.id, section.id, { title: e.target.value })}
                      placeholder="Section Title (e.g. Personal Info, Academic Background)..."
                      className="w-full bg-transparent text-lg sm:text-xl font-bold font-heading text-white border-b border-[#2A3647] focus:border-[#38BDF8] focus:outline-none pb-1 transition-colors"
                    />

                    {/* Section Description */}
                    <textarea
                      rows={2}
                      value={section.description || ''}
                      onChange={(e) => updateSection(form.id, section.id, { description: e.target.value })}
                      placeholder="Section instructions or description for respondents (optional)..."
                      className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-500 border-b border-transparent focus:border-[#2A3647] focus:outline-none resize-none"
                    />
                  </div>

                  {/* Questions in Section */}
                  <div className="space-y-3 pl-1 sm:pl-2 border-l-2 border-[#2A3647]/50">
                    {sectionQuestions.map((question) => {
                      const globalIdx = form.questions.findIndex(q => q.id === question.id);
                      return (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          index={globalIdx}
                          totalQuestions={form.questions.length}
                          isSelected={selectedQuestionId === question.id}
                          isQuizMode={form.settings.quizMode}
                          commentCount={commentsCountMap[question.id] || 0}
                          onSelect={() => onSelectQuestion(question.id)}
                          onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                          onDelete={() => onDeleteQuestion(question.id)}
                          onDuplicate={() => onDuplicateQuestion(question.id)}
                          onOpenComments={() => onOpenComments(question.id)}
                          onMoveUp={() => handleMoveQuestion(globalIdx, globalIdx - 1)}
                          onMoveDown={() => handleMoveQuestion(globalIdx, globalIdx + 1)}
                          onAddNextQuestion={() => onAddQuestion('short_answer', section.id, globalIdx)}
                          sections={sections}
                          onMoveToSection={(targetSecId) => moveQuestionToSection(form.id, question.id, targetSecId)}
                          onOpenMediaModal={(type) => handleOpenMediaModal(type, question.id)}
                          isFormattingActive={formattingQuestionId === question.id}
                          onToggleFormatting={() => setFormattingQuestionId(prev => prev === question.id ? null : question.id)}
                          onImportQuestions={() => setIsImportModalOpen(true)}
                          onAddSection={() => addSection(form.id)}
                        />
                      );
                    })}

                    {sectionQuestions.length === 0 && (
                      <div className="p-6 rounded-xl border border-dashed border-[#2A3647] text-center text-slate-500 text-xs py-8">
                        No questions in this section yet.
                      </div>
                    )}

                    {/* Quick Add Question to this specific section */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onAddQuestion('short_answer', section.id)}
                        className="w-full py-2 px-3 rounded-xl border border-dashed border-[#2A3647] hover:border-[#38BDF8]/50 hover:bg-[#38BDF8]/5 text-slate-400 hover:text-[#38BDF8] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question to Section {sIdx + 1}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Toggable Agreement / Terms Checkbox Card */}
      <div className="mt-4 p-4 rounded-xl bg-[#161E2B] border border-[#2B3B52] shadow-sm space-y-3 relative transition-all">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-bold text-white font-heading">
              Terms &amp; Data Sharing Agreement
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              form.settings.requireAgreement
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-bold'
                : 'bg-[#121820] text-slate-400 border-[#2A3647]'
            }`}>
              {form.settings.requireAgreement ? 'Enabled & Required' : 'Disabled (Optional)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const updated = !form.settings.requireAgreement;
              onUpdateForm({
                settings: {
                  ...form.settings,
                  requireAgreement: updated,
                  agreementText: form.settings.agreementText || 'By submitting this form, you agree to share the information provided for official purposes.'
                }
              });
              showToast(
                updated ? 'Agreement Enabled 📋' : 'Agreement Disabled',
                updated ? 'Respondents must accept the agreement box before submitting.' : 'Agreement checkbox removed from this form.',
                'info'
              );
            }}
            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              form.settings.requireAgreement
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {form.settings.requireAgreement ? 'Disable Agreement' : '+ Enable Agreement for this Form'}
          </button>
        </div>

        {form.settings.requireAgreement ? (
          <div className="space-y-2 pt-1 animate-fadeIn">
            <p className="text-xs text-slate-400">
              Responders will be required to check this consent statement before submitting:
            </p>
            <textarea
              rows={2}
              value={form.settings.agreementText || ''}
              onChange={(e) => {
                onUpdateForm({
                  settings: {
                    ...form.settings,
                    agreementText: e.target.value
                  }
                });
              }}
              placeholder="Enter custom agreement statement text..."
              className="w-full p-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Click "+ Enable Agreement for this Form" to require respondents to accept terms or data-sharing policies before submitting.
          </p>
        )}
      </div>

      {/* Bottom Actions Row: Add Question, Add Section & Save */}
      <div className="pt-6 pb-28 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onAddQuestion('short_answer', sections[sections.length - 1].id)}
          className="px-4 py-2.5 rounded-xl border border-[#2A3647] hover:border-[#2563EB] bg-[#161D27] hover:bg-[#2563EB]/10 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer group shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#38BDF8] group-hover:scale-110 transition-transform" />
          <span>Add Question to Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => addSection(form.id)}
          className="px-4 py-2.5 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer group shadow-xs"
        >
          <Layers className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>+ Add New Section / Page</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndExit}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-neo hover:shadow-[0_0_16px_rgba(37,99,235,0.4)]"
          title="Save all changes and return to Forms workspace"
        >
          <Save className="w-4 h-4 text-cyan-300" />
          <span>Save</span>
        </button>
      </div>
    </div>

      {/* Media Attachment Modal (Upload/Paste Image or YouTube Video) */}
      <MediaAttachmentModal
        isOpen={mediaModal.isOpen}
        onClose={() => setMediaModal({ ...mediaModal, isOpen: false })}
        mediaType={mediaModal.type}
        initialUrl={mediaModal.initialUrl}
        initialCaption={mediaModal.initialCaption}
        onSave={handleSaveMedia}
        onRemove={handleRemoveMedia}
      />

      {/* Import Questions Modal (Select & clone questions from other forms) */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        availableForms={forms}
        currentFormId={form.id}
        targetSectionId={activeQuestion?.sectionId || sections[0].id}
        onImportQuestions={handleImportQuestions}
      />
    </main>
  );
};

