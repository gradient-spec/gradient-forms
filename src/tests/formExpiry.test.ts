import { describe, it, expect } from 'vitest';
import { Form } from '../types';
import {
  getEffectiveFormStatus,
  isFormExpired,
  formatExpiryDescription,
  validateFutureExpiry
} from '../utils/formStatus';

describe('Form Expiry & Response Deadline Suite', () => {
  const baseForm: Form = {
    id: 'test-expiry-form',
    title: 'Hackathon Registration',
    description: 'Register before deadline',
    isPublished: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    sections: [{ id: 'sec-1', title: 'Main' }],
    questions: [
      { id: 'q-1', sectionId: 'sec-1', type: 'short_answer', title: 'Your Name', required: true }
    ],
    theme: {
      id: 'theme-1',
      name: 'Default',
      primaryColor: '#2563EB',
      accentColor: '#38BDF8',
      backgroundColor: '#0B0F14',
      cardStyle: 'bordered',
      fontFamily: 'Inter',
      borderRadius: 'lg'
    },
    settings: {
      collectEmail: true,
      limitOneResponse: false,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: true,
      confirmationMessage: 'Thanks for registering!'
    },
    logicRules: [],
    versions: [],
    workspaceId: 'ws-1',
    authorName: 'Admin',
    authorAvatar: ''
  };

  // 1. STATE PRECEDENCE TESTS
  describe('1. State Precedence Rules', () => {
    it('should return CLOSED when status is manually closed, regardless of expiry', () => {
      const futureExpiry = new Date(Date.now() + 100000).toISOString();
      const closedForm: Form = {
        ...baseForm,
        status: 'closed',
        expiresAt: futureExpiry
      };

      expect(getEffectiveFormStatus(closedForm)).toBe('CLOSED');
    });

    it('should return DRAFT when form is not published', () => {
      const draftForm: Form = {
        ...baseForm,
        isPublished: false,
        status: 'draft'
      };

      expect(getEffectiveFormStatus(draftForm)).toBe('DRAFT');
    });

    it('should return EXPIRED when current time >= expiresAt on published form', () => {
      const pastExpiry = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const expiredForm: Form = {
        ...baseForm,
        expiresAt: pastExpiry
      };

      expect(getEffectiveFormStatus(expiredForm)).toBe('EXPIRED');
      expect(isFormExpired(expiredForm)).toBe(true);
    });

    it('should return OPEN when form is published and expiry is in the future', () => {
      const futureExpiry = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days ahead
      const openForm: Form = {
        ...baseForm,
        expiresAt: futureExpiry
      };

      expect(getEffectiveFormStatus(openForm)).toBe('OPEN');
      expect(isFormExpired(openForm)).toBe(false);
    });

    it('should return OPEN when form is published and no expiry is set', () => {
      expect(getEffectiveFormStatus(baseForm)).toBe('OPEN');
      expect(isFormExpired(baseForm)).toBe(false);
    });
  });

  // 2. EXPIRY VALIDATION TESTS
  describe('2. Expiry Validation', () => {
    it('should reject empty date', () => {
      const res = validateFutureExpiry('', '23:59');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('select an expiry date');
    });

    it('should reject expiry date in the past', () => {
      const pastDate = '2020-01-01';
      const res = validateFutureExpiry(pastDate, '12:00');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('must be in the future');
    });

    it('should accept valid future date and time and return ISO string', () => {
      const futureDate = '2030-12-31';
      const res = validateFutureExpiry(futureDate, '23:59');
      expect(res.isValid).toBe(true);
      expect(res.isoString).toBeDefined();
    });
  });

  // 3. FORMATTING DESCRIPTION TESTS
  describe('3. Expiry Formatting & Labels', () => {
    it('should format expired date correctly', () => {
      const pastIso = new Date('2026-01-15T23:59:00Z').toISOString();
      const fixedNow = new Date('2026-02-01T12:00:00Z');
      const desc = formatExpiryDescription(pastIso, fixedNow);

      expect(desc.isExpired).toBe(true);
      expect(desc.shortLabel).toContain('Expired');
    });

    it('should format future expiry correctly', () => {
      const futureIso = new Date('2030-05-20T18:30:00Z').toISOString();
      const fixedNow = new Date('2026-02-01T12:00:00Z');
      const desc = formatExpiryDescription(futureIso, fixedNow);

      expect(desc.isExpired).toBe(false);
      expect(desc.fullLabel).toContain('2030');
      expect(desc.shortLabel).toContain('Expires');
    });
  });
});
