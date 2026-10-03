'use client';

import React from 'react';
import clsx from 'clsx';
import { Sparkles, Check } from 'lucide-react';
import { THEME_PRESETS, applyTheme } from '@/lib/themes';
import type { QRConfig } from '@/lib/types';

interface ThemePresetsProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
}

export function ThemePresets({ config, onChange }: ThemePresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-cyan-400" />
        <p className="text-sm font-medium text-slate-300">Visual Themes</p>
      </div>

      <div className="grid gap-3">
        {THEME_PRESETS.map((preset) => {
          const isActive = config.theme === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onChange(applyTheme(config, preset))}
              className={clsx(
                'relative group w-full text-left p-3 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
                isActive
                  ? 'border-cyan-500/60 bg-cyan-500/5 shadow-lg shadow-cyan-500/5'
                  : 'border-slate-700/40 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60',
              )}
            >
              <div className="flex items-center gap-3">
                {/* Colour swatch pair */}
                <div className="flex -space-x-1.5 flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full border-2 border-slate-600 shadow-md"
                    style={{ backgroundColor: preset.background }}
                  />
                  <div
                    className="w-7 h-7 rounded-full border-2 border-slate-600 shadow-md"
                    style={{ backgroundColor: preset.foreground }}
                  />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      'text-sm font-semibold leading-tight',
                      isActive ? 'text-cyan-300' : 'text-slate-200',
                    )}
                  >
                    {preset.name}
                  </p>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5 truncate">
                    {preset.description}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Check size={11} className="text-slate-900" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Accent bar */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all duration-300"
                style={{ backgroundColor: isActive ? preset.accent : 'transparent' }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
