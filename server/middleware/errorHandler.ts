import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../src/errors/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: (err as any).details || undefined
      }
    });
  }

  console.error('[SERVER UNHANDLED EXCEPTION]', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.'
    }
  });
};
