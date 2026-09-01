import React, { useState } from 'react';
import { IntegrationDetailModal, IntegrationType } from './IntegrationDetailModal';
import {
  GoogleSheetsCard,
  GoogleDriveCard,
  ResendEmailCard,
  SlackAlertsCard,
  ZapierCard,
  WebhookCard
} from '../cards/IntegrationVisualCards';

export const IntegrationsView: React.FC = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>(null);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              System Ecosystem
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
            Integrations <span className="gradient-text">& Automation Hub</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Connect Gradient Forms with your database, cloud storage, notification channels, and webhooks. Click any card below for detailed setup & live payload tests.
          </p>
        </div>
      </div>

      {/* Systems Integration Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GoogleSheetsCard onClick={() => setSelectedIntegration('sheets')} />
        <GoogleDriveCard onClick={() => setSelectedIntegration('drive')} />
        <ResendEmailCard onClick={() => setSelectedIntegration('resend')} />
        <SlackAlertsCard onClick={() => setSelectedIntegration('slack')} />
        <ZapierCard onClick={() => setSelectedIntegration('zapier')} />
        <WebhookCard onClick={() => setSelectedIntegration('webhook')} />
      </div>

      {/* Detailed Interactive Integration Modal */}
      <IntegrationDetailModal
        type={selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
      />
    </div>
  );
};
