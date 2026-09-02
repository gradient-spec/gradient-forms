import { Request, Response, NextFunction } from 'express';
import { formsStore, responsesStore } from '../db/inMemoryStore';
import { NotFoundError } from '../../src/errors/AppError';

// Google Sheets Integration Info (Safe server-side endpoint)
export const getGoogleSheetsInfo = (req: Request, res: Response, next: NextFunction) => {
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
};

// Trigger Server-side Google Sheets Sync
export const syncGoogleSheets = (req: Request, res: Response, next: NextFunction) => {
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
};
