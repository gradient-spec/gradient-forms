import React from 'react';
import { Form, Question, QuestionType } from '../../types';
import { QuestionCard } from './QuestionCard';
import { Plus } from 'lucide-react';
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
  onAddQuestion: (type: QuestionType, afterIndex?: number) => void;
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

  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-3xl mx-auto w-full space-y-5 bg-[#0B0F14] bg-grid-neo">
      {/* Form Header Card */}
      <div className="p-6 rounded-xl bg-[#1A2332] border border-[#2A3647] shadow-neo space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563EB]" />

        <input
          type="text"
          value={form.title}
          onChange={(e) => onUpdateForm({ title: e.target.value })}
          placeholder="Form Title..."
          className="w-full bg-transparent text-2xl font-bold font-heading text-white border-b border-transparent focus:border-[#2563EB] focus:outline-none pb-1 transition-colors"
        />

        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => onUpdateForm({ description: e.target.value })}
          placeholder="Form description or instructions for respondents..."
          className="w-full bg-transparent text-xs text-slate-400 border-b border-transparent focus:border-[#2A3647] focus:outline-none resize-none"
        />
      </div>

      {/* Questions Sortable Canvas */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={form.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {form.questions.map((question, idx) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={idx}
                totalQuestions={form.questions.length}
                isSelected={selectedQuestionId === question.id}
                isQuizMode={form.settings.quizMode}
                commentCount={commentsCountMap[question.id] || 0}
                onSelect={() => onSelectQuestion(question.id)}
                onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                onDelete={() => onDeleteQuestion(question.id)}
                onDuplicate={() => onDuplicateQuestion(question.id)}
                onOpenComments={() => onOpenComments(question.id)}
                onMoveUp={() => handleMoveQuestion(idx, idx - 1)}
                onMoveDown={() => handleMoveQuestion(idx, idx + 1)}
                onAddNextQuestion={() => onAddQuestion('short_answer', idx)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Question Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => onAddQuestion('short_answer')}
          className="px-5 py-2.5 rounded-xl border border-dashed border-[#2A3647] hover:border-[#2563EB] hover:bg-[#2563EB]/10 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Add Question to Canvas</span>
        </button>
      </div>
    </main>
  );
};
