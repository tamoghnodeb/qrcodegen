'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Zap, History, QrCode, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { ControlPanel } from '@/components/ControlPanel';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { ScannerModal } from '@/components/ScannerModal';
import { defaultConfig } from '@/lib/themes';
import { addHistoryEntry } from '@/lib/history';
import { useToast } from '@/components/ui/Toast';
import type { QRConfig } from '@/lib/types';

export default function HomePage() {
  const [config, setConfig] = useState<QRConfig>(defaultConfig);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const { toast } = useToast();

  // Debounce history saving — don't write on every keystroke
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGenerated = useCallback(
    (dataUrl: string | null) => {
      if (!dataUrl) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        addHistoryEntry(config, dataUrl);
        setHistoryRefresh((n) => n + 1);
      }, 800);
    },
    [config],
  );

  function handleRestore(restored: QRConfig) {
    setConfig(restored);
    toast('Configuration restored from history', { type: 'info' });
  }

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      switch (e.key.toLowerCase()) {
        case 's':
        case 'd':
          e.preventDefault();
          document.getElementById('btn-download')?.click();
          break;
        case 'c':
          if (!e.shiftKey) {
            // Only intercept if not a text field is focused
            const active = document.activeElement;
            if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
            e.preventDefault();
            document.getElementById('btn-copy-image')?.click();
          }
          break;
        case 'h':
          e.preventDefault();
          setHistoryOpen((v) => !v);
          break;
        case 'p':
          e.preventDefault();
          document.getElementById('btn-print')?.click();
          break;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <QrCode size={18} className="text-white" strokeWidth={2.5} />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <span className="text-base font-bold text-white leading-none tracking-tight">
                QR-Forge
              </span>
              <span className="ml-1 text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-none">
                Studio
              </span>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5 hidden sm:block">
                Professional QR Designer
              </p>
            </div>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            {/* Scanner */}
            <button
              id="btn-scanner"
              onClick={() => setScannerOpen(true)}
              aria-label="Open QR Scanner"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              title="Scan & Decode QR Code"
            >
              <ScanLine size={15} />
              <span className="hidden sm:block">Scan QR</span>
            </button>

            {/* History toggle */}
            <button
              id="btn-history"
              onClick={() => setHistoryOpen(true)}
              aria-label="Open history drawer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <History size={15} />
              <span className="hidden sm:block">History</span>
            </button>

            {/* GitHub link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Keyboard shortcuts hint */}
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-600">
              <kbd className="font-mono">⌘S</kbd>
              <span>save</span>
              <span className="mx-1 text-slate-700">·</span>
              <kbd className="font-mono">⌘H</kbd>
              <span>history</span>
            </div>

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-6 lg:gap-8 items-start">
          {/* Left: Control Panel */}
          <div className="order-2 lg:order-1">
            <ControlPanel config={config} onChange={setConfig} />
          </div>

          {/* Right: Preview + Download */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <PreviewCanvas config={config} onGenerated={handleGenerated} />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Zap size={11} className="text-cyan-600" />
            <span>QR-Forge Studio — 100% client-side, zero backend</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-700">
            <span>8 payload types · Custom modules · Center logos · CTA frames</span>
            <span>·</span>
            <span>Built for GDG SRM · Frontend Task 1</span>
          </div>
        </div>
      </footer>

      {/* ── Drawers & Modals ── */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
        refreshSignal={historyRefresh}
      />

      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
}
