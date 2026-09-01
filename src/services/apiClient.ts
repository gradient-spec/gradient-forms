import { Form, FormResponse } from '../types';

const API_BASE_URL = 'http://localhost:4000/api/v1';

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status} Request Failed`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[ApiClient] Network/Server request to ${endpoint} failed. Using offline fallback mechanism.`, err);
      throw err;
    }
  }

  static async getForms(search: string = '', page: number = 1) {
    return this.request<{ success: boolean; data: Form[] }>(`/forms?search=${encodeURIComponent(search)}&page=${page}`);
  }

  static async getFormById(id: string) {
    return this.request<{ success: boolean; data: Form }>(`/forms/${id}`);
  }

  static async submitResponse(formId: string, payload: { answers: Record<string, any>; timeSpentSeconds: number; respondentEmail?: string }) {
    return this.request<{ success: boolean; message: string; data: FormResponse }>(`/forms/${formId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ formId, ...payload })
    });
  }

  // Workspace API Methods
  static async getWorkspaceMembers(workspaceId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/workspaces/${workspaceId}/members`);
  }

  static async inviteMember(workspaceId: string, email: string, role: 'editor' | 'viewer', message?: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email, role, message })
    });
  }

  static async updateMemberRole(workspaceId: string, memberId: string, role: 'editor' | 'viewer') {
    return this.request<{ success: boolean; data: any }>(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  static async removeMember(workspaceId: string, memberId: string) {
    return this.request<{ success: boolean; message: string }>(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE'
    });
  }

  static async transferOwnership(workspaceId: string, targetMemberId: string) {
    return this.request<{ success: boolean; message: string }>(`/workspaces/${workspaceId}/transfer-ownership`, {
      method: 'POST',
      body: JSON.stringify({ targetMemberId })
    });
  }

  static async revokeInvite(workspaceId: string, inviteId: string) {
    return this.request<{ success: boolean; message: string }>(`/workspaces/${workspaceId}/invitations/${inviteId}`, {
      method: 'DELETE'
    });
  }

  static async getWorkspaceActivity(workspaceId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/workspaces/${workspaceId}/activity`);
  }

  // Google Sheets Integration API
  static async getGoogleSheetsIntegration(formId: string) {
    return this.request<{
      success: boolean;
      data: {
        connected: boolean;
        spreadsheetId?: string;
        spreadsheetUrl?: string;
        sheetName?: string;
        lastSyncedAt?: string;
        syncStatus?: 'synced' | 'syncing' | 'pending' | 'failed' | 'not_connected';
      };
    }>(`/forms/${formId}/integrations/google-sheets`);
  }

  static async syncGoogleSheets(formId: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        syncedCount: number;
        lastSyncedAt: string;
        spreadsheetUrl: string;
        syncStatus: string;
      };
    }>(`/forms/${formId}/integrations/google-sheets/sync`, {
      method: 'POST'
    });
  }
}
