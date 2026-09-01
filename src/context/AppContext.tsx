import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Form,
  FormResponse,
  ActiveView,
  Workspace,
  Question,
  QuestionType,
  Section,
  DesignTheme,
  Comment,
  IntegrationConfig,
  UserIdentity,
  WorkspaceMember,
  WorkspaceInvite,
  WorkspaceActivity,
  FormVersion
} from '../types';
import { SEED_FORMS, SEED_RESPONSES, INITIAL_WORKSPACE, DEFAULT_CURRENT_USER } from '../data/seedData';
import { PRESET_THEMES } from '../data/presetThemes';
import { ApiClient } from '../services/apiClient';
import { GoogleSheetsService } from '../services/googleSheetsService';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  forms: Form[];
  activeFormId: string | null;
  setActiveFormId: (id: string | null) => void;
  activeForm: Form | undefined;
  responses: FormResponse[];
  workspace: Workspace;
  currentUser: UserIdentity;
  invitations: WorkspaceInvite[];
  activities: WorkspaceActivity[];
  comments: Comment[];
  integrations: IntegrationConfig;
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Workspace Actions
  inviteMember: (email: string, role: 'editor' | 'viewer', message?: string) => Promise<boolean>;
  revokeInvite: (inviteId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: 'editor' | 'viewer') => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  transferOwnership: (targetMemberId: string) => Promise<boolean>;

  // Form Versioning Actions
  createFormVersion: (formId: string, changesDescription: string) => void;
  restoreFormVersion: (formId: string, versionId: string) => void;
  
  // Form Actions
  createBlankForm: () => string;
  createFormFromTemplate: (templateId: string) => string;
  updateForm: (formId: string, updates: Partial<Form>) => void;
  deleteForm: (formId: string) => void;
  duplicateForm: (formId: string) => string;
  publishFormToggle: (formId: string) => void;
  
  // Builder Actions
  addQuestion: (formId: string, sectionId: string, type: QuestionType, afterIndex?: number) => void;
  updateQuestion: (formId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (formId: string, questionId: string) => void;
  reorderQuestions: (formId: string, newQuestions: Question[]) => void;
  duplicateQuestion: (formId: string, questionId: string) => void;

  // Section Actions
  addSection: (formId: string, title?: string, description?: string) => string;
  updateSection: (formId: string, sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (formId: string, sectionId: string) => void;
  duplicateSection: (formId: string, sectionId: string) => string;
  reorderSections: (formId: string, fromIndex: number, toIndex: number) => void;
  moveQuestionToSection: (formId: string, questionId: string, targetSectionId: string) => void;
  
  // Response Actions
  submitResponse: (formId: string, answers: Record<string, any>, timeSpentSeconds: number, respondentEmail?: string, respondentName?: string) => void;
  deleteResponse: (responseId: string) => void;
  
  // Comments
  addComment: (formId: string, questionId: string, text: string) => void;
  resolveComment: (commentId: string) => void;
  
  // Integrations
  updateIntegrations: (updates: Partial<IntegrationConfig>) => void;

  // Profile Action
  updateUserProfile: (updates: { name?: string; email?: string; avatar?: string }) => void;
  updateWorkspaceName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_FORMS = 'gradient_forms_v1_forms';
const LOCAL_STORAGE_KEY_RESPONSES = 'gradient_forms_v1_responses';
const LOCAL_STORAGE_KEY_WORKSPACE = 'gradient_forms_v1_workspace';
const LOCAL_STORAGE_KEY_INVITES = 'gradient_forms_v1_invites';
const LOCAL_STORAGE_KEY_ACTIVITIES = 'gradient_forms_v1_activities';

export const ensureFormDefaults = (form: Form): Form => {
  if (!form) return form;
  const sections: Section[] = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];
  const defaultSectionId = sections[0].id;

  return {
    ...form,
    title: form.title !== undefined ? form.title : 'Untitled Form',
    description: form.description !== undefined ? form.description : '',
    sections,
    questions: (form.questions || []).map(q => ({
      ...q,
      title: q.title !== undefined ? q.title : '',
      sectionId: (q.sectionId && sections.some(s => s.id === q.sectionId)) ? q.sectionId : defaultSectionId,
      options: q.options || [],
      validation: q.validation || (q.required !== undefined ? { required: q.required } : undefined)
    })),
    logicRules: form.logicRules || [],
    versions: form.versions || [],
    expiresAt: form.expiresAt || form.settings?.expiresAt,
    expiryMessage: form.expiryMessage || form.settings?.expiryMessage,
    settings: {
      collectEmail: form.settings?.collectEmail ?? true,
      limitOneResponse: form.settings?.limitOneResponse ?? false,
      allowEditResponse: form.settings?.allowEditResponse ?? false,
      saveProgress: form.settings?.saveProgress ?? true,
      showProgressBar: form.settings?.showProgressBar ?? true,
      shuffleQuestions: form.settings?.shuffleQuestions ?? false,
      quizMode: form.settings?.quizMode ?? false,
      releaseGradeImmediately: form.settings?.releaseGradeImmediately ?? true,
      confirmationMessage: form.settings?.confirmationMessage || 'Your response has been submitted successfully.',
      communityLink: form.settings?.communityLink || 'https://chat.whatsapp.com/invite',
      communityLinkText: form.settings?.communityLinkText || 'Join Gradient Club WhatsApp Group',
      requireAgreement: form.settings?.requireAgreement ?? false,
      agreementText: form.settings?.agreementText || 'By submitting this form, you agree to share the information provided with the Gradient Club of St. Peter’s Engineering College for official club purposes.',
      expiresAt: form.settings?.expiresAt || form.expiresAt,
      expiryMessage: form.settings?.expiryMessage || form.expiryMessage
    }
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [activeFormId, setActiveFormId] = useState<string | null>('form-cs-feedback');
  
  const [forms, setForms] = useState<Form[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FORMS);
    if (saved) {
      try {
        const parsed: Form[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(ensureFormDefaults);
        }
      } catch (e) { console.error(e); }
    }
    return SEED_FORMS.map(ensureFormDefaults);
  });

  const [responses, setResponses] = useState<FormResponse[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RESPONSES);
    if (saved) {
      try {
        const parsed: FormResponse[] = JSON.parse(saved);
        return parsed;
      } catch (e) { console.error(e); }
    }
    return SEED_RESPONSES;
  });

  const [workspace, setWorkspace] = useState<Workspace>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_WORKSPACE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_WORKSPACE;
  });

  const [invitations, setInvitations] = useState<WorkspaceInvite[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_INVITES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [activities, setActivities] = useState<WorkspaceActivity[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const ownerMember = workspace.members.find(m => m.role === 'owner') || DEFAULT_CURRENT_USER;
  const currentUser: UserIdentity = {
    id: ownerMember.id,
    name: ownerMember.name,
    email: ownerMember.email,
    avatar: ownerMember.avatar,
    role: ownerMember.role
  };
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c-1',
      formId: 'form-cs-feedback',
      questionId: 'q-rating-pacing',
      authorName: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      text: 'Should we increase the scale max from 5 to 10 for better granularity?',
      createdAt: '2026-08-10T14:20:00Z',
      resolved: false
    }
  ]);

  const [integrations, setIntegrations] = useState<IntegrationConfig>({
    googleSheets: { connected: true, spreadsheetId: undefined, sheetName: 'Form_Responses', lastSynced: 'Just now' },
    googleDrive: { connected: true, folderName: 'Gradient Forms Uploads' },
    emailNotifications: { notifyOwner: true, sendRespondentReceipt: true, customTemplate: 'Thank you {{name}} for submitting {{form_name}}.' },
    webhooks: { enabled: false }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_FORMS, JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESPONSES, JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WORKSPACE, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_INVITES, JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  const logActivity = (action: string, targetName: string) => {
    const newActivity: WorkspaceActivity = {
      id: 'act-' + Date.now(),
      actorName: currentUser.name,
      actorAvatar: currentUser.avatar,
      action,
      targetName,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const inviteMember = async (email: string, role: 'editor' | 'viewer', message?: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return false;
    }
    const existingMember = workspace.members.find(m => m.email.toLowerCase() === trimmed);
    if (existingMember) {
      showToast('Already a Member', `${trimmed} is already in this workspace.`, 'info');
      return false;
    }
    const existingInvite = invitations.find(i => i.email.toLowerCase() === trimmed && i.status === 'pending');
    if (existingInvite) {
      showToast('Invite Already Pending', `An invitation is already active for ${trimmed}.`, 'info');
      return false;
    }

    const newInvite: WorkspaceInvite = {
      id: 'inv-' + Date.now(),
      email: trimmed,
      role,
      invitedBy: currentUser.name,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      message
    };

    setInvitations(prev => [newInvite, ...prev]);
    logActivity(`Invited ${trimmed} as ${role.toUpperCase()}`, workspace.name);
    showToast('Invitation Sent ✉️', `Invitation sent to ${trimmed}`, 'success');
    return true;
  };

  const revokeInvite = async (inviteId: string): Promise<boolean> => {
    const target = invitations.find(i => i.id === inviteId);
    if (!target) return false;
    setInvitations(prev => prev.filter(i => i.id !== inviteId));
    logActivity(`Revoked invitation for ${target.email}`, workspace.name);
    showToast('Invitation Revoked', `Cancelled invite for ${target.email}`, 'info');
    return true;
  };

  const updateMemberRole = async (memberId: string, newRole: 'editor' | 'viewer'): Promise<boolean> => {
    const target = workspace.members.find(m => m.id === memberId);
    if (!target) return false;
    if (target.role === 'owner') {
      showToast('Action Prohibited', 'Cannot modify Owner role directly. Use Transfer Ownership.', 'error');
      return false;
    }

    setWorkspace(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    }));

    logActivity(`Changed role of ${target.name} to ${newRole.toUpperCase()}`, workspace.name);
    showToast('Role Updated', `${target.name} is now ${newRole.toUpperCase()}`, 'success');
    return true;
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    const target = workspace.members.find(m => m.id === memberId);
    if (!target) return false;
    if (target.role === 'owner') {
      showToast('Action Prohibited', 'Owner cannot be removed from workspace.', 'error');
      return false;
    }

    setWorkspace(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));

    logActivity(`Removed ${target.name} from workspace`, workspace.name);
    showToast('Member Removed', `${target.name} was removed from ${workspace.name}`, 'info');
    return true;
  };

  const transferOwnership = async (targetMemberId: string): Promise<boolean> => {
    const target = workspace.members.find(m => m.id === targetMemberId);
    if (!target) {
      showToast('Transfer Failed', 'Target member not found in workspace.', 'error');
      return false;
    }
    if (target.role === 'owner') {
      showToast('Notice', `${target.name} is already the workspace owner.`, 'info');
      return false;
    }

    setWorkspace(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === targetMemberId) {
          return { ...m, role: 'owner' };
        }
        if (m.role === 'owner') {
          return { ...m, role: 'editor' };
        }
        return m;
      })
    }));

    logActivity(`Transferred workspace ownership to ${target.name}`, workspace.name);
    showToast('Ownership Transferred 👑', `${target.name} is now the Workspace Owner. You are now an Editor.`, 'success');
    return true;
  };

  const createFormVersion = (formId: string, changesDescription: string) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        const nextVerNum = (f.versions || []).length + 1;
        const newVer: FormVersion = {
          id: 'v-' + Date.now(),
          versionNumber: nextVerNum,
          savedAt: new Date().toISOString(),
          authorName: currentUser.name,
          changesDescription: changesDescription.trim() || `Revision #${nextVerNum}`
        };
        const updatedVersions = [newVer, ...(f.versions || [])];
        return {
          ...f,
          versions: updatedVersions,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
    logActivity(`Created Version Snapshot for form`, workspace.name);
    showToast('Version Snapshot Saved 📸', `Created Version Snapshot`, 'success');
  };

  const restoreFormVersion = (formId: string, versionId: string) => {
    const targetForm = forms.find(f => f.id === formId);
    if (!targetForm) return;
    const targetVer = (targetForm.versions || []).find(v => v.id === versionId);
    if (!targetVer) return;

    logActivity(`Restored form "${targetForm.title}" to Version #${targetVer.versionNumber}`, workspace.name);
    showToast('Version Restored 🔄', `Restored form state to Version #${targetVer.versionNumber}`, 'success');
  };

  const rawActiveForm = forms.find(f => f.id === activeFormId) || forms[0];
  const activeForm = rawActiveForm ? ensureFormDefaults(rawActiveForm) : undefined;

  const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const createBlankForm = (): string => {
    const id = 'form-' + Date.now();
    const newForm: Form = {
      id,
      title: 'Untitled Form',
      description: '',
      isPublished: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      workspaceId: workspace.id,
      theme: PRESET_THEMES[0],
      settings: {
        collectEmail: true,
        limitOneResponse: false,
        allowEditResponse: false,
        saveProgress: true,
        showProgressBar: true,
        shuffleQuestions: false,
        quizMode: false,
        releaseGradeImmediately: true,
        confirmationMessage: 'Your response has been submitted successfully.',
        communityLink: 'https://chat.whatsapp.com/invite',
        communityLinkText: 'Join Gradient Club WhatsApp Group'
      },
      sections: [
        { id: 'sec-main', title: 'Form Questions', description: '' }
      ],
      questions: [
        {
          id: 'q-' + Date.now(),
          sectionId: 'sec-main',
          type: 'short_answer',
          title: 'Untitled Question',
          placeholder: 'Enter answer...',
          required: false
        }
      ],
      logicRules: [],
      versions: []
    };

    setForms(prev => [newForm, ...prev]);
    setActiveFormId(id);
    showToast('New Form Created', 'Form draft initialized.', 'success');
    return id;
  };

  const createFormFromTemplate = (templateId: string): string => {
    const id = 'form-' + Date.now();
    const newForm: Form = {
      id,
      title: `${templateId.replace(/-/g, ' ').toUpperCase()} (Template)`,
      description: 'Generated from template gallery.',
      isPublished: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      workspaceId: workspace.id,
      theme: PRESET_THEMES[0],
      settings: {
        collectEmail: true,
        limitOneResponse: false,
        allowEditResponse: false,
        saveProgress: true,
        showProgressBar: true,
        shuffleQuestions: false,
        quizMode: false,
        releaseGradeImmediately: true,
        confirmationMessage: 'Your response has been recorded.'
      },
      sections: [{ id: 'sec-1', title: 'Main Section', description: '' }],
      questions: [
        { id: 'q-t1', sectionId: 'sec-1', type: 'short_answer', title: 'Your Full Name', required: true },
        { id: 'q-t2', sectionId: 'sec-1', type: 'email', title: 'Email Address', required: true },
        { id: 'q-t3', sectionId: 'sec-1', type: 'rating', title: 'Overall Satisfaction Rating', ratingMax: 5, required: true },
        { id: 'q-t4', sectionId: 'sec-1', type: 'paragraph', title: 'Additional Comments & Feedback', required: false }
      ],
      logicRules: [],
      versions: []
    };

    setForms(prev => [newForm, ...prev]);
    setActiveFormId(id);
    showToast('Template Loaded', 'Cloned form into your workspace.', 'success');
    return id;
  };

  const updateForm = (formId: string, updates: Partial<Form>) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
  };

  const deleteForm = (formId: string) => {
    setForms(prev => prev.filter(f => f.id !== formId));
    if (activeFormId === formId) {
      setActiveFormId(forms.find(f => f.id !== formId)?.id || null);
    }
    showToast('Form Deleted', 'Form removed from workspace.', 'info');
  };

  const duplicateForm = (formId: string): string => {
    const target = forms.find(f => f.id === formId);
    if (!target) return '';
    const newId = 'form-' + Date.now();
    const duplicated: Form = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      responseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setForms(prev => [duplicated, ...prev]);
    showToast('Form Duplicated', `Created copy of ${target.title}`, 'success');
    return newId;
  };

  const publishFormToggle = (formId: string) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        const isPub = !f.isPublished;
        showToast(
          isPub ? 'Form Published 🚀' : 'Form Unpublished',
          isPub ? 'Form is now live and accepting public responses.' : 'Form draft is now private.',
          isPub ? 'success' : 'info'
        );
        return { ...f, isPublished: isPub, status: isPub ? 'published' : 'draft', updatedAt: new Date().toISOString() };
      }
      return f;
    }));
  };

  const addQuestion = (formId: string, sectionId: string, type: QuestionType, afterIndex?: number) => {
    const qId = 'q-' + Date.now();
    const defaultQuestion: Question = {
      id: qId,
      sectionId,
      type,
      title: getDefaultTitleForType(type),
      placeholder: getPlaceholderForType(type),
      required: false,
      options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(type)
        ? [
            { id: 'opt-1', label: 'Option 1' },
            { id: 'opt-2', label: 'Option 2' },
            { id: 'opt-3', label: 'Option 3' }
          ]
        : undefined,
      scaleMin: type === 'scale' ? 1 : undefined,
      scaleMax: type === 'scale' ? 10 : undefined,
      scaleMinLabel: type === 'scale' ? 'Min' : undefined,
      scaleMaxLabel: type === 'scale' ? 'Max' : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
      matrixRows: type === 'matrix' ? ['Row 1', 'Row 2'] : undefined,
      matrixCols: type === 'matrix' ? ['Poor', 'Average', 'Excellent'] : undefined
    };

    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        const newQuestions = [...f.questions];
        if (typeof afterIndex === 'number' && afterIndex >= 0) {
          newQuestions.splice(afterIndex + 1, 0, defaultQuestion);
        } else {
          newQuestions.push(defaultQuestion);
        }
        return {
          ...f,
          questions: newQuestions,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
  };

  const updateQuestion = (formId: string, questionId: string, updates: Partial<Question>) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          questions: f.questions.map(q => q.id === questionId ? { ...q, ...updates } : q),
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
  };

  const deleteQuestion = (formId: string, questionId: string) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          questions: f.questions.filter(q => q.id !== questionId),
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
    showToast('Question Removed', '', 'info');
  };

  const duplicateQuestion = (formId: string, questionId: string) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        const qIndex = f.questions.findIndex(q => q.id === questionId);
        if (qIndex === -1) return f;
        const sourceQ = f.questions[qIndex];
        const newQ: Question = {
          ...sourceQ,
          id: 'q-' + Date.now(),
          title: `${sourceQ.title} (Copy)`
        };
        const newQuestions = [...f.questions];
        newQuestions.splice(qIndex + 1, 0, newQ);
        return { ...f, questions: newQuestions, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
  };

  const reorderQuestions = (formId: string, newQuestions: Question[]) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return { ...f, questions: newQuestions, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
  };

  // Section Management Actions
  const addSection = (formId: string, title?: string, description?: string): string => {
    const sectionId = 'sec-' + Date.now();
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        const count = (f.sections || []).length + 1;
        const newSection: Section = {
          id: sectionId,
          title: title || `Section ${count}`,
          description: description || ''
        };
        return {
          ...f,
          sections: [...(f.sections || []), newSection],
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
    showToast('Section Created 📑', 'Created new section/page.', 'success');
    return sectionId;
  };

  const updateSection = (formId: string, sectionId: string, updates: Partial<Section>) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          sections: (f.sections || []).map(s => s.id === sectionId ? { ...s, ...updates } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
  };

  const deleteSection = (formId: string, sectionId: string) => {
    const targetForm = forms.find(f => f.id === formId);
    if (!targetForm) return;
    if ((targetForm.sections || []).length <= 1) {
      showToast('Cannot Delete Section', 'A form must contain at least one section.', 'info');
      return;
    }

    const remainingSections = targetForm.sections.filter(s => s.id !== sectionId);
    const fallbackSectionId = remainingSections[0].id;

    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          sections: remainingSections,
          questions: f.questions.map(q => q.sectionId === sectionId ? { ...q, sectionId: fallbackSectionId } : q),
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
    showToast('Section Deleted', 'Section removed; existing questions moved to adjacent section.', 'info');
  };

  const duplicateSection = (formId: string, sectionId: string): string => {
    const targetForm = forms.find(f => f.id === formId);
    if (!targetForm) return '';
    const targetSection = (targetForm.sections || []).find(s => s.id === sectionId);
    if (!targetSection) return '';

    const newSectionId = 'sec-' + Date.now();
    const newSection: Section = {
      ...targetSection,
      id: newSectionId,
      title: `${targetSection.title} (Copy)`
    };

    // Duplicate all questions inside this section with fresh IDs
    const sectionQuestions = targetForm.questions.filter(q => q.sectionId === sectionId);
    const duplicatedQuestions = sectionQuestions.map((q, idx) => ({
      ...q,
      id: 'q-' + Date.now() + '-' + idx,
      sectionId: newSectionId,
      title: q.title
    }));

    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        const secIndex = f.sections.findIndex(s => s.id === sectionId);
        const newSections = [...f.sections];
        newSections.splice(secIndex + 1, 0, newSection);

        return {
          ...f,
          sections: newSections,
          questions: [...f.questions, ...duplicatedQuestions],
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
    showToast('Section Duplicated 📋', `Created copy of section and ${sectionQuestions.length} questions.`, 'success');
    return newSectionId;
  };

  const reorderSections = (formId: string, fromIndex: number, toIndex: number) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        if (fromIndex < 0 || fromIndex >= f.sections.length || toIndex < 0 || toIndex >= f.sections.length) return f;
        const newSections = [...f.sections];
        const [moved] = newSections.splice(fromIndex, 1);
        newSections.splice(toIndex, 0, moved);
        return {
          ...f,
          sections: newSections,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
  };

  const moveQuestionToSection = (formId: string, questionId: string, targetSectionId: string) => {
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          questions: f.questions.map(q => q.id === questionId ? { ...q, sectionId: targetSectionId } : q),
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));
    showToast('Question Moved', 'Question reassigned to section.', 'success');
  };

  const submitResponse = (
    formId: string,
    answers: Record<string, any>,
    timeSpentSeconds: number,
    respondentEmail?: string,
    respondentName?: string
  ) => {
    const targetForm = forms.find(f => f.id === formId);
    let calculatedScore = 0;
    let totalMaxScore = 0;

    if (targetForm?.settings.quizMode) {
      targetForm.questions.forEach(q => {
        if (q.points && q.correctAnswer) {
          totalMaxScore += q.points;
          const userAns = answers[q.id];
          if (userAns === q.correctAnswer) {
            calculatedScore += q.points;
          }
        }
      });
    }

    // Try to extract email or name from answers if not explicitly provided
    let extractedEmail = respondentEmail;
    let extractedName = respondentName;

    Object.entries(answers).forEach(([qId, val]) => {
      if (typeof val === 'string') {
        if (!extractedEmail && val.includes('@') && val.includes('.')) {
          extractedEmail = val;
        }
        if (!extractedName && (qId.toLowerCase().includes('name') || qId.toLowerCase().includes('student'))) {
          extractedName = val;
        }
      }
    });

    const newResp: FormResponse = {
      id: 'resp-' + Date.now(),
      formId,
      submittedAt: new Date().toISOString(),
      respondentEmail: extractedEmail || 'anonymous@respondent.io',
      respondentName: extractedName || 'Anonymous Respondent',
      answers,
      score: targetForm?.settings.quizMode ? calculatedScore : undefined,
      maxScore: targetForm?.settings.quizMode ? totalMaxScore : undefined,
      timeSpentSeconds
    };

    setResponses(prev => [newResp, ...prev]);
    setActiveFormId(formId);

    // Update response count
    setForms(prev => prev.map(f => {
      if (f.id === formId) {
        return { ...f, responseCount: (f.responseCount || 0) + 1 };
      }
      return f;
    }));

    // Real-time Google Sheets sync & Webhook dispatch
    if (integrations.googleSheets?.connected && targetForm) {
      GoogleSheetsService.syncResponses(targetForm, [newResp], integrations);
      if (integrations.googleSheets.webhookUrl) {
        GoogleSheetsService.postRowToWebhook(integrations.googleSheets.webhookUrl, targetForm, newResp)
          .catch(e => console.warn('Google Sheets Webhook Sync failed:', e));
      }
    }

    // Async REST sync
    ApiClient.submitResponse(formId, {
      answers,
      timeSpentSeconds,
      respondentEmail: extractedEmail
    }).catch((err: unknown) => console.warn('REST API sync failed:', err));

    showToast('Response Recorded! 🎉', 'Your form submission has been saved & synced.', 'success');
  };

  const deleteResponse = (responseId: string) => {
    setResponses(prev => prev.filter(r => r.id !== responseId));
    showToast('Response Deleted', '', 'info');
  };

  const addComment = (formId: string, questionId: string, text: string) => {
    const newComment: Comment = {
      id: 'c-' + Date.now(),
      formId,
      questionId,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString(),
      resolved: false
    };
    setComments(prev => [...prev, newComment]);
    showToast('Comment Added', 'Collaborators notified.', 'success');
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c));
  };

  const updateIntegrations = (updates: Partial<IntegrationConfig>) => {
    setIntegrations(prev => ({ ...prev, ...updates }));
    showToast('Integrations Saved', 'Service preferences updated.', 'success');
  };

  const updateUserProfile = (updates: { name?: string; email?: string; avatar?: string }) => {
    setWorkspace(prev => {
      const updatedMembers = prev.members.map(m => {
        if (m.role === 'owner' || m.id === currentUser.id) {
          return {
            ...m,
            name: updates.name !== undefined && updates.name.trim() !== '' ? updates.name.trim() : m.name,
            email: updates.email !== undefined && updates.email.trim() !== '' ? updates.email.trim() : m.email,
            avatar: updates.avatar !== undefined ? updates.avatar : m.avatar
          };
        }
        return m;
      });
      return { ...prev, members: updatedMembers };
    });
    logActivity('Updated user profile credentials & avatar', workspace.name);
    showToast('Profile Updated 👤', 'Your profile details and profile picture have been updated.', 'success');
  };

  const updateWorkspaceName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setWorkspace(prev => ({ ...prev, name: trimmed }));
    logActivity('Renamed workspace to ' + trimmed, trimmed);
    showToast('Workspace Renamed 🏢', `Workspace name updated to "${trimmed}".`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        forms,
        activeFormId,
        setActiveFormId,
        activeForm,
        responses,
        workspace,
        currentUser,
        invitations,
        activities,
        inviteMember,
        revokeInvite,
        updateMemberRole,
        removeMember,
        transferOwnership,
        createFormVersion,
        restoreFormVersion,
        comments,
        integrations,
        toasts,
        showToast,
        removeToast,
        createBlankForm,
        createFormFromTemplate,
        updateForm,
        deleteForm,
        duplicateForm,
        publishFormToggle,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
        duplicateQuestion,
        addSection,
        updateSection,
        deleteSection,
        duplicateSection,
        reorderSections,
        moveQuestionToSection,
        submitResponse,
        deleteResponse,
        addComment,
        resolveComment,
        updateIntegrations,
        updateUserProfile,
        updateWorkspaceName
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

function getDefaultTitleForType(type: QuestionType): string {
  switch (type) {
    case 'short_answer': return 'Short Answer Question';
    case 'paragraph': return 'Detailed Response / Feedback';
    case 'multiple_choice': return 'Select an Option';
    case 'checkboxes': return 'Select all that apply';
    case 'dropdown': return 'Choose from list';
    case 'scale': return 'Rate on a scale of 1 to 10';
    case 'rating': return 'Star Rating';
    case 'date': return 'Select Date';
    case 'time': return 'Select Time';
    case 'file_upload': return 'Upload File / Resume';
    case 'email': return 'Email Address';
    case 'phone': return 'Phone Number';
    case 'number': return 'Numeric Input';
    case 'url': return 'Website / Portfolio Link';
    case 'section': return 'New Form Section';
    case 'heading': return 'Section Header';
    case 'matrix': return 'Matrix Rating Grid';
    case 'ranking': return 'Rank in order of preference';
    case 'signature': return 'Digital Signature';
    case 'consent': return 'Terms & Conditions Agreement';
    default: return 'Question Title';
  }
}

function getPlaceholderForType(type: QuestionType): string {
  switch (type) {
    case 'short_answer': return 'Type your answer here...';
    case 'paragraph': return 'Type detailed answer...';
    case 'email': return 'alex@example.com';
    case 'phone': return '+1 (555) 000-0000';
    case 'url': return 'https://example.com';
    case 'number': return '0';
    default: return '';
  }
}
