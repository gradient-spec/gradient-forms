import { describe, it, expect } from 'vitest';
import { createFormSchema, submitResponseSchema } from '../../server/middleware/validationMiddleware';

describe('Zod API Payload Validation Tests', () => {
  it('should validate a valid form creation payload', () => {
    const payload = {
      title: 'CS Course Feedback',
      description: 'Lab evaluation form',
      settings: { collectEmail: true, quizMode: false },
      questions: [{ title: 'Name', type: 'short_answer', required: true }]
    };

    const parsed = createFormSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('should reject form payload with empty title', () => {
    const payload = { title: '' };
    const parsed = createFormSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it('should validate a valid submission response payload', () => {
    const payload = {
      formId: 'form-123',
      respondentEmail: 'alex@example.com',
      answers: { 'q-1': 'Option A' },
      timeSpentSeconds: 45
    };

    const parsed = submitResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('should reject submission response payload with invalid email', () => {
    const payload = {
      formId: 'form-123',
      respondentEmail: 'invalid-email-address',
      answers: {}
    };

    const parsed = submitResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
