import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuestionPalette } from './QuestionPalette';
import { FormCanvas } from './FormCanvas';
import { QuestionProperties } from './QuestionProperties';
import { ThemeCustomizer } from './ThemeCustomizer';
import { FormSettingsModal } from './FormSettingsModal';
import { LogicBuilder } from './LogicBuilder';
import { CommentDrawer } from './CommentDrawer';
import { ShareModal } from '../export/ShareModal';
import {
  Palette,
  Settings,
  GitBranch,
  Eye,
  Share2,
  ArrowLeft
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
    publishFormToggle,
    comments
  } = useApp();

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
      <div className="h-12 border-b border-[#2A3647] bg-[#121820] px-4 flex items-center justify-between z-20">
        {/* Left Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-1 rounded hover:bg-[#1A2332] text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-3.5 w-px bg-[#2A3647]" />

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-heading font-bold text-white truncate max-w-[180px]">{activeForm.title}</span>
            <span className="text-[10px] text-[#38BDF8] font-mono">Saved local ✓</span>
          </div>
        </div>

        {/* Center Toolbar Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsThemeOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-200 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Theme OS</span>
          </button>

          <button
            onClick={() => setIsLogicOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-200 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Logic Rules</span>
            {activeForm.logicRules.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#2563EB]/30 text-[#38BDF8] text-[10px] font-mono font-bold">
                {activeForm.logicRules.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs text-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('preview')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#84A1C0]" />
            <span>Share & QR</span>
          </button>

          <button
            onClick={() => publishFormToggle(activeForm.id)}
            className={`px-3.5 py-1 rounded text-xs font-bold transition-all ${
              activeForm.isPublished
                ? 'bg-[#38BDF8] text-slate-950 font-extrabold'
                : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
            }`}
          >
            {activeForm.isPublished ? 'Live ✓' : 'Publish'}
          </button>
        </div>
      </div>

      {/* 3-Column Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <QuestionPalette
          onAddQuestion={(type) => addQuestion(activeForm.id, 'sec-main', type)}
        />

        <FormCanvas
          form={activeForm}
          selectedQuestionId={selectedQuestionId}
          commentsCountMap={commentsCountMap}
          onSelectQuestion={(id) => setSelectedQuestionId(id)}
          onUpdateForm={(updates) => updateForm(activeForm.id, updates)}
          onUpdateQuestion={(qId, updates) => updateQuestion(activeForm.id, qId, updates)}
          onDeleteQuestion={(qId) => deleteQuestion(activeForm.id, qId)}
          onDuplicateQuestion={(qId) => duplicateQuestion(activeForm.id, qId)}
          onAddQuestion={(type, afterIndex) => addQuestion(activeForm.id, 'sec-main', type, afterIndex)}
          onOpenComments={(qId) => setActiveCommentQuestionId(qId)}
        />

        <QuestionProperties
          question={selectedQuestion}
          isQuizMode={activeForm.settings.quizMode}
          onUpdate={(updates) => selectedQuestionId && updateQuestion(activeForm.id, selectedQuestionId, updates)}
          onClose={() => setSelectedQuestionId(null)}
        />
      </div>

      {/* Drawers & Modals */}
      <ThemeCustomizer
        isOpen={isThemeOpen}
        activeTheme={activeForm.theme}
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
        questions={activeForm.questions}
        logicRules={activeForm.logicRules}
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
