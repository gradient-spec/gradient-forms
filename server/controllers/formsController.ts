import { Request, Response, NextFunction } from 'express';
import { formsStore } from '../db/inMemoryStore';
import { NotFoundError } from '../../src/errors/AppError';

// List Forms with Search & Pagination
export const listForms = (req: Request, res: Response) => {
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
};

// Create New Form
export const createForm = (req: Request, res: Response) => {
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
};

// Get Form Detail with Computed Expiry & Status
export const getFormById = (req: Request, res: Response, next: NextFunction) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const expiry = form.expiresAt || form.settings?.expiresAt;
  const isExpired = expiry ? new Date().getTime() >= new Date(expiry).getTime() : false;
  const accessType = form.settings?.accessType || form.accessType || 'public';
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
      accessType,
      effectiveStatus,
      isExpired
    }
  });
};

// Update Form (Settings, Expiry, Status, Content, AccessType)
export const updateForm = (req: Request, res: Response, next: NextFunction) => {
  const formIndex = formsStore.findIndex(f => f.id === req.params.id);
  if (formIndex === -1) return next(new NotFoundError('Form'));

  const updates = req.body;
  if (updates.expiresAt) {
    const expiryTime = new Date(updates.expiresAt).getTime();
    if (isNaN(expiryTime)) {
      return res.status(400).json({ success: false, error: 'INVALID_DATE', message: 'Invalid expiry date/time format.' });
    }
  }

  const accessType = updates.accessType || updates.settings?.accessType || formsStore[formIndex].settings?.accessType || 'public';

  formsStore[formIndex] = {
    ...formsStore[formIndex],
    ...updates,
    accessType,
    settings: {
      ...formsStore[formIndex].settings,
      ...(updates.settings || {}),
      accessType,
      expiresAt: updates.expiresAt !== undefined ? updates.expiresAt : formsStore[formIndex].settings?.expiresAt,
      expiryMessage: updates.expiryMessage !== undefined ? updates.expiryMessage : formsStore[formIndex].settings?.expiryMessage
    },
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: formsStore[formIndex]
  });
};
