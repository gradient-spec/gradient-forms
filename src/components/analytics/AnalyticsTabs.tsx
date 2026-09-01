import React from 'react';
import { LayoutDashboard, HelpCircle, Users } from 'lucide-react';

export type AnalyticsTabType = 'overview' | 'by_question' | 'by_respondent';

interface AnalyticsTabsProps {
  activeTab: AnalyticsTabType;
  onSelectTab: (tab: AnalyticsTabType) => void;
  questionsCount: number;
  responsesCount: number;
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  activeTab,
  onSelectTab,
  questionsCount,
  responsesCount
}) => {
  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'by_question' as const,
      label: 'Questions',
      icon: HelpCircle,
      badge: questionsCount
    },
    {
      id: 'by_respondent' as const,
      label: 'Respondents',
      icon: Users,
      badge: responsesCount
    }
  ];

  return (
    <div className="border-b border-[#2A3647] flex items-center gap-1 overflow-x-auto no-scrollbar" role="tablist">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              isActive
                ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
            <span>{t.label}</span>
            {t.badge !== null && (
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                isActive
                  ? 'bg-[#2563EB]/30 text-[#38BDF8] font-bold'
                  : 'bg-white/5 text-slate-400'
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
