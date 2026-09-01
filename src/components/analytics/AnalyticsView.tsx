import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FormResponse } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { isFormEdited } from '../../utils/formFilters';
import {
  computeAnalyticsOverview,
  computeQuestionAnalytics,
  computeSectionAnalytics,
  computeQuizAnalytics,
  computeTrendAnalytics
} from '../../utils/analyticsEngine';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsTabs, AnalyticsTabType } from './AnalyticsTabs';
import { OverviewTab } from './OverviewTab';
import { ByQuestionTab } from './ByQuestionTab';
import { ByRespondentTab } from './ByRespondentTab';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { ResponseDetailModal } from '../responses/ResponseDetailModal';

export const AnalyticsView: React.FC = () => {
  const {
    forms,
    activeFormId,
    setActiveFormId,
    responses,
    deleteResponse,
    showToast,
    setActiveView
  } = useApp();

  // Navigation & filtering state
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('overview');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  // Active form detection
  const editedForms = forms.filter(isFormEdited);
  const currentForm = editedForms.find(f => f.id === activeFormId) || editedForms[0] || forms[0];

  // Scoped responses for current form
  const formResponses = useMemo(() => {
    if (!currentForm) return [];
    return responses.filter(r => r.formId === currentForm.id);
  }, [responses, currentForm]);

  // Analytics Engine Calculations
  const overview = useMemo(() => {
    if (!currentForm) return null;
    return computeAnalyticsOverview(currentForm, formResponses);
  }, [currentForm, formResponses]);

  const questionsAnalytics = useMemo(() => {
    if (!currentForm) return [];
    return computeQuestionAnalytics(currentForm, formResponses);
  }, [currentForm, formResponses]);

  const sectionFunnel = useMemo(() => {
    if (!currentForm) return [];
    return computeSectionAnalytics(currentForm, formResponses);
  }, [currentForm, formResponses]);

  const quizAnalytics = useMemo(() => {
    if (!currentForm) return null;
    return computeQuizAnalytics(currentForm, formResponses);
  }, [currentForm, formResponses]);

  const trendData = useMemo(() => {
    if (!currentForm) return [];
    return computeTrendAnalytics(currentForm, formResponses, timeRange, 'daily');
  }, [currentForm, formResponses, timeRange]);

  if (!currentForm || !overview) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <AnalyticsEmptyState
          title="NO FORMS FOUND"
          description="Create a form first to inspect analytics and respondent logs."
          onShareClick={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  const handleDeleteResponse = (responseId: string) => {
    deleteResponse(responseId);
    showToast('Response Deleted', 'The submission was removed from analytics.', 'info');
  };

  return (
    <div className="text-slate-100 pb-28">
      {/* Full-width Top Edge Navigation Bar */}
      <div className="w-full border-b border-[#2A3647]/80 bg-[#0B0F14]/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-300 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 group cursor-pointer"
          title="Back to Forms Workspace"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#38BDF8] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Forms</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Data Feed</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* 1. Analytics Header Bar */}
        <AnalyticsHeader
          forms={editedForms.length > 0 ? editedForms : forms}
          currentForm={currentForm}
          onSelectForm={setActiveFormId}
          formResponses={formResponses}
          onBackToForms={() => setActiveView('dashboard')}
          showToast={showToast}
          timeRange={timeRange}
          onChangeTimeRange={setTimeRange}
        />

      {/* 2. When 0 Responses Exist: Render Professional Empty State */}
      {formResponses.length === 0 ? (
        <AnalyticsEmptyState
          title="NO RESPONSE DATA YET"
          description="Analytics, completion rates, and question distributions will appear here as soon as respondents submit this form."
          formTitle={currentForm.title}
          onShareClick={() => {
            if (navigator?.clipboard) {
              const url = `${window.location.origin}/preview?formId=${currentForm.id}`;
              navigator.clipboard.writeText(url);
              showToast('Form Link Copied 📋', 'Share this link to start collecting responses.', 'success');
            }
          }}
        />
      ) : (
        /* 3. When Responses Exist: Tab Navigation + Active View */
        <div className="space-y-6">
          <AnalyticsTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            questionsCount={currentForm.questions?.length || 0}
            responsesCount={formResponses.length}
          />

          {/* Active Tab View Render */}
          {activeTab === 'overview' && (
            <OverviewTab
              form={currentForm}
              overview={overview}
              sectionFunnel={sectionFunnel}
              quizAnalytics={quizAnalytics}
              trendData={trendData}
              recentResponses={formResponses}
              onSelectResponse={setSelectedResponse}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'by_question' && (
            <ByQuestionTab
              questionsAnalytics={questionsAnalytics}
            />
          )}

          {activeTab === 'by_respondent' && (
            <ByRespondentTab
              form={currentForm}
              responses={formResponses}
              onSelectResponse={setSelectedResponse}
              onDeleteResponse={handleDeleteResponse}
            />
          )}
        </div>
      )}

      {/* 4. Response Detail Inspection Modal */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          form={currentForm}
          onClose={() => setSelectedResponse(null)}
        />
      )}
      </div>
    </div>
  );
};
