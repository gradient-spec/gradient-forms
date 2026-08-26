import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, User, Building, Globe, Shield, Bell, Check, Palette } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { workspace, showToast } = useApp();
  const [customDomain, setCustomDomain] = useState('forms.gradientlabs.io');
  const [userName, setUserName] = useState('Alex Rivera');
  const [userEmail, setUserEmail] = useState('alex@gradientforms.io');

  const handleSaveProfile = () => {
    showToast('Settings Saved', 'Profile and custom domain settings updated.', 'success');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
          Workspace <span className="gradient-text">& Profile Settings</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Configure personal credentials, team workspace options, and custom domains.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" /> User Profile Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Custom Domain Architecture */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" /> Custom Subdomain / CNAME Setup
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Custom Domain Hostname</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="forms.yourdomain.com"
              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500">Point a CNAME DNS record from your domain registrar to cname.gradientforms.io</p>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
            <Check className="w-4 h-4" /> SSL Certificate Auto-provisioned & Verified ✓
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-colors"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};
