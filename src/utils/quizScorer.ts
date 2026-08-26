import { Form } from '../types';

export const calculateQuizScore = (form: Form, answers: Record<string, any>) => {
  if (!form.settings || !form.settings.quizMode) {
    return { score: undefined, maxScore: undefined, percentage: undefined };
  }

  let score = 0;
  let maxScore = 0;

  (form.questions || []).forEach(q => {
    if (q.points && q.correctAnswer) {
      maxScore += q.points;
      const userAns = answers[q.id];

      if (Array.isArray(q.correctAnswer)) {
        if (Array.isArray(userAns) && userAns.length === q.correctAnswer.length && userAns.every(v => (q.correctAnswer as string[]).includes(v))) {
          score += q.points;
        }
      } else if (userAns === q.correctAnswer) {
        score += q.points;
      }
    }
  });

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percentage };
};
