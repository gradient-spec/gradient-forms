import { describe, it, expect } from 'vitest';
import { Form, Question } from '../types';
import { ensureFormDefaults } from '../context/AppContext';

describe('Form Builder Input Synchronization & Deletion Suite', () => {
  const sampleForm: Form = {
    id: 'test-input-form',
    title: 'Customer Feedback',
    description: 'Initial description',
    isPublished: false,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    sections: [{ id: 'sec-main', title: 'Main Section', description: 'Section Note' }],
    questions: [
      {
        id: 'q-1',
        sectionId: 'sec-main',
        type: 'short_answer',
        title: 'Full Name',
        placeholder: 'Enter name',
        required: true
      },
      {
        id: 'q-2',
        sectionId: 'sec-main',
        type: 'multiple_choice',
        title: 'Rating Choice',
        required: false,
        options: [
          { id: 'opt-1', label: 'Option A' },
          { id: 'opt-2', label: 'Option B' }
        ]
      }
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
      confirmationMessage: 'Submitted'
    },
    logicRules: [],
    versions: [],
    workspaceId: 'ws-1',
    authorName: 'Aryan',
    authorAvatar: ''
  };

  it('1. should preserve empty string "" for form title without reverting to "Untitled Form"', () => {
    const updatedForm: Form = {
      ...sampleForm,
      title: ''
    };

    const sanitized = ensureFormDefaults(updatedForm);
    expect(sanitized.title).toBe('');
  });

  it('2. should preserve empty string "" for form description without resetting', () => {
    const updatedForm: Form = {
      ...sampleForm,
      description: ''
    };

    const sanitized = ensureFormDefaults(updatedForm);
    expect(sanitized.description).toBe('');
  });

  it('3. should preserve empty string "" for question title without resetting to default', () => {
    const updatedQuestions: Question[] = [
      {
        ...sampleForm.questions[0],
        title: ''
      },
      sampleForm.questions[1]
    ];

    const updatedForm: Form = {
      ...sampleForm,
      questions: updatedQuestions
    };

    const sanitized = ensureFormDefaults(updatedForm);
    expect(sanitized.questions[0].title).toBe('');
  });

  it('4. should preserve empty string "" for option labels when user clears an option', () => {
    const updatedQuestions: Question[] = [
      sampleForm.questions[0],
      {
        ...sampleForm.questions[1],
        options: [
          { id: 'opt-1', label: '' },
          { id: 'opt-2', label: 'Option B' }
        ]
      }
    ];

    const updatedForm: Form = {
      ...sampleForm,
      questions: updatedQuestions
    };

    const sanitized = ensureFormDefaults(updatedForm);
    expect(sanitized.questions[1].options?.[0].label).toBe('');
  });

  it('5. should allow re-typing after clearing a field without losing newer edits', () => {
    // Simulate user typing: 'A' -> '' -> 'New Title'
    let current = { ...sampleForm, title: 'A' };
    current = ensureFormDefaults({ ...current, title: '' });
    expect(current.title).toBe('');

    current = ensureFormDefaults({ ...current, title: 'New Title' });
    expect(current.title).toBe('New Title');
  });
});
