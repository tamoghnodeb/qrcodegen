'use client';

import React, { useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { X, ScanLine, Upload, Copy, ExternalLink, QrCode, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScanResult {
  text: string;
  type: 'url' | 'email' | 'phone' | 'wifi' | 'text';
}

function detectType(text: string): ScanResult['type'] {
  if (/^https?:\/\//i.test(text)) return 'url';
  if (/^mailto:/i.test(text) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'email';
  if (/^tel:/i.test(text) || /^SMSTO:/i.test(text)) return 'phone';
  if (/^WIFI:/i.test(text)) return 'wifi';
  return 'text';
}

async function decodeQRFromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        // Use BarcodeDetector if available (Chrome 88+)
        if ('BarcodeDetector' in window) {
          // @ts-expect-error BarcodeDetector not in TS lib yet
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const results = await detector.detect(img);
          if (results.length > 0) {
            resolve(results[0].rawValue);
            return;
          }
        }
        // Fallback: draw to canvas and try pixel-level decode via BarcodeDetector on ImageData
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        if ('BarcodeDetector' in window) {
          // @ts-expect-error BarcodeDetector not in TS lib yet
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const results = await detector.detect(canvas);
          if (results.length > 0) {
            resolve(results[0].rawValue);
            return;
          }
        }
        resolve(null);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export function ScannerModal({ isOpen, onClose }: ScannerModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reset = useCallback(() => {
    setResult(null);
    setPreviewUrl(null);
    setDecodeError(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setDecodeError('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    reset();
    setIsDecoding(true);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const decoded = await decodeQRFromImage(file);
    setIsDecoding(false);

    if (decoded) {
      setResult({ text: decoded, type: detectType(decoded) });
    } else {
      setDecodeError(
        'Could not read a QR code from this image. Try a clearer, higher-contrast image. Note: BarcodeDetector API is required (Chrome/Edge 88+).'
      );
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    toast('Decoded payload copied!', { type: 'success' });
  }

  function handleOpenUrl() {
    if (!result || result.type !== 'url') return;
    window.open(result.text, '_blank', 'noopener,noreferrer');
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="QR Code Scanner"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-md bg-slate-900/98 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10">
                <ScanLine size={16} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">QR Code Scanner</h2>
                <p className="text-xs text-slate-500">Decode any QR code image</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
              aria-label="Close scanner"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
                  : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {isDecoding ? (
                <Loader2 size={36} className="text-cyan-400 animate-spin" />
              ) : previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Uploaded QR code"
                  className="max-h-36 max-w-full rounded-lg object-contain"
                />
              ) : (
                <div className="p-4 rounded-2xl bg-slate-700/40">
                  <QrCode size={40} className="text-slate-500" strokeWidth={1.2} />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  {isDecoding ? 'Decoding QR code…' : 'Drop QR image here'}
                </p>
                {!isDecoding && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                    <Upload size={11} />
                    or click to browse (PNG, JPG, SVG, WebP)
                  </p>
                )}
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {result.type}
                    </span>
                    <p className="text-xs text-emerald-400 font-medium">Decoded successfully</p>
                  </div>
                  <p className="text-sm text-slate-200 break-all font-mono leading-relaxed">
                    {result.text}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/50 text-slate-200 transition-all cursor-pointer"
                  >
                    <Copy size={13} className="text-cyan-400" />
                    Copy Payload
                  </button>
                  {result.type === 'url' && (
                    <button
                      onClick={handleOpenUrl}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      Open URL
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/50 text-slate-400 transition-all cursor-pointer"
                    title="Scan another"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {decodeError && !result && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-fadeIn">
                <p className="text-xs text-red-300">{decodeError}</p>
                <button onClick={reset} className="text-xs text-cyan-400 mt-2 hover:underline cursor-pointer">
                  Try another image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
