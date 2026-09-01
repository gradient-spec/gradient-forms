import { describe, it, expect } from 'vitest';
import { Form, FormSettings } from '../types';

describe('Toggable Agreement & Consent Checkbox Feature Tests', () => {
  const baseForm: Form = {
    id: 'form-agreement-test',
    title: 'Student Club Form',
    description: 'Registration form',
    isPublished: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    workspaceId: 'ws-1',
    authorName: 'Alex Rivera',
    authorAvatar: '',
    logicRules: [],
    versions: [],
    theme: {
      id: 'theme-1',
      name: 'Default',
      primaryColor: '#2563EB',
      accentColor: '#38BDF8',
      backgroundColor: '#07070E',
      cardStyle: 'glass',
      fontFamily: 'Inter',
      borderRadius: 'lg'
    },
    sections: [{ id: 'sec-1', title: 'Main' }],
    questions: [
      {
        id: 'q-name',
        sectionId: 'sec-1',
        type: 'short_answer',
        title: 'Full Name',
        required: true
      }
    ],
    settings: {
      collectEmail: true,
      limitOneResponse: false,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: false,
      confirmationMessage: 'Thanks!',
      requireAgreement: false
    }
  };

  it('should not enforce agreement acceptance when requireAgreement is false', () => {
    const formWithoutAgreement: Form = { ...baseForm };
    const validateSubmission = (form: Form, hasAgreed: boolean) => {
      if (form.settings.requireAgreement && !hasAgreed) {
        return 'Agreement Required';
      }
      return 'VALID';
    };

    expect(validateSubmission(formWithoutAgreement, false)).toBe('VALID');
    expect(validateSubmission(formWithoutAgreement, true)).toBe('VALID');
  });

  it('should enforce agreement acceptance when requireAgreement is true', () => {
    const formWithAgreement: Form = {
      ...baseForm,
      settings: {
        ...baseForm.settings,
        requireAgreement: true,
        agreementText: 'By submitting, you agree to share your information with the college club.'
      }
    };

    const validateSubmission = (form: Form, hasAgreed: boolean) => {
      if (form.settings.requireAgreement && !hasAgreed) {
        return 'Agreement Required';
      }
      return 'VALID';
    };

    expect(validateSubmission(formWithAgreement, false)).toBe('Agreement Required');
    expect(validateSubmission(formWithAgreement, true)).toBe('VALID');
  });

  it('should allow customizing agreement text on specific forms', () => {
    const customText = 'I hereby accept the Hackathon Code of Conduct and Photo Release terms.';
    const updatedSettings: FormSettings = {
      ...baseForm.settings,
      requireAgreement: true,
      agreementText: customText
    };

    expect(updatedSettings.requireAgreement).toBe(true);
    expect(updatedSettings.agreementText).toBe(customText);
  });
});
