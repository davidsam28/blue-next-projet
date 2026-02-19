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
  { href: '/team', label: 'Team' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#001A80]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Blue Next Projet — Home">
            <div className="w-8 h-8 rounded-sm bg-[#0033FF] flex items-center justify-center text-white font-bold text-sm group-hover:bg-[#0033FF]/80 transition-colors">
              BN
            </div>
            <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
              Blue Next Projet
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[#0033FF] text-white'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Donate CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild size="sm" className="bg-[#0033FF] hover:bg-[#0033FF]/80 text-white border-0 gap-1.5">
              <Link href="/donate">
                <Heart className="h-3.5 w-3.5" />
                Donate
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
        <div className="md:hidden bg-[#001A80] border-t border-white/10" role="navigation" aria-label="Mobile navigation">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[#0033FF] text-white'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <Button asChild className="w-full bg-[#0033FF] hover:bg-[#0033FF]/80 text-white border-0 gap-1.5">
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
