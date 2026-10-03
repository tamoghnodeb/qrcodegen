// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — WCAG Luminance Contrast Utility
//  Implements WCAG 2.1 relative luminance & contrast ratio calc
// ─────────────────────────────────────────────────────────────

import type { ContrastResult } from './types';

/**
 * Parse a CSS hex colour (#rgb, #rrggbb, #rrggbbaa) to [r, g, b] 0-255.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (clean.length === 3 || clean.length === 4) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return [0, 0, 0];
  }
  return [r, g, b];
}

/**
 * Convert an sRGB channel value (0-255) to linear light.
 * Follows IEC 61966-2-1:1999 specification.
 */
function linearise(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Calculate WCAG 2.1 relative luminance for a hex colour.
 * Returns a value in [0, 1].
 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/**
 * Calculate WCAG contrast ratio between two hex colours.
 * Returns a value in [1, 21].
 */
export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Full contrast analysis against WCAG AA (4.5:1) and AAA (7:1) thresholds
 * for normal text. QR codes require at least AA to be reliably scannable.
 */
export function analyseContrast(fg: string, bg: string): ContrastResult {
  const ratio = contrastRatio(fg, bg);
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  let level: ContrastResult['level'];
  if (passesAAA) level = 'AAA';
  else if (passesAA) level = 'AA';
  else level = 'FAIL';

  return { ratio, passesAA, passesAAA, level };
}
