import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../utils/analyticsEngine';
import { Search, ListFilter, Layers, AlertCircle } from 'lucide-react';
import { MultipleChoiceAnalyticsCard } from './questionCards/MultipleChoiceAnalyticsCard';
import { DropdownAnalyticsCard } from './questionCards/DropdownAnalyticsCard';
import { CheckboxesAnalyticsCard } from './questionCards/CheckboxesAnalyticsCard';
import { ScaleAnalyticsCard } from './questionCards/ScaleAnalyticsCard';
import { RatingAnalyticsCard } from './questionCards/RatingAnalyticsCard';
import { GridAnalyticsCard } from './questionCards/GridAnalyticsCard';
import { TextAnalyticsCard } from './questionCards/TextAnalyticsCard';
import { NumericAnalyticsCard } from './questionCards/NumericAnalyticsCard';
import { DateAnalyticsCard } from './questionCards/DateAnalyticsCard';
import { TimeAnalyticsCard } from './questionCards/TimeAnalyticsCard';
import { FileUploadAnalyticsCard } from './questionCards/FileUploadAnalyticsCard';
import { IdentityAnalyticsCard } from './questionCards/IdentityAnalyticsCard';
import { ConsentAnalyticsCard } from './questionCards/ConsentAnalyticsCard';

interface ByQuestionTabProps {
  questionsAnalytics: QuestionAnalyticsData[];
}

export const ByQuestionTab: React.FC<ByQuestionTabProps> = ({ questionsAnalytics }) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredQuestions = questionsAnalytics.filter(q => {
    const matchesSelected = selectedQuestionId === 'all' || q.questionId === selectedQuestionId;
    const matchesSearch = q.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.type.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSelected && matchesSearch;
  });

  const renderQuestionCard = (q: QuestionAnalyticsData) => {
    if (q.answeredCount === 0) {
      return (
        <div className="p-8 rounded-xl bg-[#161E2B]/50 border border-dashed border-[#2A3647] text-center text-xs font-mono text-slate-500 space-y-1">
          <div className="font-bold text-slate-400">NO RESPONSES YET</div>
          <p className="text-[11px] text-slate-500 font-sans">
            Analytics will appear here once respondents submit answers for this question.
          </p>
        </div>
      );
    }

    switch (q.type) {
      case 'multiple_choice':
      case 'radio':
        return <MultipleChoiceAnalyticsCard data={q} />;
      case 'dropdown':
        return <DropdownAnalyticsCard data={q} />;
      case 'checkboxes':
        return <CheckboxesAnalyticsCard data={q} />;
      case 'scale':
        return <ScaleAnalyticsCard data={q} />;
      case 'rating':
        return <RatingAnalyticsCard data={q} />;
      case 'matrix':
        return <GridAnalyticsCard data={q} />;
      case 'short_answer':
      case 'paragraph':
        return <TextAnalyticsCard data={q} />;
      case 'number':
        return <NumericAnalyticsCard data={q} />;
      case 'date':
        return <DateAnalyticsCard data={q} />;
      case 'time':
        return <TimeAnalyticsCard data={q} />;
      case 'file_upload':
        return <FileUploadAnalyticsCard data={q} />;
      case 'email':
      case 'phone':
      case 'url':
      case 'signature':
        return <IdentityAnalyticsCard data={q} />;
      case 'consent':
        return <ConsentAnalyticsCard data={q} />;
      default:
        if (q.optionsStats && q.optionsStats.length > 0) {
          return <MultipleChoiceAnalyticsCard data={q} />;
        }
        return <TextAnalyticsCard data={q} />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Question Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121820] border border-[#2A3647] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search questions by title or type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1A2332] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
            <ListFilter className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Filter Question:</span>
          </span>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="bg-[#1A2332] text-xs text-[#38BDF8] font-medium border border-[#2A3647] rounded-xl px-3 py-2 focus:outline-none cursor-pointer max-w-[240px] truncate"
            aria-label="Filter by specific question"
          >
            <option value="all" className="bg-[#121820] text-slate-200">All Questions ({questionsAnalytics.length})</option>
            {questionsAnalytics.map((q, idx) => (
              <option key={q.questionId} value={q.questionId} className="bg-[#121820] text-slate-200">
                {idx + 1}. {q.title.length > 30 ? `${q.title.substring(0, 27)}...` : q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#121820] border border-[#2A3647] text-center text-xs text-slate-400 font-mono">
            No questions match your active filter.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.questionId}
              className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4 shadow-sm hover:border-[#2A3647]/80 transition-all"
            >
              {/* Question Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#2A3647]/60 pb-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#1A2332] px-2 py-0.5 rounded-md border border-[#2A3647]">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] bg-[#2563EB]/15 px-2.5 py-0.5 rounded-md border border-[#2563EB]/35">
                      {q.type.replace('_', ' ')}
                    </span>
                    {q.sectionTitle && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>{q.sectionTitle}</span>
                      </span>
                    )}
                    {q.required && (
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        Required
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold font-heading text-white">
                    {q.title}
                  </h3>
                </div>

                {/* Stat Pills */}
                <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-[#1A2332] border border-[#2A3647] text-center">
                    <div className="text-slate-400 text-[10px]">Answered</div>
                    <div className="font-bold text-white">{q.answeredCount}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#1A2332] border border-[#2A3647] text-center">
                    <div className="text-slate-400 text-[10px]">Skipped</div>
                    <div className="font-bold text-slate-300">{q.skippedCount}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/35 text-center">
                    <div className="text-[#38BDF8] text-[10px]">Response Rate</div>
                    <div className="font-bold text-[#38BDF8]">{q.responseRate}%</div>
                  </div>
                </div>
              </div>

              {/* Question Body: Type-Specific Analytics Card */}
              {renderQuestionCard(q)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
