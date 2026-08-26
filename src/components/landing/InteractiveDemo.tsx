import React, { useState } from 'react';
import { Plus, Trash2, Eye, Star, Type, Check, Sliders } from 'lucide-react';
import { QuestionType } from '../../types';
import { PRESET_THEMES } from '../../data/presetThemes';
import { useApp } from '../../context/AppContext';

export const InteractiveDemo: React.FC = () => {
  const { setActiveView, createBlankForm } = useApp();
  const [demoTitle, setDemoTitle] = useState('Customer Experience & Feedback Evaluation');
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [questions, setQuestions] = useState([
    { id: '1', title: 'What is your primary engineering objective?', type: 'multiple_choice' as QuestionType, required: true },
    { id: '2', title: 'Rate the quality of visual workflow interface:', type: 'rating' as QuestionType, required: true },
    { id: '3', title: 'Specific architecture feedback or feature requests:', type: 'paragraph' as QuestionType, required: false }
  ]);
  const [isPreview, setIsPreview] = useState(false);

  const theme = PRESET_THEMES[selectedThemeIndex];

  const handleAddDemoQuestion = () => {
    const newQ = {
      id: String(Date.now()),
      title: 'New Demo Question ' + (questions.length + 1),
      type: 'short_answer' as QuestionType,
      required: false
    };
    setQuestions([...questions, newQ]);
  };

  const handleTypeChange = (id: string, type: QuestionType) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, type } : q));
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#2A3647]">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-[#84A1C0]">
          SECTION 02 — LIVE WORKSPACE DEMONSTRATION
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
          Interactive Builder Workspace
        </h2>
        <p className="text-slate-400 text-sm">
          Test editing question titles, picking theme presets, and toggling live respondent preview below.
        </p>
      </div>

      {/* Embedded Mini Builder Card */}
      <div className="bg-[#121820] border border-[#2A3647] rounded-2xl shadow-neo overflow-hidden">
        {/* Builder Toolbar */}
        <div className="p-4 border-b border-[#2A3647] bg-[#0B0F14]/90 flex flex-wrap items-center justify-between gap-4">
          <input
            type="text"
            value={demoTitle}
            onChange={(e) => setDemoTitle(e.target.value)}
            className="bg-transparent text-base font-bold font-heading text-white border-b border-transparent hover:border-[#2A3647] focus:border-[#2563EB] focus:outline-none px-2 py-1 transition-colors"
          />

          <div className="flex items-center gap-3">
            {/* Theme Color Selector */}
            <div className="flex items-center gap-1.5 bg-[#1A2332] p-1 rounded-lg border border-[#2A3647]">
              {PRESET_THEMES.slice(0, 4).map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThemeIndex(idx)}
                  className={`w-5 h-5 rounded transition-transform ${selectedThemeIndex === idx ? 'scale-110 ring-2 ring-[#2563EB]' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: t.primaryColor }}
                  title={t.name}
                />
              ))}
            </div>

            {/* Preview Toggle Button */}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isPreview
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#1A2332] hover:bg-[#222C3D] border-[#2A3647] text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreview ? 'Back to Editor' : 'Respondent Preview'}</span>
            </button>

            <button
              onClick={() => { createBlankForm(); setActiveView('builder'); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs transition-colors"
            >
              <span>Open Full OS Builder</span>
            </button>
          </div>
        </div>

        {/* Demo Canvas Body */}
        <div className="p-6 md:p-10 min-h-[380px] bg-grid-neo relative">
          {isPreview ? (
            /* Live Form Answering Preview */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-xl bg-[#1A2332] border border-[#2A3647]" style={{ borderColor: theme.primaryColor }}>
                <h3 className="text-xl font-bold font-heading text-white">{demoTitle}</h3>
                <p className="text-xs text-[#84A1C0] mt-1 font-mono">Live respondent preview mode.</p>
              </div>

              {questions.map((q, i) => (
                <div key={q.id} className="p-5 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-3">
                  <label className="block text-xs font-bold text-white">
                    {i + 1}. {q.title} {q.required && <span className="text-[#2563EB]">*</span>}
                  </label>

                  {q.type === 'short_answer' && (
                    <input type="text" placeholder="Type answer here..." className="w-full px-3.5 py-2 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB]" />
                  )}

                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {['Option A: Excellent', 'Option B: Satisfactory', 'Option C: Needs Improvement'].map((opt, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#121820] cursor-pointer border border-[#2A3647] text-xs text-slate-200">
                          <input type="radio" name={`demo-${q.id}`} className="accent-[#2563EB]" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="p-1.5 rounded-lg bg-[#121820] text-yellow-500 hover:scale-105 transition-transform">
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'paragraph' && (
                    <textarea rows={3} placeholder="Share feedback..." className="w-full px-3.5 py-2 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB] resize-none" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Builder Canvas View */
            <div className="max-w-2xl mx-auto space-y-4">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] hover:border-[#2563EB]/60 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-5 h-5 rounded bg-[#121820] text-[#84A1C0] font-mono text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={q.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions(questions.map(item => item.id === q.id ? { ...item, title: val } : item));
                        }}
                        className="w-full bg-transparent text-xs font-semibold text-white border-b border-transparent focus:border-[#2563EB] focus:outline-none py-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={q.type}
                        onChange={(e) => handleTypeChange(q.id, e.target.value as QuestionType)}
                        className="bg-[#121820] border border-[#2A3647] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="short_answer">Short Answer</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="rating">Rating</option>
                        <option value="paragraph">Paragraph</option>
                      </select>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddDemoQuestion}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#2A3647] hover:border-[#2563EB] hover:bg-[#2563EB]/10 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Add Question to Demo Canvas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
