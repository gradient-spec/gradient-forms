import { describe, it, expect } from 'vitest';
import { Form } from '../types';
import {
  getFormAccessType,
  isPublicForm,
  isPrivateForm,
  resolveFormAccess
} from '../utils/formAccessEngine';
import { resolveNextSectionDestination } from '../utils/branchingEngine';

describe('Public & Private Form Types Engine', () => {
  const samplePublicForm: Form = {
    id: 'form-public-1',
    title: 'Public Community Feedback',
    description: 'General feedback from anyone',
    isPublished: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 10,
    workspaceId: 'ws-1',
    authorName: 'Aryan',
    authorAvatar: '',
    sections: [
      { id: 'sec-1', title: 'Main Section' },
      { id: 'sec-2', title: 'Next Section' }
    ],
    theme: {
      id: 'default',
      name: 'Default',
      primaryColor: '#2563EB',
      accentColor: '#38BDF8',
      backgroundColor: '#0F172A',
      cardStyle: 'glass',
      fontFamily: 'Inter',
      borderRadius: 'lg'
    },
    settings: {
      accessType: 'public',
      collectEmail: false,
      limitOneResponse: false,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: false,
      confirmationMessage: 'Thanks!'
    },
    logicRules: [],
    versions: [],
    questions: [
      {
        id: 'q-branch',
        sectionId: 'sec-1',
        type: 'multiple_choice',
        title: 'Choose Destination',
        required: true,
        enableBranching: true,
        options: [
          { id: 'opt-1', label: 'Go to Section 2', destinationSectionId: 'sec-2' }
        ]
      }
    ]
  };

  const samplePrivateForm: Form = {
    ...samplePublicForm,
    id: 'form-private-1',
    title: 'Internal Confidential Review',
    accessType: 'private',
    settings: {
      ...samplePublicForm.settings,
      accessType: 'private'
    }
  };

  it('1. Defaults legacy forms with undefined accessType safely to "public"', () => {
    const legacyForm: Form = {
      ...samplePublicForm,
      accessType: undefined,
      settings: {
        ...samplePublicForm.settings,
        accessType: undefined
      }
    };

    expect(getFormAccessType(legacyForm)).toBe('public');
    expect(isPublicForm(legacyForm)).toBe(true);
    expect(isPrivateForm(legacyForm)).toBe(false);
  });

  it('2. Correctly identifies Public and Private forms from settings', () => {
    expect(getFormAccessType(samplePublicForm)).toBe('public');
    expect(isPublicForm(samplePublicForm)).toBe(true);
    expect(isPrivateForm(samplePublicForm)).toBe(false);

    expect(getFormAccessType(samplePrivateForm)).toBe('private');
    expect(isPublicForm(samplePrivateForm)).toBe(false);
    expect(isPrivateForm(samplePrivateForm)).toBe(true);
  });

  it('3. Resolves Public form for real respondents with open access', () => {
    const resolution = resolveFormAccess(samplePublicForm);
    expect(resolution.accessType).toBe('public');
    expect(resolution.isAllowed).toBe(true);
    expect(resolution.reason).toBe('PUBLIC_OPEN');
  });

  it('4. Resolves Private form for real respondents with AUTH_REQUIRED barrier', () => {
    const resolution = resolveFormAccess(samplePrivateForm);
    expect(resolution.accessType).toBe('private');
    expect(resolution.isAllowed).toBe(false);
    expect(resolution.reason).toBe('AUTH_REQUIRED');
  });

  it('5. Creator Preview mode bypasses Private form barrier for simulation testing', () => {
    const previewResolution = resolveFormAccess(samplePrivateForm, { isPreview: true });
    expect(previewResolution.accessType).toBe('private');
    expect(previewResolution.isAllowed).toBe(true);
    expect(previewResolution.reason).toBe('PREVIEW_BYPASS');
  });

  it('6. Future authenticated sessions pass through Private form barrier cleanly', () => {
    const authResolution = resolveFormAccess(samplePrivateForm, {
      authState: { isAuthenticated: true, user: { email: 'verified@company.com' } }
    });
    expect(authResolution.accessType).toBe('private');
    expect(authResolution.isAllowed).toBe(true);
    expect(authResolution.reason).toBe('AUTHENTICATED');
  });

  it('7. Conditional Section Branching operates identically regardless of form access type', () => {
    const publicBranch = resolveNextSectionDestination(samplePublicForm, 'sec-1', { 'q-branch': 'opt-1' });
    const privateBranch = resolveNextSectionDestination(samplePrivateForm, 'sec-1', { 'q-branch': 'opt-1' });

    expect(publicBranch.destinationSectionId).toBe('sec-2');
    expect(privateBranch.destinationSectionId).toBe('sec-2');
    expect(publicBranch.isBranch).toBe(true);
    expect(privateBranch.isBranch).toBe(true);
  });

  it('8. Single source of truth in settings takes precedence', () => {
    const formWithSettings: Form = {
      ...samplePublicForm,
      accessType: 'public',
      settings: {
        ...samplePublicForm.settings,
        accessType: 'private'
      }
    };
    expect(getFormAccessType(formWithSettings)).toBe('private');
  });
});
