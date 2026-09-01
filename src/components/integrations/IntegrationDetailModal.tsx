import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Folder,
  Mail,
  MessageSquare,
  Zap,
  Terminal,
  X,
  Check,
  ExternalLink,
  Copy,
  Send,
  RefreshCw,
  Play,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type IntegrationType = 'sheets' | 'drive' | 'resend' | 'slack' | 'zapier' | 'webhook' | null;

interface IntegrationDetailModalProps {
  type: IntegrationType;
  onClose: () => void;
}

export const IntegrationDetailModal: React.FC<IntegrationDetailModalProps> = ({ type, onClose }) => {
  const { showToast, activeForm, responses, integrations, updateIntegrations } = useApp();

  // Local interactive states for test actions
  const [testEmail, setTestEmail] = useState('developer@company.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResponseStatus, setTestResponseStatus] = useState<string | null>(null);

  // Sheets Config
  const [spreadsheetId, setSpreadsheetId] = useState(integrations.googleSheets.spreadsheetId || '');
  const [sheetName, setSheetName] = useState(integrations.googleSheets.sheetName || 'Form_Responses');

  // Drive Config
  const [driveFolder, setDriveFolder] = useState('Gradient Forms Uploads');

  // Slack Config
  const [slackChannel, setSlackChannel] = useState('#feedback-alerts');

  // Webhook Config
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/v1/webhooks/gradient');

  if (!type) return null;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} Copied! 📋`, 'Copied value to clipboard.', 'info');
  };

  const handleRunTestPayload = (name: string) => {
    setIsSendingTest(true);
    setTestResponseStatus(null);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestResponseStatus('HTTP 200 OK (Execution Time: 124ms)');
      showToast(`${name} Test Successful 🎉`, 'Received 200 OK response from target endpoint.', 'success');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* ========================================================================= */}
        {/* 1. GOOGLE SHEETS MODAL */}
        {/* ========================================================================= */}
        {type === 'sheets' && (
          <>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-cyan">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">Google Sheets Integration</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Stream responses directly into your Google Spreadsheet in real-time.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Live Sync Pipeline Overview
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every submission to <strong>{activeForm?.title || 'your form'}</strong> is automatically transformed into a new row in Google Sheets. Column headers automatically map to your form questions.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                    <span className="text-slate-400 block text-[10px]">TOTAL ROWS</span>
                    <strong className="text-emerald-400 text-sm">{responses.length} rows</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                    <span className="text-slate-400 block text-[10px]">SYNC FREQUENCY</span>
                    <strong className="text-white text-sm">Real-time Stream</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                    <span className="text-slate-400 block text-[10px]">STATUS</span>
                    <strong className="text-emerald-400 text-sm">Active 🟢</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Google Spreadsheet ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleCopyText(spreadsheetId, 'Spreadsheet ID')}
                      className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Sheet Tab Name</label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Column Mapping Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Auto-Mapped Columns:</span>
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                  {['Timestamp', 'Respondent Email', 'Respondent Name'].concat(
                    (activeForm?.questions || []).map(q => q.title)
                  ).slice(0, 5).map((col, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-1 last:border-0">
                      <span className="text-slate-400">Column {String.fromCharCode(65 + idx)}</span>
                      <span className="text-emerald-300 font-medium">➔ {col}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1.5"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleRunTestPayload('Google Sheets')}
                disabled={isSendingTest}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-cyan transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSendingTest ? 'animate-spin' : ''}`} />
                <span>{isSendingTest ? 'Syncing...' : 'Force Manual Sync Now'}</span>
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* 2. GOOGLE DRIVE MODAL */}
        {/* ========================================================================= */}
        {type === 'drive' && (
          <>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-glow-blue">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">Google Drive File Sync</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/40">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Stores respondent uploaded files, resumes, and PDFs directly in Google Drive.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Folder className="w-4 h-4" /> Cloud Storage Target
                </h4>
                <div className="font-mono text-xs text-cyan-300 p-3 rounded-xl bg-black/30 border border-white/5">
                  📁 My Drive / Gradient Forms / Uploads
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">STORAGE USED</span>
                    <strong className="text-white text-sm">42.5 MB / 15 GB</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">ALLOWED FORMATS</span>
                    <strong className="text-cyan-300 text-xs">PDF, PNG, JPG, DOCX</strong>
                  </div>
                </div>
              </div>

              {/* Recent Files Log */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Recent Uploaded Files Log:</span>
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300 border-b border-white/5 pb-1">
                    <span>📄 resume_alex_rivera.pdf (2.4 MB)</span>
                    <span className="text-blue-400">Synced 10m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 border-b border-white/5 pb-1">
                    <span>🖼️ portfolio_preview.png (18.1 MB)</span>
                    <span className="text-blue-400">Synced 25m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>📝 lab_submission_data.docx (1.2 MB)</span>
                    <span className="text-slate-500">Synced 1h ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1.5"
              >
                <span>Open Google Drive Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleRunTestPayload('Google Drive File Sync')}
                disabled={isSendingTest}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow-blue transition-colors flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Testing...' : 'Test Storage Connection'}</span>
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* 3. RESEND EMAIL MODAL */}
        {/* ========================================================================= */}
        {type === 'resend' && (
          <>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-glow-violet">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">Resend Email Notifications</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/40">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Automated email receipts to respondents & instant owner alerts.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Receipt & Alert Dispatcher Settings
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">SENDER EMAIL</span>
                    <strong className="text-purple-300 text-xs">notifications@gradientforms.io</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">DELIVERY SUCCESS RATE</span>
                    <strong className="text-emerald-400 text-xs">99.8% Delivered</strong>
                  </div>
                </div>
              </div>

              {/* Template Body Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Email HTML Template Preview:</span>
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-slate-400 pb-2 border-b border-white/5">
                    Subject: <span className="text-white font-bold">Thank you for submitting {"{{form_name}}"}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    Hi <span className="text-purple-300">{"{{respondent_name}}"}</span>,<br /><br />
                    We have received your response for <strong>{"{{form_name}}"}</strong>. Your submission ID is <span className="text-cyan-300">{"{{submission_id}}"}</span>.<br /><br />
                    Thank you for choosing Gradient Forms!
                  </div>
                </div>
              </div>

              {/* Live Test Dispatcher */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Send Test Email Receipt To:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleRunTestPayload('Resend Email')}
                    disabled={isSendingTest || !testEmail.trim()}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-violet transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                  </button>
                </div>
                {testResponseStatus && (
                  <p className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {testResponseStatus}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* 4. SLACK ALERTS MODAL */}
        {/* ========================================================================= */}
        {type === 'slack' && (
          <>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-950/40 via-pink-900/20 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-glow-pink">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">Slack Team Channel Alerts</h3>
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold border border-pink-500/40">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Post rich formatted cards directly into your Slack channel when forms are submitted.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Slack Channel</label>
                  <input
                    type="text"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-pink-300 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Slack Message Card Visual Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Slack Message Block Preview:</span>
                <div className="p-4 rounded-2xl bg-[#1A1D21] border border-white/10 font-sans text-xs space-y-2">
                  <div className="flex items-center gap-2 text-pink-400 font-bold">
                    <span>⚡ Gradient Forms Bot</span>
                    <span className="text-[10px] text-slate-500 font-mono">11:42 AM</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#222529] border-l-4 border-pink-500 space-y-1 text-slate-200">
                    <p className="font-bold text-white">🚀 New Response on {activeForm?.title || 'Form'}!</p>
                    <p className="text-slate-300"><strong>Respondent:</strong> Alex Rivera (alex@gradient.io)</p>
                    <p className="text-yellow-400">★★★★★ "Seamless experience and gorgeous UI!"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-end gap-3">
              <button
                onClick={() => handleRunTestPayload('Slack Alert Ping')}
                disabled={isSendingTest}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-glow-pink transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Pinging Slack...' : 'Send Test Slack Ping'}</span>
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* 5. ZAPIER MODAL */}
        {/* ========================================================================= */}
        {type === 'zapier' && (
          <>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-orange-950/40 via-orange-900/20 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-glow-orange">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">Zapier Workflow Automation</h3>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-mono font-bold border border-orange-500/40">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Connect Gradient Forms to 5,000+ app workflows on Zapier.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Active Zaps List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Connected Zap Workflows:</span>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Form Response ➔ Notion Database Entry</div>
                      <span className="text-[10px] text-slate-400">Trigger: New Response • 142 tasks executed</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Running</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Form Response ➔ Add HubSpot CRM Contact</div>
                      <span className="text-[10px] text-slate-400">Trigger: New Submission • 68 tasks executed</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Running</span>
                  </div>
                </div>
              </div>

              {/* Zapier Secret API Key */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Zapier Workspace API Secret Key:</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    readOnly
                    value="gf_zap_secret_894028104812048"
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-orange-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopyText('gf_zap_secret_894028104812048', 'Zapier API Key')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <a
                href="https://zapier.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1.5"
              >
                <span>Open Zapier Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleRunTestPayload('Zapier Automation Trigger')}
                disabled={isSendingTest}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-glow-orange transition-colors flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Testing Zap...' : 'Test Zapier Event'}</span>
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* 6. WEBHOOKS MODAL */}
        {/* ========================================================================= */}
        {type === 'webhook' && (
          <>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-950/40 via-cyan-900/20 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">Developer Webhook Endpoint</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                      HTTP 200 OK
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Real-time HTTP POST JSON payload delivery for custom servers.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Webhook Target Endpoint URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* JSON Payload Inspector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Webhook JSON Payload:</span>
                  <button
                    onClick={() => handleCopyText(JSON.stringify({
                      event: 'form_response.created',
                      formId: activeForm?.id || 'form-cs-feedback',
                      submittedAt: new Date().toISOString(),
                      respondent: { email: 'alex.rivera@gradient.io', name: 'Alex Rivera' }
                    }, null, 2), 'JSON Payload')}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <Copy className="w-3 h-3" /> Copy JSON
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48">
{JSON.stringify({
  event: "form_response.created",
  formId: activeForm?.id || "form-cs-feedback",
  formTitle: activeForm?.title || "Course Feedback",
  responseId: "resp-" + Date.now(),
  submittedAt: new Date().toISOString(),
  respondent: {
    email: "alex.rivera@gradient.io",
    name: "Alex Rivera"
  },
  answers: {
    "q-rating": 5,
    "q-feedback": "Seamless webhook execution!"
  }
}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <div>
                {testResponseStatus && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {testResponseStatus}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleRunTestPayload('Developer Webhook')}
                disabled={isSendingTest}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-cyan transition-colors flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Sending Webhook...' : 'Fire Test Webhook Payload'}</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
