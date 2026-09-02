import { Form, Question, Section } from '../types';

export const ACTION_CONTINUE_NEXT = '__NEXT__';
export const ACTION_SUBMIT_FORM = '__SUBMIT__';

/**
 * Returns the active branching question for a given section if one exists.
 * Per specification, only one question per section can control branching,
 * and only 'multiple_choice' and 'dropdown' question types are supported.
 */
export function getBranchingQuestionForSection(form: Form, sectionId: string): Question | undefined {
  if (!form.questions) return undefined;
  return form.questions.find(
    q => q.sectionId === sectionId &&
         Boolean(q.enableBranching) &&
         (q.type === 'multiple_choice' || q.type === 'dropdown')
  );
}

/**
 * Finds the index of a section by its stable ID
 */
export function getSectionIndexById(form: Form, sectionId: string): number {
  const sections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];
  return sections.findIndex(s => s.id === sectionId);
}

/**
 * Resolves the next section destination for a given section based on current answers.
 * Returns destinationSectionId (or '__SUBMIT__', or next sequential section ID, or null if end of form).
 */
export function resolveNextSectionDestination(
  form: Form,
  currentSectionId: string,
  answers: Record<string, any>
): {
  destinationSectionId: string | typeof ACTION_SUBMIT_FORM | null;
  isBranch: boolean;
  branchQuestionId?: string;
} {
  const sections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];

  const currentIndex = sections.findIndex(s => s.id === currentSectionId);
  if (currentIndex === -1) {
    return { destinationSectionId: null, isBranch: false };
  }

  const branchingQ = getBranchingQuestionForSection(form, currentSectionId);
  if (branchingQ && branchingQ.options) {
    const selectedVal = answers[branchingQ.id];
    if (selectedVal !== undefined && selectedVal !== null && selectedVal !== '') {
      // Multiple choice and dropdown can store option ID or option label
      const matchedOption = branchingQ.options.find(
        opt => opt.id === selectedVal || opt.label === selectedVal
      );

      if (matchedOption && matchedOption.destinationSectionId) {
        const dest = matchedOption.destinationSectionId;

        if (dest === ACTION_SUBMIT_FORM) {
          return {
            destinationSectionId: ACTION_SUBMIT_FORM,
            isBranch: true,
            branchQuestionId: branchingQ.id
          };
        }

        if (dest !== ACTION_CONTINUE_NEXT) {
          // Verify target section exists
          const targetExists = sections.some(s => s.id === dest);
          if (targetExists) {
            return {
              destinationSectionId: dest,
              isBranch: true,
              branchQuestionId: branchingQ.id
            };
          }
        }
      }
    }
  }

  // Default fallback: next sequential section
  if (currentIndex < sections.length - 1) {
    return {
      destinationSectionId: sections[currentIndex + 1].id,
      isBranch: false
    };
  }

  // End of form
  return {
    destinationSectionId: ACTION_SUBMIT_FORM,
    isBranch: false
  };
}

/**
 * Computes the full dynamic path of sections from Section 1 to completion.
 * Detects and breaks out of circular loops safely.
 */
export function calculateReachablePath(
  form: Form,
  answers: Record<string, any>,
  startSectionId?: string
): string[] {
  const sections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];

  if (sections.length === 0) return [];

  const initialSectionId = startSectionId || sections[0].id;
  const path: string[] = [initialSectionId];
  const visited = new Set<string>([initialSectionId]);

  let currentId: string = initialSectionId;
  const maxHops = sections.length * 2; // Loop safety threshold
  let hops = 0;

  while (hops < maxHops) {
    hops++;
    const res = resolveNextSectionDestination(form, currentId, answers);

    if (!res.destinationSectionId || res.destinationSectionId === ACTION_SUBMIT_FORM) {
      break;
    }

    const nextId = res.destinationSectionId;
    if (visited.has(nextId)) {
      // Loop detected, terminate path calculation
      break;
    }

    path.push(nextId);
    visited.add(nextId);
    currentId = nextId;
  }

  return path;
}

/**
 * Static analyzer that detects circular branching loops across all possible option permutations.
 * Example: Section 2 -> Section 4 -> Section 2.
 */
export function detectBranchingLoops(form: Form): {
  hasLoop: boolean;
  loopPath?: string[];
  error?: string;
} {
  const sections = form.sections || [];
  if (sections.length <= 1) return { hasLoop: false };

  // For each section, build a map of possible outgoing destinations
  const adjacencyList = new Map<string, string[]>();

  sections.forEach((sec, idx) => {
    const branchingQ = getBranchingQuestionForSection(form, sec.id);
    const destinations = new Set<string>();

    if (branchingQ && branchingQ.options) {
      branchingQ.options.forEach(opt => {
        if (opt.destinationSectionId && opt.destinationSectionId !== ACTION_SUBMIT_FORM && opt.destinationSectionId !== ACTION_CONTINUE_NEXT) {
          if (sections.some(s => s.id === opt.destinationSectionId)) {
            destinations.add(opt.destinationSectionId);
          }
        } else if (idx < sections.length - 1) {
          destinations.add(sections[idx + 1].id);
        }
      });
    } else if (idx < sections.length - 1) {
      destinations.add(sections[idx + 1].id);
    }

    adjacencyList.set(sec.id, Array.from(destinations));
  });

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  let loopDetectedPath: string[] = [];

  function dfs(currentId: string, currentPath: string[]): boolean {
    visited.add(currentId);
    recursionStack.add(currentId);
    currentPath.push(currentId);

    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...currentPath])) return true;
      } else if (recursionStack.has(neighbor)) {
        loopDetectedPath = [...currentPath, neighbor];
        return true;
      }
    }

    recursionStack.delete(currentId);
    return false;
  }

  for (const sec of sections) {
    if (!visited.has(sec.id)) {
      if (dfs(sec.id, [])) {
        const loopSectionNames = loopDetectedPath.map(id => {
          const s = sections.find(secItem => secItem.id === id);
          return s ? s.title : id;
        });

        return {
          hasLoop: true,
          loopPath: loopDetectedPath,
          error: `This branching setup creates a loop (${loopSectionNames.join(' → ')}). Please review section destinations.`
        };
      }
    }
  }

  return { hasLoop: false };
}

/**
 * Validates the full branching configuration of a form.
 * Ensures:
 * 1. Destinations exist in form.sections.
 * 2. No circular loops.
 * 3. At most one branching question per section.
 * 4. Checkbox questions do not have branching enabled.
 */
export function validateBranchingIntegrity(form: Form): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sections = form.sections || [];
  const sectionIdSet = new Set(sections.map(s => s.id));

  // 1. Check one branching question per section rule
  const branchingQuestionsBySection = new Map<string, Question[]>();
  (form.questions || []).forEach(q => {
    if (q.enableBranching) {
      if (q.type === 'checkboxes') {
        errors.push(`Question "${q.title}" uses Checkboxes which do not support conditional routing.`);
      }
      const existing = branchingQuestionsBySection.get(q.sectionId) || [];
      existing.push(q);
      branchingQuestionsBySection.set(q.sectionId, existing);
    }
  });

  branchingQuestionsBySection.forEach((questions, secId) => {
    if (questions.length > 1) {
      const sec = sections.find(s => s.id === secId);
      errors.push(`Section "${sec?.title || secId}" has multiple branching questions. Only one question can control the next section.`);
    }
  });

  // 2. Check destination validity
  (form.questions || []).forEach(q => {
    if (q.enableBranching && q.options) {
      q.options.forEach(opt => {
        if (opt.destinationSectionId && opt.destinationSectionId !== ACTION_SUBMIT_FORM && opt.destinationSectionId !== ACTION_CONTINUE_NEXT) {
          if (!sectionIdSet.has(opt.destinationSectionId)) {
            warnings.push(`Option "${opt.label}" in question "${q.title}" points to a deleted or invalid section.`);
          }
        }
      });
    }
  });

  // 3. Loop detection
  const loopResult = detectBranchingLoops(form);
  if (loopResult.hasLoop && loopResult.error) {
    errors.push(loopResult.error);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Returns all active questions belonging to the reachable/visited sections on the dynamic path.
 * Questions in skipped sections are excluded.
 */
export function getReachableQuestions(
  form: Form,
  answers: Record<string, any>,
  visitedSectionIds?: string[]
): Question[] {
  const reachableSectionIds = visitedSectionIds && visitedSectionIds.length > 0
    ? visitedSectionIds
    : calculateReachablePath(form, answers);

  const reachableSet = new Set(reachableSectionIds);
  return (form.questions || []).filter(q => reachableSet.has(q.sectionId));
}

/**
 * Computes the respondent progress percentage based on questions in reachable sections.
 */
export function calculateBranchingProgress(
  form: Form,
  answers: Record<string, any>,
  visitedSectionIds?: string[]
): {
  progressPercent: number;
  answeredCount: number;
  totalCount: number;
} {
  const reachableQuestions = getReachableQuestions(form, answers, visitedSectionIds);
  if (reachableQuestions.length === 0) {
    return { progressPercent: 0, answeredCount: 0, totalCount: 0 };
  }

  const answeredCount = reachableQuestions.filter(q => {
    const val = answers[q.id];
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  }).length;

  const progressPercent = Math.round((answeredCount / reachableQuestions.length) * 100);

  return {
    progressPercent,
    answeredCount,
    totalCount: reachableQuestions.length
  };
}
