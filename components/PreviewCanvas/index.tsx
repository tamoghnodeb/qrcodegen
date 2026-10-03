'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import clsx from 'clsx';
import { Download, RefreshCw, AlertCircle, QrCode, Copy, Check, FileCode, Printer } from 'lucide-react';
import { ContrastBadge } from './ContrastBadge';
import { analyseContrast } from '@/lib/contrast';
import { buildQRString, validatePayload } from '@/lib/qr-payload';
import type { QRConfig, ModuleStyle, FinderStyle } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

interface PreviewCanvasProps {
  config: QRConfig;
  onGenerated: (dataUrl: string | null) => void;
}

type ExportScale = 1 | 2 | 4;

// ── Custom QR Renderer ───────────────────────────────────────────

// Removed unused hexToRgba function

/** Detect if a cell is inside a finder pattern (top-left, top-right, bottom-left) */
function isFinderPattern(row: number, col: number, size: number): boolean {
  const inTopLeft = row < 9 && col < 9;
  const inTopRight = row < 9 && col > size - 10;
  const inBottomLeft = row > size - 10 && col < 9;
  return inTopLeft || inTopRight || inBottomLeft;
}

interface DrawQROptions {
  ctx: CanvasRenderingContext2D;
  modules: { data: Uint8Array; size: number };
  size: number;
  margin: number;
  fg: string;
  bg: string;
  moduleStyle: ModuleStyle;
  finderStyle: FinderStyle;
}

function drawCustomQR({
  ctx,
  modules,
  size: outputSize,
  margin,
  fg,
  bg,
  moduleStyle,
  finderStyle,
}: DrawQROptions) {
  const matrixSize = modules.size;
  const totalCells = matrixSize + 2 * margin;
  const cellSize = outputSize / totalCells;
  const offsetX = margin * cellSize;
  const offsetY = margin * cellSize;

  // Background fill
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, outputSize, outputSize);

  ctx.fillStyle = fg;

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      const isDark = modules.data[row * matrixSize + col] === 1;
      if (!isDark) continue;

      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;
      const isFinder = isFinderPattern(row, col, matrixSize);
      const style = isFinder ? finderStyle : moduleStyle;

      ctx.beginPath();
      if (style === 'dots') {
        const r = cellSize * 0.4;
        ctx.arc(x + cellSize / 2, y + cellSize / 2, r, 0, Math.PI * 2);
      } else if (style === 'rounded') {
        const r = cellSize * 0.28;
        const cx = x + 0.5;
        const cy = y + 0.5;
        const cw = cellSize - 1;
        const ch = cellSize - 1;
        ctx.moveTo(cx + r, cy);
        ctx.arcTo(cx + cw, cy, cx + cw, cy + ch, r);
        ctx.arcTo(cx + cw, cy + ch, cx, cy + ch, r);
        ctx.arcTo(cx, cy + ch, cx, cy, r);
        ctx.arcTo(cx, cy, cx + cw, cy, r);
        ctx.closePath();
      } else {
        // Square (default): fill exact cell
        ctx.rect(x, y, cellSize, cellSize);
      }
      ctx.fill();
    }
  }
}

async function drawLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  config: QRConfig,
) {
  const { logo } = config;
  if (!logo.enabled || !logo.src) return;

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoSize = canvasSize * logo.sizeRatio;
      const x = (canvasSize - logoSize) / 2;
      const y = (canvasSize - logoSize) / 2;
      const pad = logo.padding;

      // Draw background shape
      ctx.fillStyle = logo.bgColor;
      const bx = x - pad;
      const by = y - pad;
      const bw = logoSize + pad * 2;
      const bh = logoSize + pad * 2;
      ctx.beginPath();
      if (logo.shape === 'circle') {
        ctx.arc(bx + bw / 2, by + bh / 2, bw / 2, 0, Math.PI * 2);
      } else if (logo.shape === 'rounded') {
        const r = bw * 0.2;
        ctx.moveTo(bx + r, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
        ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
        ctx.arcTo(bx, by + bh, bx, by, r);
        ctx.arcTo(bx, by, bx + bw, by, r);
        ctx.closePath();
      } else {
        ctx.rect(bx, by, bw, bh);
      }
      ctx.fill();

      // Draw logo image
      ctx.drawImage(img, x, y, logoSize, logoSize);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = logo.src;
  });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  config: QRConfig,
) {
  const { frame } = config;
  if (!frame.enabled || !frame.text) return;

  const bannerH = Math.round(canvasSize * 0.11);
  const bannerY = frame.position === 'bottom' ? canvasSize - bannerH : 0;
  const radius = bannerH * 0.32;

  ctx.fillStyle = frame.frameColor;
  ctx.beginPath();
  ctx.roundRect(0, bannerY, canvasSize, bannerH, radius);
  ctx.fill();

  ctx.fillStyle = frame.textColor;
  const fontSize = Math.round(bannerH * 0.48);
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '2px';
  ctx.fillText(frame.text.toUpperCase(), canvasSize / 2, bannerY + bannerH / 2);
}

// ── Main Component ────────────────────────────────────────────────

export function PreviewCanvas({ config, onGenerated }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportScale, setExportScale] = useState<ExportScale>(1);
  const { toast } = useToast();

  const contrastResult = analyseContrast(config.foreground, config.background);

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const validation = validatePayload(config.payload);
    const qrString = buildQRString(config.payload);

    if (!qrString.trim() || !validation.valid) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = config.size;
        canvas.height = config.size;
        ctx.clearRect(0, 0, config.size, config.size);
      }
      setHasContent(false);
      setError(null);
      onGenerated(null);
      return;
    }

    setIsRendering(true);
    setError(null);

    try {
      const qrObj = QRCode.create(qrString, {
        errorCorrectionLevel: config.errorCorrection,
      });

      // Compute full canvas size (with frame if enabled)
      const hasFrame = config.frame.enabled && config.frame.text;
      const bannerH = hasFrame ? Math.round(config.size * 0.11) : 0;
      const fullHeight = config.size + bannerH;

      canvas.width = config.size;
      canvas.height = fullHeight;

      const ctx = canvas.getContext('2d')!;

      // Clear & draw background for full canvas
      ctx.fillStyle = config.background;
      ctx.fillRect(0, 0, config.size, fullHeight);

      // Position QR region based on frame position
      const qrOffsetY = config.frame.enabled && config.frame.position === 'top' ? bannerH : 0;

      // Save and translate for QR rendering area
      ctx.save();
      ctx.translate(0, qrOffsetY);

      drawCustomQR({
        ctx,
        modules: qrObj.modules,
        size: config.size,
        margin: config.margin,
        fg: config.foreground,
        bg: config.background,
        moduleStyle: config.pattern.moduleStyle,
        finderStyle: config.pattern.finderStyle,
      });

      await drawLogoOnCanvas(ctx, config.size, config);
      ctx.restore();

      // Draw frame
      if (hasFrame) {
        const frameY = config.frame.position === 'bottom' ? config.size : 0;
        ctx.save();
        ctx.translate(0, frameY);
        drawFrame(ctx, config.size, config);
        ctx.restore();
      }

      setHasContent(true);
      onGenerated(canvas.toDataURL('image/png'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate QR code.';
      setError(message);
      setHasContent(false);
      onGenerated(null);
    } finally {
      setIsRendering(false);
    }
  }, [config, onGenerated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderQR();
    }, 0);
    return () => clearTimeout(timer);
  }, [renderQR]);

  async function handleDownloadPNG() {
    if (!hasContent) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const qrString = buildQRString(config.payload);
    if (!qrString.trim()) return;

    if (exportScale === 1) {
      // Download at display resolution directly from existing canvas
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-forge-${config.size}px-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast('PNG downloaded!', { description: `${config.size}×${config.size}px`, type: 'success' });
      return;
    }

    // Re-render at higher resolution
    const targetSize = config.size * exportScale;
    const hasFrame = config.frame.enabled && config.frame.text;
    const bannerH = hasFrame ? Math.round(targetSize * 0.11) : 0;
    const fullHeight = targetSize + bannerH;

    const offscreen = document.createElement('canvas');
    offscreen.width = targetSize;
    offscreen.height = fullHeight;
    const ctx = offscreen.getContext('2d')!;

    const qrObj = QRCode.create(qrString, { errorCorrectionLevel: config.errorCorrection });
    const qrOffsetY = hasFrame && config.frame.position === 'top' ? bannerH : 0;

    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, targetSize, fullHeight);
    ctx.save();
    ctx.translate(0, qrOffsetY);
    drawCustomQR({
      ctx, modules: qrObj.modules, size: targetSize, margin: config.margin,
      fg: config.foreground, bg: config.background,
      moduleStyle: config.pattern.moduleStyle, finderStyle: config.pattern.finderStyle,
    });
    await drawLogoOnCanvas(ctx, targetSize, {
      ...config, size: targetSize,
    });
    ctx.restore();

    if (hasFrame) {
      const frameY = config.frame.position === 'bottom' ? targetSize : 0;
      ctx.save();
      ctx.translate(0, frameY);
      drawFrame(ctx, targetSize, config);
      ctx.restore();
    }

    const link = document.createElement('a');
    link.href = offscreen.toDataURL('image/png');
    link.download = `qr-forge-${targetSize}px-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('PNG downloaded!', { description: `${targetSize}×${targetSize}px (${exportScale}x)`, type: 'success' });
  }

  async function handleDownloadSVG() {
    if (!hasContent) return;
    const qrString = buildQRString(config.payload);
    try {
      const svgString = await QRCode.toString(qrString, {
        type: 'svg',
        margin: config.margin,
        color: { dark: config.foreground, light: config.background },
        errorCorrectionLevel: config.errorCorrection,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-forge-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('SVG vector exported!', { type: 'success' });
    } catch (err) {
      console.error('Failed to export SVG:', err);
      toast('SVG export failed', { type: 'warning' });
    }
  }

  async function handleCopyImage() {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } else {
        const qrString = buildQRString(config.payload);
        await navigator.clipboard.writeText(qrString);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Copied to clipboard!', { type: 'success' });
    } catch {
      toast('Clipboard write failed', { type: 'warning' });
    }
  }

  function handlePrint() {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR-Forge Studio — Print</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; background: #fff; }
          img { max-width: 320px; width: 100%; }
          p { margin-top: 12px; font-size: 13px; color: #555; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="QR Code" />
        <p>Generated by QR-Forge Studio</p>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);
    win.document.close();
    toast('Opening print preview…', { type: 'info' });
  }

  const isEmpty = !buildQRString(config.payload).trim() || !validatePayload(config.payload).valid;

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas card */}
      <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-10 backdrop-blur-sm">
            <RefreshCw size={24} className="text-cyan-400 animate-spin" />
          </div>
        )}
        <div className="flex items-center justify-center p-6 min-h-[320px]">
          <canvas
            ref={canvasRef}
            className={clsx(
              'max-w-full h-auto rounded-xl shadow-2xl transition-all duration-300',
              hasContent && !isEmpty && !error ? 'block opacity-100' : 'hidden opacity-0',
            )}
            aria-label="Generated QR code preview"
          />
          {isEmpty && !error && <EmptyState />}
          {error && <ErrorState message={error} onRetry={renderQR} />}
        </div>
      </div>

      {/* Contrast badge */}
      <ContrastBadge result={contrastResult} />

      {/* Resolution selector */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400 font-medium">Export Resolution</span>
        <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/50">
          {([1, 2, 4] as ExportScale[]).map((scale) => (
            <button
              key={scale}
              onClick={() => setExportScale(scale)}
              className={clsx(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                exportScale === scale
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {scale}x ({config.size * scale}px)
            </button>
          ))}
        </div>
      </div>

      {/* Download PNG */}
      <button
        id="btn-download"
        onClick={handleDownloadPNG}
        disabled={!hasContent || isRendering}
        className={clsx(
          'flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          hasContent && !isRendering
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed',
        )}
      >
        <Download size={16} strokeWidth={2.5} />
        Download PNG ({config.size * exportScale}×{config.size * exportScale}px)
      </button>

      {/* Secondary actions */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          id="btn-download-svg"
          onClick={handleDownloadSVG}
          disabled={!hasContent || isRendering}
          className={clsx(
            'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all duration-200',
            hasContent && !isRendering
              ? 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-700/50 hover:border-slate-600 cursor-pointer'
              : 'border-slate-800 bg-slate-800/20 text-slate-600 cursor-not-allowed',
          )}
        >
          <FileCode size={15} className="text-cyan-400" />
          SVG Vector
        </button>

        <button
          id="btn-copy-image"
          onClick={handleCopyImage}
          disabled={!hasContent || isRendering}
          className={clsx(
            'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all duration-200',
            hasContent && !isRendering
              ? 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-700/50 hover:border-slate-600 cursor-pointer'
              : 'border-slate-800 bg-slate-800/20 text-slate-600 cursor-not-allowed',
          )}
        >
          {copied ? (
            <>
              <Check size={15} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={15} className="text-cyan-400" />
              Copy Image
            </>
          )}
        </button>

        <button
          id="btn-print"
          onClick={handlePrint}
          disabled={!hasContent || isRendering}
          className={clsx(
            'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-medium text-xs border transition-all duration-200',
            hasContent && !isRendering
              ? 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-700/50 hover:border-slate-600 cursor-pointer'
              : 'border-slate-800 bg-slate-800/20 text-slate-600 cursor-not-allowed',
          )}
        >
          <Printer size={15} className="text-cyan-400" />
          Print QR
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-8 px-6">
      <div className="p-5 rounded-2xl bg-slate-700/30 border border-slate-600/30">
        <QrCode size={48} className="text-slate-500" strokeWidth={1.2} />
      </div>
      <div>
        <p className="text-slate-300 font-medium">Ready to forge</p>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the payload fields to generate your QR code
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-8 px-6">
      <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertCircle size={48} className="text-red-400" strokeWidth={1.2} />
      </div>
      <div>
        <p className="text-red-300 font-medium">Generation failed</p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <RefreshCw size={13} />
        Try again
      </button>
    </div>
  );
}
