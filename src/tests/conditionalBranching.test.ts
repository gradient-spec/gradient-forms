import { describe, it, expect } from 'vitest';
import { Form, Section, Question } from '../types';
import {
  resolveNextSectionDestination,
  calculateReachablePath,
  detectBranchingLoops,
  validateBranchingIntegrity,
  getReachableQuestions,
  calculateBranchingProgress,
  ACTION_SUBMIT_FORM,
  ACTION_CONTINUE_NEXT
} from '../utils/branchingEngine';

describe('Conditional Section Routing / Branching Engine', () => {
  const sampleSections: Section[] = [
    { id: 'sec-1', title: 'Personal Information' },
    { id: 'sec-2', title: 'Artificial Intelligence' },
    { id: 'sec-3', title: 'Web Development' },
    { id: 'sec-4', title: 'Cybersecurity' },
    { id: 'sec-5', title: 'Final Feedback' }
  ];

  const baseForm: Form = {
    id: 'form-branch-test',
    title: 'Career Track Survey',
    description: 'Survey with conditional section paths',
    isPublished: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    workspaceId: 'ws-1',
    authorName: 'Aryan',
    authorAvatar: '',
    sections: sampleSections,
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
      collectEmail: false,
      limitOneResponse: false,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: false,
      confirmationMessage: 'Thank you for your submission!'
    },
    logicRules: [],
    versions: [],
    questions: [
      {
        id: 'q-track',
        sectionId: 'sec-1',
        type: 'multiple_choice',
        title: 'Which area are you interested in?',
        required: true,
        enableBranching: true,
        options: [
          { id: 'opt-ai', label: 'Artificial Intelligence', destinationSectionId: 'sec-2' },
          { id: 'opt-web', label: 'Web Development', destinationSectionId: 'sec-3' },
          { id: 'opt-sec', label: 'Cybersecurity', destinationSectionId: 'sec-4' },
          { id: 'opt-none', label: 'None of the above', destinationSectionId: ACTION_SUBMIT_FORM }
        ]
      },
      {
        id: 'q-ai-tool',
        sectionId: 'sec-2',
        type: 'multiple_choice',
        title: 'Preferred AI framework?',
        required: true,
        enableBranching: true,
        options: [
          { id: 'opt-pytorch', label: 'PyTorch', destinationSectionId: 'sec-5' },
          { id: 'opt-tf', label: 'TensorFlow', destinationSectionId: 'sec-5' }
        ]
      },
      {
        id: 'q-web-stack',
        sectionId: 'sec-3',
        type: 'multiple_choice',
        title: 'Preferred Frontend framework?',
        required: true,
        enableBranching: true,
        options: [
          { id: 'opt-react', label: 'React', destinationSectionId: 'sec-5' },
          { id: 'opt-vue', label: 'Vue', destinationSectionId: 'sec-5' }
        ]
      },
      {
        id: 'q-sec-tool',
        sectionId: 'sec-4',
        type: 'multiple_choice',
        title: 'Primary security focus?',
        required: true,
        options: [
          { id: 'opt-appsec', label: 'AppSec' },
          { id: 'opt-netsec', label: 'NetSec' }
        ]
      },
      {
        id: 'q-feedback',
        sectionId: 'sec-5',
        type: 'paragraph',
        title: 'Any final feedback?',
        required: false
      }
    ]
  };

  it('1. Resolves default sequential path when branching is not enabled', () => {
    const unbranchedForm: Form = {
      ...baseForm,
      questions: baseForm.questions.map(q => ({ ...q, enableBranching: false }))
    };

    const res1 = resolveNextSectionDestination(unbranchedForm, 'sec-1', {});
    expect(res1.destinationSectionId).toBe('sec-2');
    expect(res1.isBranch).toBe(false);

    const res2 = resolveNextSectionDestination(unbranchedForm, 'sec-2', {});
    expect(res2.destinationSectionId).toBe('sec-3');

    const resLast = resolveNextSectionDestination(unbranchedForm, 'sec-5', {});
    expect(resLast.destinationSectionId).toBe(ACTION_SUBMIT_FORM);
  });

  it('2. Resolves Multiple Choice conditional destination correctly', () => {
    // When AI selected -> Go to Section 2
    const resAI = resolveNextSectionDestination(baseForm, 'sec-1', { 'q-track': 'opt-ai' });
    expect(resAI.destinationSectionId).toBe('sec-2');
    expect(resAI.isBranch).toBe(true);

    // When Web Development selected -> Go to Section 3
    const resWeb = resolveNextSectionDestination(baseForm, 'sec-1', { 'q-track': 'opt-web' });
    expect(resWeb.destinationSectionId).toBe('sec-3');
    expect(resWeb.isBranch).toBe(true);

    // When matched by label instead of id
    const resLabel = resolveNextSectionDestination(baseForm, 'sec-1', { 'q-track': 'Cybersecurity' });
    expect(resLabel.destinationSectionId).toBe('sec-4');
  });

  it('3. Resolves Dropdown conditional destination correctly', () => {
    const dropdownForm: Form = {
      ...baseForm,
      questions: baseForm.questions.map(q =>
        q.id === 'q-track' ? { ...q, type: 'dropdown' as const } : q
      )
    };

    const res = resolveNextSectionDestination(dropdownForm, 'sec-1', { 'q-track': 'opt-web' });
    expect(res.destinationSectionId).toBe('sec-3');
    expect(res.isBranch).toBe(true);
  });

  it('4. Resolves terminal / Submit Form destination (__SUBMIT__)', () => {
    const resSubmit = resolveNextSectionDestination(baseForm, 'sec-1', { 'q-track': 'opt-none' });
    expect(resSubmit.destinationSectionId).toBe(ACTION_SUBMIT_FORM);
    expect(resSubmit.isBranch).toBe(true);
  });

  it('5. Computes dynamic reachable path accurately for different branches', () => {
    // Path for AI track: Sec 1 -> Sec 2 -> Sec 5
    const pathAI = calculateReachablePath(baseForm, {
      'q-track': 'opt-ai',
      'q-ai-tool': 'opt-pytorch'
    });
    expect(pathAI).toEqual(['sec-1', 'sec-2', 'sec-5']);

    // Path for Web track: Sec 1 -> Sec 3 -> Sec 5
    const pathWeb = calculateReachablePath(baseForm, {
      'q-track': 'opt-web',
      'q-web-stack': 'opt-react'
    });
    expect(pathWeb).toEqual(['sec-1', 'sec-3', 'sec-5']);

    // Path for Submit early: Sec 1 only
    const pathNone = calculateReachablePath(baseForm, {
      'q-track': 'opt-none'
    });
    expect(pathNone).toEqual(['sec-1']);
  });

  it('6. Reaching terminal section handles loop detection gracefully', () => {
    const loopingForm: Form = {
      ...baseForm,
      questions: [
        {
          id: 'q-loop-1',
          sectionId: 'sec-1',
          type: 'multiple_choice',
          title: 'Jump to 2',
          required: true,
          enableBranching: true,
          options: [{ id: 'o-1', label: 'Go 2', destinationSectionId: 'sec-2' }]
        },
        {
          id: 'q-loop-2',
          sectionId: 'sec-2',
          type: 'multiple_choice',
          title: 'Jump to 1',
          required: true,
          enableBranching: true,
          options: [{ id: 'o-2', label: 'Go 1', destinationSectionId: 'sec-1' }]
        }
      ]
    };

    const loopResult = detectBranchingLoops(loopingForm);
    expect(loopResult.hasLoop).toBe(true);
    expect(loopResult.error).toContain('creates a loop');

    // calculateReachablePath must not run indefinitely
    const safePath = calculateReachablePath(loopingForm, {
      'q-loop-1': 'o-1',
      'q-loop-2': 'o-2'
    });
    expect(safePath).toEqual(['sec-1', 'sec-2']);
  });

  it('7. Handles deleted destination section gracefully without crashing', () => {
    const brokenDestForm: Form = {
      ...baseForm,
      questions: [
        {
          id: 'q-broken',
          sectionId: 'sec-1',
          type: 'multiple_choice',
          title: 'Deleted destination',
          required: true,
          enableBranching: true,
          options: [
            { id: 'opt-dead', label: 'Dead link', destinationSectionId: 'sec-deleted-999' }
          ]
        }
      ]
    };

    const res = resolveNextSectionDestination(brokenDestForm, 'sec-1', { 'q-broken': 'opt-dead' });
    // Falls back safely to next sequential section
    expect(res.destinationSectionId).toBe('sec-2');
    expect(res.isBranch).toBe(false);

    const integrity = validateBranchingIntegrity(brokenDestForm);
    expect(integrity.warnings.length).toBeGreaterThan(0);
  });

  it('8. Preserves routing when sections are reordered due to stable IDs', () => {
    const reorderedSections: Section[] = [
      { id: 'sec-1', title: 'Personal Information' },
      { id: 'sec-5', title: 'Final Feedback' },
      { id: 'sec-3', title: 'Web Development' },
      { id: 'sec-2', title: 'Artificial Intelligence' },
      { id: 'sec-4', title: 'Cybersecurity' }
    ];

    const reorderedForm: Form = {
      ...baseForm,
      sections: reorderedSections
    };

    // Selecting AI still routes to sec-2 even though sec-5 is physically next
    const resAI = resolveNextSectionDestination(reorderedForm, 'sec-1', { 'q-track': 'opt-ai' });
    expect(resAI.destinationSectionId).toBe('sec-2');
  });

  it('9. Reachable questions exclude questions from skipped sections', () => {
    // When respondent is on AI path: sec-1, sec-2, sec-5
    const reachable = getReachableQuestions(baseForm, {
      'q-track': 'opt-ai',
      'q-ai-tool': 'opt-pytorch'
    });

    const reachableQuestionIds = reachable.map(q => q.id);
    expect(reachableQuestionIds).toContain('q-track'); // sec-1
    expect(reachableQuestionIds).toContain('q-ai-tool'); // sec-2
    expect(reachableQuestionIds).toContain('q-feedback'); // sec-5

    // Skipped sections questions must NOT be in reachable questions
    expect(reachableQuestionIds).not.toContain('q-web-stack'); // sec-3
    expect(reachableQuestionIds).not.toContain('q-sec-tool'); // sec-4
  });

  it('10. Calculates progress bar percentage strictly over reachable questions', () => {
    // When respondent is in Section 2 having answered Section 1 (opt-ai):
    const progress1 = calculateBranchingProgress(baseForm, {
      'q-track': 'opt-ai'
    }, ['sec-1', 'sec-2']);
    expect(progress1.totalCount).toBe(2);
    expect(progress1.answeredCount).toBe(1);
    expect(progress1.progressPercent).toBe(50);

    // When respondent has answered both questions on the full AI path (sec-1, sec-2, sec-5):
    const progress2 = calculateBranchingProgress(baseForm, {
      'q-track': 'opt-ai',
      'q-ai-tool': 'opt-pytorch'
    });
    expect(progress2.totalCount).toBe(3);
    expect(progress2.answeredCount).toBe(2);
    expect(progress2.progressPercent).toBe(67);
  });

  it('11. Validates integrity: rejects multiple branching questions per section and checkboxes', () => {
    const invalidForm: Form = {
      ...baseForm,
      questions: [
        {
          id: 'q-mc-1',
          sectionId: 'sec-1',
          type: 'multiple_choice',
          title: 'Branching 1',
          required: true,
          enableBranching: true,
          options: [{ id: 'o-1', label: 'Opt 1' }]
        },
        {
          id: 'q-mc-2',
          sectionId: 'sec-1',
          type: 'multiple_choice',
          title: 'Branching 2',
          required: true,
          enableBranching: true,
          options: [{ id: 'o-2', label: 'Opt 2' }]
        },
        {
          id: 'q-chk',
          sectionId: 'sec-2',
          type: 'checkboxes',
          title: 'Checkbox Branching',
          required: true,
          enableBranching: true,
          options: [{ id: 'o-3', label: 'Opt 3' }]
        }
      ]
    };

    const integrity = validateBranchingIntegrity(invalidForm);
    expect(integrity.isValid).toBe(false);
    expect(integrity.errors.some(e => e.includes('multiple branching questions'))).toBe(true);
    expect(integrity.errors.some(e => e.includes('uses Checkboxes'))).toBe(true);
  });
});
