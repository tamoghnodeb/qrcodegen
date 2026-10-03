import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QR-Forge Studio — Professional QR Code Designer',
  description:
    'Design, customise, and download high-resolution QR codes entirely in your browser. Supports URL, Text, Email, Phone, Wi-Fi, vCard, SMS, and WhatsApp payloads with custom module styles, center logos, CTA banners, real-time WCAG contrast checking, theme presets, and persistent history.',
  keywords: [
    'QR code generator',
    'QR designer',
    'QR code maker',
    'custom QR',
    'WiFi QR',
    'vCard QR',
    'WhatsApp QR',
    'email QR',
    'WCAG contrast',
    'client-side QR',
    'GDG SRM',
  ],
  authors: [{ name: 'QR-Forge Studio' }],
  creator: 'QR-Forge Studio',
  metadataBase: new URL('https://qr-forge-studio.vercel.app'),
  openGraph: {
    title: 'QR-Forge Studio',
    description: 'Professional browser-native QR Code Designer — 8 payload types, custom shapes, logos & CTA frames',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
