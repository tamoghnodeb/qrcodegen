'use client';

import React, { useId } from 'react';
import clsx from 'clsx';

interface ColorPickerProps {
  id?: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}

export function ColorPicker({ id: propId, label, value, onChange, className }: ColorPickerProps) {
  const autoId = useId();
  const inputId = propId ?? autoId;

  return (
    <div className={clsx('space-y-2', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-cyan-500/40 transition-colors duration-200">
        {/* Native colour swatch */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-lg border-2 border-slate-600 cursor-pointer shadow-inner overflow-hidden"
            style={{ backgroundColor: value }}
          >
            <input
              id={inputId}
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              aria-label={label}
            />
          </div>
        </div>
        {/* Hex text input */}
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const raw = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(raw)) onChange(raw);
          }}
          onBlur={(e) => {
            // Pad to full hex if incomplete
            const v = e.target.value;
            if (!/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(value);
          }}
          maxLength={7}
          className="flex-1 bg-transparent text-sm font-mono text-slate-100 focus:outline-none focus:text-cyan-300 transition-colors"
          placeholder="#000000"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
