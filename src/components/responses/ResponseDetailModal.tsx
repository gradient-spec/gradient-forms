import React from 'react';
import { FormResponse, Form } from '../../types';
import { X, Printer, Download, Mail, Clock, Calendar, ShieldCheck, Award } from 'lucide-react';
import { format } from 'date-fns';

interface ResponseDetailModalProps {
  response: FormResponse | null;
  form: Form | undefined;
  onClose: () => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({ response, form, onClose }) => {
  if (!response || !form) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full glass-panel border-l border-white/10 p-6 md:p-8 space-y-6 overflow-y-auto animate-slide-left">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">
              Response ID: {response.id}
            </span>
            <h3 className="text-xl font-bold font-display text-white mt-0.5">
              {response.respondentName || 'Anonymous Respondent'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Print Response"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Respondent Metadata Badge Box */}
        <div className="p-4 rounded-xl glass-panel border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Respondent Email</span>
            <span className="text-slate-200 font-medium truncate block">{response.respondentEmail || 'N/A'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Submitted At</span>
            <span className="text-slate-200 font-medium block">
              {format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Time Spent</span>
            <span className="text-cyan-300 font-mono font-bold block">{response.timeSpentSeconds} seconds</span>
          </div>

          {response.score !== undefined && (
            <div className="col-span-2 sm:col-span-3 pt-2 border-t border-white/10 flex items-center gap-2 text-amber-300 font-bold">
              <Award className="w-4 h-4" />
              <span>Quiz Grade Score: {response.score} / {response.maxScore} pts</span>
            </div>
          )}
        </div>

        {/* Answers List */}
        <div className="space-y-6 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Form Questions & Answers
          </h4>

          {form.questions.map((q, idx) => {
            let rawAns = response.answers[q.id];
            if (rawAns === undefined) {
              const foundKey = Object.keys(response.answers).find(
                k => k === `q-${idx + 1}` || k.toLowerCase() === q.title.toLowerCase() || k === q.id
              );
              if (foundKey) rawAns = response.answers[foundKey];
            }

            let formattedAns = 'No answer provided';
            if (rawAns !== undefined && rawAns !== null && rawAns !== '') {
              if (Array.isArray(rawAns)) {
                formattedAns = rawAns.join(', ');
              } else if (typeof rawAns === 'object') {
                formattedAns = JSON.stringify(rawAns);
              } else {
                formattedAns = String(rawAns);
              }
            }

            return (
              <div key={q.id} className="p-4 rounded-xl glass-panel border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  {idx + 1}. {q.title}
                </span>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white leading-relaxed font-mono">
                  {formattedAns}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
