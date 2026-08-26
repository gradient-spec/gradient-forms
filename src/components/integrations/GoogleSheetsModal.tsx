import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, Check, RefreshCw, X, ExternalLink, Database } from 'lucide-react';

export const GoogleSheetsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { integrations, updateIntegrations, showToast, activeForm } = useApp();
  const [spreadsheetId, setSpreadsheetId] = useState(
    integrations.googleSheets.spreadsheetId || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  );
  const [sheetName, setSheetName] = useState(
    integrations.googleSheets.sheetName || `${activeForm?.title || 'Form'}_Responses`
  );
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations({
        googleSheets: {
          connected: true,
          spreadsheetId,
          sheetName,
          lastSynced: 'Just now'
        }
      });
      showToast('Google Sheets Synced 📊', 'Forwarded latest form submissions to spreadsheet rows.', 'success');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel border border-emerald-500/40 rounded-2xl shadow-glow-cyan overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Google Sheets Integration</h3>
              <p className="text-xs text-slate-400">Stream responses directly into your Google Spreadsheet.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Google Spreadsheet ID or URL</label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Sheet Tab Name</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sheet1 or Responses"
              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Mapped Columns Preview */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Auto-mapped Columns (Header Row):
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Timestamp', 'Respondent Email', 'Respondent Name', 'Time Spent'].concat(
                (activeForm?.questions || []).map(q => q.title)
              ).slice(0, 6).map((col, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Open Spreadsheet in Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-cyan transition-colors"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Rows...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Connect & Sync Sheet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
