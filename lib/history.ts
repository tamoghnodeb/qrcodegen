// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — localStorage History Manager
// ─────────────────────────────────────────────────────────────

import type { HistoryEntry, QRConfig } from './types';
import { defaultConfig } from './themes';

const STORAGE_KEY = 'qr-forge-history';
const MAX_ENTRIES = 20;

/** Generate a compact unique id. */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Sanitize and backfill config in case older entries lack newer properties */
function sanitizeConfig(config: Partial<QRConfig>): QRConfig {
  const base = defaultConfig();
  return {
    ...base,
    ...config,
    logo: {
      ...base.logo,
      ...(config.logo || {}),
    },
    pattern: {
      ...base.pattern,
      ...(config.pattern || {}),
    },
    frame: {
      ...base.frame,
      ...(config.frame || {}),
    },
  };
}

/** Read all history entries from localStorage (safe). */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      ...entry,
      config: sanitizeConfig(entry.config),
    }));
  } catch {
    return [];
  }
}

/** Persist the history array to localStorage. */
function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('[QR-Forge] Could not write history to localStorage:', e);
  }
}

/**
 * Prepend a new entry to history, capping at MAX_ENTRIES.
 * Returns the newly created entry.
 */
export function addHistoryEntry(
  config: QRConfig,
  dataUrl: string | null,
): HistoryEntry {
  const entry: HistoryEntry = {
    id: uid(),
    createdAt: new Date().toISOString(),
    config: sanitizeConfig(config),
    dataUrl,
  };

  const existing = loadHistory();
  // Filter out identical consecutive payloads to keep history uncluttered
  const filtered = existing.filter(
    (e) => JSON.stringify(e.config.payload) !== JSON.stringify(config.payload),
  );
  const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
  saveHistory(next);
  return entry;
}

/** Remove a single history entry by id. */
export function removeHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

/** Wipe all history. */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Friendly relative timestamp label (e.g. "3 min ago"). */
export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
