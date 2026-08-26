import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../../src/errors/AppError';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipStore = new Map<string, RateLimitRecord>();

export const rateLimiter = (maxRequests: number = 30, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const now = Date.now();
    const record = ipStore.get(ip);

    if (!record || now > record.resetTime) {
      ipStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(new RateLimitError(`Rate limit exceeded (${maxRequests} req / ${windowMs / 1000}s). Try again later.`));
    }

    record.count += 1;
    next();
  };
};
