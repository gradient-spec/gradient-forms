import { describe, it, expect } from 'vitest';
import { KNOWN_SEED_FORM_IDS, SEED_FORMS, SEED_RESPONSES } from '../data/seedData';
import { Form } from '../types';

describe('Seed Forms Cleanup & Migration', () => {
  it('1. SEED_FORMS and SEED_RESPONSES default arrays start empty', () => {
    expect(SEED_FORMS).toEqual([]);
    expect(SEED_RESPONSES).toEqual([]);
  });

  it('2. KNOWN_SEED_FORM_IDS tracks exact stable IDs of all demo forms', () => {
    expect(KNOWN_SEED_FORM_IDS.has('form-cs-feedback')).toBe(true);
    expect(KNOWN_SEED_FORM_IDS.has('form-summit-rsvp')).toBe(true);
    expect(KNOWN_SEED_FORM_IDS.has('form-job-app')).toBe(true);
    expect(KNOWN_SEED_FORM_IDS.has('form-trial-2-antigraviti')).toBe(true);
  });

  it('3. Filters out seed forms from localStorage while preserving real user forms', () => {
    const mixedSavedForms: Partial<Form>[] = [
      { id: 'form-cs-feedback', title: 'Computer Science Course & Lab Feedback' },
      { id: 'form-custom-12345', title: 'My Real Company Survey', description: 'Actual user form' },
      { id: 'form-summit-rsvp', title: 'Cyberpunk 2026 Developer Summit Application' },
      { id: 'form-custom-67890', title: 'Customer Onboarding Form', description: 'Another real form' },
      { id: 'form-job-app', title: 'Senior Frontend & UX Architect Application' }
    ];

    const cleanedUserForms = mixedSavedForms.filter(f => !KNOWN_SEED_FORM_IDS.has(f.id!));

    expect(cleanedUserForms.length).toBe(2);
    expect(cleanedUserForms.map(f => f.id)).toEqual(['form-custom-12345', 'form-custom-67890']);
    expect(cleanedUserForms.map(f => f.title)).toEqual([
      'My Real Company Survey',
      'Customer Onboarding Form'
    ]);
  });

  it('4. Cleans localStorage containing only seed forms down to empty array', () => {
    const onlySeedForms: Partial<Form>[] = [
      { id: 'form-cs-feedback' },
      { id: 'form-summit-rsvp' },
      { id: 'form-job-app' }
    ];

    const cleaned = onlySeedForms.filter(f => !KNOWN_SEED_FORM_IDS.has(f.id!));
    expect(cleaned).toEqual([]);
  });

  it('5. Protects existing user-created forms if none are seed forms', () => {
    const userForms: Partial<Form>[] = [
      { id: 'form-user-1', title: 'User Form 1' },
      { id: 'form-user-2', title: 'User Form 2' }
    ];

    const cleaned = userForms.filter(f => !KNOWN_SEED_FORM_IDS.has(f.id!));
    expect(cleaned).toEqual(userForms);
    expect(cleaned.length).toBe(2);
  });
});
