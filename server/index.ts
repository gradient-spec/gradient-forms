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
  res.json({ success: true, data: form });
});

// Submit Response with Rate Limiter
app.post(
  '/api/v1/forms/:id/responses',
  rateLimiter(20, 60000),
  validateRequest(submitResponseSchema),
  (req, res, next) => {
    const form = formsStore.find(f => f.id === req.params.id);
    if (!form) return next(new NotFoundError('Form'));

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

// Centralized Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ [GRADIENT FORMS API SERVER] Running on http://localhost:${PORT}`);
  });
}

export default app;
