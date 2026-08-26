import { DesignTheme } from '../types';

export const PRESET_THEMES: DesignTheme[] = [
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    primaryColor: '#8B5CF6',
    accentColor: '#06B6D4',
    backgroundColor: '#07070E',
    cardStyle: 'glass',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: 'lg',
    bgPattern: 'grid'
  },
  {
    id: 'nebula',
    name: 'Deep Nebula',
    primaryColor: '#EC4899',
    accentColor: '#8B5CF6',
    backgroundColor: '#0B0914',
    cardStyle: 'glass',
    fontFamily: 'Space Grotesk',
    borderRadius: 'xl',
    bgPattern: 'dots'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    primaryColor: '#06B6D4',
    accentColor: '#F43F5E',
    backgroundColor: '#050B14',
    cardStyle: 'bordered',
    fontFamily: 'JetBrains Mono',
    borderRadius: 'sm',
    bgPattern: 'grid'
  },
  {
    id: 'midnight',
    name: 'Midnight Graphite',
    primaryColor: '#3B82F6',
    accentColor: '#6366F1',
    backgroundColor: '#0A0C10',
    cardStyle: 'solid',
    fontFamily: 'Inter',
    borderRadius: 'md',
    bgPattern: 'none'
  },
  {
    id: 'crystal',
    name: 'Holographic Crystal',
    primaryColor: '#10B981',
    accentColor: '#06B6D4',
    backgroundColor: '#041014',
    cardStyle: 'glass',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: 'full',
    bgPattern: 'dots'
  },
  {
    id: 'minimal',
    name: 'Futuristic Minimal',
    primaryColor: '#F8FAFC',
    accentColor: '#94A3B8',
    backgroundColor: '#09090B',
    cardStyle: 'minimal',
    fontFamily: 'Inter',
    borderRadius: 'md',
    bgPattern: 'none'
  }
];
