'use client';

import React from 'react';
import clsx from 'clsx';
import { Shapes, Square, Circle, Sparkles, LayoutTemplate } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import type { QRConfig, ModuleStyle, FinderStyle, FrameConfig } from '@/lib/types';

interface PatternPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
}

const MODULE_STYLES: { id: ModuleStyle; label: string; desc: string }[] = [
  { id: 'square',  label: 'Square',  desc: 'Classic crisp matrix' },
  { id: 'dots',    label: 'Dots',    desc: 'Circular modern modules' },
  { id: 'rounded', label: 'Rounded', desc: 'Soft squircle modules' },
];

const FINDER_STYLES: { id: FinderStyle; label: string; desc: string }[] = [
  { id: 'square',  label: 'Square',  desc: 'Standard corner eyes' },
  { id: 'rounded', label: 'Rounded', desc: 'Softened eye corners' },
  { id: 'circle',  label: 'Circle',  desc: 'Concentric ring eyes' },
];

export function PatternPanel({ config, onChange }: PatternPanelProps) {
  const pattern = config.pattern;
  const frame = config.frame;

  function updatePattern(patch: Partial<typeof pattern>) {
    onChange({
      ...config,
      pattern: { ...pattern, ...patch },
    });
  }

  function updateFrame(patch: Partial<FrameConfig>) {
    onChange({
      ...config,
      frame: { ...frame, ...patch },
    });
  }

  return (
    <div className="space-y-6">
      {/* Module Style */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Data Module Shape
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MODULE_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => updatePattern({ moduleStyle: id })}
              className={clsx(
                'flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 cursor-pointer',
                pattern.moduleStyle === id
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200',
              )}
            >
              <div className="p-1.5 rounded-lg bg-slate-700/50 mb-1.5">
                {id === 'square' && <Square size={16} />}
                {id === 'dots' && <Circle size={16} />}
                {id === 'rounded' && <Square size={16} className="rounded-sm" />}
              </div>
              <span className="text-xs font-bold leading-tight">{label}</span>
              <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Finder Eye Style */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Corner Eye (Finder) Shape
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FINDER_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => updatePattern({ finderStyle: id })}
              className={clsx(
                'flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 cursor-pointer',
                pattern.finderStyle === id
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200',
              )}
            >
              <div className="p-1.5 rounded-lg bg-slate-700/50 mb-1.5">
                {id === 'square' && <Square size={16} />}
                {id === 'rounded' && <Square size={16} className="rounded-md" />}
                {id === 'circle' && <Circle size={16} />}
              </div>
              <span className="text-xs font-bold leading-tight">{label}</span>
              <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frame / Banner Option */}
      <div className="space-y-3 pt-2 border-t border-slate-700/40">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <LayoutTemplate size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Call-To-Action Banner</p>
              <p className="text-xs text-slate-500">Add a framed &quot;SCAN ME&quot; badge</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="toggle-frame"
              type="checkbox"
              checked={frame.enabled}
              onChange={(e) => updateFrame({ enabled: e.target.checked })}
              className="sr-only"
            />
            <div
              className={clsx(
                'w-11 h-6 rounded-full transition-colors duration-200',
                frame.enabled ? 'bg-cyan-500' : 'bg-slate-700',
              )}
            />
            <div
              className={clsx(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm',
                frame.enabled ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </label>
        </div>

        {frame.enabled && (
          <div className="space-y-3 pt-1 animate-fadeIn">
            <div>
              <label htmlFor="frame-text" className="block text-xs font-medium text-slate-400 mb-1">
                Banner Text
              </label>
              <input
                id="frame-text"
                type="text"
                value={frame.text}
                onChange={(e) => updateFrame({ text: e.target.value })}
                placeholder="SCAN ME"
                maxLength={24}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateFrame({ position: 'bottom' })}
                className={clsx(
                  'py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  frame.position === 'bottom'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/40 text-slate-400',
                )}
              >
                Banner at Bottom
              </button>
              <button
                type="button"
                onClick={() => updateFrame({ position: 'top' })}
                className={clsx(
                  'py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  frame.position === 'top'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/40 text-slate-400',
                )}
              >
                Banner at Top
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorPicker
                id="frame-bg"
                label="Banner Background"
                value={frame.frameColor}
                onChange={(hex) => updateFrame({ frameColor: hex })}
              />
              <ColorPicker
                id="frame-text-col"
                label="Banner Text Color"
                value={frame.textColor}
                onChange={(hex) => updateFrame({ textColor: hex })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
