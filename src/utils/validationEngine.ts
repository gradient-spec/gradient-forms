import { Question } from '../types';

export const validateFieldValue = (question: Question, value: any): string | null => {
  // Required Check
  if (question.required || question.validation?.required) {
    if (value === undefined || value === null) return `${question.title} is required.`;
    if (typeof value === 'string') {
      if (value.trim() === '') return `${question.title} is required.`;
      if (value === '__other__' || value.trim() === 'Other:') {
        return `Please specify your custom answer for ${question.title}.`;
      }
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return `${question.title} is required.`;
      const hasValid = value.some(item => item !== '__other__' && item !== 'Other:' && String(item).trim() !== '');
      if (!hasValid) return `Please specify your custom answer for ${question.title}.`;
    }
  }

  if (value === undefined || value === null || value === '') return null;

  // Max Selections Check
  const maxLimit = question.maxSelections || question.validation?.maxSelections;
  if (maxLimit && Array.isArray(value) && value.length > maxLimit) {
    return `You can select a maximum of ${maxLimit} ${maxLimit === 1 ? 'option' : 'options'}.`;
  }

  // String Length Rules
  if (typeof value === 'string') {
    if (question.validation?.minLength && value.length < question.validation.minLength) {
      return `${question.title} must be at least ${question.validation.minLength} characters.`;
    }
    if (question.validation?.maxLength && value.length > question.validation.maxLength) {
      return `${question.title} cannot exceed ${question.validation.maxLength} characters.`;
    }
  }

  // Type Format Checks
  if (question.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) return 'Please enter a valid email address.';
  }

  if (question.type === 'url') {
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i;
    if (!urlRegex.test(String(value))) return 'Please enter a valid URL.';
  }

  if (question.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return 'Please enter a valid number.';
    if (question.validation?.minValue !== undefined && num < question.validation.minValue) {
      return `Value must be at least ${question.validation.minValue}.`;
    }
    if (question.validation?.maxValue !== undefined && num > question.validation.maxValue) {
      return `Value cannot exceed ${question.validation.maxValue}.`;
    }
  }

  if (question.validation?.pattern) {
    try {
      const regex = new RegExp(question.validation.pattern);
      if (!regex.test(String(value))) return 'Input does not match required format.';
    } catch (e) {
      console.warn('Invalid regex pattern:', e);
    }
  }

  if (question.type === 'file_upload' && typeof value === 'object' && value.sizeMB) {
    const maxMB = question.validation?.maxFileSizeMB || 10;
    if (value.sizeMB > maxMB) return `File size cannot exceed ${maxMB}MB.`;
  }

  return null;
};
