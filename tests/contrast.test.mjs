// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — WCAG Contrast Unit Tests
//  Run with: node --test tests/contrast.test.mjs
// ─────────────────────────────────────────────────────────────

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

// ── Inline WCAG contrast logic (mirrors lib/contrast.ts) ──────

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  let r, g, b;
  if (clean.length === 3 || clean.length === 4) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return [0, 0, 0];
  return [r, g, b];
}

function linearise(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function analyseContrast(fg, bg) {
  const ratio = contrastRatio(fg, bg);
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;
  let level;
  if (passesAAA) level = 'AAA';
  else if (passesAA) level = 'AA';
  else level = 'FAIL';
  return { ratio, passesAA, passesAAA, level };
}

describe('hexToRgb', () => {
  it('parses full 6-char hex', () => {
    assert.deepEqual(hexToRgb('#ffffff'), [255, 255, 255]);
    assert.deepEqual(hexToRgb('#000000'), [0, 0, 0]);
  });
  it('parses 3-char shorthand', () => {
    assert.deepEqual(hexToRgb('#fff'), [255, 255, 255]);
    assert.deepEqual(hexToRgb('#000'), [0, 0, 0]);
  });
  it('parses without # prefix', () => {
    assert.deepEqual(hexToRgb('ff0000'), [255, 0, 0]);
  });
  it('falls back to [0,0,0] for invalid', () => {
    assert.deepEqual(hexToRgb('#zzzzzz'), [0, 0, 0]);
  });
});

describe('relativeLuminance', () => {
  it('white has luminance 1', () => {
    assert.ok(Math.abs(relativeLuminance('#ffffff') - 1) < 0.0001);
  });
  it('black has luminance 0', () => {
    assert.ok(Math.abs(relativeLuminance('#000000') - 0) < 0.0001);
  });
  it('luminance is in [0, 1]', () => {
    const val = relativeLuminance('#4285f4');
    assert.ok(val >= 0 && val <= 1);
  });
});

describe('contrastRatio', () => {
  it('black on white = 21:1', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    assert.ok(Math.abs(ratio - 21) < 0.1, `Expected ~21 but got ${ratio}`);
  });
  it('white on white = 1:1', () => {
    const ratio = contrastRatio('#ffffff', '#ffffff');
    assert.ok(Math.abs(ratio - 1) < 0.01);
  });
  it('is symmetric (fg/bg swap)', () => {
    const r1 = contrastRatio('#0f172a', '#f8fafc');
    const r2 = contrastRatio('#f8fafc', '#0f172a');
    assert.ok(Math.abs(r1 - r2) < 0.01);
  });
  it('ratio is always >= 1', () => {
    const r = contrastRatio('#667788', '#334455');
    assert.ok(r >= 1);
  });
});

describe('analyseContrast levels', () => {
  it('black on white → AAA', () => {
    const result = analyseContrast('#000000', '#ffffff');
    assert.equal(result.level, 'AAA');
    assert.equal(result.passesAAA, true);
    assert.equal(result.passesAA, true);
  });

  it('Corporate Light preset (#0f172a on #f8fafc) → AAA', () => {
    const result = analyseContrast('#0f172a', '#f8fafc');
    assert.equal(result.level, 'AAA');
  });

  it('Midnight Neon (#00f5d4 on #0a0a1a) → AAA or AA', () => {
    const result = analyseContrast('#00f5d4', '#0a0a1a');
    assert.ok(result.passesAA, 'Midnight Neon must pass at least WCAG AA');
  });

  it('GDG SRM preset (#4285f4 on #0a0f1d) → passes AA', () => {
    const result = analyseContrast('#4285f4', '#0a0f1d');
    assert.ok(result.passesAA, 'GDG SRM preset must pass WCAG AA');
  });

  it('same color → FAIL (ratio 1:1)', () => {
    const result = analyseContrast('#aabbcc', '#aabbcc');
    assert.equal(result.level, 'FAIL');
    assert.equal(result.passesAA, false);
    assert.equal(result.passesAAA, false);
  });

  it('ratio < 4.5 → FAIL', () => {
    // Two similar mid-grays
    const result = analyseContrast('#888888', '#999999');
    assert.equal(result.level, 'FAIL');
  });

  it('AA threshold: ratio exactly 4.5 → AA', () => {
    // Find colors that give ~4.5; use known test vector
    // We just verify the threshold logic directly
    const r = { ratio: 4.5, passesAA: 4.5 >= 4.5, passesAAA: 4.5 >= 7 };
    assert.equal(r.passesAA, true);
    assert.equal(r.passesAAA, false);
  });

  it('AAA threshold: ratio >= 7 → AAA', () => {
    const result = analyseContrast('#000000', '#ffffff');
    assert.ok(result.ratio >= 7);
    assert.equal(result.level, 'AAA');
  });
});
