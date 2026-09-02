import { Form, FormAccessType } from '../types';

export type FormAccessResolutionReason =
  | 'PUBLIC_OPEN'
  | 'PREVIEW_BYPASS'
  | 'AUTH_REQUIRED'
  | 'AUTHENTICATED';

export interface FormAccessResolution {
  accessType: FormAccessType;
  isAllowed: boolean;
  reason: FormAccessResolutionReason;
  message: string;
}

export interface AuthStatePlaceholder {
  isAuthenticated: boolean;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

/**
 * Normalizes and extracts the canonical Form Access Type from a Form object.
 * Resolves form.settings.accessType first (the single authoritative source of truth),
 * falling back to form.accessType or defaulting safely to 'public' for all legacy/unconfigured forms.
 */
export function getFormAccessType(form: {
  accessType?: FormAccessType;
  settings?: { accessType?: FormAccessType };
}): FormAccessType {
  const type = form.settings?.accessType || form.accessType;
  if (type === 'private') {
    return 'private';
  }
  return 'public';
}

/**
 * Checks if a form is configured for open public access.
 */
export function isPublicForm(form: {
  accessType?: FormAccessType;
  settings?: { accessType?: FormAccessType };
}): boolean {
  return getFormAccessType(form) === 'public';
}

/**
 * Checks if a form is configured as private (requiring authentication).
 */
export function isPrivateForm(form: {
  accessType?: FormAccessType;
  settings?: { accessType?: FormAccessType };
}): boolean {
  return getFormAccessType(form) === 'private';
}

/**
 * Resolves form access for respondents and creators.
 *
 * RULES:
 * 1. Creator Preview (isPreview: true) always grants access for simulation/testing purposes.
 * 2. Public forms (accessType: 'public') grant open access to anyone with the link.
 * 3. Private forms (accessType: 'private') expose an AUTH_REQUIRED barrier until the future
 *    authentication system is plugged into authState.
 */
export function resolveFormAccess(
  form: {
    accessType?: FormAccessType;
    settings?: { accessType?: FormAccessType };
  },
  options?: {
    isPreview?: boolean;
    authState?: AuthStatePlaceholder;
  }
): FormAccessResolution {
  const accessType = getFormAccessType(form);

  // 1. Creator Preview mode bypass (allows testing form sections & logic without real auth)
  if (options?.isPreview) {
    return {
      accessType,
      isAllowed: true,
      reason: 'PREVIEW_BYPASS',
      message: 'Creator Preview: Testing access simulated without authentication barrier.'
    };
  }

  // 2. Public Form: open access to all respondents
  if (accessType === 'public') {
    return {
      accessType: 'public',
      isAllowed: true,
      reason: 'PUBLIC_OPEN',
      message: 'Public Form: Open to all respondents without authentication.'
    };
  }

  // 3. Private Form: Check if future auth state is authenticated
  if (options?.authState?.isAuthenticated) {
    return {
      accessType: 'private',
      isAllowed: true,
      reason: 'AUTHENTICATED',
      message: 'Private Form: Authenticated respondent access verified.'
    };
  }

  // 4. Private Form: Unauthenticated respondent -> Authentication Required Gate
  return {
    accessType: 'private',
    isAllowed: false,
    reason: 'AUTH_REQUIRED',
    message: 'This form is private and requires respondent authentication. Authentication layer integration pending.'
  };
}
