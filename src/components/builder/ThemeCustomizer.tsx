import React from 'react';
import { DesignTheme } from '../../types';
import { PRESET_THEMES } from '../../data/presetThemes';
import { Palette, Check, X, Sparkles } from 'lucide-react';

interface ThemeCustomizerProps {
  isOpen: boolean;
  activeTheme: DesignTheme;
  onSelectTheme: (theme: DesignTheme) => void;
  onClose: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  activeTheme,
  onSelectTheme,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full glass-panel border-l border-white/10 p-6 space-y-6 overflow-y-auto animate-slide-left">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold font-display text-white">Theme & Design OS</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Themes Grid */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Theme Presets</span>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_THEMES.map((theme) => {
              const isSelected = (activeTheme?.id || PRESET_THEMES[0].id) === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme)}
                  className={`p-3.5 rounded-xl border text-left transition-all space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'border-violet-500 bg-violet-600/20 shadow-glow-violet'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <span className="block text-xs font-bold text-white">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Family Selection */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Font Typography</span>
          <div className="space-y-2">
            {(['Plus Jakarta Sans', 'Space Grotesk', 'Inter', 'JetBrains Mono'] as const).map((font) => (
              <button
                key={font}
                onClick={() => onSelectTheme({ ...activeTheme, fontFamily: font })}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs border transition-colors ${
                  activeTheme.fontFamily === font
                    ? 'border-violet-500 bg-violet-500/20 text-white font-bold'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
                style={{ fontFamily: font }}
              >
                <span>{font}</span>
                {activeTheme.fontFamily === font && <Check className="w-3.5 h-3.5 text-violet-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
