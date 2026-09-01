import React, { useState } from 'react';
import { QuestionAnalyticsData } from '../../../utils/analyticsEngine';
import { Sparkles, MessageSquare, Search, Tag, Compass, List, Quote } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  data: QuestionAnalyticsData;
}

export const TextAnalyticsCard: React.FC<Props> = ({ data }) => {
  const [exploreView, setExploreView] = useState<'themes' | 'responses' | 'keywords'>('themes');
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const answers = data.textAnswers || [];
  const themes = data.themes || [];
  const keywords = data.keywords || [];

  const filteredAnswers = answers.filter(a =>
    a.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.respondent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pt-1">
      {/* Top Highlights Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Qualitative Synthesis Active</span>
          </div>
          {data.wordCountStats && (
            <div className="px-2.5 py-1 rounded-lg bg-[#161E2B] border border-[#2B3B52] text-slate-400 font-mono text-[11px]">
              Avg length: <strong className="text-white">{data.wordCountStats.avgWords} words</strong>
            </div>
          )}
        </div>

        {/* Explore Button */}
        <button
          type="button"
          onClick={() => setIsExploreOpen(!isExploreOpen)}
          className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isExploreOpen
              ? 'bg-[#2563EB]/20 border-[#2563EB]/50 text-[#38BDF8]'
              : 'bg-[#1A2332] hover:bg-[#222C3D] border-[#2A3647] text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{isExploreOpen ? 'Hide Explore' : 'Explore'}</span>
        </button>
      </div>

      {/* Explore Menu */}
      {isExploreOpen && (
        <div className="p-3 rounded-xl bg-[#16202E] border border-[#2B3B52] flex items-center justify-between gap-2 animate-fadeIn flex-wrap">
          <span className="text-[11px] font-mono uppercase text-slate-400">Select View:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExploreView('themes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'themes' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Themes &amp; Summary</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('responses')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'responses' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Responses ({answers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setExploreView('keywords')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                exploreView === 'keywords' ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#121820] text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Keywords</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Default: Concise AI Summary & Dominant Themes */}
      {exploreView === 'themes' && (
        <div className="space-y-4 pt-1">
          {themes.length > 0 ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/20 via-[#161E2B] to-[#121820] border border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Qualitative Themes</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Synthesized from {answers.length} answers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#121820]/90 border border-violet-500/20 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate">{t.theme}</span>
                      <span className="font-mono text-violet-300 font-bold">{t.percentage}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Mentioned in {t.count} responses</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#161E2B] border border-[#2B3B52] text-xs text-slate-400 font-mono text-center">
              More text responses needed to synthesize automated qualitative themes.
            </div>
          )}

          {/* Representative Responses Preview */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Quote className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Sample Representative Submissions:</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {answers.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-[#38BDF8] font-medium">{item.respondent}</span>
                    <span>{format(new Date(item.submittedAt), 'MMM dd • HH:mm')}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap font-sans text-xs pt-0.5">
                    "{item.answer}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Explore: All Responses with Search */}
      {exploreView === 'responses' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search response text or respondent email..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121820] border border-[#2B3B52] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredAnswers.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500">
                No responses match your search.
              </div>
            ) : (
              filteredAnswers.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#161E2B] border border-[#2B3B52] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-[#38BDF8] font-medium">{item.respondent}</span>
                    <span>{format(new Date(item.submittedAt), 'MMM dd, yyyy • HH:mm')}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap font-sans text-xs pt-0.5">
                    "{item.answer}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Explore: Extracted Keywords */}
      {exploreView === 'keywords' && (
        <div className="space-y-3">
          <div className="text-[11px] font-mono uppercase text-slate-400">Frequent Keywords &amp; Phrases:</div>
          {keywords.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              No prominent keywords detected.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <div key={i} className="px-3 py-1.5 rounded-lg bg-[#161E2B] border border-[#2B3B52] flex items-center gap-2 text-xs">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  <span className="font-medium text-white">{kw.keyword}</span>
                  <span className="text-[10px] font-mono bg-[#121820] text-cyan-300 px-1.5 py-0.5 rounded">
                    {kw.count}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
