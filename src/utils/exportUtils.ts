import { Form, FormResponse } from '../types';

export function exportToCSV(form: Form, responses: FormResponse[]) {
  if (!responses || responses.length === 0) return;

  const headers = ['Response ID', 'Submitted At', 'Respondent Email', 'Respondent Name', 'Time Spent (s)'];
  form.questions.forEach(q => headers.push(`"${q.title.replace(/"/g, '""')}"`));

  const rows: string[] = [];
  rows.push(headers.join(','));

  responses.forEach(r => {
    const row = [
      `"${r.id}"`,
      `"${r.submittedAt}"`,
      `"${r.respondentEmail || ''}"`,
      `"${r.respondentName || ''}"`,
      r.timeSpentSeconds
    ];

    form.questions.forEach(q => {
      const val = r.answers[q.id];
      let str = '';
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) str = val.join('; ');
        else if (typeof val === 'object') str = JSON.stringify(val);
        else str = String(val);
      }
      row.push(`"${str.replace(/"/g, '""')}"`);
    });

    rows.push(row.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Responses.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(form: Form, responses: FormResponse[]) {
  const exportPayload = {
    formTitle: form.title,
    formId: form.id,
    exportedAt: new Date().toISOString(),
    totalResponses: responses.length,
    responses
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Responses.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
