import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FormCanvas } from './FormCanvas';
import { ThemeCustomizer } from './ThemeCustomizer';
import { FormSettingsModal } from './FormSettingsModal';
import { LogicBuilder } from './LogicBuilder';
import { CommentDrawer } from './CommentDrawer';
import { ShareModal } from '../export/ShareModal';
import { PRESET_THEMES } from '../../data/presetThemes';
import {
  Palette,
  Settings,
  GitBranch,
  Eye,
  Share2,
  ArrowLeft,
  Save,
  Check,
  MessageCircle,
  Layers
} from 'lucide-react';

export const FormBuilder: React.FC = () => {
  const {
    activeForm,
    setActiveView,
    updateForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    addSection,
    publishFormToggle,
    comments,
    showToast
  } = useApp();

  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    activeForm?.questions[0]?.id || null
  );

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeCommentQuestionId, setActiveCommentQuestionId] = useState<string | null>(null);

  if (!activeForm) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No active form selected.</p>
        <button onClick={() => setActiveView('dashboard')} className="mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const selectedQuestion = activeForm.questions.find(q => q.id === selectedQuestionId);

  // Map comment counts per question
  const commentsCountMap: Record<string, number> = {};
  comments.filter(c => c.formId === activeForm.id && !c.resolved).forEach(c => {
    commentsCountMap[c.questionId] = (commentsCountMap[c.questionId] || 0) + 1;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0B0F14] overflow-hidden">
      {/* Builder Sub-header Toolbar */}
      <div className="min-h-12 border-b border-[#2A3647] bg-[#121820] px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar z-20 shrink-0">
        {/* Left Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-300 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 group cursor-pointer"
            title="Back to Forms Workspace"
          >
            <ArrowLeft className="w-4 h-4 text-[#38BDF8] group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Forms</span>
          </button>

          <div className="h-4 w-px bg-[#2A3647]" />

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-heading font-bold text-white truncate max-w-[120px] sm:max-w-[200px] text-xs sm:text-sm">
              {activeForm.title}
            </span>
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-[10px] font-mono font-medium shadow-xs"
              title="Real-time auto-save active. Stored locally in browser localStorage under 'gradient_forms_v1_forms'."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Saved ✓</span>
            </div>
          </div>
        </div>

        {/* Center Toolbar Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsThemeOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-200 transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs">Theme</span>
          </button>

          <button
            onClick={() => setIsLogicOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-200 transition-colors cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs">Logic</span>
            {(activeForm.logicRules?.length ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#2563EB]/30 text-[#38BDF8] text-[10px] font-mono font-bold">
                {activeForm.logicRules?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-200 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs">Settings</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-emerald-500/40 hover:border-emerald-400 text-xs text-emerald-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title="Configure WhatsApp & Community Links shown after submission"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold">Community Link</span>
          </button>

          <button
            onClick={() => addSection(activeForm.id)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-cyan-500/40 hover:border-cyan-400 text-xs text-cyan-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title="Create a new section / page in this form"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold">+ Section</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setActiveView('preview')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline text-xs">Preview</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#84A1C0]" />
            <span className="hidden sm:inline text-xs">Share</span>
          </button>

          {/* Manual Save Form Button */}
          <button
            onClick={() => {
              updateForm(activeForm.id, { updatedAt: new Date().toISOString() });
              setIsSavedRecently(true);
              showToast('Form Saved 💾', `"${activeForm.title}" is saved and stored safely in your workspace.`, 'success');
              setTimeout(() => setIsSavedRecently(false), 2500);
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isSavedRecently
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#1A2332] hover:bg-[#222C3D] border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-200 hover:text-white'
            }`}
            title="Save form changes to workspace"
          >
            {isSavedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">Saved ✓</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="text-xs">Save</span>
              </>
            )}
          </button>

          <button
            onClick={() => publishFormToggle(activeForm.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeForm.isPublished
                ? 'bg-[#38BDF8] text-slate-950 font-extrabold'
                : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
            }`}
          >
            {activeForm.isPublished ? 'Live ✓' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Main Form Canvas Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <FormCanvas
          form={activeForm}
          selectedQuestionId={selectedQuestionId}
          commentsCountMap={commentsCountMap}
          onSelectQuestion={(id) => setSelectedQuestionId(id)}
          onUpdateForm={(updates) => updateForm(activeForm.id, updates)}
          onUpdateQuestion={(qId, updates) => updateQuestion(activeForm.id, qId, updates)}
          onDeleteQuestion={(qId) => deleteQuestion(activeForm.id, qId)}
          onDuplicateQuestion={(qId) => duplicateQuestion(activeForm.id, qId)}
          onAddQuestion={(type, sectionId, afterIndex) => addQuestion(activeForm.id, sectionId || activeForm.sections?.[0]?.id || 'sec-main', type, afterIndex)}
          onOpenComments={(qId) => setActiveCommentQuestionId(qId)}
        />
      </div>

      {/* Drawers & Modals */}
      <ThemeCustomizer
        isOpen={isThemeOpen}
        activeTheme={activeForm.theme || PRESET_THEMES[0]}
        onSelectTheme={(newTheme) => updateForm(activeForm.id, { theme: newTheme })}
        onClose={() => setIsThemeOpen(false)}
      />

      <FormSettingsModal
        isOpen={isSettingsOpen}
        settings={activeForm.settings}
        onUpdateSettings={(newSettings) => updateForm(activeForm.id, { settings: newSettings })}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LogicBuilder
        isOpen={isLogicOpen}
        questions={activeForm.questions || []}
        logicRules={activeForm.logicRules || []}
        onUpdateLogicRules={(rules) => updateForm(activeForm.id, { logicRules: rules })}
        onClose={() => setIsLogicOpen(false)}
      />

      <CommentDrawer
        isOpen={!!activeCommentQuestionId}
        formId={activeForm.id}
        questionId={activeCommentQuestionId}
        questionTitle={selectedQuestion?.title}
        onClose={() => setActiveCommentQuestionId(null)}
      />

      {isShareOpen && (
        <ShareModal formId={activeForm.id} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  );
};
