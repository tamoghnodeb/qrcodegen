'use client';

import React from 'react';
import clsx from 'clsx';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { ContrastResult } from '@/lib/types';

interface ContrastBadgeProps {
  result: ContrastResult;
  className?: string;
}

export function ContrastBadge({ result, className }: ContrastBadgeProps) {
  const { ratio, level } = result;
  const displayRatio = ratio.toFixed(2);

  if (level === 'FAIL') {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium',
          'bg-red-500/10 border-red-500/40 text-red-300',
          'animate-pulse-once',
          className,
        )}
        role="alert"
        aria-live="polite"
      >
        <AlertTriangle size={14} className="flex-shrink-0 text-red-400" strokeWidth={2.2} />
        <span>
          Low contrast <strong className="font-mono">{displayRatio}:1</strong> — scan risk
        </span>
      </div>
    );
  }

  if (level === 'AA') {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium',
          'bg-amber-500/10 border-amber-500/40 text-amber-300',
          className,
        )}
        role="status"
      >
        <ShieldAlert size={14} className="flex-shrink-0 text-amber-400" strokeWidth={2.2} />
        <span>
          WCAG AA <strong className="font-mono">{displayRatio}:1</strong> — scannable
        </span>
      </div>
    );
  }

  // AAA
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium',
        'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
        className,
      )}
      role="status"
    >
      <ShieldCheck size={14} className="flex-shrink-0 text-emerald-400" strokeWidth={2.2} />
      <span>
        WCAG AAA <strong className="font-mono">{displayRatio}:1</strong> — excellent
      </span>
    </div>
  );
}
