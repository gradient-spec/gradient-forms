import React, { useState } from 'react';
import { Form, Question, Section } from '../../types';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Award, Star, ArrowRight, ArrowLeft, RefreshCw, Upload, FileText, AlertCircle, MessageCircle, ExternalLink, ShieldCheck, Mail, ShieldAlert, Check, Layers, Send, Cloud, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { evaluateLogicRule } from '../../utils/logicEvaluator';
import { getEffectiveFormStatus, formatExpiryDescription } from '../../utils/formStatus';
import {
  resolveNextSectionDestination,
  getReachableQuestions,
  getBranchingQuestionForSection,
  ACTION_SUBMIT_FORM
} from '../../utils/branchingEngine';

interface PublishedFormViewProps {
  form: Form;
  isPreview?: boolean;
}

export const PublishedFormView: React.FC<PublishedFormViewProps> = ({ form, isPreview = false }) => {
  const { submitResponse, showToast, responses } = useApp();
  
  // 1. Save Progress Automatically (Restore from draft if enabled)
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    if (form.settings.saveProgress && !isPreview) {
      const saved = localStorage.getItem(`gf_draft_${form.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { console.error(e); }
      }
    }
    return {};
  });

  // Custom "Other" Text Answers State (for custom responses in dropdown / choices)
  const [customOtherText, setCustomOtherText] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (form.questions) {
      form.questions.forEach(q => {
        const val = answers[q.id];
        if (typeof val === 'string' && val.startsWith('Other:')) {
          initial[q.id] = val.replace(/^Other:\s*/, '');
        } else if (Array.isArray(val)) {
          const otherItem = val.find((item: string) => typeof item === 'string' && item.startsWith('Other:'));
          if (otherItem) {
            initial[q.id] = otherItem.replace(/^Other:\s*/, '');
          }
        }
      });
    }
    return initial;
  });

  // 2. Collect Email Addresses state
  const [respondentEmail, setRespondentEmail] = useState<string>(() => {
    if (form.settings.saveProgress && !isPreview) {
      return localStorage.getItem(`gf_draft_email_${form.id}`) || localStorage.getItem('gf_last_email') || '';
    }
    return localStorage.getItem('gf_last_email') || '';
  });
  const [emailError, setEmailError] = useState(false);
  const [sendCopyRequested, setSendCopyRequested] = useState<boolean>(form.settings.sendResponseCopy === 'always');

  // 3. Limit to 1 Response per Person state
  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(() => {
    if (isPreview) return false;
    if (form.settings.limitOneResponse) {
      return localStorage.getItem(`gf_submitted_${form.id}`) !== null;
    }
    return false;
  });

  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(() => {
    if (form.settings.saveProgress && !isPreview) {
      return localStorage.getItem(`gf_draft_time_${form.id}`) || null;
    }
    return null;
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [quizScore, setQuizScore] = useState<{ score: number; max: number } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);

  const isQuestionVisible = (q: Question): boolean => {
    if (!form.logicRules || form.logicRules.length === 0) return true;

    for (const rule of form.logicRules) {
      if (rule.targetQuestionId === q.id) {
        const sourceAnswer = answers[rule.sourceQuestionId];
        const isMatch = evaluateLogicRule(rule, sourceAnswer);
        if (rule.action === 'show' && !isMatch) return false;
        if (rule.action === 'hide' && isMatch) return false;
      }
    }
    return true;
  };

  const isSectionVisible = (sec: Section): boolean => {
    if (!form.logicRules || form.logicRules.length === 0) return true;

    for (const rule of form.logicRules) {
      if (rule.targetQuestionId === sec.id) {
        const sourceAnswer = answers[rule.sourceQuestionId];
        const isMatch = evaluateLogicRule(rule, sourceAnswer);
        if (rule.action === 'show' && !isMatch) return false;
        if (rule.action === 'hide' && isMatch) return false;
      }
    }

    const secQuestions = form.questions.filter(q => q.sectionId === sec.id);
    if (secQuestions.length > 0 && secQuestions.every(q => !isQuestionVisible(q))) {
      return false;
    }

    return true;
  };

  const rawSections = form.sections && form.sections.length > 0
    ? form.sections
    : [{ id: 'sec-main', title: 'Main Section' }];

  const visibleSections = rawSections.filter(isSectionVisible);

  const [sectionHistory, setSectionHistory] = useState<string[]>(() => [
    visibleSections[0]?.id || rawSections[0].id
  ]);

  const currentSectionId = sectionHistory[sectionHistory.length - 1] || visibleSections[0]?.id || rawSections[0].id;
  const currentSection = visibleSections.find(s => s.id === currentSectionId) || rawSections.find(s => s.id === currentSectionId) || rawSections[0];
  const activeSectionIndex = Math.max(0, visibleSections.findIndex(s => s.id === currentSection.id));

  const nextDestinationInfo = resolveNextSectionDestination(form, currentSection.id, answers);
  const isFinalSection = nextDestinationInfo.destinationSectionId === ACTION_SUBMIT_FORM ||
    (!nextDestinationInfo.destinationSectionId && activeSectionIndex >= visibleSections.length - 1);

  const currentQuestions = form.questions.filter(
    q => q.sectionId === currentSection.id && isQuestionVisible(q)
  );

  const isQuestionAnswered = (q: Question): boolean => {
    const val = answers[q.id];
    if (val === undefined || val === null) return false;

    if (['short_answer', 'paragraph', 'email', 'phone', 'url', 'number', 'date', 'time', 'signature'].includes(q.type)) {
      return String(val).trim().length > 0;
    }
    if (['multiple_choice', 'dropdown'].includes(q.type)) {
      if (val === '__other__' || String(val).trim() === 'Other:' || String(val).trim() === '') return false;
      return String(val).trim().length > 0;
    }
    if (q.type === 'checkboxes') {
      if (!Array.isArray(val) || val.length === 0) return false;
      return val.some(item => item !== '__other__' && item !== 'Other:' && String(item).trim() !== '');
    }
    if (['scale', 'rating'].includes(q.type)) {
      return typeof val === 'number' || String(val).trim().length > 0;
    }
    if (q.type === 'file_upload') {
      return String(val).trim().length > 0;
    }
    if (q.type === 'consent') {
      return Boolean(val);
    }
    if (q.type === 'matrix') {
      if (!val || typeof val !== 'object') return false;
      const rows = q.matrixRows || ['Row 1', 'Row 2'];
      return rows.every(row => Boolean(val[row]));
    }
    return true;
  };

  const validateQuestions = (questionsToCheck: Question[]): boolean => {
    const errors: Record<string, string> = {};
    let firstMissingQuestionId: string | null = null;

    for (const q of questionsToCheck) {
      if (q.required && isQuestionVisible(q)) {
        if (!isQuestionAnswered(q)) {
          errors[q.id] = 'This question is required. Please fill in an answer before submitting.';
          if (!firstMissingQuestionId) {
            firstMissingQuestionId = q.id;
          }
        }
      }
    }

    setValidationErrors(errors);

    if (firstMissingQuestionId) {
      const missingCard = document.getElementById(`question-card-${firstMissingQuestionId}`);
      if (missingCard) {
        missingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = missingCard.querySelector('input, textarea, select, button') as HTMLElement;
        if (focusable) {
          focusable.focus();
        }
      }
      return false;
    }

    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIdx: number) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      // Allow multi-line typing in textarea unless Ctrl+Enter or Cmd+Enter is pressed
      if (target.tagName.toLowerCase() === 'textarea' && !e.ctrlKey && !e.metaKey) {
        return;
      }
      e.preventDefault();

      // Navigate to next question in the current section
      if (currentIdx < currentQuestions.length - 1) {
        const nextQuestion = currentQuestions[currentIdx + 1];
        const nextCard = document.getElementById(`question-card-${nextQuestion.id}`);
        if (nextCard) {
          nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const focusable = nextCard.querySelector('input, textarea, select, button') as HTMLElement;
          if (focusable) {
            focusable.focus();
          }
        }
      } else {
        // Last question in section: scroll to and focus the Next / Submit button
        const actionBtn = document.getElementById('form-submit-or-next-btn') as HTMLElement;
        if (actionBtn) {
          actionBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          actionBtn.focus();
        }
      }
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    // Save Progress Automatically
    if (form.settings.saveProgress && !isPreview) {
      localStorage.setItem(`gf_draft_${form.id}`, JSON.stringify(updatedAnswers));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(`gf_draft_time_${form.id}`, timeStr);
      setDraftSavedTime(timeStr);
    }

    // Invalidate stale future path when a branching question is changed
    const branchingQ = getBranchingQuestionForSection(form, currentSection.id);
    if (branchingQ && branchingQ.id === questionId) {
      const currIdx = sectionHistory.indexOf(currentSection.id);
      if (currIdx !== -1 && currIdx < sectionHistory.length - 1) {
        setSectionHistory(prev => prev.slice(0, currIdx + 1));
      }
    }

    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  const handleEmailChange = (val: string) => {
    setRespondentEmail(val);
    if (emailError) setEmailError(false);
    if (form.settings.saveProgress && !isPreview) {
      localStorage.setItem(`gf_draft_email_${form.id}`, val);
    }
  };

  const handleNextSection = () => {
    const isValid = validateQuestions(currentQuestions);
    if (!isValid) {
      showToast?.('Incomplete Section', `Please complete all required questions in Section ${activeSectionIndex + 1} before proceeding.`, 'error');
      return;
    }
    setValidationErrors({});

    const nextDest = resolveNextSectionDestination(form, currentSection.id, answers);

    if (nextDest.destinationSectionId === ACTION_SUBMIT_FORM) {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
      return;
    }

    if (nextDest.destinationSectionId) {
      setSectionHistory(prev => [...prev, nextDest.destinationSectionId as string]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (sectionHistory.length > 1) {
      setSectionHistory(prev => prev.slice(0, prev.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = respondentEmail.trim();

    // 1. Strictly validate Collect Email Addresses
    if (form.settings.collectEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailPattern.test(cleanEmail)) {
        setEmailError(true);
        const card = document.getElementById('collect-email-card');
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast?.('Email Required', 'Please provide a valid email address before submitting.', 'error');
        return;
      }

      // 2. Validate Limit to 1 Response per Person against submitted emails
      if (form.settings.limitOneResponse && !isPreview) {
        const alreadyHasResponse = responses.some(
          r => r.formId === form.id && r.respondentEmail?.toLowerCase() === cleanEmail.toLowerCase()
        );
        if (alreadyHasResponse) {
          setAlreadySubmitted(true);
          localStorage.setItem(`gf_submitted_${form.id}`, cleanEmail);
          showToast?.('Limit Reached', 'This email has already submitted a response for this form.', 'error');
          return;
        }
      }
    }

    // Strictly validate all reachable questions on the active path
    const reachableQuestions = getReachableQuestions(form, answers, sectionHistory).filter(isQuestionVisible);
    const isValid = validateQuestions(reachableQuestions);
    if (!isValid) {
      showToast?.('Required Questions Missing', 'Please fill in all required questions marked with * before submitting.', 'error');
      return;
    }

    // Strictly validate agreement if enabled in form settings
    if (form.settings.requireAgreement && !hasAgreed) {
      setAgreementError(true);
      const agreeCard = document.getElementById('club-agreement-card');
      agreeCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast?.('Agreement Required', 'Please accept the required agreement before submitting.', 'error');
      return;
    }

    // Save email in localStorage for seamless Google account-style auto-fill
    if (cleanEmail) {
      localStorage.setItem('gf_last_email', cleanEmail);
    }

    // 2. Mark form as submitted for Limit 1 Response
    if (form.settings.limitOneResponse && !isPreview) {
      localStorage.setItem(`gf_submitted_${form.id}`, cleanEmail || 'true');
    }

    // 3. Clear draft from localStorage on successful submission
    if (form.settings.saveProgress && !isPreview) {
      localStorage.removeItem(`gf_draft_${form.id}`);
      localStorage.removeItem(`gf_draft_email_${form.id}`);
      localStorage.removeItem(`gf_draft_time_${form.id}`);
    }

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    if (form.settings.quizMode) {
      let score = 0;
      let maxScore = 0;
      form.questions.forEach(q => {
        if (q.points && q.correctAnswer) {
          maxScore += q.points;
          if (answers[q.id] === q.correctAnswer) {
            score += q.points;
          }
        }
      });
      setQuizScore({ score, max: maxScore });
    }

    const finalEmail = respondentEmail.trim() || answers['q-email'] || answers['email'];
    const finalName = answers['q-name'] || answers['name'] || (finalEmail ? finalEmail.split('@')[0] : undefined);

    submitResponse(
      form.id,
      answers,
      timeSpent,
      finalEmail,
      finalName
    );

    setIsSubmitted(true);

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  if (isSubmitted) {
    return (
      <div className="p-8 md:p-12 max-w-xl mx-auto text-center space-y-6 py-16">
        <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-neo">
          <CheckCircle2 className="w-8 h-8 text-[#38BDF8]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">Submission Confirmed</h2>
          <p className="text-slate-400 text-xs sm:text-sm">{form.settings.confirmationMessage}</p>
        </div>

        {form.settings.quizMode && quizScore && (
          <div className="p-5 rounded-xl bg-[#1A2332] border border-amber-500/40 space-y-2 max-w-xs mx-auto">
            <Award className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Quiz Score Result</div>
            <div className="text-2xl font-bold font-mono text-white">
              {quizScore.score} / {quizScore.max} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
          </div>
        )}

        {/* Google Forms Email Confirmation Receipt Notice */}
        {form.settings.collectEmail && respondentEmail.trim() && (
          <div className="p-3.5 rounded-xl bg-[#16202E] border border-[#2B3B52] text-xs text-slate-300 max-w-md mx-auto flex items-center justify-center gap-2 shadow-sm">
            <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span>
              {sendCopyRequested || form.settings.sendResponseCopy === 'always'
                ? <>A confirmation copy was sent to <strong className="text-white font-mono">{respondentEmail.trim()}</strong></>
                : <>Responses recorded for <strong className="text-white font-mono">{respondentEmail.trim()}</strong></>}
            </span>
          </div>
        )}

        {/* Post-Submission WhatsApp / Community Join Card */}
        <div className="p-6 rounded-2xl bg-[#121820] border-2 border-emerald-500/40 hover:border-emerald-400 transition-all space-y-4 max-w-md mx-auto shadow-[0_0_30px_rgba(16,185,129,0.12)] text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Join Gradient Club Community</h4>
              <p className="text-xs text-slate-400">Stay connected for workshops, hackathons & official updates.</p>
            </div>
          </div>

          <a
            href={form.settings?.communityLink || 'https://chat.whatsapp.com/invite'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-neo cursor-pointer group"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>{form.settings?.communityLinkText || 'Join WhatsApp Group'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setAnswers({});
            setSectionHistory([visibleSections[0]?.id || rawSections[0].id]);
            setHasAgreed(false);
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#84A1C0]" />
          <span>Submit Another Response</span>
        </button>
      </div>
    );
  }

  // Limit to 1 response view
  if (alreadySubmitted) {
    return (
      <div className="p-8 md:p-12 max-w-xl mx-auto text-center space-y-6 py-16">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-neo">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">Response Limit Reached</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            This form is limited to 1 response per person. You have already submitted a response.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] text-xs text-slate-300 text-left space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#84A1C0]">Form Title</div>
          <div className="font-bold text-white">{form.title}</div>
        </div>
        {isPreview && (
          <button
            onClick={() => setAlreadySubmitted(false)}
            className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-neo cursor-pointer"
          >
            Reset Preview Response Lock
          </button>
        )}
      </div>
    );
  }

  const effectiveStatus = getEffectiveFormStatus(form);

  // 1. Manually Closed State
  if (effectiveStatus === 'CLOSED' && !isPreview) {
    return (
      <div className="p-8 md:p-12 max-w-xl mx-auto text-center space-y-6 py-16 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 flex items-center justify-center mx-auto shadow-neo">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">This form is currently closed</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            The administrator has stopped accepting new responses for this form.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] text-xs text-slate-300 text-left space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#84A1C0]">Form Title</div>
          <div className="font-bold text-white">{form.title}</div>
        </div>
      </div>
    );
  }

  // 2. Expired State (Response Deadline Passed)
  if (effectiveStatus === 'EXPIRED' && !isPreview) {
    const customMessage = form.expiryMessage || form.settings?.expiryMessage;
    const expiryDetails = (form.expiresAt || form.settings?.expiresAt)
      ? formatExpiryDescription(form.expiresAt || form.settings?.expiresAt!)
      : null;

    return (
      <div className="p-8 md:p-12 max-w-xl mx-auto text-center space-y-6 py-16 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-neo">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">This form is no longer accepting responses</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto whitespace-pre-wrap">
            {customMessage || 'The response deadline for this form has passed.'}
          </p>
        </div>
        {expiryDetails && (
          <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] text-xs text-slate-300 text-center space-y-1 max-w-sm mx-auto">
            <div className="text-[10px] font-mono uppercase text-amber-400">Response Deadline</div>
            <div className="font-mono text-white font-bold">{expiryDetails.fullLabel}</div>
          </div>
        )}
      </div>
    );
  }

  const reachableQuestions = getReachableQuestions(form, answers, sectionHistory).filter(isQuestionVisible);
  const answeredQuestionsCount = reachableQuestions.filter(q => isQuestionAnswered(q)).length;
  const progressPercent = reachableQuestions.length > 0
    ? Math.round((answeredQuestionsCount / reachableQuestions.length) * 100)
    : 0;

  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto space-y-8 min-h-[550px] flex flex-col justify-between" style={{ fontFamily: form.theme.fontFamily }}>
      {/* Header */}
      <div className="space-y-4">
        {/* Dynamic Progress Bar (Enabled via Show Section Progress Bar) */}
        {form.settings.showProgressBar && (
          <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#84A1C0]">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>Form Progress:</span>
                <span className="text-[#38BDF8]">{answeredQuestionsCount} of {reachableQuestions.length} answered</span>
                {visibleSections.length > 1 && (
                  <span className="text-slate-400 text-[11px]">
                    • (Section {activeSectionIndex + 1}/{visibleSections.length})
                  </span>
                )}
              </span>
              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#121820] rounded-full overflow-hidden border border-[#2A3647]/50">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-6 rounded-xl bg-[#1A2332] border border-[#2A3647] shadow-neo space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">{form.title}</h1>
            {/* Auto-Save Progress Indicator Pill */}
            {form.settings.saveProgress && (
              <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Auto-Save {draftSavedTime ? `@ ${draftSavedTime}` : 'Active'}</span>
              </span>
            )}
          </div>
          {form.description && <p className="text-xs text-slate-400 leading-relaxed">{form.description}</p>}
        </div>

        {/* Google Forms Account & Required Notice Banner */}
        <div className="px-5 py-3 rounded-xl bg-[#141B26] border border-[#263548] text-xs space-y-2 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2563EB] to-cyan-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                {respondentEmail.trim() ? respondentEmail.trim().charAt(0).toUpperCase() : 'G'}
              </div>
              <span className="font-medium text-slate-200 text-xs">
                {respondentEmail.trim() || (form.settings.emailCollectionMode === 'verified' ? 'verified.account@gradientforms.dev' : 'responder@gradientforms.dev')}
              </span>
              {respondentEmail.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setRespondentEmail('');
                    setEmailError(false);
                  }}
                  className="text-[#38BDF8] hover:underline text-[11px] font-mono cursor-pointer ml-1"
                >
                  Switch account
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Draft auto-saved</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-[#263548]/60">
            <span>
              {form.settings.emailCollectionMode === 'verified'
                ? 'Your email will be recorded with your submission.'
                : 'The email provided below will be submitted with this response.'}
            </span>
            <span className="text-rose-400 font-bold ml-2 shrink-0">
              * Indicates required question
            </span>
          </div>
        </div>

        {/* Distinct Section Banner for Multi-Section Forms */}
        {visibleSections.length > 1 && (
          <div className="p-4 rounded-xl bg-[#161D27] border border-[#2A3647] space-y-1 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Section {activeSectionIndex + 1} of {visibleSections.length}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Page {activeSectionIndex + 1}
              </span>
            </div>
            <h2 className="text-base font-bold font-heading text-white">{currentSection.title}</h2>
            {currentSection.description && (
              <p className="text-xs text-slate-400 leading-relaxed pt-0.5">{currentSection.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Collect Email Addresses Field (Rendered on first section) */}
        {form.settings.collectEmail && activeSectionIndex === 0 && (
          <div
            id="collect-email-card"
            className={`p-5 rounded-xl transition-all duration-300 space-y-3 ${
              emailError
                ? 'bg-[#1F1418] border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                : 'bg-[#1A2332] border border-[#2A3647] hover:border-[#38BDF8]/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <label className="block text-sm font-bold text-white leading-snug flex items-center gap-1.5 font-heading">
                <Mail className="w-4 h-4 text-[#38BDF8]" />
                <span>Email</span>
                <span className="text-rose-400 font-bold text-sm ml-0.5">*</span>
              </label>
            </div>
            <p className="text-xs text-slate-400">
              {form.settings.emailCollectionMode === 'verified'
                ? 'Verified email address will be recorded with your submission.'
                : 'Valid email address required for response verification and receipts.'}
            </p>
            <div className="relative">
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  if (respondentEmail.trim()) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    setEmailError(!emailPattern.test(respondentEmail.trim()));
                  }
                }}
                placeholder="Your email"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-sm text-white placeholder-slate-500 focus:outline-none transition-colors border ${
                  emailError ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30' : 'border-[#2A3647] focus:border-[#38BDF8]'
                }`}
              />
            </div>
            {emailError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-medium pt-1 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Please enter a valid email address (e.g. name@domain.com)</span>
              </div>
            )}
          </div>
        )}
        {currentQuestions.map((q, idx) => {
          const hasError = !!validationErrors[q.id];
          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`p-5 rounded-xl transition-all duration-300 space-y-3 ${
                hasError
                  ? 'bg-[#1F1418] border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                  : 'bg-[#1A2332] border border-[#2A3647]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <label className={`block text-white leading-snug ${
                  q.titleStyle?.size === 'lg'
                    ? 'text-lg sm:text-xl'
                    : q.titleStyle?.size === 'sm'
                    ? 'text-xs sm:text-sm'
                    : 'text-sm sm:text-base'
                } ${
                  q.titleStyle?.bold === false ? 'font-normal' : 'font-bold font-heading'
                } ${
                  q.titleStyle?.italic ? 'italic' : ''
                } ${
                  q.titleStyle?.underline ? 'underline decoration-[#38BDF8]/80 underline-offset-4' : ''
                }`}>
                  {idx + 1}. {q.title} {q.required && <span className="text-rose-400 font-bold text-sm ml-0.5">*</span>}
                  {(q.maxSelections || q.validation?.maxSelections) ? (
                    <span className="text-[11px] text-[#38BDF8] font-normal ml-2 font-mono">
                      (Select up to {q.maxSelections || q.validation?.maxSelections} {(q.maxSelections || q.validation?.maxSelections) === 1 ? 'option' : 'options'})
                    </span>
                  ) : null}
                </label>
              </div>

              {q.description && (
                <p className={`text-[11px] text-[#84A1C0] leading-relaxed ${
                  q.descriptionStyle?.bold ? 'font-bold' : ''
                } ${
                  q.descriptionStyle?.italic ? 'italic' : ''
                } ${
                  q.descriptionStyle?.underline ? 'underline' : ''
                }`}>
                  {q.description}
                </p>
              )}

              {/* Attached Image (if present) */}
              {q.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-[#2A3647] bg-[#121820] space-y-1.5 p-2">
                  <img
                    src={q.imageUrl}
                    alt={q.imageCaption || q.title}
                    className="w-full h-auto max-h-80 object-contain rounded-lg mx-auto"
                  />
                  {q.imageCaption && (
                    <p className="text-center text-xs text-slate-400 italic px-2">
                      {q.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Embedded Video (if present) */}
              {q.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-[#2A3647] bg-[#121820] space-y-1.5 p-2">
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src={q.videoUrl}
                      title={q.videoCaption || q.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {q.videoCaption && (
                    <p className="text-center text-xs text-slate-400 italic px-2">
                      {q.videoCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Inputs */}
              {['short_answer', 'email', 'phone', 'url', 'number'].includes(q.type) && (
                <input
                  type={q.type === 'email' ? 'email' : q.type === 'number' ? 'number' : 'text'}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  placeholder={q.placeholder || 'Type your answer...'}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-xs text-white focus:outline-none transition-colors border ${
                    hasError ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#2A3647] focus:border-[#2563EB]'
                  }`}
                />
              )}

              {q.type === 'paragraph' && (
                <textarea
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  placeholder={q.placeholder || 'Type detailed response... (Press Ctrl+Enter for next question)'}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-xs text-white focus:outline-none resize-none transition-colors border ${
                    hasError ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#2A3647] focus:border-[#2563EB]'
                  }`}
                />
              )}

              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                        answers[q.id] === opt.id
                          ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-semibold'
                          : hasError
                          ? 'bg-[#121820] border-rose-500/40 text-slate-300 hover:bg-[#1A2332]'
                          : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt.id}
                        onChange={() => handleAnswerChange(q.id, opt.id)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="accent-[#2563EB]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}

                  {q.allowOther && (
                    <div className="space-y-1.5 pt-0.5">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                          answers[q.id] === '__other__' || (typeof answers[q.id] === 'string' && answers[q.id]?.startsWith('Other:'))
                            ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-semibold'
                            : hasError
                            ? 'bg-[#121820] border-rose-500/40 text-slate-300 hover:bg-[#1A2332]'
                            : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === '__other__' || (typeof answers[q.id] === 'string' && answers[q.id]?.startsWith('Other:'))}
                          onChange={() => {
                            const existingCustom = customOtherText[q.id] || '';
                            handleAnswerChange(q.id, existingCustom.trim() ? `Other: ${existingCustom.trim()}` : '__other__');
                          }}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="accent-[#2563EB]"
                        />
                        <span>Other... (Custom Answer)</span>
                      </label>

                      {(answers[q.id] === '__other__' || (typeof answers[q.id] === 'string' && answers[q.id]?.startsWith('Other:'))) && (
                        <div className="pl-6 animate-fadeIn pt-1">
                          <input
                            type="text"
                            autoFocus
                            value={customOtherText[q.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomOtherText(prev => ({ ...prev, [q.id]: val }));
                              handleAnswerChange(q.id, val.trim() ? `Other: ${val.trim()}` : '__other__');
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            placeholder={q.otherPlaceholder || "Please specify your custom answer..."}
                            className="w-full px-3 py-2 rounded-lg bg-[#161D27] text-xs text-white placeholder-slate-500 border border-[#38BDF8]/60 focus:border-[#38BDF8] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {q.type === 'checkboxes' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt) => {
                    const currentArr: string[] = answers[q.id] || [];
                    const isChecked = currentArr.includes(opt.id);
                    const maxLimit = q.maxSelections || q.validation?.maxSelections;

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-semibold'
                            : hasError
                            ? 'bg-[#121820] border-rose-500/40 text-slate-300 hover:bg-[#1A2332]'
                            : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked && maxLimit && currentArr.length >= maxLimit) {
                              return;
                            }
                            const updated = e.target.checked
                              ? [...currentArr, opt.id]
                              : currentArr.filter(id => id !== opt.id);
                            handleAnswerChange(q.id, updated);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="accent-[#2563EB]"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}

                  {q.allowOther && (() => {
                    const currentArr: string[] = answers[q.id] || [];
                    const isOtherChecked = currentArr.some(id => id === '__other__' || (typeof id === 'string' && id.startsWith('Other:')));
                    const maxLimit = q.maxSelections || q.validation?.maxSelections;

                    return (
                      <div className="space-y-1.5 pt-0.5">
                        <label
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                            isOtherChecked
                              ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-semibold'
                              : hasError
                              ? 'bg-[#121820] border-rose-500/40 text-slate-300 hover:bg-[#1A2332]'
                              : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isOtherChecked}
                            onChange={(e) => {
                              if (e.target.checked && maxLimit && currentArr.length >= maxLimit) {
                                return;
                              }
                              const existingCustom = customOtherText[q.id] || '';
                              const otherVal = existingCustom.trim() ? `Other: ${existingCustom.trim()}` : '__other__';
                              const updated = e.target.checked
                                ? [...currentArr.filter(id => id !== '__other__' && !id.startsWith('Other:')), otherVal]
                                : currentArr.filter(id => id !== '__other__' && !id.startsWith('Other:'));
                              handleAnswerChange(q.id, updated);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className="accent-[#2563EB]"
                          />
                          <span>Other... (Custom Answer)</span>
                        </label>

                        {isOtherChecked && (
                          <div className="pl-6 animate-fadeIn pt-1">
                            <input
                              type="text"
                              autoFocus
                              value={customOtherText[q.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomOtherText(prev => ({ ...prev, [q.id]: val }));
                                const otherVal = val.trim() ? `Other: ${val.trim()}` : '__other__';
                                const updated = currentArr.map(id => (id === '__other__' || (typeof id === 'string' && id.startsWith('Other:'))) ? otherVal : id);
                                if (!updated.some(id => id === otherVal)) {
                                  updated.push(otherVal);
                                }
                                handleAnswerChange(q.id, updated);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, idx)}
                              placeholder={q.otherPlaceholder || "Please specify your custom answer..."}
                              className="w-full px-3 py-2 rounded-lg bg-[#161D27] text-xs text-white placeholder-slate-500 border border-[#38BDF8]/60 focus:border-[#38BDF8] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {q.type === 'dropdown' && (
                <div className="space-y-2">
                  <select
                    value={
                      answers[q.id]?.startsWith?.('Other:') || answers[q.id] === '__other__'
                        ? '__other__'
                        : (answers[q.id] || '')
                    }
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      if (selectedVal === '__other__') {
                        const existingCustom = customOtherText[q.id] || '';
                        handleAnswerChange(q.id, existingCustom.trim() ? `Other: ${existingCustom.trim()}` : '__other__');
                      } else {
                        handleAnswerChange(q.id, selectedVal);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-xs text-white focus:outline-none transition-colors border ${
                      hasError ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#2A3647] focus:border-[#2563EB]'
                    }`}
                  >
                    <option value="">-- Select Option --</option>
                    {(q.options || []).map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    {q.allowOther && (
                      <option value="__other__">Other... (Please specify custom answer)</option>
                    )}
                  </select>

                  {/* Custom Answer Input Field when "Other..." is selected */}
                  {q.allowOther && (answers[q.id] === '__other__' || (typeof answers[q.id] === 'string' && answers[q.id]?.startsWith('Other:'))) && (
                    <div className="pt-1.5 animate-fadeIn space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#38BDF8]">
                        <span className="font-semibold flex items-center gap-1">
                          <span>Please specify your custom answer:</span>
                          {q.required && <span className="text-rose-400">*</span>}
                        </span>
                        <span className="text-[10px] text-slate-400">Custom Answer</span>
                      </div>
                      <input
                        type="text"
                        autoFocus
                        value={customOtherText[q.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomOtherText(prev => ({ ...prev, [q.id]: val }));
                          handleAnswerChange(q.id, val.trim() ? `Other: ${val.trim()}` : '__other__');
                        }}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        placeholder={q.otherPlaceholder || "Please type your custom answer here..."}
                        className={`w-full px-3.5 py-2 rounded-lg bg-[#161D27] text-xs text-white placeholder-slate-500 focus:outline-none transition-colors border ${
                          hasError && !customOtherText[q.id]?.trim()
                            ? 'border-rose-500 ring-1 ring-rose-500/30'
                            : 'border-[#38BDF8]/60 focus:border-[#38BDF8]'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )}

              {q.type === 'scale' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#84A1C0] font-mono">
                    <span>{q.scaleMinLabel || 'Min'}</span>
                    <span>{q.scaleMaxLabel || 'Max'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {Array.from({ length: (q.scaleMax || 10) - (q.scaleMin || 1) + 1 }).map((_, i) => {
                      const val = (q.scaleMin || 1) + i;
                      const isSel = answers[q.id] === val;
                      return (
                        <button
                          type="button"
                          key={val}
                          onClick={() => handleAnswerChange(q.id, val)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className={`flex-1 py-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                            isSel
                              ? 'bg-[#2563EB] border-[#2563EB] text-white'
                              : hasError
                              ? 'bg-[#121820] border-rose-500/40 text-slate-300 hover:bg-[#1A2332]'
                              : 'bg-[#121820] border-[#2A3647] text-slate-300 hover:bg-[#1A2332]'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {q.type === 'rating' && (
                <div className="flex items-center gap-2 text-yellow-500">
                  {Array.from({ length: q.ratingMax || 5 }).map((_, i) => {
                    const ratingVal = i + 1;
                    const isFilled = (answers[q.id] || 0) >= ratingVal;
                    return (
                      <button
                        type="button"
                        key={ratingVal}
                        onClick={() => handleAnswerChange(q.id, ratingVal)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="p-1.5 rounded-lg bg-[#121820] hover:scale-105 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${isFilled ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'file_upload' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121820] hover:bg-[#1A2332] border text-xs font-semibold text-slate-200 cursor-pointer transition-all ${
                      hasError ? 'border-rose-500' : 'border-[#2A3647] hover:border-[#2563EB]'
                    }`}>
                      <Upload className="w-4 h-4 text-[#38BDF8]" />
                      <span>{answers[q.id] ? 'Change File' : 'Choose File to Upload'}</span>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAnswerChange(q.id, file.name);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {answers[q.id] && (
                      <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{answers[q.id]}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">Supported files: PDF, DOCX, PNG, JPG, ZIP (Max 10MB)</p>
                </div>
              )}

              {q.type === 'date' && (
                <input
                  type="date"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-xs text-white focus:outline-none transition-colors border ${
                    hasError ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#2A3647] focus:border-[#2563EB]'
                  }`}
                />
              )}

              {q.type === 'time' && (
                <input
                  type="time"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-xs text-white focus:outline-none transition-colors border ${
                    hasError ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#2A3647] focus:border-[#2563EB]'
                  }`}
                />
              )}

              {q.type === 'signature' && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    placeholder="Type full legal name as digital signature..."
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-[#121820] text-xs text-white focus:outline-none font-serif italic transition-colors border ${
                      hasError ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#2A3647] focus:border-[#2563EB]'
                    }`}
                  />
                  <p className="text-[10px] text-slate-500 font-mono">Digital Signature Verification</p>
                </div>
              )}

              {q.type === 'consent' && (
                <label className={`flex items-center gap-3 p-3 rounded-lg bg-[#121820] text-xs text-slate-300 cursor-pointer border transition-colors ${
                  hasError ? 'border-rose-500' : 'border-[#2A3647]'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!answers[q.id]}
                    onChange={(e) => handleAnswerChange(q.id, e.target.checked ? 'I Agree' : '')}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="accent-[#2563EB]"
                  />
                  <span>I agree to the terms and conditions</span>
                </label>
              )}

              {q.type === 'matrix' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#2A3647] text-[#84A1C0]">
                        <th className="p-2">Items</th>
                        {(q.matrixCols || ['Poor', 'Average', 'Excellent']).map(col => (
                          <th key={col} className="p-2 text-center">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3647]/50">
                      {(q.matrixRows || ['Row 1', 'Row 2']).map(row => (
                        <tr key={row}>
                          <td className="p-2 font-medium text-slate-200">{row}</td>
                          {(q.matrixCols || ['Poor', 'Average', 'Excellent']).map(col => (
                            <td key={col} className="p-2 text-center">
                              <input
                                type="radio"
                                name={`q-${q.id}-${row}`}
                                checked={(answers[q.id] || {})[row] === col}
                                onChange={() => {
                                  const prevMatrix = answers[q.id] || {};
                                  handleAnswerChange(q.id, { ...prevMatrix, [row]: col });
                                }}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className="accent-[#2563EB]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Validation Error Message */}
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-medium pt-1">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{validationErrors[q.id]}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Toggable Agreement / Terms Checkbox */}
        {form.settings.requireAgreement && isFinalSection && (
          <div
            id="club-agreement-card"
            className={`p-4 rounded-xl transition-all duration-300 space-y-2 ${
              agreementError
                ? 'bg-[#1F1418] border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                : 'bg-[#121820] border border-[#2A3647]'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => {
                  setHasAgreed(e.target.checked);
                  if (e.target.checked) setAgreementError(false);
                }}
                className="mt-0.5 w-4 h-4 rounded border-[#2A3647] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                {form.settings.agreementText || 'By submitting this form, you agree to share the information provided for official purposes.'}
              </span>
            </label>

            {agreementError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-2 pl-7 animate-pulse">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Please accept this agreement to submit the form.</span>
              </div>
            )}
          </div>
        )}

        {/* Send me a copy of my responses toggle (Google Forms Style) */}
        {form.settings.collectEmail && form.settings.sendResponseCopy !== 'off' && isFinalSection && (
          <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Send me a copy of my responses</span>
              </span>
              <span className="text-[11px] text-slate-400">
                A confirmation receipt will be emailed to {respondentEmail.trim() || 'the address provided'}.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sendCopyRequested}
                onChange={(e) => setSendCopyRequested(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563EB]"></div>
            </label>
          </div>
        )}

        {/* Bottom Actions: Next, Back, Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2A3647]">
          {sectionHistory.length > 1 ? (
            <button
              type="button"
              onClick={handlePrevSection}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Back</span>
            </button>
          ) : <div />}

          {!isFinalSection ? (
            <button
              type="button"
              id="form-submit-or-next-btn"
              onClick={handleNextSection}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-bold text-xs cursor-pointer shadow-neo transition-all transform hover:scale-[1.02]"
            >
              <span>Next Section</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          ) : (
            <button
              type="submit"
              id="form-submit-or-next-btn"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-indigo-600 hover:from-[#1D4ED8] hover:to-indigo-700 text-white font-bold text-xs shadow-neo transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <span>Submit Form Response</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
