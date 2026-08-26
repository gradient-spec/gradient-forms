import React from 'react';
import { FormSettings } from '../../types';
import { Settings, Shield, Bell, Check, X, Award, Eye } from 'lucide-react';

interface FormSettingsModalProps {
  isOpen: boolean;
  settings: FormSettings;
  onUpdateSettings: (newSettings: FormSettings) => void;
  onClose: () => void;
}

export const FormSettingsModal: React.FC<FormSettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel border border-violet-500/30 rounded-2xl shadow-glow-violet overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Form Configuration & Security</h3>
              <p className="text-xs text-slate-400">Response rules, presentation, and grading.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* General & Security */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" /> Response Security Rules
            </span>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Collect Email Addresses</span>
                  <span className="text-[11px] text-slate-400">Require respondents to provide validated email.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.collectEmail}
                  onChange={(e) => onUpdateSettings({ ...settings, collectEmail: e.target.checked })}
                  className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Limit to 1 Response per Person</span>
                  <span className="text-[11px] text-slate-400">Prevents duplicate submissions from same email.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.limitOneResponse}
                  onChange={(e) => onUpdateSettings({ ...settings, limitOneResponse: e.target.checked })}
                  className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Save Progress Automatically</span>
                  <span className="text-[11px] text-slate-400">Draft answers persist locally for respondent.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.saveProgress}
                  onChange={(e) => onUpdateSettings({ ...settings, saveProgress: e.target.checked })}
                  className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Presentation & UX */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" /> Presentation & Confirmation
            </span>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Section Progress Bar</span>
                  <span className="text-[11px] text-slate-400">Animated indicator on form header.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showProgressBar}
                  onChange={(e) => onUpdateSettings({ ...settings, showProgressBar: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirmation Message</label>
                <textarea
                  rows={2}
                  value={settings.confirmationMessage}
                  onChange={(e) => onUpdateSettings({ ...settings, confirmationMessage: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Quiz Mode Settings */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Quiz & Grading Mode
            </span>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-amber-200 block">Make this a Quiz</span>
                <span className="text-[11px] text-amber-400/80">Assign point values and automatic grading keys.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.quizMode}
                onChange={(e) => onUpdateSettings({ ...settings, quizMode: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
