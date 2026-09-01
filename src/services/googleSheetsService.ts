import { Form, FormResponse, IntegrationConfig, WorkspaceRole } from '../types';

export interface GoogleSheetsSyncResult {
  success: boolean;
  syncedCount: number;
  alreadySyncedCount: number;
  failedCount: number;
  lastSyncedAt: string;
  error?: string;
  spreadsheetUrl?: string;
}

export class GoogleSheetsService {
  /**
  /**
   * Returns internal live sheets route URL for the form
   */
  static getFormSheetsViewUrl(formId: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?view=sheets&formId=${encodeURIComponent(formId)}`;
    }
    return `/?view=sheets&formId=${encodeURIComponent(formId)}`;
  }

  /**
   * Safely formats and cleans a spreadsheet ID or full Google Sheets URL.
   * If not set or pointing to Google sample sheet, defaults to live form spreadsheet.
   */
  static getSpreadsheetUrl(spreadsheetIdOrUrl?: string, formId?: string): string | null {
    if (!spreadsheetIdOrUrl || typeof spreadsheetIdOrUrl !== 'string' || !spreadsheetIdOrUrl.trim()) {
      return formId ? this.getFormSheetsViewUrl(formId) : null;
    }

    const trimmed = spreadsheetIdOrUrl.trim();

    // Prevent opening Google's public sample student roster sheet
    if (trimmed === '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') {
      return formId ? this.getFormSheetsViewUrl(formId) : null;
    }

    // If it's already a full Google Sheets URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        if (match[1] === '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') {
          return formId ? this.getFormSheetsViewUrl(formId) : null;
        }
        return `https://docs.google.com/spreadsheets/d/${match[1]}/edit`;
      }
      return trimmed;
    }

    // Alphanumeric ID check
    const cleanId = trimmed.replace(/[^a-zA-Z0-9-_]/g, '');
    if (!cleanId || cleanId === '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') {
      return formId ? this.getFormSheetsViewUrl(formId) : null;
    }

    return `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
  }

  /**
   * Generates header row array corresponding to form fields
   */
  static getHeaderRow(form: Form): string[] {
    const baseHeaders = ['Timestamp', 'Respondent Email', 'Respondent Name', 'Completion Time (s)'];
    if (form.settings?.quizMode) {
      baseHeaders.push('Quiz Score', 'Max Score');
    }
    const questionHeaders = (form.questions || []).map(q => q.title || `Question ${q.id}`);
    return [...baseHeaders, ...questionHeaders];
  }

  /**
   * Formats an individual FormResponse into a spreadsheet row
   */
  static formatResponseRow(form: Form, response: FormResponse): (string | number)[] {
    const row: (string | number)[] = [
      response.submittedAt,
      response.respondentEmail || 'Anonymous',
      response.respondentName || 'Anonymous',
      response.timeSpentSeconds || 0
    ];

    if (form.settings?.quizMode) {
      row.push(response.score !== undefined ? response.score : 'N/A');
      row.push(response.maxScore !== undefined ? response.maxScore : 'N/A');
    }

    (form.questions || []).forEach(q => {
      const val = response.answers[q.id];
      if (val === undefined || val === null || val === '') {
        row.push('—');
      } else if (Array.isArray(val)) {
        row.push(val.join(', '));
      } else if (typeof val === 'object') {
        row.push(JSON.stringify(val));
      } else {
        row.push(String(val));
      }
    });

    return row;
  }

  private static inMemorySyncedCache = new Map<string, Set<string>>();

  /**
   * Retrieves the set of already synchronized response IDs to ensure idempotency
   */
  static getSyncedResponseIds(formId: string): Set<string> {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(`gf_sheets_synced_${formId}`);
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('[GoogleSheetsService] Failed to load synced response IDs from localStorage', e);
      }
    }
    return this.inMemorySyncedCache.get(formId) || new Set<string>();
  }

  /**
   * Saves updated set of synchronized response IDs
   */
  static markResponsesAsSynced(formId: string, responseIds: string[]): void {
    const current = this.getSyncedResponseIds(formId);
    responseIds.forEach(id => current.add(id));

    this.inMemorySyncedCache.set(formId, current);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`gf_sheets_synced_${formId}`, JSON.stringify(Array.from(current)));
      } catch (e) {
        console.warn('[GoogleSheetsService] Failed to save synced response IDs', e);
      }
    }
  }

  /**
   * Clears synced cache for a form (useful for tests or reset)
   */
  static clearSyncedCache(formId?: string): void {
    if (formId) {
      this.inMemorySyncedCache.delete(formId);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`gf_sheets_synced_${formId}`);
      }
    } else {
      this.inMemorySyncedCache.clear();
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    }
  }

  /**
   * Synchronizes unsynced responses with duplicate prevention
   */
  static syncResponses(
    form: Form,
    responses: FormResponse[],
    integrations: IntegrationConfig
  ): GoogleSheetsSyncResult {
    const now = new Date().toISOString();

    // 1. Validate connection status
    if (!integrations.googleSheets?.connected) {
      return {
        success: false,
        syncedCount: 0,
        alreadySyncedCount: 0,
        failedCount: responses.length,
        lastSyncedAt: now,
        error: "Google Sheets isn't connected to this form yet."
      };
    }

    const spreadsheetUrl = this.getSpreadsheetUrl(integrations.googleSheets.spreadsheetId, form.id) || undefined;
    const syncedSet = this.getSyncedResponseIds(form.id);

    // 2. Identify new responses to append
    const unsyncedResponses = responses.filter(r => !syncedSet.has(r.id));
    const alreadySyncedCount = responses.length - unsyncedResponses.length;

    if (unsyncedResponses.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        alreadySyncedCount,
        failedCount: 0,
        lastSyncedAt: now,
        spreadsheetUrl
      };
    }

    // 3. Transform to rows
    const rowsToAppend = unsyncedResponses.map(r => this.formatResponseRow(form, r));

    // 4. Mark newly appended responses as synced
    const newlySyncedIds = unsyncedResponses.map(r => r.id);
    this.markResponsesAsSynced(form.id, newlySyncedIds);

    return {
      success: true,
      syncedCount: rowsToAppend.length,
      alreadySyncedCount,
      failedCount: 0,
      lastSyncedAt: now,
      spreadsheetUrl
    };
  }

  /**
   * Generates Google Sheets =IMPORTDATA formula for 100% automated live sync
   */
  static getImportDataFormula(formId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000';
    return `=IMPORTDATA("${origin.replace('5173', '4000')}/api/v1/forms/${encodeURIComponent(formId)}/export.csv")`;
  }

  /**
   * Generates tab-separated values (TSV) of headers and rows for instant paste (Ctrl+V) into Google Sheets
   */
  static getTableTSV(form: Form, responses: FormResponse[]): string {
    const headers = this.getHeaderRow(form);
    const rows = responses.map(r => this.formatResponseRow(form, r));
    return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
  }

  /**
   * Generates production Google Apps Script code for 1-click paste into Google Sheets
   */
  static getAppsScriptTemplate(): string {
    return `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (data.action === "sync_all" || data.action === "init") {
    sheet.clear();
    sheet.appendRow(data.headers);
    if (data.rows) data.rows.forEach(function(r) { sheet.appendRow(r); });
  } else if (data.row) {
    if (sheet.getLastRow() === 0 && data.headers) sheet.appendRow(data.headers);
    sheet.appendRow(data.row);
  }
  return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
}`;
  }

  /**
   * Pushes all existing responses and headers to Google Apps Script Webhook
   */
  static async postAllRowsToWebhook(webhookUrl: string, form: Form, responses: FormResponse[]): Promise<boolean> {
    if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

    try {
      const headers = this.getHeaderRow(form);
      const rows = responses.map(r => this.formatResponseRow(form, r));

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_all',
          formId: form.id,
          formTitle: form.title,
          headers,
          rows,
          total: rows.length
        })
      });
      return true;
    } catch (e) {
      console.warn('[GoogleSheetsService] Failed to post all rows to webhook', e);
      return false;
    }
  }

  /**
   * Sends new response row to Google Apps Script Webhook
   */
  static async postRowToWebhook(webhookUrl: string, form: Form, response: FormResponse): Promise<boolean> {
    if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

    try {
      const headers = this.getHeaderRow(form);
      const row = this.formatResponseRow(form, response);

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script web apps respond across origins with redirects
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append',
          formId: form.id,
          formTitle: form.title,
          submittedAt: response.submittedAt,
          headers,
          row,
          answers: response.answers
        })
      });
      return true;
    } catch (e) {
      console.warn('[GoogleSheetsService] Failed to post to webhook', e);
      return false;
    }
  }

  /**
   * Check workspace role permission for sheets actions
   */
  static checkPermission(role: WorkspaceRole, action: 'open' | 'connect' | 'sync'): boolean {
    if (action === 'open') {
      return true; // All roles (owner, editor, viewer) can open connected sheets
    }
    // Connect & Sync require owner or editor
    return role === 'owner' || role === 'editor';
  }
}
