import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, Check, RefreshCw, X, ExternalLink, Copy, Code, Download, Sparkles } from 'lucide-react';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { exportToCSV } from '../../utils/exportUtils';

export const GoogleSheetsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { integrations, updateIntegrations, showToast, activeForm, forms, responses } = useApp();
  const currentForm = activeForm || forms[0];
  const formResponses = responses.filter(r => r.formId === currentForm?.id);

  const [spreadsheetId, setSpreadsheetId] = useState(
    integrations.googleSheets.spreadsheetId || ''
  );
  const [sheetName, setSheetName] = useState(
    integrations.googleSheets.sheetName || `${currentForm?.title || 'Form'}_Responses`
  );
  const [webhookUrl, setWebhookUrl] = useState(
    integrations.googleSheets.webhookUrl || ''
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);

  if (!isOpen) return null;

  // 1. Copy formatted table and open Google Sheets (Instant Ctrl+V workflow)
  const handleOpenAndCopyData = () => {
    if (!currentForm) return;
    const tsvData = GoogleSheetsService.getTableTSV(currentForm, formResponses);
    navigator.clipboard.writeText(tsvData).then(() => {
      showToast(
        'Data Copied! 📋',
        'In Google Sheets, click Cell A1 and press Ctrl+V to paste your dataset.',
        'success'
      );
    });

    const targetUrl = spreadsheetId.trim()
      ? (spreadsheetId.startsWith('http') ? spreadsheetId : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
      : 'https://sheets.new';

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Real Webhook Sync
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      if (webhookUrl.trim() && currentForm) {
        await GoogleSheetsService.postAllRowsToWebhook(webhookUrl.trim(), currentForm, formResponses);
        showToast('Google Sheets Synced 📊', `Sent ${formResponses.length} response rows to your Google Sheet live!`, 'success');
      } else {
        // Copy TSV so clipboard has data
        if (currentForm) {
          const tsvData = GoogleSheetsService.getTableTSV(currentForm, formResponses);
          navigator.clipboard.writeText(tsvData).catch(() => {});
        }
        showToast('Settings Saved 📊', 'Google Sheets configuration updated.', 'success');
      }

      updateIntegrations({
        googleSheets: {
          connected: true,
          spreadsheetId: spreadsheetId.trim() || undefined,
          sheetName,
          webhookUrl: webhookUrl.trim() || undefined,
          lastSynced: 'Just now'
        }
      });
      onClose();
    } catch (e) {
      console.warn('Sync error:', e);
      showToast('Sync Warning', 'Saved settings locally. Check your Google Apps Script URL if syncing live.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyScript = () => {
    const script = GoogleSheetsService.getAppsScriptTemplate();
    navigator.clipboard.writeText(script).then(() => {
      setCopiedScript(true);
      showToast('Script Copied! 📋', 'In Google Sheets: Extensions > Apps Script > Paste and Deploy.', 'success');
      setTimeout(() => setCopiedScript(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel border border-emerald-500/40 rounded-2xl shadow-glow-cyan overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-emerald-950/25 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">Google Sheets Integration</h3>
              <p className="text-xs text-slate-400">Sync live responses directly into your Google Spreadsheet.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Action: Open in Google Sheets with Data */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Instant 1-Click Open (With All Form Data)
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                RECOMMENDED
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Copies all <strong>{formResponses.length} responses &amp; field headers</strong> and opens Google Sheets in a new tab. Simply press <strong>Ctrl+V</strong> in cell A1 to populate your spreadsheet instantly.
            </p>
            <button
              type="button"
              onClick={handleOpenAndCopyData}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Copy Form Data &amp; Open Google Sheets (Ctrl+V)</span>
            </button>
          </div>

          {/* Configuration Inputs */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Google Spreadsheet Link or ID
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Apps Script Webhook Section */}
            <div className="p-3.5 rounded-xl bg-[#121820] border border-[#2A3647] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  Live Auto-Sync Webhook (Apps Script)
                </label>
                <button
                  type="button"
                  onClick={() => setShowScriptDetails(!showScriptDetails)}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  {showScriptDetails ? 'Hide instructions' : 'Setup guide (1 min)'}
                </button>
              </div>

              {showScriptDetails && (
                <div className="text-[11px] text-slate-400 space-y-2 bg-[#0B0F14] p-3 rounded-lg border border-white/5">
                  <p>1. In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>.</p>
                  <p>2. Replace code with the 1-click script below and click <strong>Deploy &gt; New deployment</strong> (Select <em>Web app</em>, Who has access: <em>Anyone</em>).</p>
                  <p>3. Copy your Web app URL and paste it below:</p>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Script Copied!' : 'Copy 1-Click Apps Script'}</span>
                  </button>
                </div>
              )}

              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">
                When provided, every form submission will automatically append a new row into your Google Sheet in real time.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => currentForm && exportToCSV(currentForm, formResponses)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-cyan transition-colors cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Connect &amp; Sync Sheet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
