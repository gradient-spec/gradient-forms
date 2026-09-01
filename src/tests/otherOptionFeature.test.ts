import { describe, it, expect } from 'vitest';
import { Form, Question, FormResponse } from '../types';
import { validateFieldValue } from '../utils/validationEngine';
import { computeQuestionAnalytics } from '../utils/analyticsEngine';
import { GoogleSheetsService } from '../services/googleSheetsService';

describe('Dropdown and Choice "Other" Custom Answer Feature Tests', () => {
  const dropdownQuestion: Question = {
    id: 'q-role',
    sectionId: 'sec-1',
    type: 'dropdown',
    title: 'What is your primary engineering domain?',
    required: true,
    allowOther: true,
    otherPlaceholder: 'Please specify your domain...',
    options: [
      { id: 'opt-frontend', label: 'Frontend Engineering' },
      { id: 'opt-backend', label: 'Backend Engineering' },
      { id: 'opt-ai', label: 'AI & Machine Learning' }
    ]
  };

  const sampleForm: Form = {
    id: 'form-domain-survey',
    title: 'Domain Survey',
    description: 'Engineering survey',
    isPublished: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 3,
    workspaceId: 'ws-1',
    authorName: 'Admin',
    authorAvatar: '',
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
    logicRules: [],
    versions: [],
    settings: {
      collectEmail: true,
      limitOneResponse: false,
      allowEditResponse: true,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: false,
      confirmationMessage: 'Thank you!'
    },
    sections: [{ id: 'sec-1', title: 'Main Section' }],
    questions: [dropdownQuestion]
  };

  describe('1. Field Validation for "Other..." Answers', () => {
    it('should pass validation when a predefined option is selected', () => {
      const error = validateFieldValue(dropdownQuestion, 'opt-frontend');
      expect(error).toBeNull();
    });

    it('should pass validation when a valid custom "Other: [Custom text]" is provided', () => {
      const error = validateFieldValue(dropdownQuestion, 'Other: Quantum Computing Specialist');
      expect(error).toBeNull();
    });

    it('should reject when "Other..." is selected but no custom text is entered for required question', () => {
      const errorOther = validateFieldValue(dropdownQuestion, '__other__');
      expect(errorOther).toContain('Please specify your custom answer');

      const errorEmptyOther = validateFieldValue(dropdownQuestion, 'Other:');
      expect(errorEmptyOther).toContain('Please specify your custom answer');

      const errorWhitespace = validateFieldValue(dropdownQuestion, 'Other:   ');
      expect(errorWhitespace).toContain('Please specify your custom answer');
    });

    it('should allow empty answer if question is optional', () => {
      const optionalQuestion: Question = { ...dropdownQuestion, required: false };
      const error = validateFieldValue(optionalQuestion, '');
      expect(error).toBeNull();
    });
  });

  describe('2. Analytics Aggregation for "Other" Options', () => {
    const responses: FormResponse[] = [
      {
        id: 'resp-1',
        formId: sampleForm.id,
        submittedAt: new Date().toISOString(),
        respondentEmail: 'alice@example.com',
        timeSpentSeconds: 45,
        answers: { 'q-role': 'opt-frontend' }
      },
      {
        id: 'resp-2',
        formId: sampleForm.id,
        submittedAt: new Date().toISOString(),
        respondentEmail: 'bob@example.com',
        timeSpentSeconds: 50,
        answers: { 'q-role': 'Other: Embedded Systems' }
      },
      {
        id: 'resp-3',
        formId: sampleForm.id,
        submittedAt: new Date().toISOString(),
        respondentEmail: 'carol@example.com',
        timeSpentSeconds: 35,
        answers: { 'q-role': 'Other: DevOps Architect' }
      }
    ];

    it('should aggregate "Other" custom answers in optionsStats', () => {
      const analytics = computeQuestionAnalytics(sampleForm, responses);
      expect(analytics).toHaveLength(1);

      const qStats = analytics[0];
      expect(qStats.answeredCount).toBe(3);
      expect(qStats.optionsStats).toBeDefined();

      const otherOptionStat = qStats.optionsStats?.find(o => o.id === '__other__');
      expect(otherOptionStat).toBeDefined();
      expect(otherOptionStat?.count).toBe(2);
      expect(otherOptionStat?.percentage).toBe(67); // 2 out of 3 = 67%
    });

    it('should collect custom other responses in textAnswers for inspection', () => {
      const analytics = computeQuestionAnalytics(sampleForm, responses);
      const qStats = analytics[0];

      expect(qStats.textAnswers).toBeDefined();
      expect(qStats.textAnswers).toHaveLength(2);
      expect(qStats.textAnswers?.some(t => t.answer === 'Other: Embedded Systems')).toBe(true);
      expect(qStats.textAnswers?.some(t => t.answer === 'Other: DevOps Architect')).toBe(true);
    });
  });

  describe('3. Spreadsheet Row Formatting for "Other" Custom Values', () => {
    it('should format predefined option with label and custom answer with full Other string', () => {
      const resp1: FormResponse = {
        id: 'resp-1',
        formId: sampleForm.id,
        submittedAt: '2026-08-29T10:00:00Z',
        respondentEmail: 'alice@example.com',
        respondentName: 'Alice',
        timeSpentSeconds: 60,
        answers: { 'q-role': 'opt-backend' }
      };

      const row1 = GoogleSheetsService.formatResponseRow(sampleForm, resp1);
      // Header: Timestamp, Respondent Email, Respondent Name, Completion Time (s), [Q title]
      expect(row1[4]).toBe('opt-backend');

      const resp2: FormResponse = {
        id: 'resp-2',
        formId: sampleForm.id,
        submittedAt: '2026-08-29T10:05:00Z',
        respondentEmail: 'bob@example.com',
        respondentName: 'Bob',
        timeSpentSeconds: 75,
        answers: { 'q-role': 'Other: Autonomous Vehicles Engineer' }
      };

      const row2 = GoogleSheetsService.formatResponseRow(sampleForm, resp2);
      expect(row2[4]).toBe('Other: Autonomous Vehicles Engineer');
    });
  });
});
