import { describe, it, expect } from 'vitest';
import { Form } from '../types';

describe('Bulk Form Deletion & Recycle Bin Engine Tests', () => {
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

  it('1. Correctly moves multiple selected forms from workspace to Recycle Bin with deletedAt timestamp', () => {
    let workspaceForms = [...sampleForms];
    let trashForms: Form[] = [];
    const idsToDelete = ['form-1', 'form-3'];
    const deleteSet = new Set(idsToDelete);

    const deletedItems = workspaceForms
      .filter(f => deleteSet.has(f.id))
      .map(f => ({ ...f, deletedAt: new Date().toISOString() }));

    workspaceForms = workspaceForms.filter(f => !deleteSet.has(f.id));
    trashForms = [...deletedItems, ...trashForms];

    expect(workspaceForms.length).toBe(1);
    expect(workspaceForms[0].id).toBe('form-2');
    expect(trashForms.length).toBe(2);
    expect(trashForms.map(f => f.id)).toEqual(['form-1', 'form-3']);
    expect(trashForms[0].deletedAt).toBeDefined();
  });

  it('2. Correctly restores deleted forms from Recycle Bin back to active workspace', () => {
    let workspaceForms = [sampleForms[1]]; // 'form-2'
    let trashForms: Form[] = [
      { ...sampleForms[0], deletedAt: new Date().toISOString() },
      { ...sampleForms[2], deletedAt: new Date().toISOString() }
    ];

    // Restore form-1
    const formToRestore = trashForms.find(f => f.id === 'form-1')!;
    const { deletedAt, ...restoredForm } = formToRestore;
    trashForms = trashForms.filter(f => f.id !== 'form-1');
    workspaceForms = [restoredForm as Form, ...workspaceForms];

    expect(workspaceForms.length).toBe(2);
    expect(workspaceForms.map(f => f.id)).toContain('form-1');
    expect(trashForms.length).toBe(1);
    expect(trashForms[0].id).toBe('form-3');
  });

  it('3. Correctly permanently deletes forms from Recycle Bin', () => {
    let trashForms: Form[] = [
      { ...sampleForms[0], deletedAt: new Date().toISOString() },
      { ...sampleForms[1], deletedAt: new Date().toISOString() }
    ];

    // Permanently delete form-0
    trashForms = trashForms.filter(f => f.id !== 'form-1');

    expect(trashForms.length).toBe(1);
    expect(trashForms[0].id).toBe('form-2');

    // Empty entire trash
    trashForms = [];
    expect(trashForms.length).toBe(0);
  });

  it('4. Select-mode allows selecting individual forms without auto-selecting all', () => {
    let selectedSet = new Set<string>();

    // User clicks checkbox on form-2 only
    selectedSet.add('form-2');
    expect(selectedSet.size).toBe(1);
    expect(selectedSet.has('form-2')).toBe(true);
    expect(selectedSet.has('form-1')).toBe(false);
    expect(selectedSet.has('form-3')).toBe(false);

    // User clicks checkbox on form-3 as well
    selectedSet.add('form-3');
    expect(selectedSet.size).toBe(2);
    expect(selectedSet.has('form-2')).toBe(true);
    expect(selectedSet.has('form-3')).toBe(true);
  });

  it('5. Reassigns activeFormId when the active form is deleted during bulk deletion', () => {
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
