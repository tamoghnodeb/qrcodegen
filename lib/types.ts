// ─────────────────────────────────────────────────────────────
//  QR-Forge Studio — Core TypeScript Interfaces
// ─────────────────────────────────────────────────────────────

/** Supported QR payload types */
export type PayloadType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'wifi'
  | 'vcard'
  | 'sms'
  | 'whatsapp';

/** Error correction levels as defined by the QR spec */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** WiFi encryption options */
export type WiFiEncryption = 'WPA' | 'WEP' | 'nopass';

/** Preset theme identifier */
export type ThemeId =
  | 'corporate-light'
  | 'midnight-neon'
  | 'cyberpunk-mint'
  | 'sunset-amber'
  | 'solar-gold'
  | 'gdg-srm'
  | 'nord-frost'
  | 'emerald-matrix'
  | 'custom';

// ─── Payload Shapes ───────────────────────────────────────────

export interface UrlPayload {
  type: 'url';
  url: string;
}

export interface TextPayload {
  type: 'text';
  text: string;
}

export interface EmailPayload {
  type: 'email';
  address: string;
  subject: string;
  body: string;
}

export interface PhonePayload {
  type: 'phone';
  number: string;
}

export interface WiFiPayload {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: WiFiEncryption;
  hidden: boolean;
}

export interface VCardPayload {
  type: 'vcard';
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
}

export interface SmsPayload {
  type: 'sms';
  number: string;
  message: string;
}

export interface WhatsAppPayload {
  type: 'whatsapp';
  number: string;
  message: string;
}

export type QRPayload =
  | UrlPayload
  | TextPayload
  | EmailPayload
  | PhonePayload
  | WiFiPayload
  | VCardPayload
  | SmsPayload
  | WhatsAppPayload;

// ─── Logo / Branding ──────────────────────────────────────────

export type LogoPreset =
  | 'none'
  | 'gdg'
  | 'google'
  | 'github'
  | 'wifi'
  | 'mail'
  | 'phone'
  | 'star'
  | 'custom';

export interface LogoConfig {
  enabled: boolean;
  preset: LogoPreset;
  src: string;          // base64 data URL or SVG data uri
  sizeRatio: number;    // fraction of QR size (0.15 - 0.35)
  padding: number;      // background padding (0 - 12 px)
  shape: 'circle' | 'rounded' | 'square';
  bgColor: string;      // background color behind logo
}

// ─── Pattern & Shape Styling ───────────────────────────────────

export type ModuleStyle = 'square' | 'dots' | 'rounded';
export type FinderStyle = 'square' | 'rounded' | 'circle';

export interface PatternConfig {
  moduleStyle: ModuleStyle;
  finderStyle: FinderStyle;
}

// ─── Frame / Banner (e.g. "SCAN ME") ──────────────────────────

export interface FrameConfig {
  enabled: boolean;
  text: string;
  textColor: string;
  frameColor: string;
  position: 'bottom' | 'top';
}

// ─── Configuration ────────────────────────────────────────────

export interface QRConfig {
  payload: QRPayload;
  size: number;                     // 128–512 px
  foreground: string;               // hex colour
  background: string;               // hex colour
  errorCorrection: ErrorCorrectionLevel;
  margin: number;                   // 0–10 modules
  theme: ThemeId;
  logo: LogoConfig;
  pattern: PatternConfig;
  frame: FrameConfig;
}

// ─── History ─────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  createdAt: string;                // ISO string
  config: QRConfig;
  dataUrl: string | null;           // base64 PNG thumbnail
}

// ─── Contrast ────────────────────────────────────────────────

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: 'AAA' | 'AA' | 'FAIL';
}

// ─── Theme Preset ─────────────────────────────────────────────

export interface ThemePreset {
  id: ThemeId;
  name: string;
  foreground: string;
  background: string;
  errorCorrection: ErrorCorrectionLevel;
  accent: string;     // UI accent colour for the preset card
  description: string;
}

// ─── Validation ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<string, string>>;
}
