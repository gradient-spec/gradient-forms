import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPersistedForms,
  loadPersistedResponses,
  loadPersistedWorkspace,
  STORAGE_KEYS,
  ensureFormDefaults
} from '../context/AppContext';
import { SEED_FORMS, SEED_RESPONSES } from '../data/seedData';
import { Form, FormResponse, Workspace } from '../types';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true
});

describe('Production Persistence Safety & Workspace Initialization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Fresh workspace starts with zero forms (forms: [])', () => {
    const forms = loadPersistedForms();
    expect(forms).toEqual([]);
    expect(forms.length).toBe(0);
  });

  it('2. Fresh workspace starts with zero responses (responses: [])', () => {
    const responses = loadPersistedResponses();
    expect(responses).toEqual([]);
    expect(responses.length).toBe(0);
  });

  it('3. Application startup never creates forms automatically', () => {
    expect(SEED_FORMS).toEqual([]);
    expect(SEED_RESPONSES).toEqual([]);
    const forms = loadPersistedForms();
    expect(forms.length).toBe(0);
  });

  it('4. Preserves all existing user-created forms in primary storage exactly', () => {
    const mockUserForms: Form[] = [
      {
        id: 'form-specathon-2026',
        title: 'SPECATHON 2026 Registration',
        description: 'Annual hackathon registration form',
        isPublished: true,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseCount: 5,
        workspaceId: 'ws-1',
        authorName: 'Aryan',
        authorAvatar: '',
        sections: [{ id: 'sec-1', title: 'Main' }],
        questions: [{ id: 'q-1', sectionId: 'sec-1', type: 'short_answer', title: 'Team Name', required: true }],
        theme: { id: 't1', name: 'Dark', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
        settings: { accessType: 'public', collectEmail: true, limitOneResponse: false, allowEditResponse: false, saveProgress: true, showProgressBar: true, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: true, confirmationMessage: 'Registered!' },
        logicRules: [],
        versions: []
      }
    ];

    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(mockUserForms));
    const loaded = loadPersistedForms();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('form-specathon-2026');
    expect(loaded[0].title).toBe('SPECATHON 2026 Registration');
  });

  it('5. Preserves existing forms even if their IDs match old seed form IDs', () => {
    const userModifiedSeedForm: Form[] = [
      {
        id: 'form-cs-feedback',
        title: 'My Custom University Course Feedback',
        description: 'User modified form with old ID',
        isPublished: true,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseCount: 1,
        workspaceId: 'ws-1',
        authorName: 'User',
        authorAvatar: '',
        sections: [{ id: 'sec-1', title: 'Questions' }],
        questions: [],
        theme: { id: 't1', name: 'Dark', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
        settings: { accessType: 'public', collectEmail: true, limitOneResponse: false, allowEditResponse: false, saveProgress: true, showProgressBar: true, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: true, confirmationMessage: 'Done' },
        logicRules: [],
        versions: []
      },
      {
        id: 'form-trial-2-antigraviti',
        title: 'Trial Evaluation Form',
        description: 'Custom trial form',
        isPublished: false,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseCount: 0,
        workspaceId: 'ws-1',
        authorName: 'User',
        authorAvatar: '',
        sections: [{ id: 'sec-1', title: 'Section' }],
        questions: [],
        theme: { id: 't1', name: 'Dark', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
        settings: { accessType: 'private', collectEmail: true, limitOneResponse: false, allowEditResponse: false, saveProgress: true, showProgressBar: true, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: true, confirmationMessage: 'Done' },
        logicRules: [],
        versions: []
      }
    ];

    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(userModifiedSeedForm));
    const loaded = loadPersistedForms();
    expect(loaded.length).toBe(2);
    expect(loaded.map(f => f.id)).toContain('form-cs-feedback');
    expect(loaded.map(f => f.id)).toContain('form-trial-2-antigraviti');
  });

  it('6. Never deletes forms based on title or keywords (e.g. "Trial", "Test", "Antigraviti")', () => {
    const testKeywordForms: Partial<Form>[] = [
      { id: 'f-1', title: 'Trial Form Alpha' },
      { id: 'f-2', title: 'Test Form Beta' },
      { id: 'f-3', title: 'Antigraviti Benchmark' }
    ];

    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(testKeywordForms));
    const loaded = loadPersistedForms();
    expect(loaded.length).toBe(3);
    expect(loaded.map(f => f.title)).toEqual([
      'Trial Form Alpha',
      'Test Form Beta',
      'Antigraviti Benchmark'
    ]);
  });

  it('7. Recovers forms from legacy storage keys (gradient_forms_data)', () => {
    const legacyForms = [
      { id: 'form-legacy-1', title: 'Legacy Survey', sections: [{ id: 's1', title: 'Main' }], questions: [] }
    ];
    localStorage.setItem('gradient_forms_data', JSON.stringify(legacyForms));

    const loaded = loadPersistedForms();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('form-legacy-1');
    expect(loaded[0].title).toBe('Legacy Survey');
  });

  it('8. Merges primary and legacy data non-destructively without overwriting', () => {
    const legacyForms = [{ id: 'form-legacy-1', title: 'Legacy Survey' }];
    const primaryForms = [{ id: 'form-primary-1', title: 'Primary Active Form' }];

    localStorage.setItem('gradient_forms_data', JSON.stringify(legacyForms));
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(primaryForms));

    const loaded = loadPersistedForms();
    expect(loaded.length).toBe(2);
    expect(loaded.map(f => f.id)).toContain('form-legacy-1');
    expect(loaded.map(f => f.id)).toContain('form-primary-1');
  });

  it('9. Legacy hydration is idempotent and does not duplicate forms on reload', () => {
    const primaryForms = [{ id: 'form-1', title: 'Unique Form' }];
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(primaryForms));

    const firstLoad = loadPersistedForms();
    const secondLoad = loadPersistedForms();
    const thirdLoad = loadPersistedForms();

    expect(firstLoad.length).toBe(1);
    expect(secondLoad.length).toBe(1);
    expect(thirdLoad.length).toBe(1);
  });

  it('10. Preserves user profile credentials, name, email, and avatar in workspace storage', () => {
    const customWorkspace: Workspace = {
      id: 'ws-custom',
      name: 'Custom Team Workspace',
      logo: '🚀',
      plan: 'pro',
      members: [
        {
          id: 'usr-custom',
          name: 'Aryan Pandey',
          email: 'aryan@specathongradient.io',
          avatar: 'https://images.unsplash.com/custom-pfp.jpg',
          role: 'owner',
          status: 'active',
          joinedAt: '2026-08-01T10:00:00Z'
        }
      ]
    };

    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(customWorkspace));
    const loaded = loadPersistedWorkspace();
    expect(loaded.name).toBe('Custom Team Workspace');
    expect(loaded.members[0].name).toBe('Aryan Pandey');
    expect(loaded.members[0].email).toBe('aryan@specathongradient.io');
    expect(loaded.members[0].avatar).toBe('https://images.unsplash.com/custom-pfp.jpg');
  });

  it('11. Preserves response records and associations with their forms', () => {
    const mockResponses: FormResponse[] = [
      {
        id: 'resp-1',
        formId: 'form-specathon-2026',
        submittedAt: new Date().toISOString(),
        respondentEmail: 'participant@specathon.io',
        respondentName: 'Alex Participant',
        timeSpentSeconds: 45,
        answers: { 'q-1': 'AI Wizards' }
      }
    ];

    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(mockResponses));
    const loaded = loadPersistedResponses();
    expect(loaded.length).toBe(1);
    expect(loaded[0].formId).toBe('form-specathon-2026');
    expect(loaded[0].respondentEmail).toBe('participant@specathon.io');
  });

  it('12. ensureFormDefaults preserves branching, accessType, expiry, and question properties', () => {
    const rawForm: Form = {
      id: 'form-detailed',
      title: 'Branching & Expiry Form',
      description: 'Test descriptions',
      isPublished: true,
      status: 'published',
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-02T10:00:00Z',
      responseCount: 3,
      workspaceId: 'ws-1',
      authorName: 'Aryan',
      authorAvatar: '',
      sections: [{ id: 's1', title: 'Section 1' }, { id: 's2', title: 'Section 2' }],
      questions: [
        {
          id: 'q-branch',
          sectionId: 's1',
          type: 'multiple_choice',
          title: 'Branching Question',
          required: true,
          enableBranching: true,
          options: [{ id: 'opt-1', label: 'Route to Sec 2', destinationSectionId: 's2' }]
        }
      ],
      theme: { id: 't', name: 'Default', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
      settings: {
        accessType: 'private',
        expiresAt: '2026-10-01T00:00:00.000Z',
        expiryMessage: 'Expired deadline',
        collectEmail: true,
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
      versions: []
    };

    const normalized = ensureFormDefaults(rawForm);
    expect(normalized.settings.accessType).toBe('private');
    expect(normalized.settings.expiresAt).toBe('2026-10-01T00:00:00.000Z');
    expect(normalized.questions[0].enableBranching).toBe(true);
    expect(normalized.questions[0].options![0].destinationSectionId).toBe('s2');
  });
});
