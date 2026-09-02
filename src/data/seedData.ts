import { Form, FormResponse, Workspace, WorkspaceMember } from '../types';

export const DEFAULT_CURRENT_USER: WorkspaceMember = {
  id: 'usr-1',
  name: 'Alex Rivera',
  email: 'alex@gradientforms.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'owner',
  status: 'active',
  joinedAt: '2026-08-01T10:00:00Z'
};

export const INITIAL_WORKSPACE: Workspace = {
  id: 'ws-1',
  name: 'Gradient Labs',
  logo: '⚡',
  plan: 'free',
  members: [DEFAULT_CURRENT_USER]
};

/**
 * Stable IDs of legacy seed/demo forms.
 * Used exclusively for safe one-time localStorage migration to remove starter forms
 * without deleting real user-created forms.
 */
export const KNOWN_SEED_FORM_IDS = new Set<string>([
  'form-cs-feedback',
  'form-summit-rsvp',
  'form-job-app',
  'form-trial-2-antigraviti'
]);

/**
 * Workspace forms array starts empty for real users.
 * Forms are created when the user creates a blank form or selects a template in Templates Marketplace.
 */
export const SEED_FORMS: Form[] = [];

/**
 * Initial responses start empty.
 */
export const SEED_RESPONSES: FormResponse[] = [];
