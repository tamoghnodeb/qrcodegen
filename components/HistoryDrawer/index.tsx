'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { History, X, Trash2, RotateCcw, QrCode, Clock } from 'lucide-react';
import { loadHistory, removeHistoryEntry, clearHistory, relativeTime } from '@/lib/history';
import type { HistoryEntry, QRConfig } from '@/lib/types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (config: QRConfig) => void;
  /** Signal to trigger a history refresh after a new QR is generated */
  refreshSignal: number;
}

const PAYLOAD_LABELS: Record<string, string> = {
  url:   'URL',
  text:  'Text',
  email: 'Email',
  phone: 'Phone',
  wifi:  'Wi-Fi',
};

export function HistoryDrawer({ isOpen, onClose, onRestore, refreshSignal }: HistoryDrawerProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Load / refresh history whenever the drawer opens or a new QR is generated
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntries(loadHistory());
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, refreshSignal]);

  function handleRestore(entry: HistoryEntry) {
    onRestore(entry.config);
    onClose();
  }

  function handleDelete(id: string) {
    const next = removeHistoryEntry(id);
    setEntries(next);
  }

  function handleClearAll() {
    clearHistory();
    setEntries([]);
  }

  // Build a short preview label for a history entry
  function payloadPreview(entry: HistoryEntry): string {
    const { payload } = entry.config;
    switch (payload.type) {
      case 'url':   return payload.url   || '(empty URL)';
      case 'text':  return payload.text  || '(empty text)';
      case 'email': return payload.address || '(empty email)';
      case 'phone': return payload.number || '(empty phone)';
      case 'wifi':  return payload.ssid  || '(empty SSID)';
      default:      return '—';
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        aria-label="QR history drawer"
        aria-hidden={!isOpen}
        className={clsx(
          'fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col',
          'bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10">
              <History size={15} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">History</h2>
              <p className="text-xs text-slate-500">{entries.length} / 20 saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Clear all history"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close history drawer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
              <div className="p-4 rounded-2xl bg-slate-800/50">
                <QrCode size={36} className="text-slate-600" strokeWidth={1.2} />
              </div>
              <p className="text-sm text-slate-400">No QR codes generated yet.</p>
              <p className="text-xs text-slate-600">Generate a QR code and it will appear here.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                preview={payloadPreview(entry)}
                onRestore={() => handleRestore(entry)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

// ── History Card ────────────────────────────────────────────────

interface HistoryCardProps {
  entry: HistoryEntry;
  preview: string;
  onRestore: () => void;
  onDelete: () => void;
}

function HistoryCard({ entry, preview, onRestore, onDelete }: HistoryCardProps) {
  const typeLabel = PAYLOAD_LABELS[entry.config.payload.type] ?? '?';

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl border border-slate-700/40 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70 transition-all duration-200">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-slate-600/30 bg-slate-700/50">
        {entry.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.dataUrl}
            alt="QR thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <QrCode size={20} className="text-slate-500" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-700 text-cyan-400">
            {typeLabel}
          </span>
        </div>
        <p className="text-xs text-slate-200 truncate font-medium leading-tight">
          {preview}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Clock size={9} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">{relativeTime(entry.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={onRestore}
          title="Restore this QR"
          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={onDelete}
          title="Delete this entry"
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
