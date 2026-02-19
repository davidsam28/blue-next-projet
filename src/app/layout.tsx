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
    default: 'Blue Next Project — Chicago Youth Media Arts & Audio Production',
    template: '%s | Blue Next Project',
  },
  description:
    'Blue Next Project is a Chicago-based 501(c)(3) nonprofit equipping youth with professional training in media arts, audio production, and digital storytelling through trauma-informed education.',
  keywords: ['Chicago youth media arts', 'audio production training', 'trauma-informed education', 'nonprofit', 'workforce development', 'Blue Next Project', 'Clear Ear Studios'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Blue Next Project',
    title: 'Blue Next Project — Chicago Youth Media Arts & Audio Production',
    description:
      'Equipping Chicago youth with professional training in media arts, audio production, and digital storytelling.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Next Project — Chicago Youth Media Arts',
    description:
      'Equipping Chicago youth with professional training in media arts and audio production.',
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
