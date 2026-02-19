'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Blue Next Project — Home">
            <div className="w-8 h-8 rounded-sm bg-[#0033FF] flex items-center justify-center text-white font-black text-xs group-hover:bg-[#0033FF]/80 transition-colors">
              BN
            </div>
            <span className="text-white font-black text-lg tracking-tight hidden sm:block">
              Blue Next Project
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-bold transition-colors uppercase tracking-wide',
                  pathname === link.href
                    ? 'bg-[#0033FF] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Get Involved CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild size="sm" className="bg-[#0033FF] hover:bg-[#0033FF]/80 text-white font-bold border-0 gap-1.5 uppercase tracking-wide text-xs">
              <Link href="/donate">
                Get Involved
              </Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-t border-white/10" role="navigation" aria-label="Mobile navigation">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-3 rounded-md text-sm font-bold transition-colors uppercase tracking-wide',
                  pathname === link.href
                    ? 'bg-[#0033FF] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 pb-1">
              <Button asChild className="w-full bg-[#0033FF] hover:bg-[#0033FF]/80 text-white border-0 gap-1.5 font-bold">
                <Link href="/donate" onClick={() => setMobileOpen(false)}>
                  <Heart className="h-4 w-4" />
                  Donate Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
