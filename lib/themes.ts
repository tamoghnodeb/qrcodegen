// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — Visual Theme Presets & Default Config
// ─────────────────────────────────────────────────────────────

import type { ThemePreset, QRConfig } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'corporate-light',
    name: 'Corporate Light',
    foreground: '#0f172a',
    background: '#f8fafc',
    errorCorrection: 'M',
    accent: '#3b82f6',
    description: 'Clean, professional — perfect for business cards and print.',
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    foreground: '#00f5d4',
    background: '#0a0a1a',
    errorCorrection: 'H',
    accent: '#00f5d4',
    description: 'Electric teal on deep abyss — strikes bold optical contrast.',
  },
  {
    id: 'cyberpunk-mint',
    name: 'Cyberpunk Mint',
    foreground: '#39ff14',
    background: '#1a0033',
    errorCorrection: 'H',
    accent: '#39ff14',
    description: 'Neon toxic green on midnight purple — sci-fi cyberpunk energy.',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    foreground: '#ff7b00',
    background: '#110c08',
    errorCorrection: 'Q',
    accent: '#ff7b00',
    description: 'Vibrant flame orange on volcanic obsidian.',
  },
  {
    id: 'solar-gold',
    name: 'Solar Gold',
    foreground: '#ffd166',
    background: '#071e22',
    errorCorrection: 'H',
    accent: '#ffd166',
    description: 'Warm solar gold on deep oceanic spruce.',
  },
  {
    id: 'gdg-srm',
    name: 'GDG SRM Edition',
    foreground: '#4285f4',
    background: '#0a0f1d',
    errorCorrection: 'H',
    accent: '#ea4335',
    description: 'Official Google Blue on dark slate with maximum ECL.',
  },
  {
    id: 'nord-frost',
    name: 'Nord Frost',
    foreground: '#88c0d0',
    background: '#2e3440',
    errorCorrection: 'Q',
    accent: '#81a1c1',
    description: 'Cool Arctic aesthetic inspired by the classic Nord palette.',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    foreground: '#10b981',
    background: '#030712',
    errorCorrection: 'H',
    accent: '#10b981',
    description: 'Deep matrix obsidian with high-visibility radiant emerald.',
  },
];

/**
 * Apply a preset's colour and ECL values onto a config,
 * preserving payload, size, logo, pattern, and frame.
 */
export function applyTheme(
  config: QRConfig,
  preset: ThemePreset,
): QRConfig {
  return {
    ...config,
    foreground: preset.foreground,
    background: preset.background,
    errorCorrection: preset.errorCorrection,
    theme: preset.id,
  };
}

/** Return the default initial QRConfig with all features initialized. */
export function defaultConfig(): QRConfig {
  return {
    payload: { type: 'url', url: 'https://gdgsrm.org' },
    size: 300,
    foreground: '#0f172a',
    background: '#f8fafc',
    errorCorrection: 'M',
    margin: 4,
    theme: 'corporate-light',
    logo: {
      enabled: false,
      preset: 'none',
      src: '',
      sizeRatio: 0.22,
      padding: 6,
      shape: 'rounded',
      bgColor: '#ffffff',
    },
    pattern: {
      moduleStyle: 'square',
      finderStyle: 'square',
    },
    frame: {
      enabled: false,
      text: 'SCAN ME',
      textColor: '#ffffff',
      frameColor: '#0f172a',
      position: 'bottom',
    },
  };
}
