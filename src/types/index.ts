export type QuestionType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'scale'
  | 'rating'
  | 'date'
  | 'time'
  | 'file_upload'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'section'
  | 'heading'
  | 'matrix'
  | 'ranking'
  | 'signature'
  | 'consent';

export interface QuestionOption {
  id: string;
  label: string;
  score?: number;
  isCorrect?: boolean;
  destinationSectionId?: string; // Target section ID or '__SUBMIT__' to end form
}

export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  maxSelections?: number;
  pattern?: string;
  maxFileSizeMB?: number;
}

export interface LogicRule {
  id: string;
  sourceQuestionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show' | 'hide' | 'skip_to';
  targetQuestionId: string;
}

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: QuestionOption[];
  enableBranching?: boolean; // Toggles 'Go to section based on answer'
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  ratingMax?: number;
  matrixRows?: string[];
  matrixCols?: string[];
  validation?: ValidationRule;
  logicRules?: LogicRule[];
  points?: number;
  correctAnswer?: string | string[];
  maxSelections?: number;
  allowOther?: boolean;
  otherPlaceholder?: string;
  // Media & Formatting
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  videoCaption?: string;
  titleStyle?: {
    size?: 'sm' | 'md' | 'lg';
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
  descriptionStyle?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
}

export interface DesignTheme {
  id: string;
  name: string;
  primaryColor: string; // hex or tailwind class
  accentColor: string;
  backgroundColor: string;
  cardStyle: 'glass' | 'solid' | 'bordered' | 'minimal';
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Space Grotesk' | 'JetBrains Mono';
  borderRadius: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  bgPattern?: 'grid' | 'dots' | 'none';
}

export type FormAccessType = 'public' | 'private';

export interface FormSettings {
  accessType?: FormAccessType; // Canonical Form Access: 'public' | 'private' (defaults to 'public')
  collectEmail: boolean;
  emailCollectionMode?: 'responder_input' | 'verified';
  sendResponseCopy?: 'off' | 'when_requested' | 'always';
  limitOneResponse: boolean;
  allowEditResponse: boolean;
  saveProgress: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  quizMode: boolean;
  releaseGradeImmediately: boolean;
  passwordProtection?: string;
  responseLimit?: number;
  redirectUrl?: string;
  confirmationMessage: string;
  communityLink?: string;
  communityLinkText?: string;
  // Agreement & Data Sharing
  requireAgreement?: boolean;
  agreementText?: string;
  // Response Deadline / Form Expiry
  expiresAt?: string; // ISO string timestamp (e.g. 2026-09-15T23:59:00.000Z)
  expiryMessage?: string;
}

export interface FormVersion {
  id: string;
  versionNumber: number;
  savedAt: string;
  authorName: string;
  changesDescription: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  accessType?: FormAccessType; // Convenience accessor delegating to settings.accessType
  isPublished: boolean;
  status: 'draft' | 'published' | 'closed' | 'archived';
  expiresAt?: string;
  expiryMessage?: string;
  deletedAt?: string; // Set when form is moved to Recycle Bin
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  sections: Section[];
  questions: Question[];
  theme: DesignTheme;
  settings: FormSettings;
  logicRules: LogicRule[];
  versions: FormVersion[];
  workspaceId: string;
  authorName: string;
  authorAvatar: string;
}

export interface Answer {
  questionId: string;
  value: any; // string, string[], number, Record<string, string> for matrix
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: string;
  respondentEmail?: string;
  respondentName?: string;
  answers: Record<string, any>;
  score?: number;
  maxScore?: number;
  timeSpentSeconds: number;
}

export interface Comment {
  id: string;
  formId: string;
  questionId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface IntegrationConfig {
  googleSheets: {
    connected: boolean;
    spreadsheetId?: string;
    sheetName?: string;
    lastSynced?: string;
    webhookUrl?: string;
  };
  googleDrive: {
    connected: boolean;
    folderName?: string;
  };
  emailNotifications: {
    notifyOwner: boolean;
    sendRespondentReceipt: boolean;
    customTemplate?: string;
  };
  webhooks: {
    enabled: boolean;
    url?: string;
  };
}

export interface UserIdentity {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
}

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';
export type MemberStatus = 'active' | 'pending' | 'inactive';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: WorkspaceRole;
  status: MemberStatus;
  joinedAt?: string;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: 'editor' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  status: InviteStatus;
  message?: string;
}

export interface WorkspaceActivity {
  id: string;
  actorName: string;
  actorAvatar: string;
  action: string;
  targetName: string;
  timestamp: string;
}

export interface Workspace {
  id: string;
  name: string;
  logo?: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  members: WorkspaceMember[];
}

export type ActiveView = 
  | 'landing'
  | 'dashboard'
  | 'builder'
  | 'preview'
  | 'published'
  | 'responses'
  | 'analytics'
  | 'integrations'
  | 'templates'
  | 'team'
  | 'settings'
  | 'sheets';
