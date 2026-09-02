import { Request, Response, NextFunction } from 'express';
import { formsStore, responsesStore } from '../db/inMemoryStore';
import { NotFoundError } from '../../src/errors/AppError';

// Live CSV Feed for Google Sheets =IMPORTDATA() function
export const exportCsv = (req: Request, res: Response, next: NextFunction) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const formResponses = responsesStore.filter(r => r.formId === form.id);

  const headers = ['Timestamp', 'Respondent Email', 'Respondent Name', 'Completion Time (s)'];
  if (form.settings?.quizMode) {
    headers.push('Quiz Score', 'Max Score');
  }
  (form.questions || []).forEach(q => headers.push(q.title));

  const escapeCSV = (val: any) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = [headers.map(escapeCSV).join(',')];

  formResponses.forEach(r => {
    const rowValues = [
      r.submittedAt,
      r.respondentEmail || 'Anonymous',
      r.respondentName || 'Anonymous',
      r.timeSpentSeconds || 0
    ];
    if (form.settings?.quizMode) {
      rowValues.push(r.score ?? 'N/A', r.maxScore ?? 'N/A');
    }
    (form.questions || []).forEach(q => {
      const ans = r.answers?.[q.id];
      if (Array.isArray(ans)) {
        rowValues.push(ans.join('; '));
      } else if (typeof ans === 'object' && ans !== null) {
        rowValues.push(JSON.stringify(ans));
      } else {
        rowValues.push(ans ?? '');
      }
    });
    rows.push(rowValues.map(escapeCSV).join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `inline; filename="${form.title}_Responses.csv"`);
  res.send(rows.join('\n'));
};
