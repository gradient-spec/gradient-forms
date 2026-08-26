import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, BarChart3, Database, Layers, Sparkles } from 'lucide-react';

export const HeroSpatialScene: React.FC = () => {
  const [selectedChoice, setSelectedChoice] = useState<'developer' | 'student' | 'designer'>('developer');

  return (
    <div className="relative w-full max-w-xl mx-auto h-[440px] flex items-center justify-center select-none perspective-1000">
      {/* Volumetric Radial Aura Glow Behind Scene */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB]/20 via-[#9333EA]/25 to-[#38BDF8]/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating 3D Spatial System Container */}
      <div className="relative w-full h-full flex items-center justify-center">

        {/* 1. CENTRAL FORM CANVAS PLANE */}
        <motion.div
          initial={{ y: 20, opacity: 0, rotateX: 6, rotateY: -6 }}
          animate={{ y: [0, -8, 0], opacity: 1, rotateX: 6, rotateY: -6 }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.8 }
          }}
          className="w-[340px] sm:w-[380px] rounded-2xl bg-[#121820]/90 border border-[#2A3647] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative z-20 space-y-4 hover:border-[#2563EB]/60 transition-colors"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#2A3647]/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <span className="text-xs font-mono font-bold text-white tracking-wide">GRADIENT FORMS</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40">
              LIVE FORM
            </span>
          </div>

          {/* Form Title & Subtitle */}
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-white">Product & Developer Feedback</h3>
            <p className="text-[11px] text-slate-400">Tell us about your current role & stack.</p>
          </div>

          {/* Question 1: Role Field */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-200 block">
              1. What is your primary role?
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'developer', label: 'Developer / Engineer' },
                { id: 'student', label: 'Student / Researcher' },
                { id: 'designer', label: 'Product Designer' },
              ].map(choice => (
                <button
                  key={choice.id}
                  onClick={() => setSelectedChoice(choice.id as any)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all ${
                    selectedChoice === choice.id
                      ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-neo'
                      : 'bg-[#1A2332] text-slate-300 border border-[#2A3647] hover:border-slate-500'
                  }`}
                >
                  <span>{choice.label}</span>
                  {selectedChoice === choice.id && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Question 2 (Revealed by Logic) */}
          <div className="p-3 rounded-xl bg-[#1A2332]/90 border border-[#2563EB]/50 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-white font-bold">
                {selectedChoice === 'developer' && '2. Primary Tech Stack / Framework:'}
                {selectedChoice === 'student' && '2. University & Major:'}
                {selectedChoice === 'designer' && '2. Favorite Design Tool:'}
              </span>
              <span className="text-[#38BDF8]">Revealed by rule</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#121820] border border-[#2A3647] text-xs text-slate-400 font-mono">
              {selectedChoice === 'developer' && 'e.g. React, TypeScript, Node.js'}
              {selectedChoice === 'student' && 'e.g. Stanford University — CS'}
              {selectedChoice === 'designer' && 'e.g. Figma, Linear'}
            </div>
          </div>
        </motion.div>


        {/* 2. SATELLITE LOGIC ENGINE PLANE (Floating Top Right) */}
        <motion.div
          initial={{ y: -10, opacity: 0, x: 20 }}
          animate={{ y: [0, -12, 0], opacity: 1, x: 0 }}
          transition={{
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            opacity: { duration: 0.8 }
          }}
          className="absolute -top-4 right-0 sm:-right-4 z-30 w-52 p-3 rounded-xl bg-[#1A2332]/95 border border-[#38BDF8]/40 shadow-neo backdrop-blur-md space-y-1.5"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-[#38BDF8]">
            <span className="flex items-center gap-1 font-bold">
              <GitBranch className="w-3 h-3 text-[#2563EB]" /> LOGIC RULE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <div className="text-[11px] font-mono text-slate-200">
            IF <span className="text-[#38BDF8] font-bold">[Role]</span> = <span className="text-white">"{selectedChoice}"</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            THEN SHOW <span className="text-cyan-300 font-bold">[Target Field]</span>
          </div>
        </motion.div>


        {/* 3. SATELLITE ANALYTICS NODE (Floating Bottom Left) */}
        <motion.div
          initial={{ y: 10, opacity: 0, x: -20 }}
          animate={{ y: [0, 10, 0], opacity: 1, x: 0 }}
          transition={{
            y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            opacity: { duration: 0.8 }
          }}
          className="absolute -bottom-4 left-0 sm:-left-4 z-30 p-3 rounded-xl bg-[#1A2332]/95 border border-[#8B5CF6]/40 shadow-neo backdrop-blur-md space-y-1"
        >
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8B5CF6] font-bold">
            <BarChart3 className="w-3 h-3 text-[#8B5CF6]" />
            <span>RESPONSES</span>
          </div>
          <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <span>142</span>
            <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.2 rounded border border-[#10B981]/30">
              ↗ 18%
            </span>
          </div>
        </motion.div>


        {/* 4. SATELLITE GOOGLE SHEETS SYNC NODE (Floating Bottom Right) */}
        <motion.div
          initial={{ y: 15, opacity: 0, x: 20 }}
          animate={{ y: [0, -10, 0], opacity: 1, x: 0 }}
          transition={{
            y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
            opacity: { duration: 0.8 }
          }}
          className="absolute bottom-2 right-2 sm:-right-8 z-30 p-2.5 rounded-xl bg-[#121820]/95 border border-[#10B981]/40 shadow-neo backdrop-blur-md flex items-center gap-2 text-[11px] font-mono text-slate-200"
        >
          <Database className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Sheets Sync</span>
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
        </motion.div>

        {/* Ambient Data Particles / Orbit Dots */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute top-1/4 left-8 w-1.5 h-1.5 rounded-full bg-[#38BDF8] opacity-60 animate-pulse" />
          <div className="absolute bottom-1/3 right-12 w-2 h-2 rounded-full bg-[#8B5CF6] opacity-70 animate-pulse" />
          <div className="absolute top-12 right-1/4 w-1.5 h-1.5 rounded-full bg-[#10B981] opacity-50 animate-pulse" />
        </div>

      </div>
    </div>
  );
};
