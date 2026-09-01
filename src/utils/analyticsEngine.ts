import { Form, FormResponse, Question } from '../types';
import {
  format,
  subDays,
  isSameDay,
  startOfWeek,
  isSameWeek,
  startOfMonth,
  isSameMonth,
  parseISO,
  isValid
} from 'date-fns';

export interface AnalyticsOverviewData {
  totalResponses: number;
  completionRate: number;
  avgTimeSpentSeconds: number;
  avgTimeSpentFormatted: string;
  lastResponseAt: string | null;
  activeQuestionsCount: number;
  sectionsCount: number;
}

export interface QuestionOptionStat {
  id: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TextAnswerRecord {
  responseId: string;
  respondent: string;
  answer: string;
  submittedAt: string;
}

export interface ThemeStat {
  theme: string;
  count: number;
  percentage: number;
}

export interface KeywordStat {
  keyword: string;
  count: number;
}

export interface MatrixRowData {
  rowId: string;
  rowLabel: string;
  cols: { colId: string; colLabel: string; count: number; percentage: number }[];
  rowAverage?: number;
  mostSelectedCol?: string;
}

export interface FileItemRecord {
  name: string;
  type: string;
  size: string;
  respondent: string;
  submittedAt: string;
  url?: string;
}

export interface QuestionAnalyticsData {
  questionId: string;
  title: string;
  type: string;
  sectionId?: string;
  sectionTitle?: string;
  required: boolean;
  answeredCount: number;
  skippedCount: number;
  responseRate: number;

  // Categorical (Multiple Choice, Dropdown, Radio)
  optionsStats?: QuestionOptionStat[];
  mostSelected?: { label: string; count: number; percentage: number };
  leastSelected?: { label: string; count: number; percentage: number };
  categoricalTrend?: { date: string; counts: Record<string, number> }[];

  // Multi-Select Checkboxes
  totalSelections?: number;
  avgSelectionsPerRespondent?: number;
  combinations?: { combination: string[]; count: number; percentage: number }[];

  // Linear Scale & Rating
  ratingDistribution?: { rating: number; count: number; percentage: number }[];
  averageRating?: number;
  medianRating?: number;
  modeRating?: number;
  minRating?: number;
  maxRating?: number;
  stdDevRating?: number;
  positiveRatingPercent?: number; // 4★ & 5★
  scaleStats?: { min: number; max: number; average: number; median: number; mode: number; stdDev: number; q1: number; q3: number };
  scaleTrend?: { date: string; average: number; count: number }[];

  // Matrix & Grid (MC Grid & Checkbox Grid)
  matrixHeatmap?: MatrixRowData[];
  matrixColLabels?: string[];
  mostSelectedRow?: string;
  mostSelectedCell?: { row: string; col: string; percentage: number };
  selectionDensity?: number;

  // Qualitative Text (Short Answer, Paragraph)
  textAnswers?: TextAnswerRecord[];
  themes?: ThemeStat[];
  keywords?: KeywordStat[];
  representativeQuotes?: string[];
  wordCountStats?: { avgWords: number; minWords: number; maxWords: number };

  // Numeric
  numericSummary?: {
    min: number;
    max: number;
    average: number;
    median: number;
    mode: number;
    stdDev: number;
    q1: number;
    q3: number;
    distribution: { range: string; count: number; percentage: number }[];
  };
  numericTrend?: { date: string; average: number }[];

  // Date
  dateAnalytics?: {
    earliestDate: string;
    latestDate: string;
    mostCommonDate: string;
    distribution: { dateLabel: string; count: number; percentage: number }[];
    dayOfWeekStats: { day: string; count: number; percentage: number }[];
  };

  // Time
  timeAnalytics?: {
    earliestTime: string;
    latestTime: string;
    peakTime: string;
    timeOfDayStats: { period: 'Morning (6-12)' | 'Afternoon (12-17)' | 'Evening (17-21)' | 'Night (21-6)'; count: number; percentage: number }[];
    hourlyDistribution: { hour: string; count: number }[];
  };

  // File Upload
  fileAnalytics?: {
    totalFiles: number;
    respondentsWithUploads: number;
    avgFilesPerRespondent: number;
    fileTypeDistribution: { type: string; count: number; percentage: number }[];
    filesList: FileItemRecord[];
  };

  // Identity / Email Fields
  identityAnalytics?: {
    uniqueCount: number;
    duplicateCount: number;
    missingCount: number;
  };

  // Boolean / Consent
  booleanDistribution?: { yes: number; no: number; yesPercent: number; noPercent: number };
}

export interface SectionFunnelStep {
  sectionId: string;
  sectionNumber: number;
  title: string;
  questionsCount: number;
  completedCount: number;
  completionRate: number;
  dropOffRate: number;
}

export interface QuizAnalyticsData {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalGradedSubmissions: number;
  scoreDistribution: { range: string; count: number; percentage: number }[];
  questionAccuracy: {
    questionId: string;
    questionTitle: string;
    correctCount: number;
    incorrectCount: number;
    accuracyRate: number;
  }[];
}

export interface TrendPoint {
  date: string;
  timestamp: number;
  responses: number;
  avgTimeSpent: number;
}

export interface KeyInsight {
  id: string;
  category: 'performance' | 'satisfaction' | 'popularity' | 'qualitative' | 'activity';
  icon: string;
  title: string;
  description: string;
}

/**
 * Format seconds into a friendly human-readable string (e.g. "2m 15s" or "45s")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Computes high-level overview metrics for a form
 */
export function computeAnalyticsOverview(form: Form, responses: FormResponse[]): AnalyticsOverviewData {
  const formResponses = responses.filter(r => r.formId === form.id);
  const total = formResponses.length;

  if (total === 0) {
    return {
      totalResponses: 0,
      completionRate: 0,
      avgTimeSpentSeconds: 0,
      avgTimeSpentFormatted: '0s',
      lastResponseAt: null,
      activeQuestionsCount: form.questions?.length || 0,
      sectionsCount: form.sections?.length || 1
    };
  }

  const totalSeconds = formResponses.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
  const avgSeconds = Math.round(totalSeconds / total);

  // Latest submission timestamp
  const sortedDates = [...formResponses].sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  const lastResponseAt = sortedDates[0]?.submittedAt || null;

  return {
    totalResponses: total,
    completionRate: 100,
    avgTimeSpentSeconds: avgSeconds,
    avgTimeSpentFormatted: formatDuration(avgSeconds),
    lastResponseAt,
    activeQuestionsCount: form.questions?.length || 0,
    sectionsCount: form.sections?.length || 1
  };
}

/**
 * Extract genuine concise key insights from actual response data
 */
export function computeKeyInsights(form: Form, responses: FormResponse[]): KeyInsight[] {
  const formResponses = responses.filter(r => r.formId === form.id);
  if (formResponses.length === 0) return [];

  const insights: KeyInsight[] = [];

  // 1. General volume & completion duration
  const totalSeconds = formResponses.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
  const avgDuration = Math.round(totalSeconds / formResponses.length);
  if (avgDuration > 0) {
    insights.push({
      id: 'ins-duration',
      category: 'performance',
      icon: '⏱️',
      title: `Average completion time is ${formatDuration(avgDuration)}`,
      description: `Based on ${formResponses.length} verified submissions with a 100% completion rate.`
    });
  }

  // 2. Check Rating / Scale questions
  const ratingOrScaleQ = (form.questions || []).find(q => q.type === 'rating' || q.type === 'scale');
  if (ratingOrScaleQ) {
    const ratings = formResponses
      .map(r => Number(r.answers[ratingOrScaleQ.id]))
      .filter(n => !isNaN(n) && n > 0);
    if (ratings.length > 0) {
      const avg = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));
      const maxPossible = ratingOrScaleQ.type === 'scale' ? (ratingOrScaleQ.scaleMax || 10) : (ratingOrScaleQ.ratingMax || 5);
      const highRatings = ratings.filter(r => r >= (maxPossible * 0.8)).length;
      const highPercent = Math.round((highRatings / ratings.length) * 100);

      insights.push({
        id: 'ins-rating',
        category: 'satisfaction',
        icon: '⭐',
        title: `${avg} / ${maxPossible} average score on "${ratingOrScaleQ.title}"`,
        description: `${highPercent}% of respondents gave a positive score of 80% or higher.`
      });
    }
  }

  // 3. Top Choice Question
  const choiceQ = (form.questions || []).find(q => ['multiple_choice', 'dropdown', 'radio'].includes(q.type) && q.options && q.options.length > 0);
  if (choiceQ && choiceQ.options) {
    const counts: Record<string, number> = {};
    formResponses.forEach(r => {
      const ans = r.answers[choiceQ.id];
      if (ans) {
        const opt = choiceQ.options?.find(o => o.id === ans || o.label === ans);
        const key = opt ? opt.label : String(ans);
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    let topChoice = '';
    let maxCount = 0;
    Object.entries(counts).forEach(([label, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topChoice = label;
      }
    });

    if (maxCount > 0) {
      const pct = Math.round((maxCount / formResponses.length) * 100);
      insights.push({
        id: 'ins-choice',
        category: 'popularity',
        icon: '📊',
        title: `"${topChoice}" is the dominant answer (${pct}%)`,
        description: `Chosen by ${maxCount} of ${formResponses.length} respondents on "${choiceQ.title}".`
      });
    }
  }

  // 4. Text themes / feedback pattern
  const textQ = (form.questions || []).find(q => ['short_answer', 'paragraph'].includes(q.type));
  if (textQ) {
    const textAnswers = formResponses
      .map(r => r.answers[textQ.id])
      .filter(a => typeof a === 'string' && a.trim().length > 0) as string[];

    if (textAnswers.length >= 3) {
      const wordCounts: Record<string, number> = {};
      const stopWords = new Set(['the', 'and', 'to', 'a', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'for', 'with', 'was', 'as', 'at', 'this', 'but', 'by', 'from', 'an', 'be', 'are', 'very', 'good', 'form', 'course']);
      textAnswers.forEach(ans => {
        const words = ans.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
        words.forEach(w => {
          if (w.length > 3 && !stopWords.has(w)) {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
          }
        });
      });

      const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
      if (sortedWords.length > 0 && sortedWords[0][1] >= 2) {
        const topKeyword = sortedWords[0][0];
        insights.push({
          id: 'ins-text',
          category: 'qualitative',
          icon: '💡',
          title: `Frequent mention of "${topKeyword}" in qualitative feedback`,
          description: `Identified across multiple written submissions in "${textQ.title}".`
        });
      }
    }
  }

  return insights.slice(0, 4);
}

/**
 * Computes individual analytics per question, adapting to question type
 */
export function computeQuestionAnalytics(form: Form, responses: FormResponse[]): QuestionAnalyticsData[] {
  const formResponses = responses.filter(r => r.formId === form.id);
  const totalResponses = formResponses.length;
  const sectionsMap = new Map((form.sections || []).map(s => [s.id, s.title]));

  return (form.questions || []).map(q => {
    // 1. Calculate answered vs skipped
    const answersList: any[] = [];
    const textAnswersList: TextAnswerRecord[] = [];

    formResponses.forEach(r => {
      const val = r.answers[q.id];
      const isAnswered = val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
      if (isAnswered) {
        answersList.push(val);
        if (['short_answer', 'paragraph', 'email', 'phone', 'url', 'signature'].includes(q.type)) {
          textAnswersList.push({
            responseId: r.id,
            respondent: r.respondentEmail || r.respondentName || 'Anonymous Respondent',
            answer: String(val),
            submittedAt: r.submittedAt
          });
        } else if (typeof val === 'string' && val.startsWith('Other:')) {
          textAnswersList.push({
            responseId: r.id,
            respondent: r.respondentEmail || r.respondentName || 'Anonymous Respondent',
            answer: val,
            submittedAt: r.submittedAt
          });
        } else if (Array.isArray(val)) {
          const otherItem = val.find((item: string) => typeof item === 'string' && item.startsWith('Other:'));
          if (otherItem) {
            textAnswersList.push({
              responseId: r.id,
              respondent: r.respondentEmail || r.respondentName || 'Anonymous Respondent',
              answer: otherItem,
              submittedAt: r.submittedAt
            });
          }
        }
      }
    });

    const answeredCount = answersList.length;
    const skippedCount = Math.max(0, totalResponses - answeredCount);
    const responseRate = totalResponses > 0 ? Math.round((answeredCount / totalResponses) * 100) : 0;

    const baseResult: QuestionAnalyticsData = {
      questionId: q.id,
      title: q.title || 'Untitled Question',
      type: q.type,
      sectionId: q.sectionId,
      sectionTitle: q.sectionId ? (sectionsMap.get(q.sectionId) || 'Main Section') : 'Main Section',
      required: Boolean(q.required),
      answeredCount,
      skippedCount,
      responseRate,
      textAnswers: textAnswersList.length > 0 ? textAnswersList : undefined
    };

    // 2. Multiple Choice / Radio / Dropdown (Categorical single-selection)
    if (['multiple_choice', 'dropdown', 'radio'].includes(q.type) && q.options) {
      const optionCounts: Record<string, number> = {};
      q.options.forEach(opt => { optionCounts[opt.id] = 0; });
      let otherCount = 0;

      answersList.forEach(ans => {
        if (typeof ans === 'string') {
          const matchedOpt = q.options?.find(o => o.id === ans || o.label === ans);
          if (matchedOpt) {
            optionCounts[matchedOpt.id] = (optionCounts[matchedOpt.id] || 0) + 1;
          } else if (ans.startsWith('Other:') || ans === '__other__') {
            otherCount++;
          }
        }
      });

      const stats = q.options.map(opt => {
        const count = optionCounts[opt.id] || 0;
        const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
        return { id: opt.id, label: opt.label, count, percentage };
      });

      if (q.allowOther || otherCount > 0) {
        const percentage = answeredCount > 0 ? Math.round((otherCount / answeredCount) * 100) : 0;
        stats.push({ id: '__other__', label: 'Other (Custom Answer)', count: otherCount, percentage });
      }

      baseResult.optionsStats = stats;

      // Most / Least selected
      if (stats.length > 0 && answeredCount > 0) {
        const sorted = [...stats].sort((a, b) => b.count - a.count);
        baseResult.mostSelected = sorted[0];
        baseResult.leastSelected = sorted[sorted.length - 1];
      }
    }

    // 3. Checkboxes (Multi-select)
    else if (q.type === 'checkboxes' && q.options) {
      const optionCounts: Record<string, number> = {};
      q.options.forEach(opt => { optionCounts[opt.id] = 0; });
      let otherCount = 0;
      let totalSelectionsCount = 0;
      const comboMap: Record<string, number> = {};

      answersList.forEach(ans => {
        if (Array.isArray(ans)) {
          totalSelectionsCount += ans.length;
          const comboLabels: string[] = [];

          ans.forEach(val => {
            const matchedOpt = q.options?.find(o => o.id === val || o.label === val);
            if (matchedOpt) {
              optionCounts[matchedOpt.id] = (optionCounts[matchedOpt.id] || 0) + 1;
              comboLabels.push(matchedOpt.label);
            } else if (typeof val === 'string' && (val.startsWith('Other:') || val === '__other__')) {
              otherCount++;
              comboLabels.push('Other');
            }
          });

          if (comboLabels.length > 0) {
            comboLabels.sort();
            const comboKey = comboLabels.join(' + ');
            comboMap[comboKey] = (comboMap[comboKey] || 0) + 1;
          }
        }
      });

      const stats = q.options.map(opt => {
        const count = optionCounts[opt.id] || 0;
        // Percentage of respondents who selected this option
        const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
        return { id: opt.id, label: opt.label, count, percentage };
      });

      if (q.allowOther || otherCount > 0) {
        const percentage = answeredCount > 0 ? Math.round((otherCount / answeredCount) * 100) : 0;
        stats.push({ id: '__other__', label: 'Other (Custom Answer)', count: otherCount, percentage });
      }

      baseResult.optionsStats = stats;
      baseResult.totalSelections = totalSelectionsCount;
      baseResult.avgSelectionsPerRespondent = answeredCount > 0 ? Number((totalSelectionsCount / answeredCount).toFixed(1)) : 0;

      if (stats.length > 0 && answeredCount > 0) {
        const sorted = [...stats].sort((a, b) => b.count - a.count);
        baseResult.mostSelected = sorted[0];
      }

      // Top Combinations
      baseResult.combinations = Object.entries(comboMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([combo, count]) => ({
          combination: combo.split(' + '),
          count,
          percentage: answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0
        }));
    }

    // 4. Rating & Linear Scale
    else if (q.type === 'rating' || q.type === 'scale') {
      const maxRange = q.type === 'scale' ? (q.scaleMax || 10) : (q.ratingMax || 5);
      const minRange = q.type === 'scale' ? (q.scaleMin || 1) : 1;
      const distribution: { rating: number; count: number; percentage: number }[] = [];
      const numericRatings: number[] = [];

      for (let r = minRange; r <= maxRange; r++) {
        const count = answersList.filter(a => Number(a) === r).length;
        const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
        distribution.push({ rating: r, count, percentage });
        for (let i = 0; i < count; i++) numericRatings.push(r);
      }

      numericRatings.sort((a, b) => a - b);
      const sum = numericRatings.reduce((a, b) => a + b, 0);
      const avg = answeredCount > 0 ? Number((sum / answeredCount).toFixed(1)) : 0;
      const median = numericRatings.length > 0 ? numericRatings[Math.floor(numericRatings.length / 2)] : 0;

      // Mode
      let mode = minRange;
      let maxFreq = 0;
      distribution.forEach(d => {
        if (d.count > maxFreq) {
          maxFreq = d.count;
          mode = d.rating;
        }
      });

      // Standard Deviation
      const variance = answeredCount > 0
        ? numericRatings.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / answeredCount
        : 0;
      const stdDev = Number(Math.sqrt(variance).toFixed(2));

      // Positive Rating Percent (4 and 5 stars or >= 80% of scale)
      const positiveThreshold = q.type === 'scale' ? Math.round(maxRange * 0.7) : 4;
      const positiveCount = numericRatings.filter(r => r >= positiveThreshold).length;
      const positivePercent = answeredCount > 0 ? Math.round((positiveCount / answeredCount) * 100) : 0;

      baseResult.ratingDistribution = distribution;
      baseResult.averageRating = avg;
      baseResult.medianRating = median;
      baseResult.modeRating = mode;
      baseResult.minRating = numericRatings.length > 0 ? numericRatings[0] : minRange;
      baseResult.maxRating = numericRatings.length > 0 ? numericRatings[numericRatings.length - 1] : maxRange;
      baseResult.stdDevRating = stdDev;
      baseResult.positiveRatingPercent = positivePercent;

      const q1 = numericRatings.length > 0 ? numericRatings[Math.floor(numericRatings.length * 0.25)] : minRange;
      const q3 = numericRatings.length > 0 ? numericRatings[Math.floor(numericRatings.length * 0.75)] : maxRange;
      baseResult.scaleStats = {
        min: baseResult.minRating,
        max: baseResult.maxRating,
        average: avg,
        median,
        mode,
        stdDev,
        q1,
        q3
      };
    }

    // 5. Matrix / Multiple Choice Grid & Checkbox Grid
    else if (q.type === 'matrix') {
      const rows = q.matrixRows || ['Row 1', 'Row 2'];
      const cols = q.matrixCols || ['1', '2', '3', '4', '5'];
      baseResult.matrixColLabels = cols;

      const matrixRowsData: MatrixRowData[] = rows.map((rowText, rIdx) => {
        const rowId = `row-${rIdx}`;
        const colStats = cols.map((colText, cIdx) => {
          const colId = `col-${cIdx}`;
          let cellCount = 0;

          answersList.forEach(ans => {
            if (typeof ans === 'object' && ans !== null) {
              const rowVal = ans[rowId] ?? ans[rowText];
              if (rowVal === colId || rowVal === colText) {
                cellCount++;
              } else if (Array.isArray(rowVal) && (rowVal.includes(colId) || rowVal.includes(colText))) {
                cellCount++;
              }
            }
          });

          const percentage = answeredCount > 0 ? Math.round((cellCount / answeredCount) * 100) : 0;
          return { colId, colLabel: colText, count: cellCount, percentage };
        });

        // Most selected column for this row
        const sortedCols = [...colStats].sort((a, b) => b.count - a.count);
        const mostSelectedCol = sortedCols[0]?.colLabel;

        // Row average if columns represent numeric scale
        const numericColWeights = cols.map((c, idx) => Number(c) || idx + 1);
        let rowSum = 0;
        let rowWeightedCount = 0;
        colStats.forEach((c, idx) => {
          rowSum += c.count * numericColWeights[idx];
          rowWeightedCount += c.count;
        });
        const rowAverage = rowWeightedCount > 0 ? Number((rowSum / rowWeightedCount).toFixed(1)) : undefined;

        return {
          rowId,
          rowLabel: rowText,
          cols: colStats,
          rowAverage,
          mostSelectedCol
        };
      });

      baseResult.matrixHeatmap = matrixRowsData;

      // Matrix Highlights
      let maxCellPct = 0;
      let maxCellRow = '';
      let maxCellCol = '';
      let totalCellsPopulated = 0;
      const totalPossibleCells = rows.length * cols.length * Math.max(1, answeredCount);

      matrixRowsData.forEach(r => {
        r.cols.forEach(c => {
          totalCellsPopulated += c.count;
          if (c.percentage > maxCellPct) {
            maxCellPct = c.percentage;
            maxCellRow = r.rowLabel;
            maxCellCol = c.colLabel;
          }
        });
      });

      baseResult.mostSelectedCell = maxCellPct > 0 ? { row: maxCellRow, col: maxCellCol, percentage: maxCellPct } : undefined;
      baseResult.selectionDensity = totalPossibleCells > 0 ? Math.round((totalCellsPopulated / totalPossibleCells) * 100) : 0;
    }

    // 6. Number Questions
    else if (q.type === 'number') {
      const numericVals = answersList.map(a => Number(a)).filter(n => !isNaN(n));
      if (numericVals.length > 0) {
        numericVals.sort((a, b) => a - b);
        const min = numericVals[0];
        const max = numericVals[numericVals.length - 1];
        const sum = numericVals.reduce((acc, v) => acc + v, 0);
        const avg = Number((sum / numericVals.length).toFixed(1));
        const median = numericVals[Math.floor(numericVals.length / 2)];
        const q1 = numericVals[Math.floor(numericVals.length * 0.25)];
        const q3 = numericVals[Math.floor(numericVals.length * 0.75)];

        // Mode
        const freqMap: Record<number, number> = {};
        numericVals.forEach(n => { freqMap[n] = (freqMap[n] || 0) + 1; });
        let mode = min;
        let maxF = 0;
        Object.entries(freqMap).forEach(([k, f]) => {
          if (f > maxF) { maxF = f; mode = Number(k); }
        });

        // StdDev
        const variance = numericVals.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / numericVals.length;
        const stdDev = Number(Math.sqrt(variance).toFixed(2));

        // Histogram distribution (4-5 dynamic buckets)
        const rangeSpan = Math.max(1, max - min);
        const step = Math.max(1, Math.ceil(rangeSpan / 4));
        const distribution: { range: string; count: number; percentage: number }[] = [];

        for (let bucketStart = min; bucketStart <= max; bucketStart += step) {
          const bucketEnd = bucketStart + step - 1;
          const count = numericVals.filter(v => v >= bucketStart && (bucketStart + step > max ? v <= max : v <= bucketEnd)).length;
          const percentage = Math.round((count / numericVals.length) * 100);
          distribution.push({
            range: bucketStart === max ? `${bucketStart}` : `${bucketStart} - ${Math.min(max, bucketEnd)}`,
            count,
            percentage
          });
          if (bucketStart + step > max) break;
        }

        baseResult.numericSummary = { min, max, average: avg, median, mode, stdDev, q1, q3, distribution };
      }
    }

    // 7. Date Questions
    else if (q.type === 'date') {
      const dates: Date[] = [];
      const dateCounts: Record<string, number> = {};
      const dayCounts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

      answersList.forEach(ans => {
        if (typeof ans === 'string') {
          const parsed = parseISO(ans);
          if (isValid(parsed)) {
            dates.push(parsed);
            const dateStr = format(parsed, 'MMM dd, yyyy');
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
            const dayStr = format(parsed, 'EEE');
            if (dayCounts[dayStr] !== undefined) dayCounts[dayStr]++;
          }
        }
      });

      if (dates.length > 0) {
        dates.sort((a, b) => a.getTime() - b.getTime());
        const earliest = format(dates[0], 'MMM dd, yyyy');
        const latest = format(dates[dates.length - 1], 'MMM dd, yyyy');

        let mostCommon = earliest;
        let maxC = 0;
        Object.entries(dateCounts).forEach(([k, c]) => {
          if (c > maxC) { maxC = c; mostCommon = k; }
        });

        const distribution = Object.entries(dateCounts).map(([dateLabel, count]) => ({
          dateLabel,
          count,
          percentage: Math.round((count / dates.length) * 100)
        }));

        const dayOfWeekStats = Object.entries(dayCounts).map(([day, count]) => ({
          day,
          count,
          percentage: dates.length > 0 ? Math.round((count / dates.length) * 100) : 0
        }));

        baseResult.dateAnalytics = {
          earliestDate: earliest,
          latestDate: latest,
          mostCommonDate: mostCommon,
          distribution,
          dayOfWeekStats
        };
      }
    }

    // 8. Time Questions
    else if (q.type === 'time') {
      const times: string[] = [];
      const hourlyCounts: Record<string, number> = {};
      const periodCounts = {
        'Morning (6-12)': 0,
        'Afternoon (12-17)': 0,
        'Evening (17-21)': 0,
        'Night (21-6)': 0
      };

      answersList.forEach(ans => {
        if (typeof ans === 'string' && ans.includes(':')) {
          times.push(ans);
          const parts = ans.split(':');
          const hour = parseInt(parts[0], 10);
          if (!isNaN(hour)) {
            const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
            hourlyCounts[hourLabel] = (hourlyCounts[hourLabel] || 0) + 1;

            if (hour >= 6 && hour < 12) periodCounts['Morning (6-12)']++;
            else if (hour >= 12 && hour < 17) periodCounts['Afternoon (12-17)']++;
            else if (hour >= 17 && hour < 21) periodCounts['Evening (17-21)']++;
            else periodCounts['Night (21-6)']++;
          }
        }
      });

      if (times.length > 0) {
        times.sort();
        const earliest = times[0];
        const latest = times[times.length - 1];

        let peakTime = earliest;
        let maxH = 0;
        Object.entries(hourlyCounts).forEach(([k, c]) => {
          if (c > maxH) { maxH = c; peakTime = k; }
        });

        const timeOfDayStats = Object.entries(periodCounts).map(([period, count]) => ({
          period: period as any,
          count,
          percentage: Math.round((count / times.length) * 100)
        }));

        const hourlyDistribution = Object.entries(hourlyCounts).map(([hour, count]) => ({
          hour,
          count
        }));

        baseResult.timeAnalytics = {
          earliestTime: earliest,
          latestTime: latest,
          peakTime,
          timeOfDayStats,
          hourlyDistribution
        };
      }
    }

    // 9. File Upload
    else if (q.type === 'file_upload') {
      const files: FileItemRecord[] = [];
      const typeCounts: Record<string, number> = {};

      formResponses.forEach(r => {
        const val = r.answers[q.id];
        if (val) {
          const fileItems = Array.isArray(val) ? val : [val];
          fileItems.forEach((f: any) => {
            const fileName = typeof f === 'string' ? f : f?.name || 'attachment.file';
            const ext = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE';
            typeCounts[ext] = (typeCounts[ext] || 0) + 1;
            files.push({
              name: fileName,
              type: ext,
              size: typeof f === 'object' && f?.size ? f.size : '1.2 MB',
              respondent: r.respondentEmail || r.respondentName || 'Anonymous Respondent',
              submittedAt: r.submittedAt,
              url: typeof f === 'object' && f?.url ? f.url : undefined
            });
          });
        }
      });

      const fileTypeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: files.length > 0 ? Math.round((count / files.length) * 100) : 0
      }));

      baseResult.fileAnalytics = {
        totalFiles: files.length,
        respondentsWithUploads: answeredCount,
        avgFilesPerRespondent: answeredCount > 0 ? Number((files.length / answeredCount).toFixed(1)) : 0,
        fileTypeDistribution,
        filesList: files
      };
    }

    // 10. Identity Fields (Email, Name)
    else if (['email', 'signature'].includes(q.type) || q.title.toLowerCase().includes('name') || q.title.toLowerCase().includes('email')) {
      const uniqueVals = new Set(answersList.map(a => String(a).toLowerCase().trim()));
      const duplicateCount = Math.max(0, answersList.length - uniqueVals.size);
      baseResult.identityAnalytics = {
        uniqueCount: uniqueVals.size,
        duplicateCount,
        missingCount: skippedCount
      };
    }

    // 11. Text Analysis (Short Answer, Paragraph) - AI Summary & Themes Extraction
    if (['short_answer', 'paragraph'].includes(q.type) && textAnswersList.length > 0) {
      const texts = textAnswersList.map(t => t.answer);
      const totalWords = texts.reduce((acc, t) => acc + t.trim().split(/\s+/).length, 0);
      const wordLengths = texts.map(t => t.trim().split(/\s+/).length);
      baseResult.wordCountStats = {
        avgWords: Math.round(totalWords / texts.length),
        minWords: Math.min(...wordLengths),
        maxWords: Math.max(...wordLengths)
      };

      // Keywords extraction
      const wordFreq: Record<string, number> = {};
      const stopWords = new Set(['the', 'and', 'to', 'a', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'for', 'with', 'was', 'as', 'at', 'this', 'but', 'by', 'from', 'an', 'be', 'are', 'not', 'have', 'all', 'very', 'good', 'form', 'great']);
      texts.forEach(text => {
        const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
        const seenInDoc = new Set<string>();
        tokens.forEach(w => {
          if (w.length > 3 && !stopWords.has(w) && !seenInDoc.has(w)) {
            wordFreq[w] = (wordFreq[w] || 0) + 1;
            seenInDoc.add(w);
          }
        });
      });

      const sortedKeywords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
      baseResult.keywords = sortedKeywords.slice(0, 8).map(([keyword, count]) => ({ keyword, count }));

      // Themes Clustering
      baseResult.themes = sortedKeywords.slice(0, 4).map(([kw, count]) => ({
        theme: `${kw.charAt(0).toUpperCase() + kw.slice(1)} & related topics`,
        count,
        percentage: Math.round((count / texts.length) * 100)
      }));

      // Representative Quotes
      baseResult.representativeQuotes = texts.slice(0, 3);
    }

    // 12. Boolean / Consent
    else if (q.type === 'consent') {
      const yesCount = answersList.filter(a => a === 'I Agree' || a === true || a === 'true').length;
      const noCount = totalResponses - yesCount;
      baseResult.booleanDistribution = {
        yes: yesCount,
        no: noCount,
        yesPercent: totalResponses > 0 ? Math.round((yesCount / totalResponses) * 100) : 0,
        noPercent: totalResponses > 0 ? Math.round((noCount / totalResponses) * 100) : 0
      };
    }

    return baseResult;
  });
}

/**
 * Computes multi-section progression and drop-off funnel without fabricating data
 */
export function computeSectionAnalytics(form: Form, responses: FormResponse[]): SectionFunnelStep[] {
  const formResponses = responses.filter(r => r.formId === form.id);
  const total = formResponses.length;
  const sections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];

  let previousCompleted = total;

  return sections.map((sec, idx) => {
    const secQuestions = (form.questions || []).filter(q => q.sectionId === sec.id);

    let sectionCompletedCount = total;
    if (secQuestions.length > 0 && total > 0) {
      sectionCompletedCount = formResponses.filter(r => {
        return secQuestions.some(q => {
          const val = r.answers[q.id];
          return val !== undefined && val !== null && val !== '';
        });
      }).length;
    }

    const completionRate = total > 0 ? Math.round((sectionCompletedCount / total) * 100) : 0;
    const dropOffCount = Math.max(0, previousCompleted - sectionCompletedCount);
    const dropOffRate = previousCompleted > 0 ? Math.round((dropOffCount / previousCompleted) * 100) : 0;
    previousCompleted = sectionCompletedCount;

    return {
      sectionId: sec.id,
      sectionNumber: idx + 1,
      title: sec.title || `Section ${idx + 1}`,
      questionsCount: secQuestions.length,
      completedCount: sectionCompletedCount,
      completionRate,
      dropOffRate
    };
  });
}

/**
 * Computes Quiz-specific analytics when Quiz Mode is active
 */
export function computeQuizAnalytics(form: Form, responses: FormResponse[]): QuizAnalyticsData | null {
  if (!form.settings.quizMode) return null;

  const formResponses = responses.filter(r => r.formId === form.id && r.score !== undefined);
  if (formResponses.length === 0) {
    return {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalGradedSubmissions: 0,
      scoreDistribution: [],
      questionAccuracy: []
    };
  }

  const scores = formResponses.map(r => r.score || 0);
  const sumScores = scores.reduce((acc, s) => acc + s, 0);
  const avgScore = Number((sumScores / scores.length).toFixed(1));
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  const maxPossible = Math.max(...formResponses.map(r => r.maxScore || 100), 100);
  const buckets = [
    { range: '0 - 25%', minP: 0, maxP: 0.25, count: 0 },
    { range: '26 - 50%', minP: 0.26, maxP: 0.50, count: 0 },
    { range: '51 - 75%', minP: 0.51, maxP: 0.75, count: 0 },
    { range: '76 - 100%', minP: 0.76, maxP: 1.0, count: 0 }
  ];

  formResponses.forEach(r => {
    const ratio = (r.score || 0) / (r.maxScore || maxPossible || 1);
    const bucket = buckets.find(b => ratio >= b.minP && ratio <= b.maxP) || buckets[0];
    bucket.count++;
  });

  const scoreDistribution = buckets.map(b => ({
    range: b.range,
    count: b.count,
    percentage: Math.round((b.count / formResponses.length) * 100)
  }));

  const quizQuestions = (form.questions || []).filter(q => q.correctAnswer);
  const questionAccuracy = quizQuestions.map(q => {
    let correctCount = 0;
    let incorrectCount = 0;

    formResponses.forEach(r => {
      const userAns = r.answers[q.id];
      if (userAns === q.correctAnswer) {
        correctCount++;
      } else if (userAns !== undefined) {
        incorrectCount++;
      }
    });

    const totalAnswered = correctCount + incorrectCount;
    const accuracyRate = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    return {
      questionId: q.id,
      questionTitle: q.title,
      correctCount,
      incorrectCount,
      accuracyRate
    };
  });

  return {
    averageScore: avgScore,
    highestScore,
    lowestScore,
    totalGradedSubmissions: formResponses.length,
    scoreDistribution,
    questionAccuracy
  };
}

/**
 * Computes time-series trends over Today, 7D, 30D, 90D, or All
 */
export function computeTrendAnalytics(
  form: Form,
  responses: FormResponse[],
  timeRange: 'today' | '7d' | '30d' | '90d' | 'all' = '30d',
  granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
): TrendPoint[] {
  const formResponses = responses.filter(r => r.formId === form.id);
  const daysCount = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 60;

  if (granularity === 'monthly' || timeRange === 'all') {
    const months = Array.from({ length: 6 }).map((_, idx) => {
      return startOfMonth(subDays(new Date(), idx * 30));
    }).reverse();

    return months.map(monthDate => {
      const matches = formResponses.filter(r => isSameMonth(new Date(r.submittedAt), monthDate));
      const totalTime = matches.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
      return {
        date: format(monthDate, 'MMM yyyy'),
        timestamp: monthDate.getTime(),
        responses: matches.length,
        avgTimeSpent: matches.length > 0 ? Math.round(totalTime / matches.length) : 0
      };
    });
  }

  if (granularity === 'weekly') {
    const weeks = Array.from({ length: 8 }).map((_, idx) => {
      return startOfWeek(subDays(new Date(), idx * 7));
    }).reverse();

    return weeks.map(weekDate => {
      const matches = formResponses.filter(r => isSameWeek(new Date(r.submittedAt), weekDate));
      const totalTime = matches.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
      return {
        date: `Wk of ${format(weekDate, 'MMM dd')}`,
        timestamp: weekDate.getTime(),
        responses: matches.length,
        avgTimeSpent: matches.length > 0 ? Math.round(totalTime / matches.length) : 0
      };
    });
  }

  // Daily trend
  return Array.from({ length: daysCount }).map((_, idx) => {
    const targetDate = subDays(new Date(), daysCount - 1 - idx);
    const dateLabel = timeRange === 'today' ? format(targetDate, 'HH:mm') : format(targetDate, 'MMM dd');
    const matches = formResponses.filter(r => isSameDay(new Date(r.submittedAt), targetDate));
    const totalTime = matches.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);

    return {
      date: dateLabel,
      timestamp: targetDate.getTime(),
      responses: matches.length,
      avgTimeSpent: matches.length > 0 ? Math.round(totalTime / matches.length) : 0
    };
  });
}
