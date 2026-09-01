import React, { useState } from 'react';
import { FormSettings } from '../../types';
import { Settings, Shield, Bell, Check, X, Award, Eye, MessageCircle, Save, FileCheck, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { formatExpiryDescription, validateFutureExpiry } from '../../utils/formStatus';
import { useApp } from '../../context/AppContext';

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
  const { showToast } = useApp();
  const [isLinkSaved, setIsLinkSaved] = useState(false);
  const [isAllSaved, setIsAllSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveLink = () => {
    onUpdateSettings(settings);
    setIsLinkSaved(true);
    showToast?.('Community Link Saved 💬', 'WhatsApp / Community invite URL has been saved.', 'success');
    setTimeout(() => setIsLinkSaved(false), 2500);
  };

  const handleSaveAll = () => {
    onUpdateSettings(settings);
    setIsAllSaved(true);
    showToast?.('Settings Saved 💾', 'Form configurations and community links saved successfully.', 'success');
    setTimeout(() => {
      setIsAllSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">Collect Email Addresses</span>
                    <span className="text-[11px] text-slate-400">Require respondents to provide validated email address.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.collectEmail}
                    onChange={(e) => onUpdateSettings({ ...settings, collectEmail: e.target.checked })}
                    className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                  />
                </label>

                {settings.collectEmail && (
                  <div className="pt-2.5 border-t border-white/5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Collection Mode</span>
                      <select
                        value={settings.emailCollectionMode || 'responder_input'}
                        onChange={(e) => onUpdateSettings({ ...settings, emailCollectionMode: e.target.value as 'responder_input' | 'verified' })}
                        className="bg-[#121820] text-xs text-[#38BDF8] border border-[#2A3647] rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="responder_input">Responder input (Manual)</option>
                        <option value="verified">Verified (Account Verified)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Send responders a copy</span>
                      <select
                        value={settings.sendResponseCopy || 'when_requested'}
                        onChange={(e) => onUpdateSettings({ ...settings, sendResponseCopy: e.target.value as 'off' | 'when_requested' | 'always' })}
                        className="bg-[#121820] text-xs text-white border border-[#2A3647] rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="when_requested">When requested</option>
                        <option value="always">Always</option>
                        <option value="off">Off</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

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

              {/* Toggable Agreement / Terms Checkbox */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-cyan-400" />
                      <span>Require Agreement / Consent Checkbox</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Respondents must check an agreement / data sharing policy box before submitting.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.requireAgreement)}
                    onChange={(e) => onUpdateSettings({
                      ...settings,
                      requireAgreement: e.target.checked,
                      agreementText: settings.agreementText || 'By submitting this form, you agree to share the information provided for official purposes.'
                    })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                {settings.requireAgreement && (
                  <div className="pt-2.5 border-t border-white/5 space-y-2.5 animate-fadeIn">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase text-slate-300">Agreement Statement Text</label>
                        <span className="text-[10px] text-slate-500 font-mono">Shown at form footer</span>
                      </div>
                      <textarea
                        rows={3}
                        value={settings.agreementText || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, agreementText: e.target.value })}
                        placeholder="e.g. By submitting this form, you agree to our terms of participation and data sharing policy."
                        className="w-full p-2.5 rounded-xl bg-[#121820] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">Quick Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateSettings({
                            ...settings,
                            agreementText: 'By submitting this form, you agree to share the information provided with the Gradient Club of St. Peter’s Engineering College for official club purposes.'
                          })}
                          className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          🏛️ College Club Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateSettings({
                            ...settings,
                            agreementText: 'By submitting this form, you agree to our Terms of Service and Privacy Policy.'
                          })}
                          className="px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          📜 Terms &amp; Privacy Policy
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateSettings({
                            ...settings,
                            agreementText: 'I consent to the collection and processing of my submitted response data for event registration and evaluation purposes.'
                          })}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          🔒 Data Processing Consent
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Deadline / Form Expiry */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Set Response Deadline (Form Expiry)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Automatically stop accepting new responses after a specific date and time.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.expiresAt)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
                        d.setHours(23, 59, 0, 0);
                        onUpdateSettings({
                          ...settings,
                          expiresAt: d.toISOString(),
                          expiryMessage: settings.expiryMessage || 'This form is no longer accepting responses. The response deadline for this form has passed.'
                        });
                      } else {
                        onUpdateSettings({
                          ...settings,
                          expiresAt: undefined
                        });
                      }
                    }}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {settings.expiresAt && (
                  <div className="pt-2.5 border-t border-white/5 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-300 block mb-1">
                          Deadline Date
                        </label>
                        <input
                          type="date"
                          value={isValid(parseISO(settings.expiresAt)) ? format(parseISO(settings.expiresAt), 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            const currentIso = settings.expiresAt && isValid(parseISO(settings.expiresAt)) ? settings.expiresAt : new Date().toISOString();
                            const currentTime = format(parseISO(currentIso), 'HH:mm');
                            const res = validateFutureExpiry(newDate, currentTime);
                            if (res.isoString) {
                              onUpdateSettings({ ...settings, expiresAt: res.isoString });
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-300 block mb-1">
                          Deadline Time
                        </label>
                        <input
                          type="time"
                          value={isValid(parseISO(settings.expiresAt)) ? format(parseISO(settings.expiresAt), 'HH:mm') : '23:59'}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            const currentIso = settings.expiresAt && isValid(parseISO(settings.expiresAt)) ? settings.expiresAt : new Date().toISOString();
                            const currentDate = format(parseISO(currentIso), 'yyyy-MM-dd');
                            const res = validateFutureExpiry(currentDate, newTime);
                            if (res.isoString) {
                              onUpdateSettings({ ...settings, expiresAt: res.isoString });
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#121820] border border-[#2A3647] text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>

                    {/* Expiry summary badge */}
                    <div className="p-2.5 rounded-lg bg-[#121820] border border-[#2A3647] flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Current Status:</span>
                      <span className="font-bold text-amber-300">
                        {formatExpiryDescription(settings.expiresAt).fullLabel}
                      </span>
                    </div>

                    {/* Custom Expired Message */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase text-slate-300">Custom Expired Message (Optional)</label>
                        <span className="text-[10px] text-slate-500 font-mono">Shown when deadline passes</span>
                      </div>
                      <textarea
                        rows={2}
                        value={settings.expiryMessage || ''}
                        onChange={(e) => onUpdateSettings({ ...settings, expiryMessage: e.target.value })}
                        placeholder="e.g. This registration period has ended. Thank you for your interest."
                        className="w-full p-2.5 rounded-xl bg-[#121820] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Want responses to stay open indefinitely?</span>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, expiresAt: undefined })}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Remove Expiry (No Deadline)
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

              {/* Post-Submission Community / WhatsApp Group Link */}
              <div className="pt-3 space-y-3 border-t border-white/10 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <label className="text-xs font-bold text-white">Post-Submission WhatsApp & Community Links</label>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Invite
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  After submitting, respondents can join your WhatsApp group, Discord server, or community with 1 click.
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({
                      ...settings,
                      communityLink: settings.communityLink || 'https://chat.whatsapp.com/your-invite-code',
                      communityLinkText: 'Join WhatsApp Group'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💬 WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({
                      ...settings,
                      communityLink: settings.communityLink || 'https://discord.gg/your-server',
                      communityLinkText: 'Join Discord Server'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🎮 Discord</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({
                      ...settings,
                      communityLink: settings.communityLink || 'https://t.me/your-channel',
                      communityLinkText: 'Join Telegram Channel'
                    })}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✈️ Telegram</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Invite URL</span>
                    <input
                      type="url"
                      value={settings.communityLink || ''}
                      onChange={(e) => onUpdateSettings({ ...settings, communityLink: e.target.value })}
                      placeholder="https://chat.whatsapp.com/your-invite-code"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Button Text</span>
                    <input
                      type="text"
                      value={settings.communityLinkText || ''}
                      onChange={(e) => onUpdateSettings({ ...settings, communityLinkText: e.target.value })}
                      placeholder="Join Gradient Club WhatsApp Group"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Direct Save Link Button */}
                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSaveLink}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-neo ${
                        isLinkSaved
                          ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                      }`}
                    >
                      {isLinkSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Link Saved Successfully ✓</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save WhatsApp / Group Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
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

        {/* Modal Sticky Footer with Save & Apply Button */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#0E131A]/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-neo cursor-pointer transition-all ${
              isAllSaved
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
            }`}
          >
            {isAllSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Settings Saved ✓</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Apply Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
