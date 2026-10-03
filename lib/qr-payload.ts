// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — Payload Formatters & Input Validators
//  Converts typed form data into standardized QR protocol strings
// ─────────────────────────────────────────────────────────────

import type { QRPayload, ValidationResult } from './types';

/** Build the raw QR string for a given payload. */
export function buildQRString(payload: QRPayload): string {
  switch (payload.type) {
    case 'url':
      return payload.url.trim();

    case 'text':
      return payload.text;

    case 'email': {
      const parts: string[] = [];
      if (payload.subject) parts.push(`subject=${encodeURIComponent(payload.subject)}`);
      if (payload.body) parts.push(`body=${encodeURIComponent(payload.body)}`);
      const query = parts.length ? `?${parts.join('&')}` : '';
      return `mailto:${payload.address.trim()}${query}`;
    }

    case 'phone':
      return `tel:${payload.number.replace(/\s/g, '')}`;

    case 'wifi': {
      const enc = payload.encryption;
      const ssid = escapeWifiField(payload.ssid);
      const pass = payload.encryption === 'nopass' ? '' : escapeWifiField(payload.password);
      const hidden = payload.hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
    }

    case 'vcard': {
      // RFC 6350 vCard 3.0 standard
      const lines: string[] = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${payload.lastName.trim()};${payload.firstName.trim()};;;`,
        `FN:${`${payload.firstName.trim()} ${payload.lastName.trim()}`.trim()}`,
      ];
      if (payload.organization.trim()) lines.push(`ORG:${payload.organization.trim()}`);
      if (payload.title.trim()) lines.push(`TITLE:${payload.title.trim()}`);
      if (payload.phone.trim()) lines.push(`TEL;TYPE=CELL:${payload.phone.trim()}`);
      if (payload.email.trim()) lines.push(`EMAIL;TYPE=INTERNET:${payload.email.trim()}`);
      if (payload.url.trim()) lines.push(`URL:${payload.url.trim()}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'sms': {
      const cleanNum = payload.number.replace(/\s/g, '');
      const body = payload.message ? `:${payload.message}` : '';
      return `SMSTO:${cleanNum}${body}`;
    }

    case 'whatsapp': {
      const cleanNum = payload.number.replace(/[\s\-()+]/g, '');
      const textParam = payload.message ? `?text=${encodeURIComponent(payload.message)}` : '';
      return `https://wa.me/${cleanNum}${textParam}`;
    }

    default:
      return '';
  }
}

/** Escape special characters for WiFi QR payload fields. */
function escapeWifiField(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:')
    .replace(/"/g, '\\"');
}

function isValidUrl(val: string): boolean {
  try {
    const withProto = /^https?:\/\//i.test(val) ? val : `https://${val}`;
    const parsed = new URL(withProto);
    return (
      parsed.hostname.length > 0 &&
      (parsed.hostname.includes('.') || parsed.hostname === 'localhost')
    );
  } catch {
    return false;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{6,20}$/;

export function validatePayload(payload: QRPayload): ValidationResult {
  const errors: Partial<Record<string, string>> = {};

  switch (payload.type) {
    case 'url': {
      const url = payload.url.trim();
      if (!url) {
        errors.url = 'URL is required.';
      } else if (!isValidUrl(url)) {
        errors.url = 'Enter a valid URL (e.g. https://example.com).';
      }
      break;
    }

    case 'text': {
      if (!payload.text.trim()) {
        errors.text = 'Text content cannot be empty.';
      } else if (payload.text.length > 2000) {
        errors.text = `Too long — QR capacity exceeded (${payload.text.length}/2000 chars).`;
      }
      break;
    }

    case 'email': {
      if (!payload.address.trim()) {
        errors.address = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(payload.address)) {
        errors.address = 'Enter a valid email address.';
      }
      if (payload.subject.length > 200) {
        errors.subject = 'Subject too long (max 200 chars).';
      }
      if (payload.body.length > 500) {
        errors.body = 'Body too long (max 500 chars).';
      }
      break;
    }

    case 'phone': {
      if (!payload.number.trim()) {
        errors.number = 'Phone number is required.';
      } else if (!PHONE_REGEX.test(payload.number)) {
        errors.number = 'Enter a valid phone number (e.g. +1 555 000 0000).';
      }
      break;
    }

    case 'wifi': {
      if (!payload.ssid.trim()) {
        errors.ssid = 'Network name (SSID) is required.';
      } else if (payload.ssid.length > 32) {
        errors.ssid = 'SSID must be ≤ 32 characters.';
      }
      if (payload.encryption !== 'nopass' && !payload.password.trim()) {
        errors.password = 'Password is required for this encryption type.';
      }
      break;
    }

    case 'vcard': {
      if (!payload.firstName.trim() && !payload.lastName.trim()) {
        errors.name = 'At least first or last name is required.';
      }
      if (payload.email && !EMAIL_REGEX.test(payload.email.trim())) {
        errors.email = 'Enter a valid email address.';
      }
      if (payload.phone && !PHONE_REGEX.test(payload.phone.trim())) {
        errors.phone = 'Enter a valid phone number.';
      }
      if (payload.url && !isValidUrl(payload.url.trim())) {
        errors.url = 'Enter a valid website URL.';
      }
      break;
    }

    case 'sms': {
      if (!payload.number.trim()) {
        errors.number = 'Recipient phone number is required.';
      } else if (!PHONE_REGEX.test(payload.number)) {
        errors.number = 'Enter a valid phone number.';
      }
      if (payload.message && payload.message.length > 500) {
        errors.message = 'SMS message too long (max 500 characters).';
      }
      break;
    }

    case 'whatsapp': {
      if (!payload.number.trim()) {
        errors.number = 'WhatsApp phone number with country code is required.';
      } else if (!PHONE_REGEX.test(payload.number)) {
        errors.number = 'Enter a valid number with country code (e.g. +91 98765 43210).';
      }
      if (payload.message && payload.message.length > 1000) {
        errors.message = 'WhatsApp message too long (max 1000 characters).';
      }
      break;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
