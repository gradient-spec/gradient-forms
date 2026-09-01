import React, { useState } from 'react';
import { Form, FormResponse } from '../../types';
import { computeTrendAnalytics, TrendPoint, formatDuration } from '../../utils/analyticsEngine';
import {
  TrendingUp,
  Clock,
  Calendar,
  Zap,
  BarChart3,
  Flame,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface TrendsTabProps {
  form: Form;
  responses: FormResponse[];
}

export const TrendsTab: React.FC<TrendsTabProps> = ({ form, responses }) => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const trendData = computeTrendAnalytics(form, responses, timeRange, granularity);

  const totalPeriodResponses = trendData.reduce((acc, p) => acc + p.responses, 0);
  const avgPeriodDaily = trendData.length > 0
    ? (totalPeriodResponses / trendData.length).toFixed(1)
    : '0';

  // Find peak submission interval
  const peakPoint = [...trendData].sort((a, b) => b.responses - a.responses)[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Trends Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#121820] border border-[#2A3647] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1A2332] border border-[#2A3647]">
            {(['today', '7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Granularity selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1A2332] border border-[#2A3647]">
            {(['daily', 'weekly', 'monthly'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  granularity === g
                    ? 'bg-[#121820] text-[#38BDF8] border border-[#2A3647] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Active Window: <strong className="text-white">{totalPeriodResponses}</strong> submissions</span>
          </div>
        </div>
      </div>

      {/* Primary Trend Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Period Average Velocity</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {avgPeriodDaily} <span className="text-xs text-slate-400 font-normal">sub / {granularity === 'daily' ? 'day' : granularity === 'weekly' ? 'week' : 'month'}</span>
          </div>
          <p className="text-[11px] text-slate-400">Mean velocity across selected duration</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Peak Interval</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {peakPoint ? `${peakPoint.responses} subs` : '0 subs'}
          </div>
          <p className="text-[11px] text-slate-400">
            {peakPoint && peakPoint.responses > 0 ? `Recorded on ${peakPoint.date}` : 'No submissions recorded'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Speed</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatDuration(trendData.reduce((sum, p) => sum + p.avgTimeSpent, 0) / (trendData.filter(p => p.avgTimeSpent > 0).length || 1))}
          </div>
          <p className="text-[11px] text-slate-400">Average response duration across interval</p>
        </div>
      </div>

      {/* Main Submission Influx Area Chart */}
      <div className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
              <span>Submission Influx Curve ({granularity})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated submission trajectory for {form.title}
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
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
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendAreaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Average Completion Time Duration Trend */}
      <div className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Average Completion Duration Over Time</span>
          </h3>
          <p className="text-xs text-slate-400">
            Evolution of respondent completion speed (seconds) over the observation window
          </p>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" allowDecimals={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val}s`, 'Avg Duration']}
                contentStyle={{
                  backgroundColor: '#121820',
                  borderColor: '#2A3647',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="avgTimeSpent"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
