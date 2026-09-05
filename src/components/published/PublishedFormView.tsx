import React, { useState, useEffect } from 'react';
import { Form, Question, Section } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Award,
  Star,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Upload,
  FileText,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Mail,
  ShieldAlert,
  Send,
  Clock,
  Lock,
  Globe,
  Phone,
  Hash,
  List,
  CheckSquare,
  Sliders,
  Calendar,
  PenTool
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { evaluateLogicRule } from '../../utils/logicEvaluator';
import { getEffectiveFormStatus, formatExpiryDescription } from '../../utils/formStatus';
import {
  resolveNextSectionDestination,
  getReachableQuestions,
  getBranchingQuestionForSection,
  ACTION_SUBMIT_FORM
} from '../../utils/branchingEngine';
import { resolveFormAccess } from '../../utils/formAccessEngine';
import { RespondentEnvironment } from './RespondentEnvironment';
import { RespondentTopBar } from './RespondentTopBar';
import {
  RespondentProgressCard,
  RespondentHeroCard,
  RespondentIdentityCard,
  RespondentSectionHeader
} from './RespondentCards';

interface PublishedFormViewProps {
  form: Form;
  isPreview?: boolean;
}

export const PublishedFormView: React.FC<PublishedFormViewProps> = ({ form, isPreview = false }) => {
  const { submitResponse, showToast, responses } = useApp();

  // If form is missing or deleted, display a graceful fallback screen
  if (!form) {
    return (
      <div className="relative min-h-screen bg-[#060A13] flex flex-col justify-center items-center p-6 text-white overflow-hidden">
        <RespondentEnvironment />
        <div className="relative z-10 max-w-md w-full p-8 rounded-2xl bg-[#0D1525]/90 backdrop-blur-xl border border-[#1D2B42] text-center space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-[#1A2538] border border-[#2D3E5B] flex items-center justify-center mx-auto text-[#38BDF8]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading">Form Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested form does not exist or has been removed by the administrator.
          </p>
        </div>
      </div>
    );
  }

  // 1. Save Progress Automatically (Restore from draft if enabled)
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    if (form.settings.saveProgress && !isPreview) {
      const saved = localStorage.getItem(`gf_draft_${form.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {};
  });

  // Custom "Other" Text Answers State (for custom responses in dropdown / choices)
  const [customOtherText, setCustomOtherText] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (form.questions) {
      form.questions.forEach((q) => {
        const val = answers[q.id];
        if (typeof val === 'string' && val.startsWith('Other:')) {
          initial[q.id] = val.replace(/^Other:\s*/, '');
        } else if (Array.isArray(val)) {
          const otherItem = val.find(
            (item: string) => typeof item === 'string' && item.startsWith('Other:')
          );
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
      return (
        localStorage.getItem(`gf_draft_email_${form.id}`) ||
        localStorage.getItem('gf_last_email') ||
        ''
      );
    }
    return localStorage.getItem('gf_last_email') || '';
  });
  const [emailError, setEmailError] = useState(false);
  const [sendCopyRequested, setSendCopyRequested] = useState<boolean>(
    form.settings.sendResponseCopy === 'always'
  );

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

    const secQuestions = form.questions.filter((q) => q.sectionId === sec.id);
    if (secQuestions.length > 0 && secQuestions.every((q) => !isQuestionVisible(q))) {
      return false;
    }

    return true;
  };

  const rawSections =
    form.sections && form.sections.length > 0
      ? form.sections
      : [{ id: 'sec-main', title: 'Main Section' }];

  const visibleSections = rawSections.filter(isSectionVisible);

  const [sectionHistory, setSectionHistory] = useState<string[]>(() => [
    visibleSections[0]?.id || rawSections[0].id
  ]);

  const currentSectionId =
    sectionHistory[sectionHistory.length - 1] || visibleSections[0]?.id || rawSections[0].id;
  const currentSection =
    visibleSections.find((s) => s.id === currentSectionId) ||
    rawSections.find((s) => s.id === currentSectionId) ||
    rawSections[0];
  const activeSectionIndex = Math.max(
    0,
    visibleSections.findIndex((s) => s.id === currentSection.id)
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSectionId]);

  const nextDestinationInfo = resolveNextSectionDestination(form, currentSection.id, answers);
  const isFinalSection =
    nextDestinationInfo.destinationSectionId === ACTION_SUBMIT_FORM ||
    (!nextDestinationInfo.destinationSectionId &&
      activeSectionIndex >= visibleSections.length - 1);

  const currentQuestions = form.questions.filter(
    (q) => q.sectionId === currentSection.id && isQuestionVisible(q)
  );

  const isQuestionAnswered = (q: Question): boolean => {
    const val = answers[q.id];
    if (val === undefined || val === null) return false;

    if (
      [
        'short_answer',
        'paragraph',
        'email',
        'phone',
        'url',
        'number',
        'date',
        'time',
        'signature'
      ].includes(q.type)
    ) {
      return String(val).trim().length > 0;
    }
    if (['multiple_choice', 'dropdown'].includes(q.type)) {
      if (
        val === '__other__' ||
        String(val).trim() === 'Other:' ||
        String(val).trim() === ''
      )
        return false;
      return String(val).trim().length > 0;
    }
    if (q.type === 'checkboxes') {
      if (!Array.isArray(val) || val.length === 0) return false;
      return val.some(
        (item) => item !== '__other__' && item !== 'Other:' && String(item).trim() !== ''
      );
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
      return rows.every((row) => Boolean(val[row]));
    }
    return true;
  };

  const validateQuestions = (questionsToCheck: Question[]): boolean => {
    const errors: Record<string, string> = {};
    let firstMissingQuestionId: string | null = null;

    for (const q of questionsToCheck) {
      if (q.required && isQuestionVisible(q)) {
        if (!isQuestionAnswered(q)) {
          errors[q.id] =
            'This question is required. Please fill in an answer before submitting.';
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
        const focusable = missingCard.querySelector(
          'input, textarea, select, button'
        ) as HTMLElement;
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
          const focusable = nextCard.querySelector(
            'input, textarea, select, button'
          ) as HTMLElement;
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
      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      localStorage.setItem(`gf_draft_time_${form.id}`, timeStr);
      setDraftSavedTime(timeStr);
    }

    // Invalidate stale future path when a branching question is changed
    const branchingQ = getBranchingQuestionForSection(form, currentSection.id);
    if (branchingQ && branchingQ.id === questionId) {
      const currIdx = sectionHistory.indexOf(currentSection.id);
      if (currIdx !== -1 && currIdx < sectionHistory.length - 1) {
        setSectionHistory((prev) => prev.slice(0, currIdx + 1));
      }
    }

    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
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
      showToast?.(
        'Incomplete Section',
        `Please complete all required questions in Section ${activeSectionIndex + 1} before proceeding.`,
        'error'
      );
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
      setSectionHistory((prev) => [...prev, nextDest.destinationSectionId as string]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (sectionHistory.length > 1) {
      setSectionHistory((prev) => prev.slice(0, prev.length - 1));
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
        showToast?.(
          'Email Required',
          'Please provide a valid email address before submitting.',
          'error'
        );
        return;
      }

      // 2. Validate Limit to 1 Response per Person against submitted emails
      if (form.settings.limitOneResponse && !isPreview) {
        const alreadyHasResponse = responses.some(
          (r) =>
            r.formId === form.id &&
            r.respondentEmail?.toLowerCase() === cleanEmail.toLowerCase()
        );
        if (alreadyHasResponse) {
          setAlreadySubmitted(true);
          localStorage.setItem(`gf_submitted_${form.id}`, cleanEmail);
          showToast?.(
            'Limit Reached',
            'This email has already submitted a response for this form.',
            'error'
          );
          return;
        }
      }
    }

    // Strictly validate all reachable questions on the active path
    const reachableQuestions = getReachableQuestions(form, answers, sectionHistory).filter(
      isQuestionVisible
    );
    const isValid = validateQuestions(reachableQuestions);
    if (!isValid) {
      showToast?.(
        'Required Questions Missing',
        'Please fill in all required questions marked with * before submitting.',
        'error'
      );
      return;
    }

    // Strictly validate agreement if enabled in form settings
    if (form.settings.requireAgreement && !hasAgreed) {
      setAgreementError(true);
      const agreeCard = document.getElementById('club-agreement-card');
      agreeCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast?.(
        'Agreement Required',
        'Please accept the required agreement before submitting.',
        'error'
      );
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
      form.questions.forEach((q) => {
        if (q.points && q.correctAnswer) {
          maxScore += q.points;
          if (answers[q.id] === q.correctAnswer) {
            score += q.points;
          }
        }
      });
      setQuizScore({ score, max: maxScore });
    }

    const finalEmail =
      respondentEmail.trim() || answers['q-email'] || answers['email'];
    const finalName =
      answers['q-name'] ||
      answers['name'] ||
      (finalEmail ? finalEmail.split('@')[0] : undefined);

    submitResponse(form.id, answers, timeSpent, finalEmail, finalName);

    setIsSubmitted(true);

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Helper to render Question Type Icon
  const renderQuestionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-[#38BDF8]" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-[#38BDF8]" />;
      case 'url':
        return <Globe className="w-4 h-4 text-[#38BDF8]" />;
      case 'number':
        return <Hash className="w-4 h-4 text-[#38BDF8]" />;
      case 'multiple_choice':
        return <List className="w-4 h-4 text-[#38BDF8]" />;
      case 'checkboxes':
        return <CheckSquare className="w-4 h-4 text-[#38BDF8]" />;
      case 'scale':
        return <Sliders className="w-4 h-4 text-[#38BDF8]" />;
      case 'rating':
        return <Star className="w-4 h-4 text-[#38BDF8]" />;
      case 'file_upload':
        return <Upload className="w-4 h-4 text-[#38BDF8]" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-[#38BDF8]" />;
      case 'time':
        return <Clock className="w-4 h-4 text-[#38BDF8]" />;
      case 'signature':
        return <PenTool className="w-4 h-4 text-[#38BDF8]" />;
      default:
        return <FileText className="w-4 h-4 text-[#38BDF8]" />;
    }
  };

  // -------------------------------------------------------------
  // STATE: SUBMISSION CONFIRMED
  // -------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div className="relative min-h-screen bg-[#060A13] flex flex-col justify-between py-8 px-4 sm:px-6">
        <RespondentEnvironment />
        <RespondentTopBar isAutoSaveEnabled={false} />

        <div className="relative z-10 p-6 sm:p-10 max-w-xl mx-auto text-center space-y-6 rounded-2xl bg-[#0D1525]/90 backdrop-blur-xl border border-[#1D2B42] shadow-[0_16px_40px_rgba(0,0,0,0.6)] my-auto w-full animate-fadeIn">
          {/* Glowing Animated Luminous Checkmark */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(56,189,248,0.5)]">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide">
              Submission Confirmed
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              {form.settings.confirmationMessage ||
                'Your response has been securely recorded. Thank you for participating!'}
            </p>
          </div>

          {form.settings.quizMode && quizScore && (
            <div className="p-4 rounded-xl bg-[#080E18] border border-amber-500/40 space-y-2 max-w-xs mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <Award className="w-6 h-6 text-amber-400 mx-auto" />
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                Quiz Score Result
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {quizScore.score} / {quizScore.max}{' '}
                <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>
          )}

          {/* Email Confirmation Receipt Notice */}
          {form.settings.collectEmail && respondentEmail.trim() && (
            <div className="p-3.5 rounded-xl bg-[#080E18] border border-[#1E2D45] text-xs text-slate-300 max-w-md mx-auto flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span className="truncate">
                {sendCopyRequested || form.settings.sendResponseCopy === 'always' ? (
                  <>
                    A confirmation copy was sent to{' '}
                    <strong className="text-white font-mono">{respondentEmail.trim()}</strong>
                  </>
                ) : (
                  <>
                    Responses recorded for{' '}
                    <strong className="text-white font-mono">{respondentEmail.trim()}</strong>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Post-Submission WhatsApp / Community Join Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#080E18] border border-emerald-500/40 hover:border-emerald-400 transition-all space-y-3.5 max-w-md mx-auto shadow-[0_0_25px_rgba(16,185,129,0.12)] text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Join Gradient Club Community</h4>
                <p className="text-xs text-slate-400">
                  Stay connected for workshops, hackathons & official updates.
                </p>
              </div>
            </div>

            <a
              href={form.settings?.communityLink || 'https://chat.whatsapp.com/invite'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] cursor-pointer group"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#080E18] hover:bg-[#121B2A] border border-[#1E2D45] text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Submit Another Response</span>
          </button>
        </div>

        <footer className="text-center py-4 text-xs text-slate-500 font-mono select-none">
          Powered by Gradient Forms • Secure Form Platform
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: LIMIT TO 1 RESPONSE REACHED
  // -------------------------------------------------------------
  if (alreadySubmitted) {
    return (
      <div className="relative min-h-screen bg-[#060A13] flex flex-col justify-between py-8 px-4 sm:px-6">
        <RespondentEnvironment />
        <RespondentTopBar isAutoSaveEnabled={false} />

        <div className="relative z-10 p-6 sm:p-10 max-w-xl mx-auto text-center space-y-6 rounded-2xl bg-[#0D1525]/90 backdrop-blur-xl border border-[#1D2B42] shadow-[0_16px_40px_rgba(0,0,0,0.6)] my-auto w-full">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Response Limit Reached
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              This form is configured to allow only 1 response per person. You have already
              submitted a response.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#080E18] border border-[#1E2D45] text-xs text-slate-300 text-left space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#38BDF8]">Form Title</div>
            <div className="font-bold text-white text-sm">{form.title}</div>
          </div>
          {isPreview && (
            <button
              onClick={() => setAlreadySubmitted(false)}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              Reset Preview Response Lock
            </button>
          )}
        </div>

        <footer className="text-center py-4 text-xs text-slate-500 font-mono select-none">
          Powered by Gradient Forms
        </footer>
      </div>
    );
  }

  const effectiveStatus = getEffectiveFormStatus(form);

  // -------------------------------------------------------------
  // STATE: MANUALLY CLOSED
  // -------------------------------------------------------------
  if (effectiveStatus === 'CLOSED' && !isPreview) {
    return (
      <div className="relative min-h-screen bg-[#060A13] flex flex-col justify-between py-8 px-4 sm:px-6">
        <RespondentEnvironment />
        <RespondentTopBar isAutoSaveEnabled={false} />

        <div className="relative z-10 p-6 sm:p-10 max-w-xl mx-auto text-center space-y-6 rounded-2xl bg-[#0D1525]/90 backdrop-blur-xl border border-[#1D2B42] shadow-[0_16px_40px_rgba(0,0,0,0.6)] my-auto w-full animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 flex items-center justify-center mx-auto shadow-neo">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              This form is currently closed
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              The administrator has paused or stopped accepting new responses for this form.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#080E18] border border-[#1E2D45] text-xs text-slate-300 text-left space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#38BDF8]">Form Title</div>
            <div className="font-bold text-white text-sm">{form.title}</div>
          </div>
        </div>

        <footer className="text-center py-4 text-xs text-slate-500 font-mono select-none">
          Powered by Gradient Forms
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: DEADLINE EXPIRED
  // -------------------------------------------------------------
  if (effectiveStatus === 'EXPIRED' && !isPreview) {
    const customMessage = form.expiryMessage || form.settings?.expiryMessage;
    const expiryDetails =
      form.expiresAt || form.settings?.expiresAt
        ? formatExpiryDescription(form.expiresAt || form.settings?.expiresAt!)
        : null;

    return (
      <div className="relative min-h-screen bg-[#060A13] flex flex-col justify-between py-8 px-4 sm:px-6">
        <RespondentEnvironment />
        <RespondentTopBar isAutoSaveEnabled={false} />

        <div className="relative z-10 p-6 sm:p-10 max-w-xl mx-auto text-center space-y-6 rounded-2xl bg-[#0D1525]/90 backdrop-blur-xl border border-[#1D2B42] shadow-[0_16px_40px_rgba(0,0,0,0.6)] my-auto w-full animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Response Deadline Passed
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto whitespace-pre-wrap">
              {customMessage || 'The response deadline for this form has passed.'}
            </p>
          </div>
          {expiryDetails && (
            <div className="p-4 rounded-xl bg-[#080E18] border border-[#1E2D45] text-xs text-slate-300 text-center space-y-1 max-w-sm mx-auto">
              <div className="text-[10px] font-mono uppercase text-amber-400">Response Deadline</div>
              <div className="font-mono text-white font-bold">{expiryDetails.fullLabel}</div>
            </div>
          )}
        </div>

        <footer className="text-center py-4 text-xs text-slate-500 font-mono select-none">
          Powered by Gradient Forms
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: PRIVATE FORM GATE
  // -------------------------------------------------------------
  const accessResolution = resolveFormAccess(form, { isPreview });
  if (!accessResolution.isAllowed && !isPreview) {
    return (
      <div className="relative min-h-screen bg-[#060A13] flex flex-col justify-between py-8 px-4 sm:px-6">
        <RespondentEnvironment />
        <RespondentTopBar isAutoSaveEnabled={false} />

        <div className="relative z-10 p-6 sm:p-10 max-w-xl mx-auto text-center space-y-6 rounded-2xl bg-[#0D1525]/90 backdrop-blur-xl border border-[#1D2B42] shadow-[0_16px_40px_rgba(0,0,0,0.6)] my-auto w-full animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
              Private Form • Authentication Required
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {form.title}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              This form is configured as Private and requires authorized respondent authentication
              to access.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#080E18] border border-[#1E2D45] text-xs text-slate-400 text-center max-w-sm mx-auto space-y-1">
            <p className="text-[11px] text-slate-400">
              Authentication integration point active. Please sign in with an authorized account
              when authentication is available.
            </p>
          </div>
        </div>

        <footer className="text-center py-4 text-xs text-slate-500 font-mono select-none">
          Powered by Gradient Forms
        </footer>
      </div>
    );
  }

  // Active path progress calculation
  const reachableQuestions = getReachableQuestions(form, answers, sectionHistory).filter(
    isQuestionVisible
  );
  const answeredQuestionsCount = reachableQuestions.filter((q) => isQuestionAnswered(q)).length;
  const progressPercent =
    reachableQuestions.length > 0
      ? Math.round((answeredQuestionsCount / reachableQuestions.length) * 100)
      : 0;

  // -------------------------------------------------------------
  // ACTIVE RESPONDENT FORM VIEW
  // -------------------------------------------------------------
  return (
    <div
      className="relative min-h-screen bg-[#060A13] text-white flex flex-col justify-between pb-12 overflow-x-hidden selection:bg-[#2563EB] selection:text-white"
      style={{ fontFamily: form.theme?.fontFamily }}
    >
      {/* 3D Background Environment with Canvas Falling Stars & Subtle Emblem Watermark */}
      <RespondentEnvironment />

      {/* Top Brand Header Bar */}
      <div className="relative z-20 px-4 sm:px-6">
        <RespondentTopBar
          draftSavedTime={draftSavedTime}
          isAutoSaveEnabled={form.settings.saveProgress}
        />
      </div>

      {/* Main Interactive Form Area */}
      <main className="relative z-10 max-w-2xl sm:max-w-3xl w-full mx-auto px-4 sm:px-6 space-y-4 sm:space-y-5 my-2 sm:my-4">
        {/* 1. Progress Bar Card */}
        {form.settings.showProgressBar && (
          <RespondentProgressCard
            answeredCount={answeredQuestionsCount}
            totalQuestions={reachableQuestions.length}
            progressPercent={progressPercent}
            currentSectionIndex={activeSectionIndex}
            totalSections={visibleSections.length}
          />
        )}

        {/* 2. Hero Form Header Card */}
        <RespondentHeroCard
          title={form.title}
          description={form.description}
          autoSaveStatus={draftSavedTime ? `@ ${draftSavedTime}` : 'Active'}
        />

        {/* 3. Respondent Identity Card */}
        <RespondentIdentityCard
          respondentEmail={respondentEmail}
          onSwitchAccount={() => {
            setRespondentEmail('');
            setEmailError(false);
          }}
          emailCollectionMode={form.settings.emailCollectionMode}
          draftSavedTime={draftSavedTime}
        />

        {/* 4. Section Card (Multi-Section indicator) */}
        {visibleSections.length > 1 && (
          <RespondentSectionHeader
            sectionIndex={activeSectionIndex}
            totalSections={visibleSections.length}
            title={currentSection.title}
            description={currentSection.description}
          />
        )}

        {/* 5. Questions Form List */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Collect Email Addresses Card (Rendered on first section) */}
          {form.settings.collectEmail && activeSectionIndex === 0 && (
            <div
              id="collect-email-card"
              className={`rounded-2xl backdrop-blur-xl p-5 sm:p-6 transition-all duration-200 space-y-3 ${
                emailError
                  ? 'bg-[#180E14]/90 border-2 border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.25)]'
                  : 'bg-[#0D1525]/85 border border-[#1D2B42] hover:border-[#2563EB]/40 shadow-[0_12px_32px_rgba(0,0,0,0.45)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <label className="block text-sm sm:text-base font-bold text-white leading-snug flex items-center gap-2 font-heading">
                  <Mail className="w-4 h-4 text-[#38BDF8]" />
                  <span>Email</span>
                  <span className="text-rose-400 font-bold text-sm ml-0.5">*</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
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
                  placeholder="name@domain.com"
                  className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 border ${
                    emailError
                      ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
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

          {/* Render Active Questions in Current Section */}
          {currentQuestions.map((q, idx) => {
            const hasError = !!validationErrors[q.id];
            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className={`rounded-2xl backdrop-blur-xl p-5 sm:p-6 transition-all duration-200 space-y-3.5 ${
                  hasError
                    ? 'bg-[#180E14]/90 border-2 border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.25)]'
                    : 'bg-[#0D1525]/85 border border-[#1D2B42] hover:border-[#2563EB]/40 shadow-[0_12px_32px_rgba(0,0,0,0.45)]'
                }`}
              >
                {/* Question Header & Title */}
                <div className="flex items-start justify-between gap-2">
                  <label
                    className={`block text-white leading-snug flex items-baseline gap-2 ${
                      q.titleStyle?.size === 'lg'
                        ? 'text-lg sm:text-xl'
                        : q.titleStyle?.size === 'sm'
                        ? 'text-xs sm:text-sm'
                        : 'text-sm sm:text-base'
                    } ${
                      q.titleStyle?.bold === false ? 'font-normal' : 'font-bold font-heading'
                    } ${q.titleStyle?.italic ? 'italic' : ''} ${
                      q.titleStyle?.underline
                        ? 'underline decoration-[#38BDF8]/80 underline-offset-4'
                        : ''
                    }`}
                  >
                    <span className="shrink-0 translate-y-0.5">{renderQuestionIcon(q.type)}</span>
                    <span>
                      {q.title}{' '}
                      {q.required && (
                        <span className="text-rose-400 font-bold text-sm ml-0.5">*</span>
                      )}
                      {q.maxSelections || q.validation?.maxSelections ? (
                        <span className="text-[11px] text-[#38BDF8] font-normal ml-2 font-mono">
                          (Select up to {q.maxSelections || q.validation?.maxSelections}{' '}
                          {(q.maxSelections || q.validation?.maxSelections) === 1
                            ? 'option'
                            : 'options'}
                          )
                        </span>
                      ) : null}
                    </span>
                  </label>
                </div>

                {/* Question Description */}
                {q.description && (
                  <p
                    className={`text-xs text-slate-400 leading-relaxed font-normal ${
                      q.descriptionStyle?.bold ? 'font-bold' : ''
                    } ${q.descriptionStyle?.italic ? 'italic' : ''} ${
                      q.descriptionStyle?.underline ? 'underline' : ''
                    }`}
                  >
                    {q.description}
                  </p>
                )}

                {/* Attached Image (if present) */}
                {q.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#1E2D45] bg-[#080E18] space-y-1.5 p-2">
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
                  <div className="rounded-xl overflow-hidden border border-[#1E2D45] bg-[#080E18] space-y-1.5 p-2">
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

                {/* Question Type Inputs */}
                {['short_answer', 'email', 'phone', 'url', 'number'].includes(q.type) && (
                  <input
                    type={q.type === 'email' ? 'email' : q.type === 'number' ? 'number' : 'text'}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    placeholder={q.placeholder || 'Type your answer...'}
                    className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 border ${
                      hasError
                        ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
                    }`}
                  />
                )}

                {q.type === 'paragraph' && (
                  <textarea
                    rows={3}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    placeholder={
                      q.placeholder ||
                      'Type detailed response... (Press Ctrl+Enter for next question)'
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white placeholder-slate-500 focus:outline-none resize-none transition-all duration-200 border ${
                      hasError
                        ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
                    }`}
                  />
                )}

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2 sm:space-y-2.5">
                    {(q.options || []).map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all duration-150 select-none ${
                          answers[q.id] === opt.id
                            ? 'bg-[#2563EB]/15 border-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                            : hasError
                            ? 'bg-[#080E18] border-rose-500/40 text-slate-300 hover:bg-[#0E1726]'
                            : 'bg-[#080E18] border-[#1E2D45] text-slate-300 hover:border-[#2B3F5E] hover:bg-[#0E1726]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleAnswerChange(q.id, opt.id)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                        />
                        <span className="flex-1 leading-snug">{opt.label}</span>
                      </label>
                    ))}

                    {q.allowOther && (
                      <div className="space-y-2 pt-1">
                        <label
                          className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all duration-150 select-none ${
                            answers[q.id] === '__other__' ||
                            (typeof answers[q.id] === 'string' &&
                              answers[q.id]?.startsWith('Other:'))
                              ? 'bg-[#2563EB]/15 border-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                              : hasError
                              ? 'bg-[#080E18] border-rose-500/40 text-slate-300 hover:bg-[#0E1726]'
                              : 'bg-[#080E18] border-[#1E2D45] text-slate-300 hover:border-[#2B3F5E] hover:bg-[#0E1726]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={
                              answers[q.id] === '__other__' ||
                              (typeof answers[q.id] === 'string' &&
                                answers[q.id]?.startsWith('Other:'))
                            }
                            onChange={() => {
                              const existingCustom = customOtherText[q.id] || '';
                              handleAnswerChange(
                                q.id,
                                existingCustom.trim() ? `Other: ${existingCustom.trim()}` : '__other__'
                              );
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                          />
                          <span className="flex-1 leading-snug">Other... (Custom Answer)</span>
                        </label>

                        {(answers[q.id] === '__other__' ||
                          (typeof answers[q.id] === 'string' &&
                            answers[q.id]?.startsWith('Other:'))) && (
                          <div className="pl-4 sm:pl-6 animate-fadeIn pt-1">
                            <input
                              type="text"
                              autoFocus
                              value={customOtherText[q.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomOtherText((prev) => ({ ...prev, [q.id]: val }));
                                handleAnswerChange(
                                  q.id,
                                  val.trim() ? `Other: ${val.trim()}` : '__other__'
                                );
                              }}
                              onKeyDown={(e) => handleKeyDown(e, idx)}
                              placeholder={
                                q.otherPlaceholder || 'Please specify your custom answer...'
                              }
                              className="w-full px-4 py-2.5 rounded-xl bg-[#080E18] text-xs sm:text-sm text-white placeholder-slate-500 border border-[#38BDF8]/60 focus:border-[#38BDF8] focus:outline-none shadow-inner"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'checkboxes' && (
                  <div className="space-y-2 sm:space-y-2.5">
                    {(q.options || []).map((opt) => {
                      const currentArr: string[] = answers[q.id] || [];
                      const isChecked = currentArr.includes(opt.id);
                      const maxLimit = q.maxSelections || q.validation?.maxSelections;

                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all duration-150 select-none ${
                            isChecked
                              ? 'bg-[#2563EB]/15 border-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                              : hasError
                              ? 'bg-[#080E18] border-rose-500/40 text-slate-300 hover:bg-[#0E1726]'
                              : 'bg-[#080E18] border-[#1E2D45] text-slate-300 hover:border-[#2B3F5E] hover:bg-[#0E1726]'
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
                                : currentArr.filter((id) => id !== opt.id);
                              handleAnswerChange(q.id, updated);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                          />
                          <span className="flex-1 leading-snug">{opt.label}</span>
                        </label>
                      );
                    })}

                    {q.allowOther &&
                      (() => {
                        const currentArr: string[] = answers[q.id] || [];
                        const isOtherChecked = currentArr.some(
                          (id) =>
                            id === '__other__' ||
                            (typeof id === 'string' && id.startsWith('Other:'))
                        );
                        const maxLimit = q.maxSelections || q.validation?.maxSelections;

                        return (
                          <div className="space-y-2 pt-1">
                            <label
                              className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all duration-150 select-none ${
                                isOtherChecked
                                  ? 'bg-[#2563EB]/15 border-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                                  : hasError
                                  ? 'bg-[#080E18] border-rose-500/40 text-slate-300 hover:bg-[#0E1726]'
                                  : 'bg-[#080E18] border-[#1E2D45] text-slate-300 hover:border-[#2B3F5E] hover:bg-[#0E1726]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isOtherChecked}
                                onChange={(e) => {
                                  if (
                                    e.target.checked &&
                                    maxLimit &&
                                    currentArr.length >= maxLimit
                                  ) {
                                    return;
                                  }
                                  const existingCustom = customOtherText[q.id] || '';
                                  const otherVal = existingCustom.trim()
                                    ? `Other: ${existingCustom.trim()}`
                                    : '__other__';
                                  const updated = e.target.checked
                                    ? [
                                        ...currentArr.filter(
                                          (id) => id !== '__other__' && !id.startsWith('Other:')
                                        ),
                                        otherVal
                                      ]
                                    : currentArr.filter(
                                        (id) => id !== '__other__' && !id.startsWith('Other:')
                                      );
                                  handleAnswerChange(q.id, updated);
                                }}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                              />
                              <span className="flex-1 leading-snug">Other... (Custom Answer)</span>
                            </label>

                            {isOtherChecked && (
                              <div className="pl-4 sm:pl-6 animate-fadeIn pt-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={customOtherText[q.id] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomOtherText((prev) => ({ ...prev, [q.id]: val }));
                                    const otherVal = val.trim()
                                      ? `Other: ${val.trim()}`
                                      : '__other__';
                                    const updated = currentArr.map((id) =>
                                      id === '__other__' ||
                                      (typeof id === 'string' && id.startsWith('Other:'))
                                        ? otherVal
                                        : id
                                    );
                                    if (!updated.some((id) => id === otherVal)) {
                                      updated.push(otherVal);
                                    }
                                    handleAnswerChange(q.id, updated);
                                  }}
                                  onKeyDown={(e) => handleKeyDown(e, idx)}
                                  placeholder={
                                    q.otherPlaceholder || 'Please specify your custom answer...'
                                  }
                                  className="w-full px-4 py-2.5 rounded-xl bg-[#080E18] text-xs sm:text-sm text-white placeholder-slate-500 border border-[#38BDF8]/60 focus:border-[#38BDF8] focus:outline-none shadow-inner"
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
                          : answers[q.id] || ''
                      }
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        if (selectedVal === '__other__') {
                          const existingCustom = customOtherText[q.id] || '';
                          handleAnswerChange(
                            q.id,
                            existingCustom.trim() ? `Other: ${existingCustom.trim()}` : '__other__'
                          );
                        } else {
                          handleAnswerChange(q.id, selectedVal);
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white focus:outline-none transition-all duration-200 border cursor-pointer ${
                        hasError
                          ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                          : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
                      }`}
                    >
                      <option value="">-- Select Option --</option>
                      {(q.options || []).map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-[#0D1525]">
                          {opt.label}
                        </option>
                      ))}
                      {q.allowOther && (
                        <option value="__other__" className="bg-[#0D1525]">
                          Other... (Please specify custom answer)
                        </option>
                      )}
                    </select>

                    {/* Custom Answer Input Field when "Other..." is selected */}
                    {q.allowOther &&
                      (answers[q.id] === '__other__' ||
                        (typeof answers[q.id] === 'string' &&
                          answers[q.id]?.startsWith('Other:'))) && (
                        <div className="pt-2 animate-fadeIn space-y-1.5 pl-1">
                          <div className="flex items-center justify-between text-[11px] text-[#38BDF8]">
                            <span className="font-semibold flex items-center gap-1">
                              <span>Please specify your custom answer:</span>
                              {q.required && <span className="text-rose-400">*</span>}
                            </span>
                          </div>
                          <input
                            type="text"
                            autoFocus
                            value={customOtherText[q.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomOtherText((prev) => ({ ...prev, [q.id]: val }));
                              handleAnswerChange(
                                q.id,
                                val.trim() ? `Other: ${val.trim()}` : '__other__'
                              );
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            placeholder={
                              q.otherPlaceholder || 'Please type your custom answer here...'
                            }
                            className={`w-full px-4 py-2.5 rounded-xl bg-[#080E18] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 border ${
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
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>{q.scaleMinLabel || 'Min'}</span>
                      <span>{q.scaleMaxLabel || 'Max'}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {Array.from({
                        length: (q.scaleMax || 10) - (q.scaleMin || 1) + 1
                      }).map((_, i) => {
                        const val = (q.scaleMin || 1) + i;
                        const isSel = answers[q.id] === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => handleAnswerChange(q.id, val)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className={`flex-1 min-w-[36px] py-3 rounded-xl border text-xs sm:text-sm font-mono font-bold transition-all duration-150 cursor-pointer ${
                              isSel
                                ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] border-[#38BDF8] text-white shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                                : hasError
                                ? 'bg-[#080E18] border-rose-500/40 text-slate-300 hover:bg-[#0E1726]'
                                : 'bg-[#080E18] border-[#1E2D45] text-slate-300 hover:border-[#2B3F5E] hover:bg-[#0E1726]'
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
                  <div className="flex items-center gap-2 text-yellow-500 py-1">
                    {Array.from({ length: q.ratingMax || 5 }).map((_, i) => {
                      const ratingVal = i + 1;
                      const isFilled = (answers[q.id] || 0) >= ratingVal;
                      return (
                        <button
                          type="button"
                          key={ratingVal}
                          onClick={() => handleAnswerChange(q.id, ratingVal)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="p-2 rounded-xl bg-[#080E18] border border-[#1E2D45] hover:border-[#38BDF8]/50 hover:scale-105 transition-all duration-150 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? 'fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'file_upload' && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-[#080E18] hover:bg-[#121B2A] border text-xs sm:text-sm font-semibold text-slate-200 cursor-pointer transition-all ${
                          hasError
                            ? 'border-rose-500'
                            : 'border-[#1E2D45] hover:border-[#38BDF8]/60 shadow-sm'
                        }`}
                      >
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
                        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-2 rounded-xl border border-cyan-500/20 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{answers[q.id]}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Supported files: PDF, DOCX, PNG, JPG, ZIP (Max 10MB)
                    </p>
                  </div>
                )}

                {q.type === 'date' && (
                  <input
                    type="date"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white focus:outline-none transition-all duration-200 border ${
                      hasError
                        ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
                    }`}
                  />
                )}

                {q.type === 'time' && (
                  <input
                    type="time"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white focus:outline-none transition-all duration-200 border ${
                      hasError
                        ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
                    }`}
                  />
                )}

                {q.type === 'signature' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      placeholder="Type full legal name as digital signature..."
                      className={`w-full px-4 py-3 rounded-xl bg-[#080E18] text-sm text-white placeholder-slate-500 focus:outline-none font-serif italic tracking-wide transition-all duration-200 border ${
                        hasError
                          ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                          : 'border-[#1E2D45] hover:border-[#2B3F5E] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/40'
                      }`}
                    />
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Digital Signature Verification Enabled</span>
                    </div>
                  </div>
                )}

                {q.type === 'consent' && (
                  <label
                    className={`flex items-center gap-3.5 p-4 rounded-xl bg-[#080E18] text-xs sm:text-sm text-slate-300 cursor-pointer border transition-all duration-150 select-none ${
                      hasError
                        ? 'border-rose-500 bg-[#180E14]'
                        : 'border-[#1E2D45] hover:border-[#2B3F5E]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!answers[q.id]}
                      onChange={(e) => handleAnswerChange(q.id, e.target.checked ? 'I Agree' : '')}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-medium">I agree to the terms and conditions</span>
                  </label>
                )}

                {q.type === 'matrix' && (
                  <div className="overflow-x-auto rounded-xl border border-[#1E2D45] bg-[#080E18]">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#1E2D45] text-[#38BDF8] bg-[#0D1525]/60">
                          <th className="p-3 font-semibold">Items</th>
                          {(q.matrixCols || ['Poor', 'Average', 'Excellent']).map((col) => (
                            <th key={col} className="p-3 text-center font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2D45]/50">
                        {(q.matrixRows || ['Row 1', 'Row 2']).map((row) => (
                          <tr key={row} className="hover:bg-[#0E1726] transition-colors">
                            <td className="p-3 font-medium text-slate-200">{row}</td>
                            {(q.matrixCols || ['Poor', 'Average', 'Excellent']).map((col) => (
                              <td key={col} className="p-3 text-center">
                                <input
                                  type="radio"
                                  name={`q-${q.id}-${row}`}
                                  checked={(answers[q.id] || {})[row] === col}
                                  onChange={() => {
                                    const prevMatrix = answers[q.id] || {};
                                    handleAnswerChange(q.id, { ...prevMatrix, [row]: col });
                                  }}
                                  onKeyDown={(e) => handleKeyDown(e, idx)}
                                  className="accent-[#2563EB] w-4 h-4 cursor-pointer"
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
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-medium pt-1 animate-fadeIn">
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
              className={`rounded-2xl backdrop-blur-xl p-5 sm:p-6 transition-all duration-200 space-y-2.5 ${
                agreementError
                  ? 'bg-[#180E14]/90 border-2 border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.25)]'
                  : 'bg-[#0D1525]/85 border border-[#1D2B42] hover:border-[#2563EB]/40 shadow-[0_12px_32px_rgba(0,0,0,0.45)]'
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
                  className="mt-0.5 w-4 h-4 rounded border-[#1E2D45] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {form.settings.agreementText ||
                    'By submitting this form, you agree to share the information provided for official purposes.'}
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
          {form.settings.collectEmail &&
            form.settings.sendResponseCopy !== 'off' &&
            isFinalSection && (
              <div className="rounded-2xl bg-[#0D1525]/85 backdrop-blur-xl border border-[#1D2B42] p-5 sm:p-6 flex items-center justify-between gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-bold text-white block flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#38BDF8]" />
                    <span>Send me a copy of my responses</span>
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-normal">
                    A confirmation receipt will be emailed to{' '}
                    {respondentEmail.trim() || 'the address provided'}.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={sendCopyRequested}
                    onChange={(e) => setSendCopyRequested(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>
            )}

          {/* Bottom Actions Card: Back, Security Indicator, Next/Submit */}
          <div className="rounded-2xl bg-[#0D1525]/85 backdrop-blur-xl border border-[#1D2B42] p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {sectionHistory.length > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevSection}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#080E18] hover:bg-[#121B2A] border border-[#1E2D45] hover:border-[#2B3F5E] text-slate-200 text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                  <span>Back</span>
                </button>
              ) : null}

              <div className="flex items-center gap-1.5 text-xs text-slate-400 select-none">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                <span className="hidden sm:inline">Secured and encrypted</span>
              </div>
            </div>

            {!isFinalSection ? (
              <button
                type="button"
                id="form-submit-or-next-btn"
                onClick={handleNextSection}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </button>
            ) : (
              <button
                type="submit"
                id="form-submit-or-next-btn"
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Submit Form Response</span>
                <Send className="w-4 h-4 text-cyan-200" />
              </button>
            )}
          </div>
        </form>
      </main>

      <footer className="relative z-10 text-center py-4 text-xs text-slate-500 font-mono select-none">
        Powered by Gradient Forms
      </footer>
    </div>
  );
};
