'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Link2,
  AlignLeft,
  Mail,
  Phone,
  Wifi,
  Contact,
  MessageSquare,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import type { QRPayload, PayloadType, WiFiEncryption } from '@/lib/types';
import { validatePayload } from '@/lib/qr-payload';
import { useToast } from '@/components/ui/Toast';

interface PayloadEngineProps {
  payload: QRPayload;
  onChange: (payload: QRPayload) => void;
}

const PAYLOAD_TABS: { type: PayloadType; label: string; Icon: React.ElementType }[] = [
  { type: 'url',      label: 'URL',      Icon: Link2 },
  { type: 'text',     label: 'Text',     Icon: AlignLeft },
  { type: 'email',    label: 'Email',    Icon: Mail },
  { type: 'phone',    label: 'Phone',    Icon: Phone },
  { type: 'wifi',     label: 'Wi-Fi',    Icon: Wifi },
  { type: 'vcard',    label: 'vCard',    Icon: Contact },
  { type: 'sms',      label: 'SMS',      Icon: MessageSquare },
  { type: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
];

/** Return a blank payload for a given type */
function blankPayload(type: PayloadType): QRPayload {
  switch (type) {
    case 'url':
      return { type, url: '' };
    case 'text':
      return { type, text: '' };
    case 'email':
      return { type, address: '', subject: '', body: '' };
    case 'phone':
      return { type, number: '' };
    case 'wifi':
      return { type, ssid: '', password: '', encryption: 'WPA', hidden: false };
    case 'vcard':
      return {
        type,
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        phone: '',
        email: '',
        url: '',
      };
    case 'sms':
      return { type, number: '', message: '' };
    case 'whatsapp':
      return { type, number: '', message: '' };
  }
}

/** Pre-filled sample data for evaluator testing */
const SAMPLES: Record<PayloadType, QRPayload> = {
  url: { type: 'url', url: 'https://gdgsrm.org' },
  text: {
    type: 'text',
    text: 'Welcome to GDG SRM! Building the future with community-driven engineering.',
  },
  email: {
    type: 'email',
    address: 'team@gdgsrm.org',
    subject: 'Greetings from QR-Forge Studio',
    body: 'Hello GDG SRM team! Testing instant QR generation.',
  },
  phone: { type: 'phone', number: '+91 98765 43210' },
  wifi: {
    type: 'wifi',
    ssid: 'GDG-SRM-5G',
    password: 'ForgeStudioPassword2026',
    encryption: 'WPA',
    hidden: false,
  },
  vcard: {
    type: 'vcard',
    firstName: 'Aarav',
    lastName: 'Sharma',
    organization: 'Google Developer Groups SRM',
    title: 'Lead Architect',
    phone: '+91 98765 43210',
    email: 'aarav@gdgsrm.org',
    url: 'https://gdgsrm.org',
  },
  sms: {
    type: 'sms',
    number: '+91 98765 43210',
    message: 'Hello! I scanned your QR code at the GDG SRM booth.',
  },
  whatsapp: {
    type: 'whatsapp',
    number: '+91 98765 43210',
    message: 'Hi there! Excited to connect regarding QR-Forge Studio.',
  },
};

const inputBase =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200';
const inputNormal = 'border-slate-700/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30';
const inputError = 'border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30';

export function PayloadEngine({ payload, onChange }: PayloadEngineProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const errors = validatePayload(payload).errors;

  function switchType(type: PayloadType) {
    if (payload.type === type) return;
    setTouched({});
    onChange(blankPayload(type));
  }

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function getFieldError(field: string, value?: string): string | undefined {
    const err = errors[field];
    if (!err) return undefined;
    if (value && value.trim().length > 0) return err;
    if (touched[field]) return err;
    return undefined;
  }

  function loadSample() {
    onChange(SAMPLES[payload.type]);
    setTouched({});
    toast('Loaded sample payload', {
      description: `Pre-filled sample data for ${payload.type.toUpperCase()}`,
      type: 'info',
    });
  }

  return (
    <div className="space-y-5">
      {/* ── Type Tabs & Sample loader ── */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Payload Modality
        </span>
        <button
          type="button"
          onClick={loadSample}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all cursor-pointer"
          title="Pre-fill sample data for this payload type"
        >
          <Sparkles size={12} />
          <span>Load Sample</span>
        </button>
      </div>

      {/* Grid of 8 tabs */}
      <div
        role="tablist"
        aria-label="Payload type"
        className="grid grid-cols-4 sm:grid-cols-8 gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700/40"
      >
        {PAYLOAD_TABS.map(({ type, label, Icon }) => (
          <button
            key={type}
            role="tab"
            id={`tab-${type}`}
            aria-selected={payload.type === type}
            aria-controls={`tabpanel-${type}`}
            onClick={() => switchType(type)}
            className={clsx(
              'flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer',
              payload.type === type
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
            )}
          >
            <Icon size={14} strokeWidth={2.2} />
            <span className="text-[11px] truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Modality Forms ── */}
      <div
        id={`tabpanel-${payload.type}`}
        role="tabpanel"
        aria-labelledby={`tab-${payload.type}`}
        className="space-y-3 animate-fadeIn"
      >
        {/* 1. URL */}
        {payload.type === 'url' && (
          <FormField label="Target Website URL" error={getFieldError('url', payload.url)}>
            <input
              id="field-url"
              type="url"
              value={payload.url}
              onChange={(e) => onChange({ ...payload, url: e.target.value })}
              onBlur={() => markTouched('url')}
              placeholder="https://example.com"
              className={clsx(inputBase, getFieldError('url', payload.url) ? inputError : inputNormal)}
              autoComplete="url"
            />
          </FormField>
        )}

        {/* 2. Plain Text */}
        {payload.type === 'text' && (
          <FormField label="Plain Text Content" error={getFieldError('text', payload.text)}>
            <textarea
              id="field-text"
              value={payload.text}
              onChange={(e) => onChange({ ...payload, text: e.target.value })}
              onBlur={() => markTouched('text')}
              placeholder="Enter any raw text content…"
              rows={4}
              className={clsx(inputBase, 'resize-none', getFieldError('text', payload.text) ? inputError : inputNormal)}
            />
            <CharCount current={payload.text.length} max={2000} />
          </FormField>
        )}

        {/* 3. Email */}
        {payload.type === 'email' && (
          <>
            <FormField label="Recipient Email" error={getFieldError('address', payload.address)}>
              <input
                id="field-email-address"
                type="email"
                value={payload.address}
                onChange={(e) => onChange({ ...payload, address: e.target.value })}
                onBlur={() => markTouched('address')}
                placeholder="recipient@example.com"
                className={clsx(inputBase, getFieldError('address', payload.address) ? inputError : inputNormal)}
              />
            </FormField>
            <FormField label="Subject (Optional)" error={getFieldError('subject', payload.subject)}>
              <input
                id="field-email-subject"
                type="text"
                value={payload.subject}
                onChange={(e) => onChange({ ...payload, subject: e.target.value })}
                onBlur={() => markTouched('subject')}
                placeholder="Subject line"
                className={clsx(inputBase, getFieldError('subject', payload.subject) ? inputError : inputNormal)}
              />
            </FormField>
            <FormField label="Message Body (Optional)" error={getFieldError('body', payload.body)}>
              <textarea
                id="field-email-body"
                value={payload.body}
                onChange={(e) => onChange({ ...payload, body: e.target.value })}
                onBlur={() => markTouched('body')}
                placeholder="Message body…"
                rows={3}
                className={clsx(inputBase, 'resize-none', getFieldError('body', payload.body) ? inputError : inputNormal)}
              />
            </FormField>
          </>
        )}

        {/* 4. Phone */}
        {payload.type === 'phone' && (
          <FormField label="Phone Number" error={getFieldError('number', payload.number)}>
            <input
              id="field-phone"
              type="tel"
              value={payload.number}
              onChange={(e) => onChange({ ...payload, number: e.target.value })}
              onBlur={() => markTouched('number')}
              placeholder="+91 98765 43210"
              className={clsx(inputBase, getFieldError('number', payload.number) ? inputError : inputNormal)}
            />
          </FormField>
        )}

        {/* 5. Wi-Fi */}
        {payload.type === 'wifi' && (
          <>
            <FormField label="Network Name (SSID)" error={getFieldError('ssid', payload.ssid)}>
              <input
                id="field-wifi-ssid"
                type="text"
                value={payload.ssid}
                onChange={(e) => onChange({ ...payload, ssid: e.target.value })}
                onBlur={() => markTouched('ssid')}
                placeholder="MyHomeNetwork"
                className={clsx(inputBase, getFieldError('ssid', payload.ssid) ? inputError : inputNormal)}
                maxLength={32}
              />
            </FormField>
            <FormField label="Security / Encryption">
              <div className="grid grid-cols-3 gap-2">
                {(['WPA', 'WEP', 'nopass'] as WiFiEncryption[]).map((enc) => (
                  <button
                    key={enc}
                    type="button"
                    onClick={() => onChange({ ...payload, encryption: enc })}
                    className={clsx(
                      'py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer',
                      payload.encryption === enc
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600',
                    )}
                  >
                    {enc === 'nopass' ? 'None (Open)' : enc}
                  </button>
                ))}
              </div>
            </FormField>
            {payload.encryption !== 'nopass' && (
              <FormField label="Network Password" error={getFieldError('password', payload.password)}>
                <input
                  id="field-wifi-password"
                  type="text"
                  value={payload.password}
                  onChange={(e) => onChange({ ...payload, password: e.target.value })}
                  onBlur={() => markTouched('password')}
                  placeholder="Network password"
                  className={clsx(inputBase, getFieldError('password', payload.password) ? inputError : inputNormal)}
                />
              </FormField>
            )}
            <label className="flex items-center gap-3 cursor-pointer group select-none pt-1">
              <div className="relative">
                <input
                  id="field-wifi-hidden"
                  type="checkbox"
                  checked={payload.hidden}
                  onChange={(e) => onChange({ ...payload, hidden: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={clsx(
                    'w-10 h-5 rounded-full transition-colors duration-200',
                    payload.hidden ? 'bg-cyan-500' : 'bg-slate-700',
                  )}
                />
                <div
                  className={clsx(
                    'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                    payload.hidden ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                Hidden network (SSID not broadcast)
              </span>
            </label>
          </>
        )}

        {/* 6. vCard (Contact Card) */}
        {payload.type === 'vcard' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" error={getFieldError('name', payload.firstName)}>
                <input
                  id="field-vcard-firstname"
                  type="text"
                  value={payload.firstName}
                  onChange={(e) => onChange({ ...payload, firstName: e.target.value })}
                  onBlur={() => markTouched('name')}
                  placeholder="Aarav"
                  className={clsx(inputBase, getFieldError('name', payload.firstName) ? inputError : inputNormal)}
                />
              </FormField>
              <FormField label="Last Name">
                <input
                  id="field-vcard-lastname"
                  type="text"
                  value={payload.lastName}
                  onChange={(e) => onChange({ ...payload, lastName: e.target.value })}
                  placeholder="Sharma"
                  className={clsx(inputBase, inputNormal)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone" error={getFieldError('phone', payload.phone)}>
                <input
                  id="field-vcard-phone"
                  type="tel"
                  value={payload.phone}
                  onChange={(e) => onChange({ ...payload, phone: e.target.value })}
                  onBlur={() => markTouched('phone')}
                  placeholder="+91 98765 43210"
                  className={clsx(inputBase, getFieldError('phone', payload.phone) ? inputError : inputNormal)}
                />
              </FormField>
              <FormField label="Email" error={getFieldError('email', payload.email)}>
                <input
                  id="field-vcard-email"
                  type="email"
                  value={payload.email}
                  onChange={(e) => onChange({ ...payload, email: e.target.value })}
                  onBlur={() => markTouched('email')}
                  placeholder="aarav@gdgsrm.org"
                  className={clsx(inputBase, getFieldError('email', payload.email) ? inputError : inputNormal)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Organization / Company">
                <input
                  id="field-vcard-org"
                  type="text"
                  value={payload.organization}
                  onChange={(e) => onChange({ ...payload, organization: e.target.value })}
                  placeholder="GDG SRM"
                  className={clsx(inputBase, inputNormal)}
                />
              </FormField>
              <FormField label="Job Title">
                <input
                  id="field-vcard-title"
                  type="text"
                  value={payload.title}
                  onChange={(e) => onChange({ ...payload, title: e.target.value })}
                  placeholder="Lead Architect"
                  className={clsx(inputBase, inputNormal)}
                />
              </FormField>
            </div>

            <FormField label="Website URL (Optional)" error={getFieldError('url', payload.url)}>
              <input
                id="field-vcard-url"
                type="url"
                value={payload.url}
                onChange={(e) => onChange({ ...payload, url: e.target.value })}
                onBlur={() => markTouched('url')}
                placeholder="https://gdgsrm.org"
                className={clsx(inputBase, getFieldError('url', payload.url) ? inputError : inputNormal)}
              />
            </FormField>
          </>
        )}

        {/* 7. SMS */}
        {payload.type === 'sms' && (
          <>
            <FormField label="Recipient Phone Number" error={getFieldError('number', payload.number)}>
              <input
                id="field-sms-number"
                type="tel"
                value={payload.number}
                onChange={(e) => onChange({ ...payload, number: e.target.value })}
                onBlur={() => markTouched('number')}
                placeholder="+91 98765 43210"
                className={clsx(inputBase, getFieldError('number', payload.number) ? inputError : inputNormal)}
              />
            </FormField>
            <FormField label="SMS Message" error={getFieldError('message', payload.message)}>
              <textarea
                id="field-sms-message"
                value={payload.message}
                onChange={(e) => onChange({ ...payload, message: e.target.value })}
                onBlur={() => markTouched('message')}
                placeholder="Type your SMS message…"
                rows={3}
                className={clsx(inputBase, 'resize-none', getFieldError('message', payload.message) ? inputError : inputNormal)}
              />
              <CharCount current={payload.message.length} max={500} />
            </FormField>
          </>
        )}

        {/* 8. WhatsApp */}
        {payload.type === 'whatsapp' && (
          <>
            <FormField
              label="WhatsApp Number (with Country Code)"
              error={getFieldError('number', payload.number)}
            >
              <input
                id="field-wa-number"
                type="tel"
                value={payload.number}
                onChange={(e) => onChange({ ...payload, number: e.target.value })}
                onBlur={() => markTouched('number')}
                placeholder="+91 98765 43210"
                className={clsx(inputBase, getFieldError('number', payload.number) ? inputError : inputNormal)}
              />
            </FormField>
            <FormField label="Pre-filled Chat Message (Optional)" error={getFieldError('message', payload.message)}>
              <textarea
                id="field-wa-message"
                value={payload.message}
                onChange={(e) => onChange({ ...payload, message: e.target.value })}
                onBlur={() => markTouched('message')}
                placeholder="Pre-filled message when chat opens…"
                rows={3}
                className={clsx(inputBase, 'resize-none', getFieldError('message', payload.message) ? inputError : inputNormal)}
              />
              <CharCount current={payload.message.length} max={1000} />
            </FormField>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function FormField({
  label,
  error,
  children,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 animate-fadeIn">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function CharCount({ current, max }: { current: number; max: number }) {
  const pct = current / max;
  return (
    <p
      className={clsx(
        'text-right text-xs tabular-nums mt-1',
        pct >= 1 ? 'text-red-400' : pct >= 0.8 ? 'text-amber-400' : 'text-slate-500',
      )}
    >
      {current}/{max} characters
    </p>
  );
}
