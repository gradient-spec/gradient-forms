import { describe, it, expect } from 'vitest';
import { Question } from '../types';

function calculateQuizScore(questions: Question[], answers: Record<string, any>): { score: number; maxScore: number } {
  let score = 0;
  let maxScore = 0;

  questions.forEach(q => {
    if (q.points && q.correctAnswer) {
      maxScore += q.points;
      if (answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    }
  });

  return { score, maxScore };
}

describe('Quiz Mode Score Engine Unit Tests', () => {
  const quizQuestions: Question[] = [
    {
      id: 'q-1',
      sectionId: 'sec-1',
      type: 'multiple_choice',
      title: 'Time complexity of QuickSelect?',
      required: true,
      points: 10,
      correctAnswer: 'opt-3'
    },
    {
      id: 'q-2',
      sectionId: 'sec-1',
      type: 'multiple_choice',
      title: 'Primary CSS framework version?',
      required: true,
      points: 5,
      correctAnswer: 'opt-v4'
    }
  ];

  it('should calculate 100% full marks when all answers are correct', () => {
    const answers = { 'q-1': 'opt-3', 'q-2': 'opt-v4' };
    const result = calculateQuizScore(quizQuestions, answers);
    expect(result.score).toBe(15);
    expect(result.maxScore).toBe(15);
  });

  it('should calculate partial score when some answers are wrong', () => {
    const answers = { 'q-1': 'opt-3', 'q-2': 'opt-wrong' };
    const result = calculateQuizScore(quizQuestions, answers);
    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(15);
  });

  it('should return 0 score when all answers are wrong or missing', () => {
    const answers = {};
    const result = calculateQuizScore(quizQuestions, answers);
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(15);
  });
});
