import React, { useState } from 'react';
import { Form, Question } from '../../types';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Award, Star, ArrowRight, RefreshCw, Upload, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublishedFormViewProps {
  form: Form;
  isPreview?: boolean;
}

export const PublishedFormView: React.FC<PublishedFormViewProps> = ({ form, isPreview = false }) => {
  const { submitResponse } = useApp();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [quizScore, setQuizScore] = useState<{ score: number; max: number } | null>(null);

  const sections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];

  const currentSection = sections[currentSectionIndex];

  const isQuestionVisible = (q: Question): boolean => {
    if (!form.logicRules || form.logicRules.length === 0) return true;

    for (const rule of form.logicRules) {
      if (rule.targetQuestionId === q.id) {
        const sourceAnswer = answers[rule.sourceQuestionId];
        if (rule.operator === 'equals' && sourceAnswer !== rule.value) {
          if (rule.action === 'show') return false;
        }
      }
    }
    return true;
  };

  const currentQuestions = form.questions.filter(
    q => (q.sectionId === currentSection.id || !q.sectionId) && isQuestionVisible(q)
  );

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    if (form.settings.quizMode) {
      let score = 0;
      let maxScore = 0;
      form.questions.forEach(q => {
        if (q.points && q.correctAnswer) {
          maxScore += q.points;
          if (answers[q.id] === q.correctAnswer) {
            score += q.points;
          }
        }
      });
      setQuizScore({ score, max: maxScore });
    }

    submitResponse(
      form.id,
      answers,
      timeSpent,
      answers['q-email'] || answers['email'],
      answers['q-name'] || answers['name']
    );

    setIsSubmitted(true);

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  if (isSubmitted) {
    return (
      <div className="p-8 md:p-12 max-w-xl mx-auto text-center space-y-6 py-16">
        <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-neo">
          <CheckCircle2 className="w-8 h-8 text-[#38BDF8]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">Submission Confirmed</h2>
          <p className="text-slate-400 text-xs sm:text-sm">{form.settings.confirmationMessage}</p>
        </div>

        {form.settings.quizMode && quizScore && (
          <div className="p-5 rounded-xl bg-[#1A2332] border border-amber-500/40 space-y-2 max-w-xs mx-auto">
            <Award className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Quiz Score Result</div>
            <div className="text-2xl font-bold font-mono text-white">
              {quizScore.score} / {quizScore.max} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
          </div>
        )}

        <button
          onClick={() => { setIsSubmitted(false); setAnswers({}); setCurrentSectionIndex(0); }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-white text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#84A1C0]" />
          <span>Submit Another Response</span>
        </button>
      </div>
    );
  }

  const progressPercent = sections.length > 1 ? ((currentSectionIndex + 1) / sections.length) * 100 : 100;

  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto space-y-8 min-h-[550px] flex flex-col justify-between" style={{ fontFamily: form.theme.fontFamily }}>
      {/* Header */}
      <div className="space-y-4">
        {form.settings.showProgressBar && sections.length > 1 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-[#84A1C0]">
              <span>Section {currentSectionIndex + 1} of {sections.length}</span>
              <span>{Math.round(progressPercent)}% Completed</span>
            </div>
            <div className="h-1 w-full bg-[#1A2332] rounded-full overflow-hidden">
              <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="p-6 rounded-xl bg-[#1A2332] border border-[#2A3647] shadow-neo space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">{form.title}</h1>
          {form.description && <p className="text-xs text-slate-400 leading-relaxed">{form.description}</p>}
        </div>
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {currentQuestions.map((q, idx) => (
          <div key={q.id} className="p-5 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <label className="block text-xs font-bold text-white leading-snug">
                {idx + 1}. {q.title} {q.required && <span className="text-[#2563EB]">*</span>}
                {(q.maxSelections || q.validation?.maxSelections) ? (
                  <span className="text-[11px] text-[#38BDF8] font-normal ml-2 font-mono">
                    (Select up to {q.maxSelections || q.validation?.maxSelections} {(q.maxSelections || q.validation?.maxSelections) === 1 ? 'option' : 'options'})
                  </span>
                ) : null}
              </label>
            </div>

            {q.description && <p className="text-[11px] text-[#84A1C0]">{q.description}</p>}

            {/* Inputs */}
            {['short_answer', 'email', 'phone', 'url', 'number'].includes(q.type) && (
              <input
                type={q.type === 'email' ? 'email' : q.type === 'number' ? 'number' : 'text'}
                required={q.required}
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder={q.placeholder || 'Type your answer...'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB]"
              />
            )}

            {q.type === 'paragraph' && (
              <textarea
                required={q.required}
                rows={3}
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder={q.placeholder || 'Type detailed response...'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB] resize-none"
              />
            )}

            {q.type === 'multiple_choice' && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                      answers[q.id] === opt.id
                        ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-semibold'
                        : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      required={q.required}
                      checked={answers[q.id] === opt.id}
                      onChange={() => handleAnswerChange(q.id, opt.id)}
                      className="accent-[#2563EB]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'checkboxes' && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => {
                  const currentArr: string[] = answers[q.id] || [];
                  const isChecked = currentArr.includes(opt.id);
                  const maxLimit = q.maxSelections || q.validation?.maxSelections;

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-semibold'
                          : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked && maxLimit && currentArr.length >= maxLimit) {
                            return;
                          }
                          const updated = e.target.checked
                            ? [...currentArr, opt.id]
                            : currentArr.filter(id => id !== opt.id);
                          handleAnswerChange(q.id, updated);
                        }}
                        className="accent-[#2563EB]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'dropdown' && (
              <select
                required={q.required}
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">-- Select Option --</option>
                {(q.options || []).map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            )}

            {q.type === 'scale' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#84A1C0] font-mono">
                  <span>{q.scaleMinLabel || 'Min'}</span>
                  <span>{q.scaleMaxLabel || 'Max'}</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {Array.from({ length: (q.scaleMax || 10) - (q.scaleMin || 1) + 1 }).map((_, i) => {
                    const val = (q.scaleMin || 1) + i;
                    const isSel = answers[q.id] === val;
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handleAnswerChange(q.id, val)}
                        className={`flex-1 py-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                          isSel
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {q.type === 'rating' && (
              <div className="flex items-center gap-2 text-yellow-500">
                {Array.from({ length: q.ratingMax || 5 }).map((_, i) => {
                  const ratingVal = i + 1;
                  const isFilled = (answers[q.id] || 0) >= ratingVal;
                  return (
                    <button
                      type="button"
                      key={ratingVal}
                      onClick={() => handleAnswerChange(q.id, ratingVal)}
                      className="p-1.5 rounded-lg bg-[#121820] hover:scale-105 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${isFilled ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'file_upload' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121820] hover:bg-[#1A2332] border border-[#2A3647] hover:border-[#2563EB] text-xs font-semibold text-slate-200 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-[#38BDF8]" />
                    <span>{answers[q.id] ? 'Change File' : 'Choose File to Upload'}</span>
                    <input
                      type="file"
                      required={q.required && !answers[q.id]}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAnswerChange(q.id, file.name);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {answers[q.id] && (
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{answers[q.id]}</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Supported files: PDF, DOCX, PNG, JPG, ZIP (Max 10MB)</p>
              </div>
            )}

            {q.type === 'date' && (
              <input
                type="date"
                required={q.required}
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB]"
              />
            )}

            {q.type === 'time' && (
              <input
                type="time"
                required={q.required}
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB]"
              />
            )}

            {q.type === 'signature' && (
              <div className="space-y-1.5">
                <input
                  type="text"
                  required={q.required}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type full legal name as digital signature..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-[#2563EB] font-serif italic"
                />
                <p className="text-[10px] text-slate-500 font-mono">Digital Signature Verification</p>
              </div>
            )}

            {q.type === 'consent' && (
              <label className="flex items-center gap-3 p-3 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  required={q.required}
                  checked={!!answers[q.id]}
                  onChange={(e) => handleAnswerChange(q.id, e.target.checked ? 'I Agree' : '')}
                  className="accent-[#2563EB]"
                />
                <span>I agree to the terms and conditions</span>
              </label>
            )}

            {q.type === 'matrix' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#2A3647] text-[#84A1C0]">
                      <th className="p-2">Items</th>
                      {(q.matrixCols || ['Poor', 'Average', 'Excellent']).map(col => (
                        <th key={col} className="p-2 text-center">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3647]/50">
                    {(q.matrixRows || ['Row 1', 'Row 2']).map(row => (
                      <tr key={row}>
                        <td className="p-2 font-medium text-slate-200">{row}</td>
                        {(q.matrixCols || ['Poor', 'Average', 'Excellent']).map(col => (
                          <td key={col} className="p-2 text-center">
                            <input
                              type="radio"
                              name={`q-${q.id}-${row}`}
                              required={q.required}
                              checked={(answers[q.id] || {})[row] === col}
                              onChange={() => {
                                const prevMatrix = answers[q.id] || {};
                                handleAnswerChange(q.id, { ...prevMatrix, [row]: col });
                              }}
                              className="accent-[#2563EB]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2A3647]">
          {currentSectionIndex > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentSectionIndex(currentSectionIndex - 1)}
              className="px-4 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-white text-xs font-medium"
            >
              Previous
            </button>
          ) : <div />}

          {currentSectionIndex < sections.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs"
            >
              <span>Next Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-neo transition-all transform hover:scale-102"
            >
              <span>Submit Form Response</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
