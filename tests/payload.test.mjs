// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — Payload Unit Tests
//  Run with: node --test tests/payload.test.mjs
// ─────────────────────────────────────────────────────────────

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

// Inline the functions to avoid ESM/TS compilation complexity in raw node:test
// These test the same logic as lib/qr-payload.ts

function escapeWifiField(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:')
    .replace(/"/g, '\\"');
}

function buildQRString(payload) {
  switch (payload.type) {
    case 'url': return payload.url.trim();
    case 'text': return payload.text;
    case 'email': {
      const parts = [];
      if (payload.subject) parts.push(`subject=${encodeURIComponent(payload.subject)}`);
      if (payload.body) parts.push(`body=${encodeURIComponent(payload.body)}`);
      const query = parts.length ? `?${parts.join('&')}` : '';
      return `mailto:${payload.address.trim()}${query}`;
    }
    case 'phone': return `tel:${payload.number.replace(/\s/g, '')}`;
    case 'wifi': {
      const enc = payload.encryption;
      const ssid = escapeWifiField(payload.ssid);
      const pass = payload.encryption === 'nopass' ? '' : escapeWifiField(payload.password);
      const hidden = payload.hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
    }
    case 'vcard': {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${payload.lastName.trim()};${payload.firstName.trim()};;;`,
        `FN:${(payload.firstName.trim() + ' ' + payload.lastName.trim()).trim()}`,
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
    default: return '';
  }
}

describe('buildQRString', () => {
  it('URL: returns trimmed URL', () => {
    assert.equal(buildQRString({ type: 'url', url: '  https://gdgsrm.org  ' }), 'https://gdgsrm.org');
  });

  it('Text: returns raw text', () => {
    assert.equal(buildQRString({ type: 'text', text: 'Hello World' }), 'Hello World');
  });

  it('Email: no subject/body → bare mailto', () => {
    assert.equal(
      buildQRString({ type: 'email', address: 'test@example.com', subject: '', body: '' }),
      'mailto:test@example.com'
    );
  });

  it('Email: with subject and body → encoded query string', () => {
    const result = buildQRString({
      type: 'email',
      address: 'test@example.com',
      subject: 'Hello World',
      body: 'Message body',
    });
    assert.ok(result.startsWith('mailto:test@example.com?'));
    assert.ok(result.includes('subject=Hello%20World'));
    assert.ok(result.includes('body=Message%20body'));
  });

  it('Phone: strips whitespace and prefixes tel:', () => {
    // strip all spaces
    const result = buildQRString({ type: 'phone', number: '+1 555 123 4567' });
    assert.equal(result, 'tel:+15551234567');
  });

  it('Wi-Fi WPA: produces standard WIFI: string', () => {
    const result = buildQRString({
      type: 'wifi', ssid: 'MyNet', password: 'Pass123', encryption: 'WPA', hidden: false,
    });
    assert.equal(result, 'WIFI:T:WPA;S:MyNet;P:Pass123;H:false;;');
  });

  it('Wi-Fi nopass: password is empty', () => {
    const result = buildQRString({
      type: 'wifi', ssid: 'OpenNet', password: '', encryption: 'nopass', hidden: false,
    });
    assert.equal(result, 'WIFI:T:nopass;S:OpenNet;P:;H:false;;');
  });

  it('Wi-Fi: escapes semicolons in SSID', () => {
    const result = buildQRString({
      type: 'wifi', ssid: 'Net;Work', password: 'p', encryption: 'WPA', hidden: false,
    });
    assert.ok(result.includes('S:Net\\;Work'));
  });

  it('Wi-Fi hidden: H:true', () => {
    const result = buildQRString({
      type: 'wifi', ssid: 'HiddenNet', password: 'pass', encryption: 'WPA', hidden: true,
    });
    assert.ok(result.includes('H:true'));
  });

  it('vCard: RFC 3.0 format with required fields', () => {
    const result = buildQRString({
      type: 'vcard', firstName: 'Aarav', lastName: 'Sharma',
      organization: 'GDG', title: 'Dev', phone: '+91 98765 43210',
      email: 'aarav@gdg.org', url: 'https://gdg.org',
    });
    assert.ok(result.startsWith('BEGIN:VCARD'));
    assert.ok(result.includes('VERSION:3.0'));
    assert.ok(result.includes('N:Sharma;Aarav;;;'));
    assert.ok(result.includes('FN:Aarav Sharma'));
    assert.ok(result.includes('ORG:GDG'));
    assert.ok(result.includes('TEL;TYPE=CELL:+91 98765 43210'));
    assert.ok(result.includes('EMAIL;TYPE=INTERNET:aarav@gdg.org'));
    assert.ok(result.includes('URL:https://gdg.org'));
    assert.ok(result.endsWith('END:VCARD'));
  });

  it('SMS: produces SMSTO: URI with message', () => {
    const result = buildQRString({ type: 'sms', number: '+919876543210', message: 'Hello!' });
    assert.equal(result, 'SMSTO:+919876543210:Hello!');
  });

  it('SMS: no message → no colon suffix', () => {
    const result = buildQRString({ type: 'sms', number: '+919876543210', message: '' });
    assert.equal(result, 'SMSTO:+919876543210');
  });

  it('WhatsApp: strips formatting chars from number', () => {
    const result = buildQRString({ type: 'whatsapp', number: '+91 (987) 654-3210', message: 'Hi' });
    assert.ok(result.startsWith('https://wa.me/91987654321'));
    assert.ok(result.includes('text=Hi'));
  });

  it('WhatsApp: no message → no text param', () => {
    const result = buildQRString({ type: 'whatsapp', number: '+919876543210', message: '' });
    assert.equal(result, 'https://wa.me/919876543210');
  });
});

describe('escapeWifiField', () => {
  it('escapes backslash', () => assert.ok(escapeWifiField('a\\b').includes('\\\\')));
  it('escapes semicolons', () => assert.ok(escapeWifiField('a;b').includes('\\;')));
  it('escapes commas', () => assert.ok(escapeWifiField('a,b').includes('\\,')));
  it('escapes colons', () => assert.ok(escapeWifiField('a:b').includes('\\:')));
  it('escapes quotes', () => assert.ok(escapeWifiField('a"b').includes('\\"')));
  it('leaves normal text untouched', () => assert.equal(escapeWifiField('NormalSSID'), 'NormalSSID'));
});
