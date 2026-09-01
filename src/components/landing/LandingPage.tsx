import React from 'react';
import { Hero } from './Hero';
import { InteractiveDemo } from './InteractiveDemo';
import { LogicDemoSection } from './LogicDemoSection';
import { useApp } from '../../context/AppContext';
import { Cpu, ArrowRight, Layers, Database } from 'lucide-react';
import { Footer } from '../layout/Footer';
import { AmbientBackground } from '../3d/AmbientBackground';

// Visual Card Primitives
import { SubmissionVelocityCard } from '../cards/SubmissionVelocityCard';
import { CompletionTimeCard } from '../cards/CompletionTimeCard';
import { GoogleSheetsSyncCard } from '../cards/GoogleSheetsSyncCard';

import {
  GoogleSheetsCard,
  GoogleDriveCard,
  ResendEmailCard,
  SlackAlertsCard,
  ZapierCard,
  WebhookCard
} from '../cards/IntegrationVisualCards';

export const LandingPage: React.FC = () => {
  const { setActiveView, createBlankForm, responses } = useApp();

  const handleStartBuilding = () => {
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 selection:bg-[#2563EB] selection:text-white relative">
      {/* Global Dynamic Topographic Parallax Background */}
      <AmbientBackground />

      <div className="relative z-10">
        {/* SECTION 01: Hero */}
        <Hero />

        {/* SECTION 02: Interactive Builder Workspace Preview */}
        <InteractiveDemo />

        {/* SECTION 03: Smart Form Logic Demonstration */}
        <LogicDemoSection />

        {/* SECTION 04: Real-time Analytics Stream & Metric Primitives */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#2A3647]">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-[#84A1C0]">
              SECTION 04 — VISUAL DATA ENGINE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Automated Analytics & Insights
            </h2>
            <p className="text-slate-400 text-sm">
              Submissions instantly transform into visual metrics, daily influx velocity, and answer distribution reports.
            </p>
          </div>

          {/* Asymmetric Bento Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SubmissionVelocityCard count={responses.length > 0 ? responses.length : 142} velocityPercent={18} />
            <CompletionTimeCard timeText="1m 45s" completionRate={82} speedImprovementPercent={12} />
            <GoogleSheetsSyncCard />
          </div>
        </section>

        {/* SECTION 05: Systems Integration Map & Bento Grid */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#2A3647]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Editorial Column with Orbital Visualization */}
            <div className="lg:col-span-4 space-y-6 relative">
              {/* Orbital Background Visualization */}
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-gradient-to-tr from-[#2563EB]/15 via-[#9333EA]/15 to-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#38BDF8]">
                  <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>SYSTEM INTEGRATIONS</span>
                </div>
                <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white leading-tight">
                  Connect Data <br />
                  <span className="bg-gradient-to-r from-[#38BDF8] to-[#2563EB] bg-clip-text text-transparent">Everywhere</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bridge form responses with the tools you already use. Automate workflows, sync data, and never miss another submission.
                </p>
              </div>

              <div className="pt-2 relative z-10">
                <button
                  onClick={() => setActiveView('integrations')}
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-bold text-white transition-all shadow-neo group"
                >
                  <span>View Integrations Hub</span>
                  <ArrowRight className="w-4 h-4 text-[#38BDF8] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Asymmetric 2x3 Integration Bento Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GoogleSheetsCard onClick={() => setActiveView('integrations')} />
              <GoogleDriveCard onClick={() => setActiveView('integrations')} />
              <ResendEmailCard onClick={() => setActiveView('integrations')} />
              <SlackAlertsCard onClick={() => setActiveView('integrations')} />
              <ZapierCard onClick={() => setActiveView('integrations')} />
              <WebhookCard onClick={() => setActiveView('integrations')} />
            </div>
          </div>
        </section>

        {/* SECTION 06: Final Product CTA */}
        <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto text-center border-t border-[#2A3647]">
          <div className="bg-[#121820] border border-[#2A3647] rounded-2xl p-10 md:p-16 space-y-6 shadow-neo">
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white">
              Ready to build intelligent forms?
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Experience the neo-tech form OS designed for modern product, engineering, and research teams.
            </p>
            <div>
              <button
                onClick={handleStartBuilding}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-neo transition-all transform hover:scale-105"
              >
                <span>Create your first form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 07: Minimal Footer */}
        <Footer />
      </div>
    </div>
  );
};
