import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3999')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Echo Relay',
    template: '%s · Echo Relay',
  },
  description: 'Record your path, create an Echo, and solve deterministic isometric puzzle rooms together.',
  applicationName: 'Echo Relay',
  keywords: ['puzzle game', 'isometric game', 'pixel art', 'echo mechanic', 'Prompt To Play'],
  authors: [{ name: 'Echo Relay contributors' }],
  creator: 'Echo Relay contributors',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    title: 'Echo Relay',
    description: 'Record your path. Create an Echo. Solve the room together.',
    siteName: 'Echo Relay',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo Relay',
    description: 'A deterministic isometric puzzle game about cooperating with your own recorded Echo.',
  },
}

export const viewport: Viewport = {
  themeColor: '#111429',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
