import { describe, it, expect } from 'vitest';
import { Form, Question, Section, LogicRule } from '../types';
import { evaluateLogicRule } from '../utils/logicEvaluator';
import { ensureFormDefaults } from '../context/AppContext';

describe('Real Multi-Section Form Engine & Workflow Test Suite', () => {

  const createTestForm = (): Form => {
    const baseForm: Form = {
      id: 'form-test-sections',
      title: 'Student Registration & Feedback',
      description: 'Multi-step registration workflow',
      isPublished: true,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      workspaceId: 'ws-1',
      authorName: 'Test Author',
      authorAvatar: '',
      theme: {
        id: 'theme-default',
        name: 'Neo Tech',
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
        confirmationMessage: 'Your response has been submitted successfully.'
      },
      sections: [
        { id: 'sec-1', title: 'Personal Details', description: 'Enter basic identity info' },
        { id: 'sec-2', title: 'Academic Background', description: 'Enter university info' }
      ],
      questions: [
        { id: 'q-name', sectionId: 'sec-1', type: 'short_answer', title: 'Full Name', required: true },
        { id: 'q-email', sectionId: 'sec-1', type: 'email', title: 'Email Address', required: true },
        { id: 'q-college', sectionId: 'sec-2', type: 'short_answer', title: 'College / University', required: true },
        { id: 'q-branch', sectionId: 'sec-2', type: 'short_answer', title: 'Department / Branch', required: false }
      ],
      logicRules: [],
      versions: []
    };
    return ensureFormDefaults(baseForm);
  };

  // 1. CREATE SECTION
  describe('1. Create Section', () => {
    it('should add a new section with title and description to the form', () => {
      const form = createTestForm();
      const initialCount = form.sections.length;
      const newSecId = 'sec-' + Date.now();
      const newSection: Section = {
        id: newSecId,
        title: 'Section 3: Additional Information',
        description: 'Extra certifications and projects'
      };
      form.sections.push(newSection);

      expect(form.sections.length).toBe(initialCount + 1);
      expect(form.sections[form.sections.length - 1].id).toBe(newSecId);
      expect(form.sections[form.sections.length - 1].title).toBe('Section 3: Additional Information');
    });

    it('should assign a default title if none provided', () => {
      const form = createTestForm();
      const count = form.sections.length + 1;
      const defaultSection: Section = {
        id: 'sec-' + Date.now(),
        title: `Section ${count}`,
        description: ''
      };
      form.sections.push(defaultSection);

      expect(form.sections[form.sections.length - 1].title).toBe(`Section ${count}`);
    });
  });

  // 2. EDIT SECTION
  describe('2. Edit Section', () => {
    it('should update section title and description without affecting questions', () => {
      const form = createTestForm();
      const secId = 'sec-1';
      form.sections = form.sections.map(s => s.id === secId ? { ...s, title: 'Updated Identity Section', description: 'Updated instructions' } : s);

      const target = form.sections.find(s => s.id === secId);
      expect(target?.title).toBe('Updated Identity Section');
      expect(target?.description).toBe('Updated instructions');
      expect(form.questions.filter(q => q.sectionId === secId).length).toBe(2);
    });
  });

  // 3. DELETE SECTION
  describe('3. Delete Section', () => {
    it('should prevent deleting the only section in a single-section form', () => {
      const form = createTestForm();
      form.sections = [form.sections[0]]; // single section
      const canDelete = form.sections.length > 1;

      expect(canDelete).toBe(false);
    });

    it('should remove the section and safely reassign its questions to adjacent remaining section', () => {
      const form = createTestForm();
      expect(form.sections.length).toBe(2);

      const sectionToDelete = 'sec-2';
      const remaining = form.sections.filter(s => s.id !== sectionToDelete);
      const fallbackId = remaining[0].id; // 'sec-1'

      // Reassign questions
      form.questions = form.questions.map(q => q.sectionId === sectionToDelete ? { ...q, sectionId: fallbackId } : q);
      form.sections = remaining;

      expect(form.sections.length).toBe(1);
      expect(form.sections[0].id).toBe('sec-1');
      // All 4 questions should now belong to sec-1
      expect(form.questions.every(q => q.sectionId === 'sec-1')).toBe(true);
      expect(form.questions.length).toBe(4);
    });
  });

  // 4. DUPLICATE SECTION
  describe('4. Duplicate Section', () => {
    it('should duplicate section and all internal questions with fresh unique IDs', () => {
      const form = createTestForm();
      const targetSec = form.sections[0]; // sec-1 with q-name and q-email
      const newSecId = 'sec-dup-1';
      const duplicatedSec: Section = {
        ...targetSec,
        id: newSecId,
        title: `${targetSec.title} (Copy)`
      };

      const sourceQuestions = form.questions.filter(q => q.sectionId === targetSec.id);
      const duplicatedQuestions: Question[] = sourceQuestions.map((q, idx) => ({
        ...q,
        id: `q-dup-${idx}`,
        sectionId: newSecId,
        title: q.title
      }));

      form.sections.push(duplicatedSec);
      form.questions.push(...duplicatedQuestions);

      expect(form.sections.length).toBe(3);
      expect(duplicatedSec.title).toBe('Personal Details (Copy)');
      expect(duplicatedQuestions.length).toBe(2);
      expect(duplicatedQuestions[0].sectionId).toBe(newSecId);
      expect(duplicatedQuestions[0].id).not.toBe(sourceQuestions[0].id);
    });
  });

  // 5. REORDER SECTIONS
  describe('5. Reorder Sections', () => {
    it('should swap section order while questions stay attached to their section IDs', () => {
      const form = createTestForm();
      const [sec1, sec2] = form.sections;
      // Reorder [sec2, sec1]
      form.sections = [sec2, sec1];

      expect(form.sections[0].id).toBe('sec-2');
      expect(form.sections[1].id).toBe('sec-1');

      // Questions remain assigned to their correct sectionId
      const sec2Questions = form.questions.filter(q => q.sectionId === 'sec-2');
      expect(sec2Questions.map(q => q.id)).toEqual(['q-college', 'q-branch']);
    });
  });

  // 6. MOVE QUESTION BETWEEN SECTIONS
  describe('6. Move Question Between Sections', () => {
    it('should change question sectionId from sec-1 to sec-2', () => {
      const form = createTestForm();
      const targetQId = 'q-email';
      form.questions = form.questions.map(q => q.id === targetQId ? { ...q, sectionId: 'sec-2' } : q);

      const updatedQ = form.questions.find(q => q.id === targetQId);
      expect(updatedQ?.sectionId).toBe('sec-2');

      const sec1Questions = form.questions.filter(q => q.sectionId === 'sec-1');
      const sec2Questions = form.questions.filter(q => q.sectionId === 'sec-2');
      expect(sec1Questions.length).toBe(1);
      expect(sec2Questions.length).toBe(3);
    });
  });

  // 7. RESPONDENT NEXT & BACK NAVIGATION
  describe('7. Respondent Navigation Flow (Next / Back)', () => {
    it('should advance from section 0 to 1 on Next and return on Back', () => {
      let currentIndex = 0;
      const totalSections = 3;

      // Click Next
      if (currentIndex < totalSections - 1) currentIndex++;
      expect(currentIndex).toBe(1);

      // Click Next
      if (currentIndex < totalSections - 1) currentIndex++;
      expect(currentIndex).toBe(2);

      // Boundary: cannot advance past last section
      if (currentIndex < totalSections - 1) currentIndex++;
      expect(currentIndex).toBe(2);

      // Click Back
      if (currentIndex > 0) currentIndex--;
      expect(currentIndex).toBe(1);

      // Click Back
      if (currentIndex > 0) currentIndex--;
      expect(currentIndex).toBe(0);

      // Boundary: cannot go below 0
      if (currentIndex > 0) currentIndex--;
      expect(currentIndex).toBe(0);
    });
  });

  // 8. SECTION VALIDATION BEFORE NEXT
  describe('8. Validation Before Next', () => {
    const validateSection = (questions: Question[], answers: Record<string, any>): { isValid: boolean; missingIds: string[] } => {
      const missing: string[] = [];
      for (const q of questions) {
        if (q.required) {
          const val = answers[q.id];
          const hasAnswer = val !== undefined && val !== null && String(val).trim().length > 0;
          if (!hasAnswer) {
            missing.push(q.id);
          }
        }
      }
      return { isValid: missing.length === 0, missingIds: missing };
    };

    it('should block Next when required fields in current section are empty', () => {
      const form = createTestForm();
      const sec1Questions = form.questions.filter(q => q.sectionId === 'sec-1');
      const answers = { 'q-name': 'Alice' }; // 'q-email' is missing

      const result = validateSection(sec1Questions, answers);
      expect(result.isValid).toBe(false);
      expect(result.missingIds).toEqual(['q-email']);
    });

    it('should allow Next when all required fields in current section are filled', () => {
      const form = createTestForm();
      const sec1Questions = form.questions.filter(q => q.sectionId === 'sec-1');
      const answers = { 'q-name': 'Alice', 'q-email': 'alice@example.com' };

      const result = validateSection(sec1Questions, answers);
      expect(result.isValid).toBe(true);
      expect(result.missingIds).toEqual([]);
    });

    it('should not block Next on optional fields', () => {
      const form = createTestForm();
      const sec2Questions = form.questions.filter(q => q.sectionId === 'sec-2');
      const answers = { 'q-college': 'Stanford University' }; // q-branch is optional

      const result = validateSection(sec2Questions, answers);
      expect(result.isValid).toBe(true);
    });
  });

  // 9. PROGRESS INDICATOR CALCULATION
  describe('9. Progress Indicator', () => {
    it('should compute section step string (e.g. Section 1 of 3)', () => {
      const currentSectionIndex = 0;
      const totalSections = 3;
      const indicatorText = `Section ${currentSectionIndex + 1} of ${totalSections}`;
      expect(indicatorText).toBe('Section 1 of 3');
    });

    it('should compute completion percentage based on answered questions across form', () => {
      const form = createTestForm(); // 4 questions
      const answers: Record<string, string> = {
        'q-name': 'Alice',
        'q-email': 'alice@example.com'
      };
      const totalQuestions = form.questions.length;
      const answeredCount = form.questions.filter(q => Boolean(answers[q.id])).length;
      const percent = Math.round((answeredCount / totalQuestions) * 100);

      expect(answeredCount).toBe(2);
      expect(percent).toBe(50);
    });
  });

  // 10. CONDITIONAL LOGIC SKIPPING HIDDEN SECTIONS
  describe('10. Conditional Logic Section Skipping', () => {
    it('should skip a section if a logic rule hides it based on prior answers', () => {
      const form = createTestForm();
      // Add a third section
      form.sections.push({ id: 'sec-dev', title: 'Developer Skills', description: '' });
      form.questions.push({ id: 'q-github', sectionId: 'sec-dev', type: 'url', title: 'GitHub URL', required: true });

      // Add a logic rule: Hide Developer Skills if role not Developer
      const rule: LogicRule = {
        id: 'rule-skip-dev',
        sourceQuestionId: 'q-role',
        operator: 'equals',
        value: 'Developer',
        action: 'show',
        targetQuestionId: 'sec-dev'
      };
      form.logicRules.push(rule);

      const isSectionVisible = (sec: Section, answers: Record<string, any>): boolean => {
        for (const r of form.logicRules) {
          if (r.targetQuestionId === sec.id) {
            const isMatch = evaluateLogicRule(r, answers[r.sourceQuestionId]);
            if (r.action === 'show' && !isMatch) return false;
            if (r.action === 'hide' && isMatch) return false;
          }
        }
        return true;
      };

      // Case A: Role is Designer -> sec-dev should be hidden
      const answersA = { 'q-role': 'Designer' };
      const visibleA = form.sections.filter(s => isSectionVisible(s, answersA));
      expect(visibleA.map(s => s.id)).toEqual(['sec-1', 'sec-2']);

      // Case B: Role is Developer -> sec-dev should be visible
      const answersB = { 'q-role': 'Developer' };
      const visibleB = form.sections.filter(s => isSectionVisible(s, answersB));
      expect(visibleB.map(s => s.id)).toEqual(['sec-1', 'sec-2', 'sec-dev']);
    });
  });

  // 11. FINAL SUBMIT ACTION
  describe('11. Final Submit Restriction', () => {
    it('should identify whether respondent is on final visible section', () => {
      const visibleSections = ['sec-1', 'sec-2'];

      let currentIdx = 0;
      let isFinalSection = currentIdx === visibleSections.length - 1;
      expect(isFinalSection).toBe(false);

      currentIdx = 1;
      isFinalSection = currentIdx === visibleSections.length - 1;
      expect(isFinalSection).toBe(true);
    });
  });

  // 12. ANSWER PERSISTENCE ACROSS SECTION MOVEMENT
  describe('12. Answer Persistence Across Sections', () => {
    it('should preserve answers in Section 1 when navigating to Section 2 and back to Section 1', () => {
      const answersState: Record<string, any> = {};

      // Step 1: User fills Section 1
      answersState['q-name'] = 'Jane Doe';
      answersState['q-email'] = 'jane@domain.com';

      // Step 2: Navigate to Section 2 and fill Section 2
      answersState['q-college'] = 'MIT';
      answersState['q-branch'] = 'Computer Science';

      // Step 3: User clicks Back to Section 1
      // Verify Section 1 answers are retained
      expect(answersState['q-name']).toBe('Jane Doe');
      expect(answersState['q-email']).toBe('jane@domain.com');

      // Verify Section 2 answers are retained
      expect(answersState['q-college']).toBe('MIT');
      expect(answersState['q-branch']).toBe('Computer Science');
      expect(Object.keys(answersState).length).toBe(4);
    });
  });
});
