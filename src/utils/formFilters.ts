import { Form } from '../types';

/**
 * Returns true if the form has been edited by the user:
 * 1. Title is not default "Untitled Form" or "Untitled"
 * 2. OR at least one question title or option label has been customized
 * 3. OR the form has responses recorded / is published
 */
export const isFormEdited = (form: Form): boolean => {
  if (!form) return false;

  const normalizedTitle = (form.title || '').trim().toLowerCase();
  const isTitleEdited = Boolean(
    normalizedTitle !== '' &&
    normalizedTitle !== 'untitled form' &&
    normalizedTitle !== 'untitled'
  );

  const hasEditedQuestions = (form.questions || []).some(q => {
    const qTitle = (q.title || '').trim().toLowerCase();
    const isQTitleCustom = Boolean(
      q.title &&
      qTitle !== '' &&
      !qTitle.startsWith('untitled') &&
      qTitle !== 'enter question title...'
    );

    const isOptionCustom = (q.options || []).some(opt => {
      const optLabel = (opt.label || '').trim().toLowerCase();
      return (
        optLabel !== '' &&
        !optLabel.startsWith('option 1') &&
        !optLabel.startsWith('option 2') &&
        !optLabel.startsWith('option 3')
      );
    });

    return isQTitleCustom || isOptionCustom;
  });

  const hasActivity = (form.responseCount || 0) > 0 || form.isPublished;

  return isTitleEdited || hasEditedQuestions || hasActivity;
};
