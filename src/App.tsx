import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/Toast';
import { AmbientBackground } from './components/3d/AmbientBackground';
import { CreateFormModal } from './components/dashboard/CreateFormModal';
import { getFormIdFromUrl } from './utils/routing';

// Views
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { FormBuilder } from './components/builder/FormBuilder';
import { FormPreviewModal } from './components/preview/FormPreviewModal';
import { PublishedFormView } from './components/published/PublishedFormView';
import { ResponsesView } from './components/responses/ResponsesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { TemplatesGallery } from './components/templates/TemplatesGallery';
import { TeamCollaborationView } from './components/team/TeamCollaborationView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, forms, activeFormId, setActiveFormId, activeForm } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check URL Hash & Search Params for published form link /#/f/:id or ?formId=:id
  useEffect(() => {
    const handleUrlRouting = () => {
      const urlFormId = getFormIdFromUrl();
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

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'published') {
    const urlFormId = getFormIdFromUrl();
    const currentPublishedForm =
      (urlFormId ? forms.find(f => f.id === urlFormId) : null) ||
      activeForm ||
      forms.find(f => f.id === activeFormId) ||
      forms[0];

    return (
      <div className="min-h-screen bg-[#07070E] py-12 px-4 relative">
        <AmbientBackground />
        <div className="relative z-10">
          <PublishedFormView form={currentPublishedForm} />
        </div>
      </div>
    );
  }

  if (activeView === 'preview') {
    return <FormPreviewModal />;
  }

  return (
    <div className="min-h-screen bg-[#07070E] flex flex-col relative selection:bg-violet-500 selection:text-white">
      <AmbientBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onCreateFormClick={() => setIsCreateModalOpen(true)} />

        <div className="flex flex-1">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'builder' && <FormBuilder />}
            {activeView === 'responses' && <ResponsesView />}
            {activeView === 'analytics' && <AnalyticsView />}
            {activeView === 'integrations' && <IntegrationsView />}
            {activeView === 'templates' && <TemplatesGallery />}
            {activeView === 'team' && <TeamCollaborationView />}
            {activeView === 'settings' && <SettingsView />}
          </main>
        </div>
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
