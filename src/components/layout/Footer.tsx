import React from 'react';
import { useApp } from '../../context/AppContext';
import { GradientLogo } from '../ui/GradientLogo';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="border-t border-[#2A3647] bg-[#121820] py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <GradientLogo size={32} showText={false} />
          <div>
            <span className="font-heading font-bold text-white tracking-wide">GRADIENT FORMS</span>
            <p className="text-[10px] text-slate-500 font-mono">Ideas Are Automated</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button onClick={() => setActiveView('dashboard')} className="hover:text-white transition-colors">Dashboard</button>
          <button onClick={() => setActiveView('templates')} className="hover:text-white transition-colors">Templates</button>
          <button onClick={() => setActiveView('integrations')} className="hover:text-white transition-colors">Integrations</button>
          <button onClick={() => setActiveView('analytics')} className="hover:text-white transition-colors">Analytics</button>
          <button onClick={() => setActiveView('settings')} className="hover:text-white transition-colors">Settings</button>
        </div>

        <p className="text-[11px] text-slate-500 font-mono">
          © 2026 Gradient Forms. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
