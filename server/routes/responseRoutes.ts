import { Router } from 'express';
import { submitResponse, listResponses } from '../controllers/responsesController';
import { validateRequest, submitResponseSchema } from '../middleware/validationMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

export const responseRoutes = Router();

// Submit response with rate limiter & schema validation
responseRoutes.post(
  '/forms/:id/responses',
  rateLimiter(20, 60000),
  validateRequest(submitResponseSchema),
  submitResponse
);

// List responses for a form
responseRoutes.get('/forms/:id/responses', listResponses);
