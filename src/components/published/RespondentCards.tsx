import React from 'react';
import { Layers } from 'lucide-react';

/* =========================================================================
   1. RESPONDENT PROGRESS CARD
   ========================================================================= */
interface RespondentProgressCardProps {
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
  currentSectionIndex?: number;
  totalSections?: number;
}

export const RespondentProgressCard: React.FC<RespondentProgressCardProps> = ({
  answeredCount,
  totalQuestions,
  progressPercent,
  currentSectionIndex = 0,
  totalSections = 1
}) => {
  return (
    <div className="rounded-2xl bg-[#0D1525]/85 backdrop-blur-xl border border-[#1D2B42] p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_20px_rgba(37,99,235,0.04)] space-y-3 transition-all">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <span className="text-white font-bold">Form Progress:</span>
          <span className="text-slate-200">
            {answeredCount} of {totalQuestions} answered
          </span>
          {totalSections > 1 && (
            <span className="text-slate-400">
              • (Section {currentSectionIndex + 1}/{totalSections})
            </span>
          )}
        </div>
        <div className="text-[#38BDF8] font-bold text-xs tracking-wider">
          {progressPercent}%
        </div>
      </div>

      {/* Progress Track & Fill */}
      <div className="h-2 w-full bg-[#0A101E] rounded-full overflow-hidden border border-[#1D2B42]/80 relative">
        <div
          className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#60A5FA] rounded-full transition-all duration-400 ease-out shadow-[0_0_12px_rgba(56,189,248,0.4)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

/* =========================================================================
   2. RESPONDENT HERO CARD
   ========================================================================= */
interface RespondentHeroCardProps {
  title: string;
  description?: string;
  autoSaveStatus?: string | null;
}

export const RespondentHeroCard: React.FC<RespondentHeroCardProps> = ({
  title,
  description
}) => {
  return (
    <div className="relative rounded-2xl bg-[#0D1525]/85 backdrop-blur-xl border border-[#1D2B42] p-5 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(37,99,235,0.05)] space-y-2.5 overflow-hidden group">
      {/* Signature vertical cyan/blue glow accent strip on left edge (as seen in reference design) */}
      <div className="absolute left-0 top-3 bottom-3 w-[3.5px] rounded-r-full bg-gradient-to-b from-[#38BDF8] to-[#2563EB] shadow-[0_0_12px_#38BDF8] pointer-events-none" />

      {/* Soft internal gradient reflection */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />

      <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide pl-1 sm:pl-2">
        {title}
      </h1>

      {description && (
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-1 sm:pl-2 font-normal">
          {description}
        </p>
      )}
    </div>
  );
};

/* =========================================================================
   3. RESPONDENT IDENTITY CARD
   ========================================================================= */
interface RespondentIdentityCardProps {
  respondentEmail: string;
  onSwitchAccount?: () => void;
  emailCollectionMode?: 'responder_input' | 'verified' | string;
  draftSavedTime?: string | null;
}

export const RespondentIdentityCard: React.FC<RespondentIdentityCardProps> = ({
  respondentEmail,
  onSwitchAccount,
  emailCollectionMode = 'responder_input'
}) => {
  const displayEmail =
    respondentEmail.trim() ||
    (emailCollectionMode === 'verified' ? 'verified.account@gradientforms.dev' : 'responder@gradientforms.dev');

  // Compute avatar initials (e.g. AP)
  const computeInitials = (email: string) => {
    if (!email) return 'GF';
    const local = email.split('@')[0] || 'GF';
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
  };

  const initials = computeInitials(displayEmail);

  return (
    <div className="rounded-2xl bg-[#0D1525]/85 backdrop-blur-xl border border-[#1D2B42] p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] space-y-3.5">
      {/* Top Row: Avatar + Email + Switch Account + Auto-save Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#0284C7] text-white text-[11px] sm:text-xs font-bold font-mono flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.4)] shrink-0">
            {initials}
          </div>
          <span className="font-mono text-xs sm:text-sm text-slate-200 font-medium truncate max-w-[220px] sm:max-w-xs">
            {displayEmail}
          </span>
          {respondentEmail.trim() && onSwitchAccount && (
            <button
              type="button"
              onClick={onSwitchAccount}
              className="text-[#38BDF8] hover:text-[#7DD3FC] hover:underline text-[11px] font-mono cursor-pointer ml-1 transition-colors"
            >
              Switch account
            </button>
          )}
        </div>

        {/* Draft Auto-Saved Indicator */}
        <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
          <span>Draft auto-saved</span>
        </div>
      </div>

      {/* Bottom Row: Submission Policy & Required Question Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400 pt-2.5 border-t border-[#1D2B42]/70">
        <span>
          {emailCollectionMode === 'verified'
            ? 'Your verified account email will be submitted with this response.'
            : 'The email provided below will be submitted with this response.'}
        </span>
        <span className="text-rose-400 font-medium shrink-0">
          * Indicates required question
        </span>
      </div>
    </div>
  );
};

/* =========================================================================
   4. RESPONDENT SECTION HEADER
   ========================================================================= */
interface RespondentSectionHeaderProps {
  sectionIndex: number;
  totalSections: number;
  title: string;
  description?: string;
}

export const RespondentSectionHeader: React.FC<RespondentSectionHeaderProps> = ({
  sectionIndex,
  totalSections,
  title,
  description
}) => {
  return (
    <div className="rounded-2xl bg-[#0D1525]/85 backdrop-blur-xl border border-[#1D2B42] p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.45)] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Section {sectionIndex + 1} of {totalSections}</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Page {sectionIndex + 1}
        </span>
      </div>
      <h2 className="text-lg sm:text-xl font-bold font-heading text-white tracking-wide uppercase">
        {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-0.5 font-normal">
          {description}
        </p>
      )}
    </div>
  );
};
