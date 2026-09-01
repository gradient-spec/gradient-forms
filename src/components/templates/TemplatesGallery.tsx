import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Eye, Check, Star, BookOpen, Briefcase, Calendar, ShieldAlert, ArrowLeft } from 'lucide-react';

export const TemplatesGallery: React.FC = () => {
  const { createFormFromTemplate, setActiveView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates = [
    { id: 'cs-course-feedback', title: 'Computer Science Course & Lab Feedback', category: 'Education', desc: '10-point lab scale, instructor rating, and algorithms quiz.', icon: BookOpen, color: 'text-violet-400' },
    { id: 'cyberpunk-conference', title: 'Cyberpunk 2026 Tech Summit RSVP', category: 'Events', desc: 'Conference registration, workshop selection, and VIP pass.', icon: Calendar, color: 'text-cyan-400' },
    { id: 'senior-frontend-app', title: 'Senior Frontend & UX Architect Job Application', category: 'HR', desc: 'Resume PDF upload, portfolio link, and technical question.', icon: Briefcase, color: 'text-magenta-400' },
    { id: 'product-nps-survey', title: 'Gradient Forms Product UX & NPS Survey', category: 'Marketing', desc: 'Matrix rating grid, satisfaction scale, and feature requests.', icon: Star, color: 'text-yellow-400' },
    { id: 'ai-prompt-eval', title: 'AI Model & Prompt Output Benchmarking', category: 'Research', desc: 'Comparative scale rating and safety assessment.', icon: Sparkles, color: 'text-emerald-400' },
    { id: 'hackathon-registration', title: 'Global AI & WebGL Hackathon Team Registration', category: 'Events', desc: 'Team member details, project title, and track selection.', icon: Calendar, color: 'text-indigo-400' }
  ];

  const filtered = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleUseTemplate = (templateId: string) => {
    createFormFromTemplate(templateId);
    setActiveView('builder');
  };

  return (
    <div className="text-slate-100 pb-24">
      {/* Full-width Top Edge Navigation Bar */}
      <div className="w-full border-b border-[#2A3647]/80 bg-[#0B0F14]/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-300 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 group cursor-pointer"
          title="Back to Forms Workspace"
        >
          <ArrowLeft className="w-4 h-4 text-[#38BDF8] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Forms</span>
        </button>
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>12+ FUTURISTIC TEMPLATES READY</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
          Templates <span className="gradient-text">Marketplace</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          1-click clone pre-designed forms into your workspace.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {['all', 'Education', 'Events', 'HR', 'Marketing', 'Research'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.id}
              className="p-6 rounded-2xl glass-panel glass-panel-hover border border-white/10 flex flex-col justify-between h-64 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${tpl.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/5 text-slate-400 border border-white/10">
                    {tpl.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-white group-hover:text-violet-300 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {tpl.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleUseTemplate(tpl.id)}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all flex items-center justify-center gap-2"
              >
                <span>Use Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
