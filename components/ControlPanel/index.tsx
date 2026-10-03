'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Layers,
  Settings2,
  Image as ImageIcon,
  Shapes,
  Palette,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PayloadEngine } from './PayloadEngine';
import { CustomizationPanel } from './CustomizationPanel';
import { LogoPanel } from './LogoPanel';
import { PatternPanel } from './PatternPanel';
import { ThemePresets } from './ThemePresets';
import type { QRConfig } from '@/lib/types';

interface ControlPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
}

interface Section {
  id: string;
  label: string;
  badge?: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: 'payload',  label: 'Payload Engine',       icon: Layers },
  { id: 'design',   label: 'Design & Colors',      icon: Settings2 },
  { id: 'logo',     label: 'Logo & Branding',      badge: 'NEW', icon: ImageIcon },
  { id: 'patterns', label: 'Shapes & Banner Frame', badge: 'NEW', icon: Shapes },
  { id: 'themes',   label: 'Designer Themes',      icon: Palette },
];

export function ControlPanel({ config, onChange }: ControlPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['payload', 'design']),
  );

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <aside className="flex flex-col gap-4 h-full overflow-y-auto scroll-smooth">
      {SECTIONS.map(({ id, label, badge, icon: Icon }) => (
        <div
          key={id}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden"
        >
          {/* Section header */}
          <button
            onClick={() => toggleSection(id)}
            aria-expanded={openSections.has(id)}
            className={clsx(
              'w-full flex items-center justify-between px-5 py-4 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset',
              'hover:bg-slate-700/20 cursor-pointer',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/10">
                <Icon size={15} className="text-cyan-400" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200 tracking-wide">
                  {label}
                </span>
                {badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {badge}
                  </span>
                )}
              </div>
            </div>
            {openSections.has(id) ? (
              <ChevronUp size={14} className="text-slate-500" />
            ) : (
              <ChevronDown size={14} className="text-slate-500" />
            )}
          </button>

          {/* Section body */}
          {openSections.has(id) && (
            <div className="px-5 pb-5 border-t border-slate-700/30">
              <div className="pt-4">
                {id === 'payload' && (
                  <PayloadEngine
                    payload={config.payload}
                    onChange={(p) => onChange({ ...config, payload: p })}
                  />
                )}
                {id === 'design' && (
                  <CustomizationPanel config={config} onChange={onChange} />
                )}
                {id === 'logo' && (
                  <LogoPanel config={config} onChange={onChange} />
                )}
                {id === 'patterns' && (
                  <PatternPanel config={config} onChange={onChange} />
                )}
                {id === 'themes' && (
                  <ThemePresets config={config} onChange={onChange} />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}
