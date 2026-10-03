// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — Built-in Vector Logo Presets
//  High-contrast SVG vector data URIs optimized for QR embedding
// ─────────────────────────────────────────────────────────────

import type { LogoPreset } from './types';

export interface LogoPresetItem {
  id: LogoPreset;
  label: string;
  iconSvg: string; // Data URI or inline SVG
}

/** SVG string encoded as clean data URI */
function toDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

// ─── Preset Vector Definitions ─────────────────────────────────

const GOOGLE_G = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
</svg>`;

const GDG_BRACKETS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#0f172a"/>
  <!-- Left Bracket < (Blue & Yellow) -->
  <path d="M19 14 L9 24 L19 34" stroke="#4285F4" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <!-- Right Bracket > (Red & Green) -->
  <path d="M29 14 L39 24 L29 34" stroke="#EA4335" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <!-- Center Slash / (Amber) -->
  <circle cx="24" cy="24" r="3.5" fill="#34A853"/>
</svg>`;

const GITHUB_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#181717"/>
  <path fill="#ffffff" fill-rule="evenodd" clip-rule="evenodd" d="M24 8C15.16 8 8 15.16 8 24c0 7.08 4.58 13.06 10.94 15.18 0.8.14 1.1-.34 1.1-.76 0-.38-.02-1.62-.02-2.94-4.44.96-5.38-1.9-5.38-1.9-.72-1.84-1.78-2.34-1.78-2.34-1.46-1 .12-.98.12-.98 1.62.12 2.46 1.66 2.46 1.66 1.44 2.46 3.76 1.76 4.68 1.34.14-1.04.56-1.76 1.02-2.16-3.54-.4-7.26-1.78-7.26-7.88 0-1.74.62-3.16 1.64-4.28-.16-.4-.72-2.02.16-4.22 0 0 1.34-.42 4.38 1.64 1.28-.36 2.64-.54 4-.54s2.72.18 4 .54c3.04-2.06 4.38-1.64 4.38-1.64.88 2.2.32 3.82.16 4.22 1.02 1.12 1.64 2.54 1.64 4.28 0 6.12-3.74 7.48-7.3 7.88.58.5 1.08 1.48 1.08 2.98 0 2.16-.02 3.9-.02 4.42 0 .44.28.92 1.1.76C35.42 37.06 40 31.08 40 24c0-8.84-7.16-16-16-16z"/>
</svg>`;

const WIFI_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#0891b2"/>
  <path d="M9 16 C18 7 30 7 39 16" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M14 22 C20 16 28 16 34 22" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M19 28 C22 25 26 25 29 28" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none"/>
  <circle cx="24" cy="35" r="3.5" fill="#ffffff"/>
</svg>`;

const MAIL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#2563eb"/>
  <rect x="9" y="14" width="30" height="20" rx="3" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="3"/>
  <path d="M9 16 L24 28 L39 16" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const PHONE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#059669"/>
  <path d="M16 13 C16 11.9 16.9 11 18 11 L22 11 C22.6 11 23.1 11.4 23.3 12 L24.5 16 C24.7 16.7 24.4 17.5 23.8 17.9 L21.5 19.5 C23 22.8 25.2 25 28.5 26.5 L30.1 24.2 C30.5 23.6 31.3 23.3 32 23.5 L36 24.7 C36.6 24.9 37 25.4 37 26 L37 30 C37 31.1 36.1 32 35 32 C24.5 32 16 23.5 16 13 Z" fill="#ffffff"/>
</svg>`;

const STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#d97706"/>
  <path d="M24 10 L28.2 18.5 L37.5 19.8 L30.8 26.3 L32.4 35.5 L24 31.1 L15.6 35.5 L17.2 26.3 L10.5 19.8 L19.8 18.5 Z" fill="#ffffff"/>
</svg>`;

export const LOGO_PRESETS: Record<Exclude<LogoPreset, 'none' | 'custom'>, { label: string; dataUri: string }> = {
  gdg: {
    label: 'GDG',
    dataUri: toDataUri(GDG_BRACKETS),
  },
  google: {
    label: 'Google',
    dataUri: toDataUri(GOOGLE_G),
  },
  github: {
    label: 'GitHub',
    dataUri: toDataUri(GITHUB_ICON),
  },
  wifi: {
    label: 'Wi-Fi',
    dataUri: toDataUri(WIFI_ICON),
  },
  mail: {
    label: 'Email',
    dataUri: toDataUri(MAIL_ICON),
  },
  phone: {
    label: 'Phone',
    dataUri: toDataUri(PHONE_ICON),
  },
  star: {
    label: 'Star',
    dataUri: toDataUri(STAR_ICON),
  },
};
