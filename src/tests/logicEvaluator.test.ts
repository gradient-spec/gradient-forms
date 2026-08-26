import { describe, it, expect } from 'vitest';
import { LogicRule, Question } from '../types';

function evaluateQuestionVisibility(q: Question, logicRules: LogicRule[], answers: Record<string, any>): boolean {
  if (!logicRules || logicRules.length === 0) return true;

  for (const rule of logicRules) {
    if (rule.targetQuestionId === q.id) {
      const sourceAnswer = answers[rule.sourceQuestionId];
      if (rule.operator === 'equals' && sourceAnswer !== rule.value) {
        if (rule.action === 'show') return false;
      }
    }
  }
  return true;
}

describe('Conditional Logic Evaluator Domain Unit Tests', () => {
  const targetQuestion: Question = {
    id: 'q-target',
    sectionId: 'sec-1',
    type: 'short_answer',
    title: 'What is your college name?',
    required: false
  };

  const rules: LogicRule[] = [
    {
      id: 'rule-1',
      sourceQuestionId: 'q-enrolled',
      operator: 'equals',
      value: 'Yes',
      action: 'show',
      targetQuestionId: 'q-target'
    }
  ];

  it('should HIDE target question if source condition is NOT met', () => {
    const answers = { 'q-enrolled': 'No' };
    const visible = evaluateQuestionVisibility(targetQuestion, rules, answers);
    expect(visible).toBe(false);
  });

  it('should SHOW target question if source condition IS met', () => {
    const answers = { 'q-enrolled': 'Yes' };
    const visible = evaluateQuestionVisibility(targetQuestion, rules, answers);
    expect(visible).toBe(true);
  });

  it('should SHOW target question by default if no rules target it', () => {
    const answers = {};
    const visible = evaluateQuestionVisibility({ ...targetQuestion, id: 'q-other' }, rules, answers);
    expect(visible).toBe(true);
  });
});
