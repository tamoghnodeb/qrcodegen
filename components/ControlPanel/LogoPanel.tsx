'use client';

import React, { useRef } from 'react';
import clsx from 'clsx';
import { Image as ImageIcon, Upload, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { SliderInput } from '@/components/ui/SliderInput';
import { LOGO_PRESETS } from '@/lib/logo-presets';
import type { QRConfig, LogoPreset, LogoConfig } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

interface LogoPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
}

const SHAPES: { id: LogoConfig['shape']; label: string }[] = [
  { id: 'circle',  label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'square',  label: 'Square' },
];

export function LogoPanel({ config, onChange }: LogoPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const logo = config.logo;

  function updateLogo(patch: Partial<LogoConfig>) {
    const nextLogo = { ...logo, ...patch };
    // If enabling logo and ECL is L or M, boost to H for scan safety
    let nextEcl = config.errorCorrection;
    if (patch.enabled === true && (config.errorCorrection === 'L' || config.errorCorrection === 'M')) {
      nextEcl = 'H';
      toast('Error correction boosted to Level H', {
        description: 'Maximum redundancy (~30%) ensures camera readability with center logos.',
        type: 'info',
      });
    }

    onChange({
      ...config,
      errorCorrection: nextEcl,
      logo: nextLogo,
    });
  }

  function handleSelectPreset(presetId: LogoPreset) {
    if (presetId === 'none') {
      updateLogo({ enabled: false, preset: 'none', src: '' });
      return;
    }

    const presetData = LOGO_PRESETS[presetId as keyof typeof LOGO_PRESETS];
    if (presetData) {
      updateLogo({
        enabled: true,
        preset: presetId,
        src: presetData.dataUri,
      });
      toast(`Applied ${presetData.label} logo`, { type: 'success' });
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Invalid file type', {
        description: 'Please upload a PNG, SVG, JPG, or WebP image.',
        type: 'warning',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast('Image too large', {
        description: 'Please select an image smaller than 2MB for smooth browser rendering.',
        type: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateLogo({
        enabled: true,
        preset: 'custom',
        src: result,
      });
      toast('Custom logo uploaded', { type: 'success' });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ImageIcon size={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Center Logo & Branding</p>
            <p className="text-xs text-slate-500">Embed brand icon in center of QR</p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-logo"
            type="checkbox"
            checked={logo.enabled}
            onChange={(e) => updateLogo({ enabled: e.target.checked })}
            className="sr-only"
          />
          <div
            className={clsx(
              'w-11 h-6 rounded-full transition-colors duration-200',
              logo.enabled ? 'bg-cyan-500' : 'bg-slate-700',
            )}
          />
          <div
            className={clsx(
              'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm',
              logo.enabled ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </label>
      </div>

      {logo.enabled && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* ECL recommendation note */}
          {config.errorCorrection !== 'H' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <ShieldAlert size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>
                  Center logos cover QR modules. We recommend Reed-Solomon <strong>Level H (30%)</strong> for guaranteed readability.
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, errorCorrection: 'H' })}
                  className="block mt-1.5 text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Set to Error Correction H
                </button>
              </div>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Icon Presets
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(LOGO_PRESETS) as (keyof typeof LOGO_PRESETS)[]).map((key) => {
                const item = LOGO_PRESETS[key];
                const isActive = logo.preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.dataUri} alt={item.label} className="w-5 h-5 object-contain" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Upload */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Custom Upload
            </span>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="logo-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-700/50 hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <Upload size={14} className="text-cyan-400" />
                <span>Upload Logo (PNG, SVG, JPG)</span>
              </button>

              {logo.src && (
                <button
                  type="button"
                  onClick={() => updateLogo({ enabled: false, preset: 'none', src: '' })}
                  title="Remove Logo"
                  className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Sizing & Padding */}
          <div className="space-y-4 pt-1">
            <SliderInput
              id="logo-size"
              label="Logo Size"
              value={Math.round(logo.sizeRatio * 100)}
              min={15}
              max={32}
              unit="%"
              onChange={(pct) => updateLogo({ sizeRatio: pct / 100 })}
            />

            <SliderInput
              id="logo-padding"
              label="Background Padding"
              value={logo.padding}
              min={0}
              max={12}
              unit="px"
              onChange={(pad) => updateLogo({ padding: pad })}
            />

            {/* Shape selection */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Background Shape</span>
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateLogo({ shape: id })}
                    className={clsx(
                      'py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer',
                      logo.shape === id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:border-slate-600',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo background color */}
            <ColorPicker
              id="logo-bg-color"
              label="Logo Background Color"
              value={logo.bgColor}
              onChange={(hex) => updateLogo({ bgColor: hex })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
