'use client';

import React from 'react';
import clsx from 'clsx';
import { ArrowLeftRight } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { SliderInput } from '@/components/ui/SliderInput';
import type { QRConfig, ErrorCorrectionLevel } from '@/lib/types';

interface CustomizationPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
}

const ECL_OPTIONS: { value: ErrorCorrectionLevel; label: string; description: string }[] = [
  { value: 'L', label: 'L', description: '~7% recovery' },
  { value: 'M', label: 'M', description: '~15% recovery' },
  { value: 'Q', label: 'Q', description: '~25% recovery' },
  { value: 'H', label: 'H', description: '~30% recovery' },
];

export function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
  function update<K extends keyof QRConfig>(key: K, value: QRConfig[K]) {
    onChange({
      ...config,
      [key]: value,
      theme: key === 'foreground' || key === 'background' ? 'custom' : config.theme,
    });
  }

  function swapColors() {
    onChange({
      ...config,
      foreground: config.background,
      background: config.foreground,
      theme: 'custom',
    });
  }

  return (
    <div className="space-y-6">
      {/* Size */}
      <SliderInput
        id="ctrl-size"
        label="QR Size"
        value={config.size}
        min={128}
        max={512}
        step={16}
        unit="px"
        onChange={(v) => update('size', v)}
      />

      {/* Margin */}
      <SliderInput
        id="ctrl-margin"
        label="Quiet Zone (Margin)"
        value={config.margin}
        min={0}
        max={10}
        unit=" modules"
        onChange={(v) => update('margin', v)}
      />

      {/* Colours */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Color Palette
          </span>
          <button
            type="button"
            onClick={swapColors}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
            title="Invert / Swap foreground and background colors"
          >
            <ArrowLeftRight size={12} className="text-cyan-400" />
            <span>Invert Colors</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            id="ctrl-fg"
            label="Foreground"
            value={config.foreground}
            onChange={(hex) => update('foreground', hex)}
          />
          <ColorPicker
            id="ctrl-bg"
            label="Background"
            value={config.background}
            onChange={(hex) => update('background', hex)}
          />
        </div>
      </div>

      {/* Error Correction Level */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Error Correction Level (ECL)</p>
          <span className="text-xs text-slate-500">Reed-Solomon</span>
        </div>
        <div
          role="radiogroup"
          aria-label="Error correction level"
          className="grid grid-cols-4 gap-1.5"
        >
          {ECL_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              role="radio"
              aria-checked={config.errorCorrection === value}
              onClick={() => update('errorCorrection', value)}
              title={description}
              className={clsx(
                'flex flex-col items-center py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer',
                config.errorCorrection === value
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300',
              )}
            >
              <span className="text-base leading-tight">{label}</span>
              <span
                className={clsx(
                  'text-[10px] font-normal mt-0.5 leading-tight text-center',
                  config.errorCorrection === value ? 'text-cyan-400/70' : 'text-slate-600',
                )}
              >
                {description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
