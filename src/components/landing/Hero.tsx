import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Hero3DLogoScene } from './Hero3DLogoScene';

export const Hero: React.FC = () => {
  const { setActiveView, createBlankForm } = useApp();

  const handleCreateForm = () => {
    setActiveView('dashboard');
  };

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-[100svh] h-[100svh] flex flex-col justify-between pt-8 pb-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Viewport Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Editorial Headline & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 space-y-6"
        >
          {/* Editorial Display Headline */}
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.08]">
            Forms, <br />
            <span className="bg-gradient-to-r from-[#FF455B] via-[#EC4899] to-[#3B82F6] bg-clip-text text-transparent">
              reimagined
            </span> for the future.
          </h1>

          {/* Product Concept Message */}
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg font-sans">
            Create structured forms, design intelligent logic, collect responses, and turn submissions into useful data — all in one workspace.
          </p>

          {/* Refined CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={handleCreateForm}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs transition-all shadow-neo group"
            >
              <span>Create a form</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-200 font-medium text-xs transition-colors"
            >
              <Play className="w-3 h-3 text-[#38BDF8]" />
              <span>View Forms Control Center</span>
            </button>
          </div>

          {/* Minimal Specification Capability Strip */}
          <div className="pt-6 border-t border-[#2A3647]/60 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
            <span className="text-white font-semibold">20+ Field Types</span>
            <span className="text-[#2A3647]">•</span>
            <span className="text-[#38BDF8] font-semibold">IF / THEN Logic</span>
            <span className="text-[#2A3647]">•</span>
            <span className="text-white font-semibold">Response Analytics</span>
            <span className="text-[#2A3647]">•</span>
            <span className="text-[#10B981] font-semibold">Sheets Sync</span>
          </div>
        </motion.div>

        {/* Right Column: Substantially Enlarged 3D Logo Mark + 4 Product Signals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-6 flex justify-center py-2"
        >
          <Hero3DLogoScene />
        </motion.div>
      </div>

      {/* Subtle Bottom Scroll Discovery Indicator */}
      <motion.button
        onClick={scrollToNextSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mx-auto flex flex-col items-center gap-1 text-[10px] font-mono tracking-widest text-[#84A1C0] hover:text-white transition-colors cursor-pointer group focus:outline-none pb-2"
      >
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform animate-bounce text-[#38BDF8]" />
      </motion.button>
    </section>
  );
};
