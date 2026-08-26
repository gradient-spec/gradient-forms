import React, { useState } from 'react';
import { Question, LogicRule } from '../../types';
import { GitBranch, Plus, Trash2, X, Sparkles, ArrowRight } from 'lucide-react';

interface LogicBuilderProps {
  isOpen: boolean;
  questions: Question[];
  logicRules: LogicRule[];
  onUpdateLogicRules: (rules: LogicRule[]) => void;
  onClose: () => void;
}

export const LogicBuilder: React.FC<LogicBuilderProps> = ({
  isOpen,
  questions,
  logicRules,
  onUpdateLogicRules,
  onClose
}) => {
  if (!isOpen) return null;

  const handleAddRule = () => {
    if (questions.length < 2) return;
    const newRule: LogicRule = {
      id: 'rule-' + Date.now(),
      sourceQuestionId: questions[0].id,
      operator: 'equals',
      value: questions[0].options?.[0]?.label || 'Yes',
      action: 'show',
      targetQuestionId: questions[1].id
    };
    onUpdateLogicRules([...logicRules, newRule]);
  };

  const handleDeleteRule = (ruleId: string) => {
    onUpdateLogicRules(logicRules.filter(r => r.id !== ruleId));
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<LogicRule>) => {
    onUpdateLogicRules(logicRules.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel border border-violet-500/40 rounded-2xl shadow-glow-violet overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Visual Conditional Logic Builder</h3>
              <p className="text-xs text-slate-400">Dynamically show or hide questions based on respondent answers.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Canvas */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {logicRules.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl space-y-3">
              <GitBranch className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No logic rules configured yet.</p>
              <button
                onClick={handleAddRule}
                disabled={questions.length < 2}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-glow-violet disabled:opacity-50"
              >
                + Add First Logic Rule
              </button>
            </div>
          ) : (
            logicRules.map((rule, idx) => {
              const sourceQ = questions.find(q => q.id === rule.sourceQuestionId);
              return (
                <div key={rule.id} className="p-4 rounded-xl glass-panel border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400">
                      Rule #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                    {/* IF Source Question */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">IF Answer To:</label>
                      <select
                        value={rule.sourceQuestionId}
                        onChange={(e) => handleUpdateRule(rule.id, { sourceQuestionId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        {questions.map(q => (
                          <option key={q.id} value={q.id}>{q.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Operator & Value */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">EQUALS VALUE:</label>
                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                        placeholder="Option value (e.g. Yes)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    {/* THEN Action Target */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">THEN SHOW QUESTION:</label>
                      <select
                        value={rule.targetQuestionId}
                        onChange={(e) => handleUpdateRule(rule.id, { targetQuestionId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        {questions.map(q => (
                          <option key={q.id} value={q.id}>{q.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {logicRules.length > 0 && (
            <button
              onClick={handleAddRule}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-violet-500/50 text-xs font-semibold text-violet-300 hover:text-white transition-colors"
            >
              + Add Another Condition
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
