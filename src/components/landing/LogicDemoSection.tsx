import React, { useState } from 'react';
import { GitBranch, ArrowRight, Check, Eye } from 'lucide-react';

export const LogicDemoSection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'professional'>('student');

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#2A3647]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Technical Context */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#84A1C0]">
            SECTION 03 — DYNAMIC LOGIC ENGINE
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Conditional Form Branching
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Construct visual rules that reveal or hide questions dynamically based on respondent inputs, ensuring clean, concise user journeys.
          </p>
          <div className="p-4 rounded-xl bg-[#121820] border border-[#2A3647] text-xs space-y-2 font-mono text-slate-300">
            <div className="text-[#84A1C0] uppercase font-bold">Rule Definition:</div>
            <div>IF <span className="text-white font-bold">[Role]</span> EQUALS <span className="text-[#38BDF8] font-bold">"Student"</span></div>
            <div>THEN SHOW <span className="text-cyan-300 font-bold">[University & Major]</span></div>
          </div>
        </div>

        {/* Right Column: Interactive Logic Rule Demo Box */}
        <div className="lg:col-span-7 bg-[#121820] border border-[#2A3647] rounded-2xl p-6 md:p-8 space-y-6 shadow-neo">
          <div className="flex items-center justify-between border-b border-[#2A3647] pb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-mono text-white font-bold">Live Conditional Branching Preview</span>
            </div>
            <span className="text-[10px] font-mono text-[#38BDF8] px-2 py-0.5 rounded bg-[#2563EB]/20 border border-[#2563EB]/40">
              Rule Active
            </span>
          </div>

          <div className="space-y-4">
            {/* Question 1: Source Condition */}
            <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-2">
              <label className="block text-xs font-bold text-white">
                1. What is your current primary role?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRole('student')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                    selectedRole === 'student'
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#121820] text-slate-300 border-[#2A3647]'
                  }`}
                >
                  Full-time Student
                </button>
                <button
                  onClick={() => setSelectedRole('professional')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                    selectedRole === 'professional'
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#121820] text-slate-300 border-[#2A3647]'
                  }`}
                >
                  Working Professional
                </button>
              </div>
            </div>

            {/* Question 2: Conditionally Revealed Target */}
            {selectedRole === 'student' ? (
              <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2563EB]/60 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    2. University Name & Major Department:
                  </label>
                  <span className="text-[10px] font-mono text-[#84A1C0]">Revealed by rule</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Stanford University — Computer Science"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2563EB]/60 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    2. Company Name & Job Title:
                  </label>
                  <span className="text-[10px] font-mono text-[#84A1C0]">Revealed by rule</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. TechCorp — Senior Systems Engineer"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
