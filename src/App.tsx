import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { FloatingDock } from './components/layout/FloatingDock';
import { ToastContainer } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AmbientBackground } from './components/3d/AmbientBackground';
import { CreateFormModal } from './components/dashboard/CreateFormModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { FormBuilder } from './components/builder/FormBuilder';
import { FormPreviewModal } from './components/preview/FormPreviewModal';
import { PublishedFormView } from './components/published/PublishedFormView';
import { ResponsesView } from './components/responses/ResponsesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { TemplatesGallery } from './components/templates/TemplatesGallery';
import { SettingsView } from './components/settings/SettingsView';
import { GoogleSheetsLiveViewer } from './components/sheets/GoogleSheetsLiveViewer';
import { getFormIdFromUrl, getViewFromUrl } from './utils/routing';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, forms, activeFormId, setActiveFormId, activeForm, responses } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check URL Hash & Search Params for published form link /#/f/:id or ?formId=:id or ?view=sheets
  useEffect(() => {
    const handleUrlRouting = () => {
      const urlView = getViewFromUrl();
      const urlFormId = getFormIdFromUrl();

      if (urlView === 'sheets') {
        if (urlFormId) setActiveFormId(urlFormId);
        setActiveView('sheets');
        return;
      }

      if (urlFormId) {
        setActiveFormId(urlFormId);
        setActiveView('published');
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, [setActiveFormId, setActiveView]);

  if (activeView === 'sheets') {
    const urlFormId = getFormIdFromUrl();
    const currentForm =
      (urlFormId ? forms.find(f => f.id === urlFormId) : null) ||
      activeForm ||
      forms.find(f => f.id === activeFormId) ||
      forms[0];

    const currentResponses = responses.filter(r => r.formId === currentForm?.id);

    return (
      <div className="min-h-screen bg-[#07070E]">
        <GoogleSheetsLiveViewer
          form={currentForm}
          responses={currentResponses}
          onBack={() => setActiveView('analytics')}
        />
        <ToastContainer />
      </div>
    );
  }

  if (activeView === 'published') {
    const urlFormId = getFormIdFromUrl();
    const currentPublishedForm =
      (urlFormId ? forms.find(f => f.id === urlFormId) : null) ||
      activeForm ||
      forms.find(f => f.id === activeFormId) ||
      forms[0];

    return (
      <div className="min-h-screen bg-[#060A13]">
        <PublishedFormView form={currentPublishedForm} />
        <ToastContainer />
      </div>
    );
  }

  if (activeView === 'preview') {
    return <FormPreviewModal />;
  }

  return (
    <div className="min-h-screen bg-[#07070E] flex flex-col relative selection:bg-violet-500 selection:text-white pb-24">
      <AmbientBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onCreateFormClick={() => setIsCreateModalOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <ErrorBoundary onReset={() => setActiveView('dashboard')}>
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'builder' && <FormBuilder />}
            {(activeView === 'analytics' || activeView === 'responses') && <AnalyticsView />}
            {activeView === 'templates' && <TemplatesGallery />}
            {(activeView === 'settings' || activeView === 'integrations') && <SettingsView />}
          </ErrorBoundary>
        </main>

        {/* Floating Bottom Curved Navigation Dock */}
        <FloatingDock onCreateFormClick={() => setIsCreateModalOpen(true)} />
      </div>

      <ToastContainer />
      <CreateFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
