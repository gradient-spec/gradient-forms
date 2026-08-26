import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../../src/errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join('.') || 'body';
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(err.message);
        });
        next(new ValidationError('Request payload failed validation check', fieldErrors));
      } else {
        next(error);
      }
    }
  };
};

// Zod Schemas for Form Payload & Submissions
export const createFormSchema = z.object({
  title: z.string().min(1, 'Form title is required').max(150, 'Title too long'),
  description: z.string().optional(),
  settings: z.object({
    collectEmail: z.boolean().default(true),
    limitOneResponse: z.boolean().default(false),
    quizMode: z.boolean().default(false),
    confirmationMessage: z.string().default('Response recorded.')
  }).optional(),
  questions: z.array(z.object({
    title: z.string().min(1, 'Question title required'),
    type: z.string(),
    required: z.boolean().default(false)
  })).optional()
});

export const submitResponseSchema = z.object({
  formId: z.string().min(1, 'Form ID required'),
  respondentEmail: z.string().email('Invalid email address').optional(),
  respondentName: z.string().optional(),
  answers: z.record(z.string(), z.any()),
  timeSpentSeconds: z.number().nonnegative().default(0)
});

