import { Form } from '../types';
import { format, isToday, isTomorrow, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export type EffectiveFormStatus = 'DRAFT' | 'OPEN' | 'EXPIRED' | 'CLOSED';

/**
 * Returns the effective status of a form based on strict precedence rules:
 * 1. If manually closed -> CLOSED
 * 2. If not published / in draft -> DRAFT
 * 3. If expiry date exists AND current time >= expiry -> EXPIRED
 * 4. Otherwise -> OPEN
 */
export function getEffectiveFormStatus(form: Form, now: Date = new Date()): EffectiveFormStatus {
  if (form.status === 'closed') {
    return 'CLOSED';
  }

  if (!form.isPublished || form.status === 'draft') {
    return 'DRAFT';
  }

  const expiryStr = form.expiresAt || form.settings?.expiresAt;
  if (expiryStr) {
    const expiryDate = parseISO(expiryStr);
    if (isValid(expiryDate) && now.getTime() >= expiryDate.getTime()) {
      return 'EXPIRED';
    }
  }

  return 'OPEN';
}

/**
 * Checks if a form has passed its configured response deadline
 */
export function isFormExpired(form: Form, now: Date = new Date()): boolean {
  const expiryStr = form.expiresAt || form.settings?.expiresAt;
  if (!expiryStr) return false;
  const expiryDate = parseISO(expiryStr);
  return isValid(expiryDate) && now.getTime() >= expiryDate.getTime();
}

/**
 * Formats a human-readable expiry summary string (e.g. "Expires in 2 days", "Expires today at 11:59 PM", "Expired on Sep 15")
 */
export function formatExpiryDescription(expiryIso: string, now: Date = new Date()): {
  isExpired: boolean;
  shortLabel: string;
  fullLabel: string;
  formattedDate: string;
  formattedTime: string;
} {
  const expiryDate = parseISO(expiryIso);
  if (!isValid(expiryDate)) {
    return {
      isExpired: false,
      shortLabel: 'Invalid date',
      fullLabel: 'Invalid date',
      formattedDate: '',
      formattedTime: ''
    };
  }

  const isExpired = now.getTime() >= expiryDate.getTime();
  const formattedDate = format(expiryDate, 'MMM dd, yyyy');
  const formattedTime = format(expiryDate, 'h:mm a');

  if (isExpired) {
    return {
      isExpired: true,
      shortLabel: `Expired ${format(expiryDate, 'MMM dd')}`,
      fullLabel: `Expired on ${formattedDate} at ${formattedTime}`,
      formattedDate,
      formattedTime
    };
  }

  if (isToday(expiryDate)) {
    return {
      isExpired: false,
      shortLabel: `Expires today (${formattedTime})`,
      fullLabel: `Expires today at ${formattedTime}`,
      formattedDate,
      formattedTime
    };
  }

  if (isTomorrow(expiryDate)) {
    return {
      isExpired: false,
      shortLabel: `Expires tomorrow (${formattedTime})`,
      fullLabel: `Expires tomorrow at ${formattedTime}`,
      formattedDate,
      formattedTime
    };
  }

  const distance = formatDistanceToNow(expiryDate, { addSuffix: false });
  return {
    isExpired: false,
    shortLabel: `Expires in ${distance}`,
    fullLabel: `Expires ${formattedDate} at ${formattedTime}`,
    formattedDate,
    formattedTime
  };
}

/**
 * Validates whether a provided date/time string is valid and in the future
 */
export function validateFutureExpiry(dateStr: string, timeStr: string): {
  isValid: boolean;
  isoString?: string;
  error?: string;
} {
  if (!dateStr) {
    return { isValid: false, error: 'Please select an expiry date.' };
  }

  // Combine date and time (defaulting to 23:59 if time is not provided)
  const cleanTime = timeStr ? timeStr.trim() : '23:59';
  const combinedStr = `${dateStr}T${cleanTime.length === 5 ? cleanTime + ':00' : cleanTime}`;
  
  const parsed = new Date(combinedStr);
  if (isNaN(parsed.getTime())) {
    return { isValid: false, error: 'Invalid date or time format.' };
  }

  if (parsed.getTime() <= Date.now()) {
    return { isValid: false, error: 'Expiry date and time must be in the future.' };
  }

  return { isValid: true, isoString: parsed.toISOString() };
}
