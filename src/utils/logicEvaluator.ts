import { LogicRule } from '../types';

export const evaluateLogicRule = (rule: LogicRule, answer: any): boolean => {
  if (answer === undefined || answer === null) {
    if (rule.operator === 'not_equals') return true;
    return false;
  }

  const strAnswer = String(answer).trim().toLowerCase();
  const ruleVal = String(rule.value || '').trim().toLowerCase();

  switch (rule.operator) {
    case 'equals':
      if (Array.isArray(answer)) {
        return answer.some(item => String(item).trim().toLowerCase() === ruleVal);
      }
      return strAnswer === ruleVal;

    case 'not_equals':
      if (Array.isArray(answer)) {
        return !answer.some(item => String(item).trim().toLowerCase() === ruleVal);
      }
      return strAnswer !== ruleVal;

    case 'contains':
      if (Array.isArray(answer)) {
        return answer.some(item => String(item).toLowerCase().includes(ruleVal));
      }
      return strAnswer.includes(ruleVal);

    case 'greater_than': {
      const numAns = parseFloat(strAnswer);
      const numRule = parseFloat(ruleVal);
      if (isNaN(numAns) || isNaN(numRule)) return false;
      return numAns > numRule;
    }

    case 'less_than': {
      const numAns = parseFloat(strAnswer);
      const numRule = parseFloat(ruleVal);
      if (isNaN(numAns) || isNaN(numRule)) return false;
      return numAns < numRule;
    }

    default:
      return false;
  }
};
