import { describe, it, expect, beforeEach } from 'vitest';
import { Form, FormResponse, IntegrationConfig } from '../types';
import { GoogleSheetsService } from '../services/googleSheetsService';

describe('Google Sheets Integration & "Open in Google Sheets" Engine', () => {
  const sampleForm: Form = {
    id: 'form-sheets-test',
    title: 'Customer Feedback Survey',
    description: 'Post-support satisfaction survey',
    isPublished: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 2,
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
    sections: [{ id: 'sec-1', title: 'Main Section' }],
    settings: {
      collectEmail: true,
      limitOneResponse: false,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: true,
      releaseGradeImmediately: true,
      confirmationMessage: 'Thanks!'
    },
    questions: [
      {
        id: 'q-service',
        sectionId: 'sec-1',
        type: 'multiple_choice',
        title: 'How was your support experience?',
        required: true,
        options: [
          { id: 'opt-great', label: 'Great' },
          { id: 'opt-poor', label: 'Poor' }
        ],
        correctAnswer: 'opt-great',
        points: 5
      },
      {
        id: 'q-notes',
        sectionId: 'sec-1',
        type: 'paragraph',
        title: 'Additional comments',
        required: false
      }
    ]
  };

  const sampleResponses: FormResponse[] = [
    {
      id: 'resp-sheets-1',
      formId: 'form-sheets-test',
      submittedAt: '2026-08-29T10:00:00Z',
      respondentEmail: 'user1@example.com',
      respondentName: 'User One',
      timeSpentSeconds: 45,
      score: 5,
      maxScore: 5,
      answers: {
        'q-service': 'opt-great',
        'q-notes': 'Super helpful agent!'
      }
    },
    {
      id: 'resp-sheets-2',
      formId: 'form-sheets-test',
      submittedAt: '2026-08-29T10:15:00Z',
      respondentEmail: 'user2@example.com',
      respondentName: 'User Two',
      timeSpentSeconds: 90,
      score: 0,
      maxScore: 5,
      answers: {
        'q-service': 'opt-poor',
        'q-notes': 'Long wait times.'
      }
    }
  ];

  const connectedIntegrations: IntegrationConfig = {
    googleSheets: {
      connected: true,
      spreadsheetId: '1abcXYZ987_CustomSheetId',
      sheetName: 'Customer_Feedback_Responses',
      lastSynced: 'Just now'
    },
    googleDrive: { connected: false },
    emailNotifications: { notifyOwner: true, sendRespondentReceipt: false },
    webhooks: { enabled: false }
  };

  const disconnectedIntegrations: IntegrationConfig = {
    googleSheets: {
      connected: false,
      spreadsheetId: undefined
    },
    googleDrive: { connected: false },
    emailNotifications: { notifyOwner: false, sendRespondentReceipt: false },
    webhooks: { enabled: false }
  };

  beforeEach(() => {
    GoogleSheetsService.clearSyncedCache();
  });

  // 1. SPREADSHEET URL GENERATION
  describe('1. Spreadsheet URL Generation', () => {
    it('should generate valid Google Sheets URL from a clean alphanumeric spreadsheet ID', () => {
      const url = GoogleSheetsService.getSpreadsheetUrl('1abcXYZ987_CustomSheetId');
      expect(url).toBe('https://docs.google.com/spreadsheets/d/1abcXYZ987_CustomSheetId/edit');
    });

    it('should safely extract and normalize URL if full Google Sheets URL was pasted', () => {
      const inputUrl = 'https://docs.google.com/spreadsheets/d/1abcXYZ987_CustomSheetId/edit#gid=0';
      const url = GoogleSheetsService.getSpreadsheetUrl(inputUrl);
      expect(url).toBe('https://docs.google.com/spreadsheets/d/1abcXYZ987_CustomSheetId/edit');
    });

    it('should filter out Google sample student roster ID and fallback to form sheets URL', () => {
      const url = GoogleSheetsService.getSpreadsheetUrl('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'form-test-123');
      expect(url).toContain('view=sheets&formId=form-test-123');
    });

    it('should return null or form sheets view for empty or invalid input', () => {
      expect(GoogleSheetsService.getSpreadsheetUrl('')).toBeNull();
      expect(GoogleSheetsService.getSpreadsheetUrl(undefined)).toBeNull();
      expect(GoogleSheetsService.getSpreadsheetUrl('   ')).toBeNull();
      expect(GoogleSheetsService.getSpreadsheetUrl('', 'form-test-123')).toContain('view=sheets&formId=form-test-123');
    });
  });

  // 2. HEADER AND ROW FORMATTING
  describe('2. Header & Row Transformation', () => {
    it('should generate headers matching form fields and metadata', () => {
      const headers = GoogleSheetsService.getHeaderRow(sampleForm);
      expect(headers).toContain('Timestamp');
      expect(headers).toContain('Respondent Email');
      expect(headers).toContain('Respondent Name');
      expect(headers).toContain('Completion Time (s)');
      expect(headers).toContain('Quiz Score');
      expect(headers).toContain('How was your support experience?');
      expect(headers).toContain('Additional comments');
    });

    it('should format responses into correct row values without data loss', () => {
      const row = GoogleSheetsService.formatResponseRow(sampleForm, sampleResponses[0]);
      expect(row[0]).toBe('2026-08-29T10:00:00Z');
      expect(row[1]).toBe('user1@example.com');
      expect(row[2]).toBe('User One');
      expect(row[3]).toBe(45);
      expect(row[4]).toBe(5); // quiz score
      expect(row[6]).toBe('opt-great');
      expect(row[7]).toBe('Super helpful agent!');
    });

    it('should generate valid Google Sheets =IMPORTDATA formula', () => {
      const formula = GoogleSheetsService.getImportDataFormula('form-test-123');
      expect(formula).toContain('=IMPORTDATA(');
      expect(formula).toContain('/api/v1/forms/form-test-123/export.csv');
    });

    it('should generate tab-separated values (TSV) table for instant Google Sheets pasting', () => {
      const tsv = GoogleSheetsService.getTableTSV(sampleForm, sampleResponses);
      expect(tsv).toContain('\t');
      expect(tsv).toContain('user1@example.com');
      expect(tsv).toContain('How was your support experience?');
    });
  });

  // 3. IDEMPOTENCY & DUPLICATE PREVENTION
  describe('3. Synchronization & Duplicate Protection', () => {
    it('should sync unsynced responses and mark them as synced', () => {
      const result = GoogleSheetsService.syncResponses(sampleForm, sampleResponses, connectedIntegrations);
      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(2);
      expect(result.alreadySyncedCount).toBe(0);
      expect(result.failedCount).toBe(0);
      expect(result.spreadsheetUrl).toContain('docs.google.com/spreadsheets/d');
    });

    it('should avoid duplicating responses when synced repeatedly (idempotency check)', () => {
      // First sync
      const firstSync = GoogleSheetsService.syncResponses(sampleForm, sampleResponses, connectedIntegrations);
      expect(firstSync.syncedCount).toBe(2);

      // Repeat sync immediately
      const secondSync = GoogleSheetsService.syncResponses(sampleForm, sampleResponses, connectedIntegrations);
      expect(secondSync.success).toBe(true);
      expect(secondSync.syncedCount).toBe(0); // 0 new rows appended!
      expect(secondSync.alreadySyncedCount).toBe(2); // 2 detected as already synced
    });

    it('should only append newly added responses on subsequent syncs', () => {
      // First sync with 2 responses
      GoogleSheetsService.syncResponses(sampleForm, sampleResponses, connectedIntegrations);

      // Add a third response
      const newResponse: FormResponse = {
        id: 'resp-sheets-3',
        formId: 'form-sheets-test',
        submittedAt: '2026-08-29T10:30:00Z',
        respondentEmail: 'user3@example.com',
        timeSpentSeconds: 30,
        answers: { 'q-service': 'opt-great' }
      };

      const updatedResponses = [...sampleResponses, newResponse];
      const subsequentSync = GoogleSheetsService.syncResponses(sampleForm, updatedResponses, connectedIntegrations);

      expect(subsequentSync.syncedCount).toBe(1); // exactly 1 new row!
      expect(subsequentSync.alreadySyncedCount).toBe(2);
    });
  });

  // 4. DISCONNECTED / UNCONFIGURED HANDLING
  describe('4. Disconnected State Handling', () => {
    it('should report failure and message when Google Sheets is not connected', () => {
      const result = GoogleSheetsService.syncResponses(sampleForm, sampleResponses, disconnectedIntegrations);
      expect(result.success).toBe(false);
      expect(result.syncedCount).toBe(0);
      expect(result.error).toContain("Google Sheets isn't connected to this form yet.");
    });
  });

  // 5. PERMISSION CHECKS
  describe('5. Workspace Permission Rules', () => {
    it('should allow all roles (owner, editor, viewer) to open connected sheet', () => {
      expect(GoogleSheetsService.checkPermission('owner', 'open')).toBe(true);
      expect(GoogleSheetsService.checkPermission('editor', 'open')).toBe(true);
      expect(GoogleSheetsService.checkPermission('viewer', 'open')).toBe(true);
    });

    it('should restrict connect and sync actions to owner and editor only', () => {
      expect(GoogleSheetsService.checkPermission('owner', 'connect')).toBe(true);
      expect(GoogleSheetsService.checkPermission('editor', 'connect')).toBe(true);
      expect(GoogleSheetsService.checkPermission('viewer', 'connect')).toBe(false);

      expect(GoogleSheetsService.checkPermission('owner', 'sync')).toBe(true);
      expect(GoogleSheetsService.checkPermission('editor', 'sync')).toBe(true);
      expect(GoogleSheetsService.checkPermission('viewer', 'sync')).toBe(false);
    });
  });
});
