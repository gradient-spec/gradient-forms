import { describe, it, expect } from 'vitest';
import { Form } from '../types';

describe('Bulk Form Deletion & Multi-Select Engine', () => {
  const sampleForms: Form[] = [
    {
      id: 'form-1',
      title: 'Survey 1',
      description: '',
      isPublished: true,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 2,
      workspaceId: 'ws-1',
      authorName: 'Aryan',
      authorAvatar: '',
      sections: [{ id: 's1', title: 'Sec 1' }],
      questions: [],
      theme: { id: 't1', name: 'Dark', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
      settings: { accessType: 'public', collectEmail: true, limitOneResponse: false, allowEditResponse: false, saveProgress: true, showProgressBar: true, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: true, confirmationMessage: 'Done' },
      logicRules: [],
      versions: []
    },
    {
      id: 'form-2',
      title: 'Survey 2',
      description: '',
      isPublished: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      workspaceId: 'ws-1',
      authorName: 'Aryan',
      authorAvatar: '',
      sections: [{ id: 's1', title: 'Sec 1' }],
      questions: [],
      theme: { id: 't1', name: 'Dark', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
      settings: { accessType: 'public', collectEmail: true, limitOneResponse: false, allowEditResponse: false, saveProgress: true, showProgressBar: true, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: true, confirmationMessage: 'Done' },
      logicRules: [],
      versions: []
    },
    {
      id: 'form-3',
      title: 'Survey 3',
      description: '',
      isPublished: true,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 5,
      workspaceId: 'ws-1',
      authorName: 'Aryan',
      authorAvatar: '',
      sections: [{ id: 's1', title: 'Sec 1' }],
      questions: [],
      theme: { id: 't1', name: 'Dark', primaryColor: '#2563EB', accentColor: '#38BDF8', backgroundColor: '#0B0F14', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'lg' },
      settings: { accessType: 'public', collectEmail: true, limitOneResponse: false, allowEditResponse: false, saveProgress: true, showProgressBar: true, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: true, confirmationMessage: 'Done' },
      logicRules: [],
      versions: []
    }
  ];

  it('1. Correctly removes multiple selected forms at once by ID', () => {
    const idsToDelete = ['form-1', 'form-3'];
    const deleteSet = new Set(idsToDelete);

    const remaining = sampleForms.filter(f => !deleteSet.has(f.id));

    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('form-2');
    expect(remaining[0].title).toBe('Survey 2');
  });

  it('2. Preserves all forms when deletion set is empty', () => {
    const idsToDelete: string[] = [];
    const deleteSet = new Set(idsToDelete);

    const remaining = sampleForms.filter(f => !deleteSet.has(f.id));

    expect(remaining.length).toBe(3);
    expect(remaining.map(f => f.id)).toEqual(['form-1', 'form-2', 'form-3']);
  });

  it('3. Select-all and Deselect-all toggles accurately update the selected IDs set', () => {
    const allIds = sampleForms.map(f => f.id);
    let selectedSet = new Set<string>();

    // Select All
    selectedSet = new Set(allIds);
    expect(selectedSet.size).toBe(3);
    expect(selectedSet.has('form-1')).toBe(true);
    expect(selectedSet.has('form-2')).toBe(true);
    expect(selectedSet.has('form-3')).toBe(true);

    // Deselect single
    selectedSet.delete('form-2');
    expect(selectedSet.size).toBe(2);
    expect(selectedSet.has('form-2')).toBe(false);

    // Clear / Deselect all
    selectedSet.clear();
    expect(selectedSet.size).toBe(0);
  });

  it('4. Reassigns activeFormId when the active form is deleted during bulk deletion', () => {
    let activeId: string | null = 'form-1';
    const idsToDelete = ['form-1', 'form-2'];
    const toDeleteSet = new Set(idsToDelete);

    const remaining = sampleForms.filter(f => !toDeleteSet.has(f.id));
    if (activeId && toDeleteSet.has(activeId)) {
      activeId = remaining.length > 0 ? remaining[0].id : null;
    }

    expect(activeId).toBe('form-3');
  });
});
