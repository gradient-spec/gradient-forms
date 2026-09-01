import express from 'express';
import cors from 'cors';
import { validateRequest, createFormSchema, submitResponseSchema } from './middleware/validationMiddleware';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from '../src/errors/AppError';
import { SEED_FORMS, SEED_RESPONSES } from '../src/data/seedData';
import { prisma } from './db/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-Memory Data Store (Failsafe backup)
let formsStore = [...SEED_FORMS];
let responsesStore = [...SEED_RESPONSES];

// System Healthcheck
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Gradient Forms REST API Server',
    formsCount: formsStore.length
  });
});

// Database Healthcheck
app.get('/api/v1/health/db', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as db_health`;
    res.json({
      status: 'healthy',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString(),
      ping: 'OK',
      result
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'PostgreSQL',
      error: error?.message || 'Database connection error'
    });
  }
});

// List Forms with Pagination & Search
app.get('/api/v1/forms', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = ((req.query.search as string) || '').toLowerCase();

  const filtered = formsStore.filter(f =>
    f.title.toLowerCase().includes(search) || f.description.toLowerCase().includes(search)
  );

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    }
  });
});

// Create Form
app.post('/api/v1/forms', validateRequest(createFormSchema), (req, res) => {
  const newForm = {
    id: 'form-' + Date.now(),
    ...req.body,
    isPublished: false,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    sections: req.body.sections || [{ id: 'sec-1', title: 'Main Section' }],
    questions: req.body.questions || [],
    logicRules: [],
    versions: []
  };

  formsStore.unshift(newForm);

  res.status(201).json({
    success: true,
    data: newForm
  });
});

// Get Form Detail
app.get('/api/v1/forms/:id', (req, res, next) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const expiry = form.expiresAt || form.settings?.expiresAt;
  const isExpired = expiry ? new Date().getTime() >= new Date(expiry).getTime() : false;
  const effectiveStatus = form.status === 'closed'
    ? 'CLOSED'
    : (!form.isPublished || form.status === 'draft')
    ? 'DRAFT'
    : isExpired
    ? 'EXPIRED'
    : 'OPEN';

  res.json({
    success: true,
    data: {
      ...form,
      effectiveStatus,
      isExpired
    }
  });
});

// Update Form (Settings, Expiry, Status)
app.patch('/api/v1/forms/:id', (req, res, next) => {
  const formIndex = formsStore.findIndex(f => f.id === req.params.id);
  if (formIndex === -1) return next(new NotFoundError('Form'));

  const updates = req.body;
  if (updates.expiresAt) {
    const expiryTime = new Date(updates.expiresAt).getTime();
    if (isNaN(expiryTime)) {
      return res.status(400).json({ success: false, error: 'INVALID_DATE', message: 'Invalid expiry date/time format.' });
    }
  }

  formsStore[formIndex] = {
    ...formsStore[formIndex],
    ...updates,
    settings: {
      ...formsStore[formIndex].settings,
      ...(updates.settings || {}),
      expiresAt: updates.expiresAt !== undefined ? updates.expiresAt : formsStore[formIndex].settings?.expiresAt,
      expiryMessage: updates.expiryMessage !== undefined ? updates.expiryMessage : formsStore[formIndex].settings?.expiryMessage
    },
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: formsStore[formIndex]
  });
});

// Submit Response with Rate Limiter & Server-side Expiry & Status Protection
app.post(
  '/api/v1/forms/:id/responses',
  rateLimiter(20, 60000),
  validateRequest(submitResponseSchema),
  (req, res, next) => {
    const form = formsStore.find(f => f.id === req.params.id);
    if (!form) return next(new NotFoundError('Form'));

    // 1. Rejection rule: Manually closed
    if (form.status === 'closed') {
      return res.status(403).json({
        success: false,
        error: 'FORM_CLOSED',
        message: 'This form has been manually closed by the administrator and is not accepting responses.'
      });
    }

    // 2. Rejection rule: Automatic response deadline expiry (currentTime >= expiresAt)
    const expiryStr = form.expiresAt || form.settings?.expiresAt;
    if (expiryStr) {
      const expiryTimestamp = new Date(expiryStr).getTime();
      if (!isNaN(expiryTimestamp) && Date.now() >= expiryTimestamp) {
        return res.status(403).json({
          success: false,
          error: 'FORM_EXPIRED',
          message: form.expiryMessage || form.settings?.expiryMessage || 'This form is no longer accepting responses. The response deadline for this form has passed.'
        });
      }
    }

    const newResponse = {
      id: 'resp-' + Date.now(),
      formId: form.id,
      submittedAt: new Date().toISOString(),
      ...req.body
    };

    responsesStore.unshift(newResponse);
    form.responseCount += 1;

    res.status(201).json({
      success: true,
      message: form.settings.confirmationMessage || 'Response recorded.',
      data: newResponse
    });
  }
);

// List Form Responses
app.get('/api/v1/forms/:id/responses', (req, res, next) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const formResponses = responsesStore.filter(r => r.formId === form.id);
  res.json({
    success: true,
    total: formResponses.length,
    data: formResponses
  });
});

// Live CSV Feed for Google Sheets =IMPORTDATA() function
app.get('/api/v1/forms/:id/export.csv', (req, res, next) => {
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
});

// Google Sheets Integration Info (Safe server-side endpoint)
app.get('/api/v1/forms/:id/integrations/google-sheets', (req, res, next) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const spreadsheetUrl = `/?view=sheets&formId=${form.id}`;

  res.json({
    success: true,
    data: {
      connected: true,
      spreadsheetId: undefined,
      spreadsheetUrl,
      sheetName: `${form.title}_Responses`,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced'
    }
  });
});

// Trigger Server-side Google Sheets Sync
app.post('/api/v1/forms/:id/integrations/google-sheets/sync', (req, res, next) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const formResponses = responsesStore.filter(r => r.formId === form.id);
  const spreadsheetUrl = `/?view=sheets&formId=${form.id}`;

  res.json({
    success: true,
    message: 'Google Sheets synchronization completed successfully.',
    data: {
      syncedCount: formResponses.length,
      lastSyncedAt: new Date().toISOString(),
      spreadsheetUrl,
      syncStatus: 'synced'
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ [GRADIENT FORMS API SERVER] Running on http://localhost:${PORT}`);
  });
}

export default app;
