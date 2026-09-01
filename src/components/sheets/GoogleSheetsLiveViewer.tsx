import React, { useState, useMemo } from 'react';
import { Form, FormResponse } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  ArrowLeft,
  Search,
  Check,
  RotateCcw,
  Printer,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Filter,
  Sigma,
  Plus,
  Menu,
  Star,
  FolderPlus,
  CloudCheck,
  Share2,
  Table,
  Link2
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { GoogleSheetsModal } from '../integrations/GoogleSheetsModal';

interface GoogleSheetsLiveViewerProps {
  form: Form;
  responses: FormResponse[];
  onBack?: () => void;
}

export const GoogleSheetsLiveViewer: React.FC<GoogleSheetsLiveViewerProps> = ({
  form,
  responses: initialResponses,
  onBack
}) => {
  const { integrations, showToast, setActiveView, responses: appResponses, submitResponse } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [copiedToast, setCopiedToast] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Live responses dynamically matched from AppContext
  const liveResponses = useMemo(() => {
    const fromContext = appResponses.filter(r => r.formId === form?.id);
    return fromContext.length > 0 ? fromContext : (initialResponses || []);
  }, [appResponses, initialResponses, form?.id]);

  // 2. Build Column Headers strictly from form structure
  const headers = useMemo(() => {
    return GoogleSheetsService.getHeaderRow(form);
  }, [form]);

  // 3. Build Response Rows strictly from form responses
  const dataRows = useMemo(() => {
    return liveResponses.map(r => GoogleSheetsService.formatResponseRow(form, r));
  }, [form, liveResponses]);

  // Filtered rows for search
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return dataRows;
    const lower = searchFilter.toLowerCase();
    return dataRows.filter(row => row.some(cell => String(cell).toLowerCase().includes(lower)));
  }, [dataRows, searchFilter]);

  // Pad rows up to at least 25 rows for authentic spreadsheet feel
  const totalDisplayRows = Math.max(25, filteredRows.length + 5);

  // Column letters (A, B, C, D...)
  const getColLetter = (index: number): string => {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  // Cell coordinate label (e.g. A1, B2)
  const selectedCoord = `${getColLetter(selectedCell.col)}${selectedCell.row + 1}`;

  // Get content of active selected cell
  const selectedCellValue = useMemo(() => {
    if (selectedCell.row === 0) {
      return headers[selectedCell.col] || '';
    }
    const dataRowIndex = selectedCell.row - 1;
    if (dataRowIndex < filteredRows.length) {
      return filteredRows[dataRowIndex][selectedCell.col] !== undefined
        ? String(filteredRows[dataRowIndex][selectedCell.col])
        : '';
    }
    return '';
  }, [selectedCell, headers, filteredRows]);

  // Insert a test response to instantly verify live row appending
  const handleInsertSampleResponse = () => {
    if (!form) return;
    const sampleAnswers: Record<string, any> = {};
    (form.questions || []).forEach((q) => {
      if (q.type === 'multiple_choice' || q.type === 'dropdown') {
        sampleAnswers[q.id] = q.options?.[0]?.label || 'Satisfied';
      } else if (q.type === 'checkboxes') {
        sampleAnswers[q.id] = [q.options?.[0]?.label || 'Feature A'];
      } else if (q.type === 'rating') {
        sampleAnswers[q.id] = 5;
      } else if (q.type === 'scale' || q.type === 'number') {
        sampleAnswers[q.id] = 9;
      } else if (q.type === 'email') {
        sampleAnswers[q.id] = `respondent_${Date.now().toString().slice(-4)}@example.com`;
      } else {
        sampleAnswers[q.id] = `Live feedback recorded at ${new Date().toLocaleTimeString()}`;
      }
    });

    submitResponse(
      form.id,
      sampleAnswers,
      52,
      `respondent_${Date.now().toString().slice(-4)}@example.com`,
      `Live Respondent ${liveResponses.length + 1}`
    );
    showToast('Row Appended! 📊', 'New live response row added to spreadsheet in real time.', 'success');
  };

  // Copy entire table as Tab-Separated Values (TSV) for direct paste into any Google Sheet
  const handleCopyForGoogleSheets = () => {
    const tsvContent = GoogleSheetsService.getTableTSV(form, liveResponses);
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedToast(true);
      showToast('Copied to Clipboard! 📋', 'Press Ctrl+V in cell A1 of Google Sheets to paste all columns and rows.', 'success');
      setTimeout(() => setCopiedToast(false), 3000);
    });
  };

  // Copy Google Sheets =IMPORTDATA formula for 100% automated live sync
  const handleCopyImportDataFormula = () => {
    const formula = GoogleSheetsService.getImportDataFormula(form.id);
    navigator.clipboard.writeText(formula).then(() => {
      showToast('Formula Copied! ⚡', 'Paste in cell A1 of Google Sheets: ' + formula, 'success');
    });
  };

  // Open Google Sheets in Web
  const handleOpenGoogleSheetsWeb = () => {
    const customId = integrations?.googleSheets?.spreadsheetId;
    if (customId && customId !== '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') {
      const url = GoogleSheetsService.getSpreadsheetUrl(customId, form.id);
      if (url) {
        // Also copy data to clipboard so user can easily paste if new
        handleCopyForGoogleSheets();
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    // Auto-copy data and open blank sheet in Google Drive
    handleCopyForGoogleSheets();
    window.open('https://docs.google.com/spreadsheets/create', '_blank', 'noopener,noreferrer');
    showToast('Opening Google Sheets 📊', 'All form data copied! Click cell A1 in your Google Sheet and press Ctrl+V.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#1E232B] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. GOOGLE SHEETS HEADER */}
      <header className="bg-[#12161D] border-b border-[#2A3647] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Analytics"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView('analytics')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Analytics"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Green Google Sheets Icon */}
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-tight">
                {form.title} (Responses)
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                Live Google Sheets View
              </span>
              <button className="text-slate-400 hover:text-amber-400 transition-colors" title="Star spreadsheet">
                <Star className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu options */}
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
              <span className="hover:text-white cursor-pointer">File</span>
              <span className="hover:text-white cursor-pointer">Edit</span>
              <span className="hover:text-white cursor-pointer">View</span>
              <span className="hover:text-white cursor-pointer">Insert</span>
              <span className="hover:text-white cursor-pointer">Format</span>
              <span className="hover:text-white cursor-pointer">Data</span>
              <span className="hover:text-white cursor-pointer">Tools</span>
              <span className="hover:text-white cursor-pointer">Help</span>
              <span className="text-[11px] text-emerald-400 font-mono hidden md:inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Form responses auto-synced
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Insert Live Test Response */}
          <button
            type="button"
            onClick={handleInsertSampleResponse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Insert a live test response to verify real-time spreadsheet updates"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Insert Test Response</span>
          </button>

          {/* Copy Table to Clipboard */}
          <button
            type="button"
            onClick={handleCopyForGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Copy all formatted form rows to paste into Google Sheets (Ctrl+V)"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{copiedToast ? 'Copied!' : 'Copy Table (Ctrl+V)'}</span>
          </button>

          {/* Copy =IMPORTDATA Formula */}
          <button
            type="button"
            onClick={handleCopyImportDataFormula}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Copy =IMPORTDATA() formula for live syncing Google Sheets"
          >
            <Sigma className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Formula</span>
          </button>

          {/* Open in Google Drive / Web */}
          <button
            type="button"
            onClick={handleOpenGoogleSheetsWeb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Open a Google Sheet in Google Drive (data copied to clipboard)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Google Drive</span>
          </button>

          {/* Download CSV */}
          <button
            type="button"
            onClick={() => exportToCSV(form, liveResponses)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          {/* Connect Sheet Modal */}
          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Configure linked spreadsheet ID or Webhook URL"
          >
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* 2. GOOGLE SHEETS TOOLBAR */}
      <div className="bg-[#161B22] border-b border-[#2A3647] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="Undo">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="Print" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />

          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white font-bold" title="Bold">
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white italic" title="Italic">
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />

          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="Align Left">
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="Align Center">
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="Align Right">
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />

          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5">
            Font: Roboto 10pt
          </span>
        </div>

        {/* Quick in-sheet search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search spreadsheet cells..."
            className="w-full pl-8 pr-3 py-1 rounded bg-[#12161D] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* 3. FORMULA BAR */}
      <div className="bg-[#12161D] border-b border-[#2A3647] px-4 py-1.5 flex items-center gap-3 text-xs">
        <div className="w-16 px-2 py-1 rounded bg-[#1A2332] border border-[#2A3647] text-center font-mono font-bold text-emerald-400 text-xs">
          {selectedCoord}
        </div>
        <div className="text-slate-500 font-mono font-bold italic select-none">
          fx
        </div>
        <div className="flex-1 px-3 py-1 rounded bg-[#1A2332] border border-[#2A3647] font-mono text-xs text-white truncate">
          {selectedCellValue || <span className="text-slate-600 italic">&lt;empty cell&gt;</span>}
        </div>
      </div>

      {/* 4. SPREADSHEET GRID */}
      <div className="flex-1 overflow-auto bg-[#0F1319]">
        <table className="w-full border-collapse text-xs font-mono text-slate-200">
          {/* Column Letters Row (A, B, C, D...) */}
          <thead className="sticky top-0 z-20 bg-[#161B22] shadow-sm">
            <tr>
              <th className="w-12 min-w-12 p-1.5 text-center bg-[#1A2332] border-r border-b border-[#2A3647] text-slate-400 font-normal">
                #
              </th>
              {headers.map((_, colIdx) => (
                <th
                  key={colIdx}
                  className="min-w-[180px] px-3 py-1.5 text-center font-normal border-r border-b border-[#2A3647] text-slate-400 hover:bg-white/5"
                >
                  {getColLetter(colIdx)}
                </th>
              ))}
            </tr>

            {/* Row 1: Header Row (Form Fields) */}
            <tr className="bg-[#18202C] text-white font-bold border-b border-[#2A3647]">
              <td className="p-2 text-center bg-[#161B22] border-r border-b border-[#2A3647] text-slate-400 font-normal">
                1
              </td>
              {headers.map((head, colIdx) => {
                const isSelected = selectedCell.row === 0 && selectedCell.col === colIdx;
                return (
                  <td
                    key={colIdx}
                    onClick={() => setSelectedCell({ row: 0, col: colIdx })}
                    className={`px-3 py-2 border-r border-b border-[#2A3647] truncate max-w-[280px] cursor-cell transition-colors ${
                      isSelected
                        ? 'outline-2 outline-emerald-500 bg-emerald-500/10'
                        : 'hover:bg-white/5'
                    }`}
                    title={head}
                  >
                    {head}
                  </td>
                );
              })}
            </tr>
          </thead>

          {/* Response Rows 2..N */}
          <tbody>
            {liveResponses.length === 0 ? (
              <tr>
                <td className="p-2 text-center bg-[#161B22] border-r border-b border-[#2A3647] text-slate-400 text-[11px] select-none">
                  2
                </td>
                <td colSpan={headers.length} className="p-8 text-center bg-[#141A24]/60 border-b border-[#2A3647]">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Spreadsheet Ready — Awaiting Submissions</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Form field headers are mapped in Row 1. Responses submitted in Published Forms append here live in real-time.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleInsertSampleResponse}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert Test Response</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyForGoogleSheets}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Headers</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}

            {Array.from({ length: totalDisplayRows }).map((_, rowIdx) => {
              const actualRowIndex = rowIdx + 1; // display row number: 2, 3, 4...
              const responseData = filteredRows[rowIdx];

              return (
                <tr
                  key={actualRowIndex}
                  className={`border-b border-[#2A3647]/50 ${
                    responseData ? 'hover:bg-white/5' : 'opacity-40'
                  }`}
                >
                  {/* Row Number */}
                  <td className="p-1.5 text-center bg-[#161B22] border-r border-b border-[#2A3647] text-slate-400 text-[11px] font-normal select-none">
                    {actualRowIndex + 1}
                  </td>

                  {/* Cell Columns */}
                  {headers.map((_, colIdx) => {
                    const isSelected = selectedCell.row === rowIdx + 1 && selectedCell.col === colIdx;
                    const cellVal = responseData ? responseData[colIdx] : '';

                    return (
                      <td
                        key={colIdx}
                        onClick={() => setSelectedCell({ row: rowIdx + 1, col: colIdx })}
                        className={`px-3 py-1.5 border-r border-b border-[#2A3647]/60 truncate max-w-[280px] cursor-cell transition-colors ${
                          isSelected
                            ? 'outline-2 outline-emerald-500 bg-emerald-500/10'
                            : 'hover:bg-white/5'
                        }`}
                        title={cellVal ? String(cellVal) : ''}
                      >
                        {cellVal !== undefined && cellVal !== null ? (
                          String(cellVal)
                        ) : (
                          <span className="text-transparent">.</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. BOTTOM SHEET TABS & STATUS BAR */}
      <footer className="bg-[#12161D] border-t border-[#2A3647] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <button className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="Add Sheet">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white" title="All Sheets">
            <Menu className="w-3.5 h-3.5" />
          </button>

          {/* Active Tab Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#1E232B] border-t-2 border-emerald-500 font-semibold text-white text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Form Responses 1</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>
            Total Entries: <strong className="text-white">{dataRows.length}</strong> responses
          </span>
          <span>
            Total Columns: <strong className="text-white">{headers.length}</strong> fields
          </span>
          <span className="hidden sm:inline text-emerald-400 font-semibold">
            ● Direct Form Connection
          </span>
        </div>
      </footer>

      {/* Integration Configuration Modal */}
      <GoogleSheetsModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};
