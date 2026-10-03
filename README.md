<div align="center">
  <h1>QR-Forge Studio</h1>
  <p><strong>A production-grade, browser-only QR Code Generator & Visual Designer.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
  <h3><a href="https://qrcodegen-sigma-lake.vercel.app/">Live Demo Available Here</a></h3>

  <p>Fulfilling <strong>Frontend Task 1: QR Code Generator & Designer</strong> for GDG SRM recruitment.</p>
  <p><em>100% Client-Side • Zero Backend Dependencies • Privacy-First Architecture</em></p>
</div>

---

## Features & Engineering Highlights

QR-Forge Studio is crafted to enterprise standards, delivering an ultra-responsive, zero-latency desktop and mobile web experience:

### 1. Dynamic Payload Engine
- **5 Supported Modalities:**
  - **URL:** Target websites, deep-links, webhooks, and local domains with RFC-compliant validation.
  - **Plain Text:** Multiline raw text with live character counter (up to 2,000 characters).
  - **Email:** Formatted `mailto:` payload supporting recipient address, optional subject line, and body.
  - **Phone:** Formatted `tel:` URI with whitespace normalization.
  - **Wi-Fi:** Standard `WIFI:T:...;S:...;P:...;H:...;;` payload with encryption selection (**WPA/WPA2**, **WEP**, **Open / None**) and Hidden SSID flag.
- **Instant Mode Switching:** Clean tabbed UI with isolated state preservation.
- **One-Click Sample Loader:** Includes instant "Load Sample" presets for effortless evaluator testing.

### 2. Real-Time Reactive Customization Panel
- **Dimension Scaling:** Smooth hardware-accelerated range slider from `128px` to `512px`.
- **Quiet Zone (Margin):** Modular padding adjustment from `0` to `10` modules.
- **Color Pickers:** Full-spectrum RGB/Hex color controls with synchronized real-time preview.
- **One-Click Invert Palette:** Instantly swap foreground and background colors with a single tap.
- **Reed-Solomon Error Correction Level (ECL):**
  - **L** (~7% recovery) — lowest density, easiest scan
  - **M** (~15% recovery) — optimal standard default
  - **Q** (~25% recovery) — high redundancy for noisy environments
  - **H** (~30% recovery) — maximum resilience, ideal for physical stickers or styled codes

### 3. Visual Theme Presets
One-tap designer themes with instant preview application:
- **Corporate Light:** Clean slate `#0f172a` foreground on crisp `#f8fafc` background (WCAG AAA contrast).
- **Midnight Neon:** Electric teal `#00f5d4` on deep abyss `#0a0a1a` (High-tech contrast).
- **Cyberpunk Mint:** Toxic green `#39ff14` on midnight purple `#1a0033` (Vibrant sci-fi styling).
- **Sunset Amber:** Radiant flame orange `#ff7b00` on volcanic obsidian `#110c08`.
- **Solar Gold:** Warm solar gold `#ffd166` on deep oceanic spruce `#071e22`.

### 4. High-Resolution & Vector Export Engine
- **Crisp Live PNG:** Download pixel-perfect PNGs matching the active design.
- **Multi-Resolution Scaling:** Export at `1x`, `2x` (HD), or `4x` (Ultra HD up to `2048px`) without pixelation.
- **Vector SVG Export:** Generate pure SVG vector markup for infinite scalability in Figma, Illustrator, or print workflows.
- **Direct Clipboard Integration:** One-click "Copy Image" directly to system clipboard via standard Clipboard API with fallback.

### 5. WCAG 2.1 Scan Reliability Algorithm
Physical and mobile camera barcode scanners rely on adequate optical contrast. QR-Forge Studio calculates the exact mathematical contrast ratio in real time:
$$\text{Relative Luminance } L = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$$
$$\text{Contrast Ratio } CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$
- **WCAG AAA ($\ge 7.0:1$):** Green badge indicating flawless camera readability.
- **WCAG AA ($4.5:1 \text{ to } 7.0:1$):** Amber badge indicating good readability.
- **FAIL ($< 4.5:1$):** Active red warning alert warning the user of potential camera read failures.

### 6. Persistent History Drawer
- Automated non-blocking debounced history caching into browser `localStorage`.
- Stores the last 20 generated codes with timestamp, payload preview, base64 thumbnail, and full configuration state.
- Full state restoration in a single click.
- History management with individual deletion and full wipe options.
- Zero server communication: completely private and persistent across hard refreshes.

### 7. Mobile-First Glassmorphic Dashboard
- Tailored for both desktop power users and touch-screen mobile devices.
- Crafted with sleek glassmorphism panels, CSS backdrop filters, and vibrant slate/cyan aesthetics.
- Collapsible accordion sections for streamlined workflow navigation.

---

## Architecture & Folder Structure

```
qr-forge-studio/
├── app/
│   ├── layout.tsx              # Root HTML shell with font configuration & SEO meta
│   ├── page.tsx                # Main dashboard page layout
│   └── globals.css             # Tailwind CSS tokens & custom range slider styles
├── components/
│   ├── ControlPanel/
│   │   ├── index.tsx           # Accordion control panel wrapper
│   │   ├── PayloadEngine.tsx   # 5-modal payload switcher & validated inputs
│   │   ├── CustomizationPanel.tsx # Size, margin, color, and ECL controls
│   │   └── ThemePresets.tsx    # Designer preset templates
│   ├── PreviewCanvas/
│   │   ├── index.tsx           # Reactive canvas renderer & multi-format export
│   │   └── ContrastBadge.tsx   # WCAG compliance indicator
│   ├── HistoryDrawer/
│   │   └── index.tsx           # Slide-out history drawer with thumbnails & restore
│   └── ui/
│       ├── ColorPicker.tsx     # Custom RGB/Hex color selector
│       └── SliderInput.tsx     # Custom glassmorphic range slider
├── lib/
│   ├── types.ts                # Strict TypeScript interfaces and discriminated unions
│   ├── contrast.ts             # WCAG 2.1 mathematical luminance & contrast engine
│   ├── qr-payload.ts           # Protocol payload formatters & input validators
│   ├── history.ts              # LocalStorage CRUD operations
│   └── themes.ts               # Theme preset definitions & default configs
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18.17+ (Node.js 20+ recommended)
- npm, pnpm, or yarn

### Installation

```bash
# 1. Clone or navigate to the project directory
cd qr-forge-studio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Verification

```bash
# Compile and verify production build with Turbopack & TypeScript
npm run build

# Start production server
npm run start
```

---

## Requirements Compliance Checklist

| # | GDG SRM Requirement | Implementation Status | Highlights |
|---|---|---|---|
| 1 | **Dynamic Payload Engine** | Complete | URL, Text, Email, Phone, Wi-Fi with instant tab switching and one-click sample loader |
| 2 | **Real-time Customization Panel** | Complete | Dynamic size, quiet zone margins, foreground/background color pickers, palette inverter, and Reed-Solomon ECL (L/M/Q/H) |
| 3 | **Visual Theme Presets** | Complete | Corporate Light, Midnight Neon, Cyberpunk Mint, Sunset Amber, Solar Gold |
| 4 | **Client-Side High-Res Download** | Complete | Crisp live PNG, 1x/2x/4x scaling (up to 2048px), Vector SVG export, and OS clipboard copy |
| 5 | **Strict Input Validation** | Complete | Real-time RFC-compliant validation with interactive error badges and touch-aware states |
| 6 | **Scan Reliability Algorithm** | Complete | WCAG 2.1 relative luminance check with active warning alerts on low contrast |
| 7 | **Persistent History Drawer** | Complete | Debounced `localStorage` storage, base64 thumbnails, single-click state restore, and entry deletion |
| 8 | **Fully Responsive Layout** | Complete | Mobile-first dark mode with Tailwind CSS grid, glassmorphism, and Lucide icons |
| 9 | **Client-Side Error Handling** | Complete | Graceful empty states, rendering guards, and resilient fallbacks for invalid strings |
| 10 | **Modular Architecture** | Complete | Clean separation of concerns across UI components, control panels, and mathematical utilities |

---

## Author

**Tamoghna Deb** ([@tamoghnodeb](https://github.com/tamoghnodeb))  
Built with passion for **GDG SRM** Recruitment — Frontend Task 1.
