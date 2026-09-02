import { Request, Response, NextFunction } from 'express';
import { formsStore, responsesStore } from '../db/inMemoryStore';
import { NotFoundError } from '../../src/errors/AppError';

// Submit Response with Server-side Expiry & Closed Protection
export const submitResponse = (req: Request, res: Response, next: NextFunction) => {
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

  // 3. Rejection rule: Private Form unauthenticated submission check
  const accessType = form.settings?.accessType || form.accessType || 'public';
  if (accessType === 'private') {
    const isRespondentAuthenticated = Boolean(req.headers['x-auth-user'] || req.body?.authenticatedUserId);
    if (!isRespondentAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'This form is private and requires authenticated access before submissions can be accepted.'
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
    message: form.settings?.confirmationMessage || 'Response recorded.',
    data: newResponse
  });
};

// List Form Responses
export const listResponses = (req: Request, res: Response, next: NextFunction) => {
  const form = formsStore.find(f => f.id === req.params.id);
  if (!form) return next(new NotFoundError('Form'));

  const formResponses = responsesStore.filter(r => r.formId === form.id);
  res.json({
    success: true,
    total: formResponses.length,
    data: formResponses
  });
};
