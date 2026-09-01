/**
 * Utility functions for parsing form IDs from URL hash or query parameters.
 */
export const getFormIdFromUrl = (customUrl?: string): string | null => {
  let hash = '';
  let search = '';

  if (customUrl) {
    const hashIndex = customUrl.indexOf('#');
    if (hashIndex !== -1) {
      hash = customUrl.substring(hashIndex);
    }
    const searchIndex = customUrl.indexOf('?');
    if (searchIndex !== -1) {
      search = customUrl.substring(searchIndex).split('#')[0];
    }
  } else if (typeof window !== 'undefined') {
    hash = window.location.hash;
    search = window.location.search;
  } else {
    return null;
  }

  // Check hash route formats: #/f/:id or #/published/:id
  if (hash.startsWith('#/f/')) {
    const id = hash.replace('#/f/', '').split('?')[0].split('/')[0];
    if (id) return decodeURIComponent(id);
  }

  if (hash.startsWith('#/published/')) {
    const id = hash.replace('#/published/', '').split('?')[0].split('/')[0];
    if (id) return decodeURIComponent(id);
  }

  if (hash.startsWith('#/sheets/')) {
    const id = hash.replace('#/sheets/', '').split('?')[0].split('/')[0];
    if (id) return decodeURIComponent(id);
  }

  // Check URL search parameters ?formId=xyz
  try {
    const searchParams = new URLSearchParams(search);
    const formIdParam = searchParams.get('formId');
    if (formIdParam) return decodeURIComponent(formIdParam);
  } catch (e) {
    console.error('Error parsing URL search params:', e);
  }

  return null;
};

/**
 * Parses requested view from URL query params or hash
 */
export const getViewFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  const search = window.location.search;

  if (hash.startsWith('#/sheets/')) return 'sheets';
  if (hash.startsWith('#/f/') || hash.startsWith('#/published/')) return 'published';

  try {
    const searchParams = new URLSearchParams(search);
    const viewParam = searchParams.get('view');
    if (viewParam) return viewParam;
  } catch (e) {
    console.error('Error parsing view search param:', e);
  }

  return null;
};
