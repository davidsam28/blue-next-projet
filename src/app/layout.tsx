import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Blue Next Projet — Trauma Informed Media Arts',
    template: '%s | Blue Next Projet',
  },
  description:
    'Blue Next Projet is a nonprofit organization harnessing the transformative power of media arts to support trauma-informed healing and community empowerment.',
  keywords: ['trauma informed', 'media arts', 'nonprofit', 'healing', 'community', 'Blue Next Projet'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Blue Next Projet',
    title: 'Blue Next Projet — Trauma Informed Media Arts',
    description:
      'Harnessing the transformative power of media arts to support trauma-informed healing.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Next Projet — Trauma Informed Media Arts',
    description:
      'Harnessing the transformative power of media arts to support trauma-informed healing.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
