import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleSheetsModal } from './GoogleSheetsModal';
import {
  GoogleSheetsCard,
  GoogleDriveCard,
  ResendEmailCard,
  SlackAlertsCard,
  ZapierCard,
  WebhookCard
} from '../cards/IntegrationVisualCards';

export const IntegrationsView: React.FC = () => {
  const { showToast } = useApp();
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-white">
          Integrations <span className="text-[#38BDF8]">& Automation Hub</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Connect Gradient Forms with your database, spreadsheets, and notification channels.
        </p>
      </div>

      {/* Systems Integration Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GoogleSheetsCard onClick={() => setIsSheetsModalOpen(true)} />
        <GoogleDriveCard onClick={() => showToast('Google Drive Active', 'File uploads destination set to Gradient Forms Uploads.', 'success')} />
        <ResendEmailCard onClick={() => showToast('Email Notifications Saved', 'Receipt templates configured.', 'success')} />
        <SlackAlertsCard onClick={() => showToast('Slack Alerts Active', 'Channel #feedback connected.', 'info')} />
        <ZapierCard onClick={() => showToast('Zapier Active', 'Workflow nodes connected.', 'info')} />
        <WebhookCard onClick={() => showToast('Webhooks Active', 'Endpoint POST /api/v1/webhook active.', 'info')} />
      </div>

      {/* Google Sheets Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />
    </div>
  );
};
