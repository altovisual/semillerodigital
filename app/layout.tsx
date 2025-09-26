import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Semillero Digital",
  description: "Plataforma educativa para el seguimiento del progreso estudiantil",
  generator: "Next.js",
  metadataBase: new URL('https://semillero-digital.com'),
  
  // Favicon y iconos
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/SVG/Asset 3mvpx.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#4fc096' }
    ]
  },

  // PWA y manifest
  manifest: '/site.webmanifest',

  // Open Graph
  openGraph: {
    title: 'Semillero Digital',
    description: 'Plataforma educativa para el seguimiento del progreso estudiantil',
    url: 'https://semillero-digital.com',
    siteName: 'Semillero Digital',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Semillero Digital - Plataforma Educativa'
      }
    ],
    locale: 'es_ES',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Semillero Digital',
    description: 'Plataforma educativa para el seguimiento del progreso estudiantil',
    images: ['/og-image.png'],
  },

  // Otros meta tags
  keywords: ['educación', 'plataforma educativa', 'seguimiento estudiantil', 'google classroom', 'dashboard'],
  authors: [{ name: 'Semillero Digital Team' }],
  creator: 'Semillero Digital',
  publisher: 'Semillero Digital'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AppProviders>
          <Suspense fallback={null}>{children}</Suspense>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
