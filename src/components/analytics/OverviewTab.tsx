import React from 'react';
import { Form, FormResponse } from '../../types';
import {
  AnalyticsOverviewData,
  SectionFunnelStep,
  QuizAnalyticsData,
  TrendPoint,
  computeKeyInsights
} from '../../utils/analyticsEngine';
import {
  Inbox,
  Clock,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
  TrendingUp,
  ArrowRight,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface OverviewTabProps {
  form: Form;
  overview: AnalyticsOverviewData;
  sectionFunnel: SectionFunnelStep[];
  quizAnalytics: QuizAnalyticsData | null;
  trendData: TrendPoint[];
  recentResponses: FormResponse[];
  onSelectResponse: (response: FormResponse) => void;
  onNavigateToTab: (tab: 'by_question' | 'by_respondent') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  form,
  overview,
  sectionFunnel,
  quizAnalytics,
  trendData,
  recentResponses,
  onSelectResponse,
  onNavigateToTab
}) => {
  const isMultiSection = Boolean(form.sections && form.sections.length > 1);
  const keyInsights = computeKeyInsights(form, recentResponses);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Primary High-Level Form Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-2 hover:border-[#38BDF8]/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Total Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/15 text-[#38BDF8] flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {overview.totalResponses}
            </span>
            <span className="text-xs text-slate-400 font-mono">responses</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {overview.lastResponseAt
                ? `Latest ${format(new Date(overview.lastResponseAt), 'MMM dd, HH:mm')}`
                : 'Awaiting first response'}
            </span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-2 hover:border-[#38BDF8]/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {overview.totalResponses > 0 ? `${overview.completionRate}%` : '0%'}
            </span>
            <span className="text-xs text-emerald-400 font-mono">finalized</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>All submitted entries completed validation</span>
          </div>
        </div>

        {/* Average Time Spent */}
        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-2 hover:border-[#38BDF8]/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Avg Completion Time</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {overview.avgTimeSpentFormatted}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>Average duration from start to submit</span>
          </div>
        </div>

        {/* Questions & Structure Scope */}
        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-2 hover:border-[#38BDF8]/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Form Structure</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {overview.activeQuestionsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">questions</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>
              {overview.sectionsCount} {overview.sectionsCount === 1 ? 'section' : 'multi-sections'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Insights Section (Concise Summary of Genuine Patterns) */}
      {keyInsights.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                Key Insights &amp; Synthesis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Calculated from verified responses</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {keyInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span>{insight.icon}</span>
                  <span className="truncate">{insight.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Multi-Section Progression Funnel (If Multi-Section) */}
      {isMultiSection && (
        <div className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
                Multi-Section Progression
              </span>
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#38BDF8]" />
                <span>Section Funnel &amp; Drop-off Analysis</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tracking section-by-section completion progression to identify respondent drop-off.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {sectionFunnel.map((step, idx) => (
              <div
                key={step.sectionId}
                className="p-4 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Section {step.sectionNumber}</span>
                  <span className="font-mono text-[#38BDF8] font-bold">{step.completionRate}%</span>
                </div>
                <div className="font-bold text-white text-xs truncate" title={step.title}>
                  {step.title}
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${step.completionRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>{step.completedCount} respondents</span>
                  {idx > 0 && step.dropOffRate > 0 && (
                    <span className="text-rose-400 font-medium">-{step.dropOffRate}% drop-off</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Quiz Mode Analytics Card (If Quiz Mode Enabled) */}
      {quizAnalytics && (
        <div className="p-6 rounded-2xl bg-[#121820] border border-amber-500/30 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                Graded Performance
              </span>
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Quiz Score Metrics &amp; Accuracy</span>
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation results across {quizAnalytics.totalGradedSubmissions} graded submissions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Average Score</span>
              <div className="text-2xl font-bold font-mono text-amber-300">
                {quizAnalytics.averageScore} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Highest Score</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {quizAnalytics.highestScore} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Lowest Score</span>
              <div className="text-2xl font-bold font-mono text-rose-400">
                {quizAnalytics.lowestScore} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>
          </div>

          {quizAnalytics.scoreDistribution.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300">Score Range Distribution</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quizAnalytics.scoreDistribution.map((b) => (
                  <div key={b.range} className="p-3 rounded-lg bg-[#16202E] border border-[#2B3B52] space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{b.range}</span>
                      <span className="font-bold text-amber-300">{b.percentage}%</span>
                    </div>
                    <div className="text-xs text-white font-medium">{b.count} respondents</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Response Velocity Trend + Recent Responses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Velocity Area Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
                <span>Response Activity Trend</span>
              </h3>
              <p className="text-xs text-slate-400">Submission volume over the active period</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('by_question')}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>Question Insights</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="influxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121820',
                    borderColor: '#2A3647',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#influxGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Responses List */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Recent Submissions</span>
              </h3>
              <p className="text-xs text-slate-400">Latest respondents to complete this form</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('by_respondent')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 pt-1 flex-1">
            {recentResponses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No recent submissions to display.
              </div>
            ) : (
              recentResponses.slice(0, 4).map((resp) => (
                <div
                  key={resp.id}
                  onClick={() => onSelectResponse(resp)}
                  className="p-3 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 text-[#38BDF8] text-xs font-bold flex items-center justify-center shrink-0">
                      {(resp.respondentEmail || resp.respondentName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-white truncate">
                        {resp.respondentEmail || resp.respondentName || 'Anonymous Respondent'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {format(new Date(resp.submittedAt), 'MMM dd • HH:mm')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-cyan-300 bg-[#121820] px-2 py-0.5 rounded border border-[#2A3647]">
                      {resp.timeSpentSeconds ? `${resp.timeSpentSeconds}s` : 'N/A'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
