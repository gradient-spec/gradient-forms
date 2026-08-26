import React from 'react';
import { CheckCircle2, ArrowUpRight, Folder, Mail, MessageSquare, Zap, Terminal, Table } from 'lucide-react';

interface CardProps {
  onClick?: () => void;
}

// 1. Google Sheets Integration Card: Spreadsheet Data Table Preview
export const GoogleSheetsCard: React.FC<CardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#10B981]/70 transition-all duration-300 shadow-neo space-y-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#10B981] transition-colors">
              Google Sheets
            </h4>
            <p className="text-[11px] text-slate-400">Real-time response sync & auto append</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] text-[10px] font-mono font-bold border border-[#10B981]/30 flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> Connected
        </span>
      </div>

      {/* Mini Spreadsheet Table Contextual Visualization */}
      <div className="rounded-lg bg-[#121820] border border-[#2A3647] p-2.5 space-y-1.5 font-mono text-[10px]">
        <div className="grid grid-cols-3 text-[#84A1C0] border-b border-[#2A3647] pb-1 font-bold">
          <span>TIME</span>
          <span>NAME</span>
          <span>SCORE</span>
        </div>
        <div className="grid grid-cols-3 text-slate-300">
          <span>10:42</span>
          <span>Alex Rivera</span>
          <span className="text-[#10B981]">100%</span>
        </div>
        <div className="grid grid-cols-3 text-slate-400">
          <span>10:45</span>
          <span>Sara Chen</span>
          <span className="text-[#10B981]">95%</span>
        </div>
      </div>
    </div>
  );
};

// 2. Google Drive Card: Folder Tree Hierarchy
export const GoogleDriveCard: React.FC<CardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#2563EB]/70 transition-all duration-300 shadow-neo space-y-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB]">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#38BDF8] transition-colors">
              Google Drive
            </h4>
            <p className="text-[11px] text-slate-400">File uploads & media storage</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#38BDF8] text-[10px] font-mono font-bold border border-[#2563EB]/30 flex items-center gap-1">
          <ArrowUpRight className="w-2.5 h-2.5" /> Active
        </span>
      </div>

      {/* Folder Hierarchy Tree Contextual Visualization */}
      <div className="rounded-lg bg-[#121820] border border-[#2A3647] p-2.5 font-mono text-[10px] space-y-1 text-slate-300">
        <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
          📁 Gradient Forms Drive
        </div>
        <div className="pl-3 text-slate-400">├── 📁 Responses / CSV Exports</div>
        <div className="pl-3 text-slate-400">└── 📁 Uploads / Respondent Files</div>
      </div>
    </div>
  );
};

// 3. Resend Email Card: Delivered Email Message Preview
export const ResendEmailCard: React.FC<CardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#A855F7]/70 transition-all duration-300 shadow-neo space-y-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#A855F7]/20 border border-[#A855F7]/40 flex items-center justify-center text-[#A855F7]">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#C084FC] transition-colors">
              Resend Email
            </h4>
            <p className="text-[11px] text-slate-400">Automated email receipts & notifications</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#A855F7]/15 text-[#C084FC] text-[10px] font-mono font-bold border border-[#A855F7]/30 flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> Connected
        </span>
      </div>

      {/* Delivered Message Visual Preview */}
      <div className="rounded-lg bg-[#121820] border border-[#2A3647] p-2.5 font-mono text-[10px] space-y-1">
        <div className="text-slate-400">To: <span className="text-slate-200">owner@company.com</span></div>
        <div className="text-white font-bold">"New response received on CS Feedback"</div>
        <div className="text-[#C084FC] pt-0.5">Status: Delivered ✓</div>
      </div>
    </div>
  );
};

// 4. Slack Alerts Card: Channel Stream Preview
export const SlackAlertsCard: React.FC<CardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#EC4899]/70 transition-all duration-300 shadow-neo space-y-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EC4899]/20 border border-[#EC4899]/40 flex items-center justify-center text-[#EC4899]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#F472B6] transition-colors">
              Slack Alerts
            </h4>
            <p className="text-[11px] text-slate-400">Instant team channel pings</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#EC4899]/15 text-[#F472B6] text-[10px] font-mono font-bold border border-[#EC4899]/30 flex items-center gap-1">
          <ArrowUpRight className="w-2.5 h-2.5" /> Active
        </span>
      </div>

      {/* Slack Channel Stream Visual Preview */}
      <div className="rounded-lg bg-[#121820] border border-[#2A3647] p-2.5 font-mono text-[10px] space-y-1">
        <div className="text-[#F472B6] font-bold">#feedback</div>
        <div className="text-slate-300">Alex submitted form feedback:</div>
        <div className="text-yellow-400">★★★★★ "Seamless UX!"</div>
      </div>
    </div>
  );
};

// 5. Zapier Card: Workflow Automation Node Diagram
export const ZapierCard: React.FC<CardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#F97316]/70 transition-all duration-300 shadow-neo space-y-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center text-[#F97316]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#FB923C] transition-colors">
              Zapier
            </h4>
            <p className="text-[11px] text-slate-400">Connect 5,000+ app workflows</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#F97316]/15 text-[#FB923C] text-[10px] font-mono font-bold border border-[#F97316]/30 flex items-center gap-1">
          <ArrowUpRight className="w-2.5 h-2.5" /> Active
        </span>
      </div>

      {/* Workflow Node Chain Contextual Visualization */}
      <div className="rounded-lg bg-[#121820] border border-[#2A3647] p-2.5 font-mono text-[10px] flex items-center justify-between text-slate-300">
        <span className="px-1.5 py-0.5 rounded bg-[#2563EB]/20 text-[#38BDF8]">Form</span>
        <span>➔</span>
        <span className="px-1.5 py-0.5 rounded bg-[#F97316]/20 text-[#FB923C]">Zapier</span>
        <span>➔</span>
        <span className="px-1.5 py-0.5 rounded bg-[#EC4899]/20 text-[#F472B6]">Slack</span>
      </div>
    </div>
  );
};

// 6. Webhooks Card: Technical Endpoint Code Interface
export const WebhookCard: React.FC<CardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3647] hover:border-[#3B82F6]/70 transition-all duration-300 shadow-neo space-y-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#60A5FA] transition-colors">
              Webhooks
            </h4>
            <p className="text-[11px] text-slate-400">Custom HTTP JSON payload endpoint</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#3B82F6]/15 text-[#60A5FA] text-[10px] font-mono font-bold border border-[#3B82F6]/30 flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> Connected
        </span>
      </div>

      {/* Code Endpoint JSON Interface Contextual Visualization */}
      <div className="rounded-lg bg-[#121820] border border-[#2A3647] p-2.5 font-mono text-[10px] space-y-1">
        <div className="text-[#60A5FA]">POST /api/v1/webhook <span className="text-[#10B981]">200 OK</span></div>
        <div className="text-slate-400">{'{ "event": "response.created" }'}</div>
      </div>
    </div>
  );
};
