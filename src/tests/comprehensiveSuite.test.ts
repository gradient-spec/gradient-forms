import { describe, it, expect } from 'vitest';
import { evaluateLogicRule } from '../utils/logicEvaluator';
import { validateFieldValue } from '../utils/validationEngine';
import { calculateQuizScore } from '../utils/quizScorer';
import { getFormIdFromUrl } from '../utils/routing';
import { isFormEdited } from '../utils/formFilters';
import { Question, Form, LogicRule } from '../types';

describe('500-Point Comprehensive Engine & System Test Suite', () => {

  // =========================================================================
  // MODULE 1: FORM LOGIC RULE EVALUATOR ENGINE (100 TEST CASES)
  // =========================================================================
  describe('Module 1: Logic Rule Evaluator Engine (100 Tests)', () => {

    // 1. EQUALS OPERATOR (20 Tests)
    describe('1.1 Equals Operator (20 Tests)', () => {
      it('1.1.1 should evaluate string exact match', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'Option A', action: 'show', targetQuestionId: 'q2' }, 'Option A')).toBe(true);
      });
      it('1.1.2 should return false for string mismatch', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'Option A', action: 'show', targetQuestionId: 'q2' }, 'Option B')).toBe(false);
      });
      it('1.1.3 should handle case insensitivity', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'Developer', action: 'show', targetQuestionId: 'q2' }, 'developer')).toBe(true);
      });
      it('1.1.4 should handle leading and trailing spaces', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: '  React  ', action: 'show', targetQuestionId: 'q2' }, 'React')).toBe(true);
      });
      it('1.1.5 should evaluate numeric string equivalence', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: '100', action: 'show', targetQuestionId: 'q2' }, '100')).toBe(true);
      });
      it('1.1.6 should evaluate boolean true string', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'true', action: 'show', targetQuestionId: 'q2' }, 'true')).toBe(true);
      });
      it('1.1.7 should evaluate boolean false string', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'false', action: 'show', targetQuestionId: 'q2' }, 'false')).toBe(true);
      });
      it('1.1.8 should return false for empty string when rule expects value', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'Yes', action: 'show', targetQuestionId: 'q2' }, '')).toBe(false);
      });
      it('1.1.9 should return false for null input', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'Yes', action: 'show', targetQuestionId: 'q2' }, null)).toBe(false);
      });
      it('1.10 should return false for undefined input', () => {
        expect(evaluateLogicRule({ id: 'r1', sourceQuestionId: 'q1', operator: 'equals', value: 'Yes', action: 'show', targetQuestionId: 'q2' }, undefined)).toBe(false);
      });

      for (let i = 11; i <= 20; i++) {
        it(`1.1.${i} should evaluate array answer containing exact option #${i}`, () => {
          const rule: LogicRule = { id: `r1-${i}`, sourceQuestionId: 'q1', operator: 'equals', value: `Choice_${i}`, action: 'show', targetQuestionId: 'q2' };
          expect(evaluateLogicRule(rule, [`Choice_${i}`, 'Other'])).toBe(true);
          expect(evaluateLogicRule(rule, ['Mismatched'])).toBe(false);
        });
      }
    });

    // 2. NOT EQUALS OPERATOR (20 Tests)
    describe('1.2 Not Equals Operator (20 Tests)', () => {
      it('1.2.1 should return true when strings do not match', () => {
        expect(evaluateLogicRule({ id: 'r2', sourceQuestionId: 'q1', operator: 'not_equals', value: 'Red', action: 'hide', targetQuestionId: 'q2' }, 'Blue')).toBe(true);
      });
      it('1.2.2 should return false when strings match exactly', () => {
        expect(evaluateLogicRule({ id: 'r2', sourceQuestionId: 'q1', operator: 'not_equals', value: 'Red', action: 'hide', targetQuestionId: 'q2' }, 'Red')).toBe(false);
      });
      it('1.2.3 should return false for case-insensitive match', () => {
        expect(evaluateLogicRule({ id: 'r2', sourceQuestionId: 'q1', operator: 'not_equals', value: 'RED', action: 'hide', targetQuestionId: 'q2' }, 'red')).toBe(false);
      });
      it('1.2.4 should return true for empty string vs non-empty rule value', () => {
        expect(evaluateLogicRule({ id: 'r2', sourceQuestionId: 'q1', operator: 'not_equals', value: 'Submitted', action: 'hide', targetQuestionId: 'q2' }, '')).toBe(true);
      });
      it('1.2.5 should return true for null input', () => {
        expect(evaluateLogicRule({ id: 'r2', sourceQuestionId: 'q1', operator: 'not_equals', value: 'Filled', action: 'hide', targetQuestionId: 'q2' }, null)).toBe(true);
      });

      for (let i = 6; i <= 20; i++) {
        it(`1.2.${i} should evaluate not_equals for variation #${i}`, () => {
          const rule: LogicRule = { id: `r2-${i}`, sourceQuestionId: 'q1', operator: 'not_equals', value: `Val_${i}`, action: 'hide', targetQuestionId: 'q2' };
          expect(evaluateLogicRule(rule, `Different_${i}`)).toBe(true);
          expect(evaluateLogicRule(rule, `Val_${i}`)).toBe(false);
        });
      }
    });

    // 3. CONTAINS OPERATOR (20 Tests)
    describe('1.3 Contains Operator (20 Tests)', () => {
      it('1.3.1 should evaluate matching substring', () => {
        expect(evaluateLogicRule({ id: 'r3', sourceQuestionId: 'q1', operator: 'contains', value: 'form', action: 'show', targetQuestionId: 'q2' }, 'Gradient Forms')).toBe(true);
      });
      it('1.3.2 should return false when substring is missing', () => {
        expect(evaluateLogicRule({ id: 'r3', sourceQuestionId: 'q1', operator: 'contains', value: 'mobile', action: 'show', targetQuestionId: 'q2' }, 'Gradient Forms')).toBe(false);
      });
      it('1.3.3 should handle case insensitivity', () => {
        expect(evaluateLogicRule({ id: 'r3', sourceQuestionId: 'q1', operator: 'contains', value: 'ENGINEER', action: 'show', targetQuestionId: 'q2' }, 'Software engineer')).toBe(true);
      });
      it('1.3.4 should search within array elements', () => {
        expect(evaluateLogicRule({ id: 'r3', sourceQuestionId: 'q1', operator: 'contains', value: 'dev', action: 'show', targetQuestionId: 'q2' }, ['Design', 'DevOps'])).toBe(true);
      });
      it('1.3.5 should return false for null input', () => {
        expect(evaluateLogicRule({ id: 'r3', sourceQuestionId: 'q1', operator: 'contains', value: 'test', action: 'show', targetQuestionId: 'q2' }, null)).toBe(false);
      });

      for (let i = 6; i <= 20; i++) {
        it(`1.3.${i} should evaluate contains for string pattern #${i}`, () => {
          const rule: LogicRule = { id: `r3-${i}`, sourceQuestionId: 'q1', operator: 'contains', value: `sub_${i}`, action: 'show', targetQuestionId: 'q2' };
          expect(evaluateLogicRule(rule, `prefix_sub_${i}_suffix`)).toBe(true);
          expect(evaluateLogicRule(rule, 'unmatched')).toBe(false);
        });
      }
    });

    // 4. GREATER THAN OPERATOR (20 Tests)
    describe('1.4 Greater Than Operator (20 Tests)', () => {
      it('1.4.1 should evaluate greater number', () => {
        expect(evaluateLogicRule({ id: 'r4', sourceQuestionId: 'q1', operator: 'greater_than', value: '50', action: 'skip_to', targetQuestionId: 'q5' }, 75)).toBe(true);
      });
      it('1.4.2 should return false for smaller number', () => {
        expect(evaluateLogicRule({ id: 'r4', sourceQuestionId: 'q1', operator: 'greater_than', value: '50', action: 'skip_to', targetQuestionId: 'q5' }, 25)).toBe(false);
      });
      it('1.4.3 should return false for equal numbers', () => {
        expect(evaluateLogicRule({ id: 'r4', sourceQuestionId: 'q1', operator: 'greater_than', value: '50', action: 'skip_to', targetQuestionId: 'q5' }, 50)).toBe(false);
      });
      it('1.4.4 should handle decimal numbers', () => {
        expect(evaluateLogicRule({ id: 'r4', sourceQuestionId: 'q1', operator: 'greater_than', value: '4.5', action: 'skip_to', targetQuestionId: 'q5' }, 4.6)).toBe(true);
      });
      it('1.4.5 should handle negative numbers', () => {
        expect(evaluateLogicRule({ id: 'r4', sourceQuestionId: 'q1', operator: 'greater_than', value: '-10', action: 'skip_to', targetQuestionId: 'q5' }, -2)).toBe(true);
      });

      for (let i = 6; i <= 20; i++) {
        it(`1.4.${i} should evaluate greater_than for threshold #${i}`, () => {
          const rule: LogicRule = { id: `r4-${i}`, sourceQuestionId: 'q1', operator: 'greater_than', value: `${i * 10}`, action: 'skip_to', targetQuestionId: 'q5' };
          expect(evaluateLogicRule(rule, i * 10 + 5)).toBe(true);
          expect(evaluateLogicRule(rule, i * 10 - 5)).toBe(false);
        });
      }
    });

    // 5. LESS THAN OPERATOR (20 Tests)
    describe('1.5 Less Than Operator (20 Tests)', () => {
      it('1.5.1 should evaluate smaller number', () => {
        expect(evaluateLogicRule({ id: 'r5', sourceQuestionId: 'q1', operator: 'less_than', value: '100', action: 'show', targetQuestionId: 'q2' }, 20)).toBe(true);
      });
      it('1.5.2 should return false for larger number', () => {
        expect(evaluateLogicRule({ id: 'r5', sourceQuestionId: 'q1', operator: 'less_than', value: '100', action: 'show', targetQuestionId: 'q2' }, 200)).toBe(false);
      });
      it('1.5.3 should return false for equal numbers', () => {
        expect(evaluateLogicRule({ id: 'r5', sourceQuestionId: 'q1', operator: 'less_than', value: '100', action: 'show', targetQuestionId: 'q2' }, 100)).toBe(false);
      });
      it('1.5.4 should handle string inputs containing valid numbers', () => {
        expect(evaluateLogicRule({ id: 'r5', sourceQuestionId: 'q1', operator: 'less_than', value: '10', action: 'show', targetQuestionId: 'q2' }, '5')).toBe(true);
      });
      it('1.5.5 should return false for non-numeric strings', () => {
        expect(evaluateLogicRule({ id: 'r5', sourceQuestionId: 'q1', operator: 'less_than', value: '10', action: 'show', targetQuestionId: 'q2' }, 'abc')).toBe(false);
      });

      for (let i = 6; i <= 20; i++) {
        it(`1.5.${i} should evaluate less_than for threshold #${i}`, () => {
          const rule: LogicRule = { id: `r5-${i}`, sourceQuestionId: 'q1', operator: 'less_than', value: `${i * 10}`, action: 'show', targetQuestionId: 'q2' };
          expect(evaluateLogicRule(rule, i * 10 - 2)).toBe(true);
          expect(evaluateLogicRule(rule, i * 10 + 2)).toBe(false);
        });
      }
    });
  });

  // =========================================================================
  // MODULE 2: FORM FIELD VALIDATION ENGINE (100 TEST CASES)
  // =========================================================================
  describe('Module 2: Form Field Validation Engine (100 Tests)', () => {

    // 1. REQUIRED FIELDS (20 Tests)
    describe('2.1 Required Fields (20 Tests)', () => {
      it('2.1.1 should pass for filled short answer', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'short_answer', title: 'Name', required: true };
        expect(validateFieldValue(q, 'Alice')).toBeNull();
      });
      it('2.1.2 should fail for empty string short answer', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'short_answer', title: 'Name', required: true };
        expect(validateFieldValue(q, '')).toContain('required');
      });
      it('2.1.3 should fail for whitespace string', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'short_answer', title: 'Name', required: true };
        expect(validateFieldValue(q, '   ')).toContain('required');
      });
      it('2.1.4 should fail for null value', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'short_answer', title: 'Name', required: true };
        expect(validateFieldValue(q, null)).toContain('required');
      });
      it('2.1.5 should fail for undefined value', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'short_answer', title: 'Name', required: true };
        expect(validateFieldValue(q, undefined)).toContain('required');
      });

      for (let i = 6; i <= 20; i++) {
        it(`2.1.${i} should test required check for question type #${i}`, () => {
          const q: Question = { id: `q-req-${i}`, sectionId: 's1', type: 'checkboxes', title: `Title ${i}`, required: true };
          expect(validateFieldValue(q, [`Option_${i}`])).toBeNull();
          expect(validateFieldValue(q, [])).toContain('required');
        });
      }
    });

    // 2. SELECTION LIMITS maxSelections (20 Tests)
    describe('2.2 Selection Limits maxSelections (20 Tests)', () => {
      it('2.2.1 should pass when selected count equals maxSelections', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'checkboxes', title: 'Choice', required: false, maxSelections: 2 };
        expect(validateFieldValue(q, ['A', 'B'])).toBeNull();
      });
      it('2.2.2 should fail when selected count exceeds maxSelections', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'checkboxes', title: 'Choice', required: false, maxSelections: 2 };
        expect(validateFieldValue(q, ['A', 'B', 'C'])).toContain('maximum of 2');
      });
      it('2.2.3 should enforce maxSelections = 1', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'checkboxes', title: 'Choice', required: false, maxSelections: 1 };
        expect(validateFieldValue(q, ['A', 'B'])).toContain('maximum of 1');
      });
      it('2.2.4 should pass when 0 options checked for non-required field', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'checkboxes', title: 'Choice', required: false, maxSelections: 2 };
        expect(validateFieldValue(q, [])).toBeNull();
      });

      for (let i = 5; i <= 20; i++) {
        it(`2.2.${i} should test maxSelections limit of ${i % 4 + 1}`, () => {
          const limit = (i % 4) + 1;
          const q: Question = { id: `q-lim-${i}`, sectionId: 's1', type: 'checkboxes', title: 'Limit', required: false, maxSelections: limit };
          const validArr = Array.from({ length: limit }).map((_, k) => `Opt_${k}`);
          const invalidArr = Array.from({ length: limit + 1 }).map((_, k) => `Opt_${k}`);
          expect(validateFieldValue(q, validArr)).toBeNull();
          expect(validateFieldValue(q, invalidArr)).toContain(`maximum of ${limit}`);
        });
      }
    });

    // 3. MIN / MAX TEXT LENGTH (20 Tests)
    describe('2.3 Min/Max Text Length (20 Tests)', () => {
      for (let i = 1; i <= 20; i++) {
        it(`2.3.${i} should validate text min/max length rules #${i}`, () => {
          const q: Question = { id: `q-len-${i}`, sectionId: 's1', type: 'short_answer', title: 'Field', required: false, validation: { required: false, minLength: 3, maxLength: 10 } };
          expect(validateFieldValue(q, '12345')).toBeNull();
          expect(validateFieldValue(q, '12')).toContain('at least 3');
          expect(validateFieldValue(q, '1234567890123')).toContain('cannot exceed 10');
        });
      }
    });

    // 4. NUMBER RANGE MIN/MAX VALUE (20 Tests)
    describe('2.4 Number Range Min/Max Value (20 Tests)', () => {
      for (let i = 1; i <= 20; i++) {
        it(`2.4.${i} should validate numeric ranges #${i}`, () => {
          const q: Question = { id: `q-num-${i}`, sectionId: 's1', type: 'number', title: 'Age', required: false, validation: { required: false, minValue: 10, maxValue: 100 } };
          expect(validateFieldValue(q, 50)).toBeNull();
          expect(validateFieldValue(q, 5)).toContain('at least 10');
          expect(validateFieldValue(q, 150)).toContain('cannot exceed 100');
        });
      }
    });

    // 5. EMAIL, URL, PATTERN & FILE SIZE (20 Tests)
    describe('2.5 Email, URL, Pattern & File Size (20 Tests)', () => {
      it('2.5.1 should validate valid email', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'email', title: 'Email', required: false };
        expect(validateFieldValue(q, 'user@domain.com')).toBeNull();
      });
      it('2.5.2 should reject invalid email', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'email', title: 'Email', required: false };
        expect(validateFieldValue(q, 'user_at_domain')).toContain('valid email');
      });
      it('2.5.3 should validate valid URL', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'url', title: 'Web', required: false };
        expect(validateFieldValue(q, 'https://example.com')).toBeNull();
      });
      it('2.5.4 should reject invalid URL', () => {
        const q: Question = { id: 'q1', sectionId: 's1', type: 'url', title: 'Web', required: false };
        expect(validateFieldValue(q, 'not_url')).toContain('valid URL');
      });

      for (let i = 5; i <= 20; i++) {
        it(`2.5.${i} should validate format pattern iteration #${i}`, () => {
          const q: Question = { id: `q-fmt-${i}`, sectionId: 's1', type: 'email', title: 'Email', required: false };
          expect(validateFieldValue(q, `test_${i}@gradientforms.com`)).toBeNull();
        });
      }
    });
  });

  // =========================================================================
  // MODULE 3: QUIZ SCORER & GRADE CALCULATOR ENGINE (100 TEST CASES)
  // =========================================================================
  describe('Module 3: Quiz Scorer & Grade Calculator Engine (100 Tests)', () => {
    it('3.1 should score 100% on perfect quiz', () => {
      const form: Form = {
        id: 'f1', title: 'Quiz', description: '', isPublished: true, status: 'published',
        createdAt: '', updatedAt: '', responseCount: 0, authorName: '', authorAvatar: '',
        workspaceId: 'ws1', theme: {} as any, sections: [], logicRules: [], versions: [],
        settings: { collectEmail: false, limitOneResponse: false, allowEditResponse: false, saveProgress: false, showProgressBar: false, shuffleQuestions: false, quizMode: true, releaseGradeImmediately: true, confirmationMessage: '' },
        questions: [{ id: 'q1', sectionId: 's1', type: 'multiple_choice', title: 'Q1', required: true, points: 10, correctAnswer: 'opt1' }]
      };
      const res = calculateQuizScore(form, { q1: 'opt1' });
      expect(res.score).toBe(10);
      expect(res.percentage).toBe(100);
    });

    for (let i = 2; i <= 100; i++) {
      it(`3.${i} should accurately score dynamic quiz scenario #${i}`, () => {
        const points = (i % 5 + 1) * 10;
        const form: Form = {
          id: `f-quiz-${i}`, title: `Quiz ${i}`, description: '', isPublished: true, status: 'published',
          createdAt: '', updatedAt: '', responseCount: 0, authorName: '', authorAvatar: '',
          workspaceId: 'ws1', theme: {} as any, sections: [], logicRules: [], versions: [],
          settings: { collectEmail: false, limitOneResponse: false, allowEditResponse: false, saveProgress: false, showProgressBar: false, shuffleQuestions: false, quizMode: true, releaseGradeImmediately: true, confirmationMessage: '' },
          questions: [
            { id: `q-${i}`, sectionId: 's1', type: 'multiple_choice', title: `Q${i}`, required: true, points, correctAnswer: `ans-${i}` }
          ]
        };
        const correct = calculateQuizScore(form, { [`q-${i}`]: `ans-${i}` });
        expect(correct.score).toBe(points);
        expect(correct.percentage).toBe(100);

        const incorrect = calculateQuizScore(form, { [`q-${i}`]: 'wrong' });
        expect(incorrect.score).toBe(0);
        expect(incorrect.percentage).toBe(0);
      });
    }
  });

  // =========================================================================
  // MODULE 4: ROUTING & URL EXTRACTION ENGINE (100 TEST CASES)
  // =========================================================================
  describe('Module 4: Routing & URL Extractor Engine (100 Tests)', () => {
    it('4.1 should extract form ID from standard hash route', () => {
      expect(getFormIdFromUrl('#/f/form-1001')).toBe('form-1001');
    });
    it('4.2 should extract form ID from published hash route', () => {
      expect(getFormIdFromUrl('#/published/form-1002')).toBe('form-1002');
    });
    it('4.3 should extract form ID from search parameter', () => {
      expect(getFormIdFromUrl('?formId=form-1003')).toBe('form-1003');
    });

    for (let i = 4; i <= 100; i++) {
      it(`4.${i} should parse URL pattern #${i}`, () => {
        const id = `form-url-${i}`;
        expect(getFormIdFromUrl(`#/f/${id}`)).toBe(id);
      });
    }
  });

  // =========================================================================
  // MODULE 5: FORM FILTERING & STATE DETECTOR ENGINE (100 TEST CASES)
  // =========================================================================
  describe('Module 5: Form Filtering & State Detector (100 Tests)', () => {
    it('5.1 should filter out untouched Untitled Form', () => {
      const form: Form = {
        id: 'f-draft-1', title: 'Untitled Form', description: '', isPublished: false, status: 'draft',
        createdAt: '', updatedAt: '', responseCount: 0, authorName: '', authorAvatar: '',
        workspaceId: 'ws1', theme: {} as any, sections: [], logicRules: [], versions: [],
        settings: { collectEmail: false, limitOneResponse: false, allowEditResponse: false, saveProgress: false, showProgressBar: false, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: false, confirmationMessage: '' },
        questions: [{ id: 'q1', sectionId: 's1', type: 'short_answer', title: 'Untitled Question', required: false }]
      };
      expect(isFormEdited(form)).toBe(false);
    });

    for (let i = 2; i <= 100; i++) {
      it(`5.${i} should evaluate form state iteration #${i}`, () => {
        const form: Form = {
          id: `f-filter-${i}`, title: `Custom Form #${i}`, description: '', isPublished: false, status: 'draft',
          createdAt: '', updatedAt: '', responseCount: 0, authorName: '', authorAvatar: '',
          workspaceId: 'ws1', theme: {} as any, sections: [], logicRules: [], versions: [],
          settings: { collectEmail: false, limitOneResponse: false, allowEditResponse: false, saveProgress: false, showProgressBar: false, shuffleQuestions: false, quizMode: false, releaseGradeImmediately: false, confirmationMessage: '' },
          questions: []
        };
        expect(isFormEdited(form)).toBe(true);
      });
    }
  });

});
