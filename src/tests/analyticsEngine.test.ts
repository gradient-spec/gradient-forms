import { describe, it, expect } from 'vitest';
import { Form, FormResponse, Question } from '../types';
import {
  computeAnalyticsOverview,
  computeQuestionAnalytics,
  computeSectionAnalytics,
  computeQuizAnalytics,
  computeTrendAnalytics,
  computeKeyInsights,
  KeyInsight,
  formatDuration
} from '../utils/analyticsEngine';

describe('Analytics Engine & Calculations', () => {
  const sampleForm: Form = {
    id: 'test-form-1',
    title: 'Employee Satisfaction Survey',
    description: 'Annual employee feedback survey',
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
      backgroundColor: '#0B0F14',
      cardStyle: 'bordered',
      fontFamily: 'Inter',
      borderRadius: 'lg'
    },
    logicRules: [],
    versions: [],
    sections: [
      { id: 'sec-1', title: 'Work Environment' },
      { id: 'sec-2', title: 'Compensation & Growth' }
    ],
    settings: {
      collectEmail: true,
      limitOneResponse: false,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: true,
      releaseGradeImmediately: false,
      confirmationMessage: 'Thanks for your feedback!'
    },
    questions: [
      {
        id: 'q-mc',
        sectionId: 'sec-1',
        type: 'multiple_choice',
        title: 'How satisfied are you with our remote work policy?',
        required: true,
        options: [
          { id: 'opt-1', label: 'Very Satisfied' },
          { id: 'opt-2', label: 'Satisfied' },
          { id: 'opt-3', label: 'Neutral' },
          { id: 'opt-4', label: 'Dissatisfied' }
        ],
        correctAnswer: 'opt-1',
        points: 10
      },
      {
        id: 'q-cb',
        sectionId: 'sec-1',
        type: 'checkboxes',
        title: 'Which perks do you utilize?',
        required: false,
        options: [
          { id: 'p-1', label: 'Health Insurance' },
          { id: 'p-2', label: 'Gym Subsidy' },
          { id: 'p-3', label: 'Learning Stipend' }
        ]
      },
      {
        id: 'q-rate',
        sectionId: 'sec-2',
        type: 'rating',
        title: 'Rate your manager support',
        required: true,
        ratingMax: 5
      },
      {
        id: 'q-num',
        sectionId: 'sec-2',
        type: 'number',
        title: 'Years at company',
        required: false
      },
      {
        id: 'q-txt',
        sectionId: 'sec-2',
        type: 'paragraph',
        title: 'Any additional suggestions?',
        required: false
      }
    ]
  };

  const sampleResponses: FormResponse[] = [
    {
      id: 'resp-1',
      formId: 'test-form-1',
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      timeSpentSeconds: 120,
      respondentEmail: 'alice@company.com',
      respondentName: 'Alice Smith',
      score: 10,
      maxScore: 10,
      answers: {
        'q-mc': 'opt-1',
        'q-cb': ['p-1', 'p-3'],
        'q-rate': 5,
        'q-num': 3,
        'q-txt': 'Great culture and autonomy.'
      }
    },
    {
      id: 'resp-2',
      formId: 'test-form-1',
      submittedAt: new Date(Date.now() - 7200000).toISOString(),
      timeSpentSeconds: 60,
      respondentEmail: 'bob@company.com',
      respondentName: 'Bob Jones',
      score: 0,
      maxScore: 10,
      answers: {
        'q-mc': 'opt-2',
        'q-cb': ['p-1'],
        'q-rate': 4,
        'q-num': 5,
        'q-txt': 'More social events would be nice.'
      }
    },
    {
      id: 'resp-3',
      formId: 'test-form-1',
      submittedAt: new Date(Date.now() - 10800000).toISOString(),
      timeSpentSeconds: 90,
      respondentEmail: 'charlie@company.com',
      respondentName: 'Charlie Brown',
      score: 10,
      maxScore: 10,
      answers: {
        'q-mc': 'opt-1',
        'q-cb': ['p-2'],
        'q-rate': 3,
        'q-num': 1
        // q-txt skipped
      }
    }
  ];

  // 1. DURATION FORMATTING
  describe('1. Duration Formatter', () => {
    it('should format seconds into human readable duration', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(-10)).toBe('0s');
    });
  });

  // 2. OVERVIEW METRICS
  describe('2. Overview Metrics Calculation', () => {
    it('should compute overview metrics accurately with responses', () => {
      const overview = computeAnalyticsOverview(sampleForm, sampleResponses);

      expect(overview.totalResponses).toBe(3);
      expect(overview.completionRate).toBe(100);
      expect(overview.avgTimeSpentSeconds).toBe(90); // (120 + 60 + 90) / 3 = 90
      expect(overview.avgTimeSpentFormatted).toBe('1m 30s');
      expect(overview.activeQuestionsCount).toBe(5);
      expect(overview.sectionsCount).toBe(2);
      expect(overview.lastResponseAt).toBeTruthy();
    });

    it('should handle zero responses safely without NaN or crash', () => {
      const overview = computeAnalyticsOverview(sampleForm, []);

      expect(overview.totalResponses).toBe(0);
      expect(overview.completionRate).toBe(0);
      expect(overview.avgTimeSpentSeconds).toBe(0);
      expect(overview.avgTimeSpentFormatted).toBe('0s');
      expect(overview.lastResponseAt).toBeNull();
    });
  });

  // 3. QUESTION ANALYTICS
  describe('3. Question Analytics Engine', () => {
    it('should compute multiple choice option breakdown', () => {
      const qAnalytics = computeQuestionAnalytics(sampleForm, sampleResponses);
      const mc = qAnalytics.find(q => q.questionId === 'q-mc');

      expect(mc).toBeDefined();
      expect(mc?.answeredCount).toBe(3);
      expect(mc?.skippedCount).toBe(0);
      expect(mc?.responseRate).toBe(100);
      expect(mc?.optionsStats).toBeDefined();

      const opt1 = mc?.optionsStats?.find(o => o.id === 'opt-1');
      const opt2 = mc?.optionsStats?.find(o => o.id === 'opt-2');
      expect(opt1?.count).toBe(2);
      expect(opt1?.percentage).toBe(67);
      expect(opt2?.count).toBe(1);
      expect(opt2?.percentage).toBe(33);
    });

    it('should compute checkboxes multi-select frequencies', () => {
      const qAnalytics = computeQuestionAnalytics(sampleForm, sampleResponses);
      const cb = qAnalytics.find(q => q.questionId === 'q-cb');

      expect(cb).toBeDefined();
      expect(cb?.answeredCount).toBe(3);
      const p1 = cb?.optionsStats?.find(o => o.id === 'p-1');
      expect(p1?.count).toBe(2); // alice and bob checked p-1
      expect(p1?.percentage).toBe(67);
    });

    it('should compute rating distribution and average score', () => {
      const qAnalytics = computeQuestionAnalytics(sampleForm, sampleResponses);
      const ratingQ = qAnalytics.find(q => q.questionId === 'q-rate');

      expect(ratingQ).toBeDefined();
      expect(ratingQ?.averageRating).toBe(4); // (5 + 4 + 3) / 3 = 4.0
      expect(ratingQ?.ratingDistribution?.length).toBe(5);
    });

    it('should compute numeric stats (min, max, average, median)', () => {
      const qAnalytics = computeQuestionAnalytics(sampleForm, sampleResponses);
      const numQ = qAnalytics.find(q => q.questionId === 'q-num');

      expect(numQ).toBeDefined();
      expect(numQ?.numericSummary?.min).toBe(1);
      expect(numQ?.numericSummary?.max).toBe(5);
      expect(numQ?.numericSummary?.average).toBe(3); // (3 + 5 + 1) / 3 = 3
      expect(numQ?.numericSummary?.median).toBe(3);
    });

    it('should collect text answers with respondent attribution', () => {
      const qAnalytics = computeQuestionAnalytics(sampleForm, sampleResponses);
      const txtQ = qAnalytics.find(q => q.questionId === 'q-txt');

      expect(txtQ).toBeDefined();
      expect(txtQ?.answeredCount).toBe(2);
      expect(txtQ?.skippedCount).toBe(1);
      expect(txtQ?.responseRate).toBe(67);
      expect(txtQ?.textAnswers?.length).toBe(2);
      expect(txtQ?.textAnswers?.[0].respondent).toBe('alice@company.com');
      expect(txtQ?.textAnswers?.[0].answer).toBe('Great culture and autonomy.');
    });
  });

  // 4. MULTI-SECTION FUNNEL & DROP-OFF
  describe('4. Section Analytics & Drop-off Funnel', () => {
    it('should compute section completion rates and progression', () => {
      const funnel = computeSectionAnalytics(sampleForm, sampleResponses);

      expect(funnel.length).toBe(2);
      expect(funnel[0].sectionNumber).toBe(1);
      expect(funnel[0].completedCount).toBe(3);
      expect(funnel[0].completionRate).toBe(100);
      expect(funnel[1].completedCount).toBe(3);
      expect(funnel[1].dropOffRate).toBe(0);
    });
  });

  // 5. QUIZ ANALYTICS
  describe('5. Quiz Analytics Suite', () => {
    it('should calculate quiz scores and question accuracy when quizMode is on', () => {
      const quiz = computeQuizAnalytics(sampleForm, sampleResponses);

      expect(quiz).not.toBeNull();
      expect(quiz?.totalGradedSubmissions).toBe(3);
      expect(quiz?.averageScore).toBe(6.7); // (10 + 0 + 10) / 3 = 6.666... -> 6.7
      expect(quiz?.highestScore).toBe(10);
      expect(quiz?.lowestScore).toBe(0);
      expect(quiz?.questionAccuracy.length).toBe(1);
      expect(quiz?.questionAccuracy[0].correctCount).toBe(2);
      expect(quiz?.questionAccuracy[0].accuracyRate).toBe(67);
    });

    it('should return null when quizMode is disabled', () => {
      const normalForm = {
        ...sampleForm,
        settings: { ...sampleForm.settings, quizMode: false }
      };
      const quiz = computeQuizAnalytics(normalForm, sampleResponses);
      expect(quiz).toBeNull();
    });
  });

  // 6. TRENDS AGGREGATION
  describe('6. Trends Aggregator', () => {
    it('should generate daily trend points for active window', () => {
      const dailyTrend = computeTrendAnalytics(sampleForm, sampleResponses, '7d', 'daily');

      expect(dailyTrend.length).toBe(7);
      const totalResponsesInTrend = dailyTrend.reduce((acc, p) => acc + p.responses, 0);
      expect(totalResponsesInTrend).toBe(3);
    });

    it('should generate weekly trend points', () => {
      const weeklyTrend = computeTrendAnalytics(sampleForm, sampleResponses, '30d', 'weekly');
      expect(weeklyTrend.length).toBe(8);
    });

    it('should generate monthly trend points', () => {
      const monthlyTrend = computeTrendAnalytics(sampleForm, sampleResponses, 'all', 'monthly');
      expect(monthlyTrend.length).toBe(6);
    });
  });

  // 7. MATRIX & GRID HEATMAP
  describe('7. Matrix & Grid Heatmap Calculations', () => {
    it('should compute 2D matrix heatmap cell percentages and row averages', () => {
      const matrixForm: Form = {
        ...sampleForm,
        questions: [
          {
            id: 'q-matrix',
            sectionId: 'sec-1',
            type: 'matrix',
            title: 'Rate campus facilities',
            required: true,
            matrixRows: ['Library', 'Cafeteria'],
            matrixCols: ['Poor', 'Fair', 'Good', 'Excellent']
          }
        ]
      };

      const matrixResponses: FormResponse[] = [
        {
          id: 'r-1',
          formId: 'test-form-1',
          submittedAt: new Date().toISOString(),
          timeSpentSeconds: 60,
          answers: {
            'q-matrix': { Library: 'Good', Cafeteria: 'Fair' }
          }
        },
        {
          id: 'r-2',
          formId: 'test-form-1',
          submittedAt: new Date().toISOString(),
          timeSpentSeconds: 70,
          answers: {
            'q-matrix': { Library: 'Excellent', Cafeteria: 'Fair' }
          }
        }
      ];

      const res = computeQuestionAnalytics(matrixForm, matrixResponses);
      const matrixQ = res.find(q => q.questionId === 'q-matrix');

      expect(matrixQ?.matrixHeatmap).toBeDefined();
      expect(matrixQ?.matrixHeatmap?.length).toBe(2);
      expect(matrixQ?.matrixHeatmap?.[0].rowLabel).toBe('Library');
      expect(matrixQ?.matrixColLabels).toEqual(['Poor', 'Fair', 'Good', 'Excellent']);
    });
  });

  // 8. KEY INSIGHTS SYNTHESIS
  describe('8. Key Insights Synthesis', () => {
    it('should extract genuine key insights from response data', () => {
      const insights = computeKeyInsights(sampleForm, sampleResponses);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((i: KeyInsight) => i.id === 'ins-duration')).toBe(true);
      expect(insights.some((i: KeyInsight) => i.id === 'ins-rating')).toBe(true);
    });
  });
});
