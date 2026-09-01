import React, { useState, useRef, useEffect } from 'react';
import { Form, FormResponse } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  Check,
  ChevronDown,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { GoogleSheetsModal } from '../integrations/GoogleSheetsModal';

interface AnalyticsHeaderProps {
  forms: Form[];
  currentForm: Form;
  onSelectForm: (formId: string) => void;
  formResponses: FormResponse[];
  onBackToForms: () => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  timeRange: 'today' | '7d' | '30d' | '90d' | 'all';
  onChangeTimeRange: (range: 'today' | '7d' | '30d' | '90d' | 'all') => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  forms,
  currentForm,
  onSelectForm,
  formResponses,
  onBackToForms,
  showToast,
  timeRange,
  onChangeTimeRange
}) => {
  const { integrations, currentUser } = useApp();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isNotConnectedDialogOpen, setIsNotConnectedDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const isSheetsConnected = Boolean(integrations?.googleSheets?.connected);
  const spreadsheetId = integrations?.googleSheets?.spreadsheetId;
  const lastSynced = integrations?.googleSheets?.lastSynced || 'Just now';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    if (formResponses.length === 0) {
      showToast('Export Error', 'No responses to export.', 'error');
      return;
    }
    exportToCSV(currentForm, formResponses);
    showToast('Export Complete 📊', 'CSV response dataset downloaded.', 'success');
    setIsExportOpen(false);
  };

  const handleExportJSON = () => {
    if (formResponses.length === 0) {
      showToast('Export Error', 'No responses to export.', 'error');
      return;
    }
    exportToJSON(currentForm, formResponses);
    showToast('Export Complete 📄', 'JSON response dataset downloaded.', 'success');
    setIsExportOpen(false);
  };

  const handlePrintSummary = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleOpenGoogleSheets = () => {
    if (!isSheetsConnected) {
      setIsNotConnectedDialogOpen(true);
      return;
    }

    // Always copy data to clipboard so user can paste with Ctrl+V into Google Sheets
    const tsvData = GoogleSheetsService.getTableTSV(currentForm, formResponses);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tsvData).catch(() => {});
    }

    // If Google Apps Script webhook is configured, sync all rows now!
    if (integrations?.googleSheets?.webhookUrl) {
      setIsSyncing(true);
      GoogleSheetsService.postAllRowsToWebhook(integrations.googleSheets.webhookUrl, currentForm, formResponses)
        .then(() => {
          showToast('Google Sheets Synced 📊', `Pushed ${formResponses.length} rows directly into your Google Sheet!`, 'success');
        })
        .catch(err => console.warn('Webhook sync error:', err))
        .finally(() => setIsSyncing(false));
    }

    // Target Google Sheets URL on docs.google.com
    const targetGoogleSheetsUrl = spreadsheetId?.trim()
      ? (spreadsheetId.startsWith('http') ? spreadsheetId : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
      : 'https://sheets.new';

    // Open actual Google Sheets on docs.google.com in a new tab
    window.open(targetGoogleSheetsUrl, '_blank', 'noopener,noreferrer');

    showToast(
      'Opening Google Sheets 📊',
      `All ${formResponses.length} responses copied! In Google Sheets, click cell A1 and press Ctrl+V to paste.`,
      'success'
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Header Bar with Form Selector, Time Filters, Sheets & Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121820] border border-[#2A3647] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/35">
              Production Analytics
            </span>
            {currentForm?.settings?.quizMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/35">
                Quiz Mode
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-white tracking-tight flex items-baseline gap-2">
            <span>Analytics:</span>
            <span className="text-[#38BDF8]">{currentForm.title}</span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data-driven insights, response distributions, respondent records, and completion velocity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Form Dropdown Switcher */}
          <div className="flex items-center gap-2 bg-[#1A2332] border border-[#2A3647] px-3 py-1.5 rounded-xl text-xs">
            <FileText className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <select
              value={currentForm.id}
              onChange={(e) => onSelectForm(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
              aria-label="Select form"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#121820] text-slate-200">
                  {f.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Time Range Filter */}
          <div className="p-1 rounded-xl bg-[#1A2332] border border-[#2A3647] flex items-center gap-0.5 text-xs">
            {(['today', '7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChangeTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7D' : r === '30d' ? '30D' : r === '90d' ? '90D' : 'All'}
              </button>
            ))}
          </div>

          {/* Open in Google Sheets Action Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenGoogleSheets}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-emerald-500/40 hover:border-emerald-400 text-xs font-semibold text-emerald-300 hover:text-white transition-all cursor-pointer shadow-xs group disabled:opacity-50"
              title={isSheetsConnected ? "Open actual connected Google Spreadsheet" : "Connect Google Sheets to this form"}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              )}
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3 h-3 text-emerald-400/80 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Subtle Connection Status Dot */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 select-none"
              title={isSheetsConnected ? `Connected • Last synced: ${lastSynced}` : 'Google Sheets not connected'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSheetsConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isSheetsConnected ? 'Connected' : 'Not Connected'}</span>
            </div>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#121820] border border-[#2A3647] p-1.5 shadow-2xl z-50 space-y-0.5 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#1A2332] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download CSV (.csv)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#1A2332] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download JSON (.json)</span>
                </button>

                <div className="h-px bg-white/5 my-1" />

                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#1A2332] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-400" />
                  <span>Print / PDF Summary</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Sheets Not Connected Modal Dialog */}
      {isNotConnectedDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-[#2A3647] rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsNotConnectedDialogOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-white">Google Sheets Integration</h3>
                <p className="text-xs text-slate-400">Stream responses directly into your spreadsheet.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1A2332] border border-[#2A3647] space-y-1">
              <div className="text-xs font-semibold text-white">
                Google Sheets isn't connected to this form yet.
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your Google account and spreadsheet ID to automatically append each new form response as a row.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNotConnectedDialogOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNotConnectedDialogOpen(false);
                  if (!GoogleSheetsService.checkPermission(currentUser.role, 'connect')) {
                    showToast('Permission Denied', 'Only workspace owners and editors can connect integrations.', 'error');
                    return;
                  }
                  setIsConnectModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-neo cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Connect Google Sheets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing GoogleSheetsModal integration modal */}
      <GoogleSheetsModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};
