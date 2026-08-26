import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublishedFormView } from '../published/PublishedFormView';
import { Monitor, Tablet, Smartphone, X, ArrowLeft } from 'lucide-react';

export const FormPreviewModal: React.FC = () => {
  const { activeForm, setActiveView } = useApp();
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!activeForm) return null;

  const frameWidths = {
    desktop: 'w-full max-w-5xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07070E] flex flex-col overflow-hidden">
      {/* Top Device Switcher Bar */}
      <div className="h-14 border-b border-white/10 glass-panel px-6 flex items-center justify-between z-30">
        <button
          onClick={() => setActiveView('builder')}
          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-violet-400" />
          <span>Exit Preview</span>
        </button>

        {/* Device Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setDeviceFrame('desktop')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${deviceFrame === 'desktop' ? 'bg-violet-600 text-white shadow-glow-violet font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDeviceFrame('tablet')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${deviceFrame === 'tablet' ? 'bg-violet-600 text-white shadow-glow-violet font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDeviceFrame('mobile')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${deviceFrame === 'mobile' ? 'bg-violet-600 text-white shadow-glow-violet font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <button
          onClick={() => setActiveView('builder')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-black/40 p-4 md:p-8 flex items-start justify-center overflow-y-auto">
        <div className={`${frameWidths[deviceFrame]} transition-all duration-300 rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl my-auto`}>
          <PublishedFormView form={activeForm} isPreview={true} />
        </div>
      </div>
    </div>
  );
};
