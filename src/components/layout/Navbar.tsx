'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Heart, Settings, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser()
        .then(({ data }) => setUser(data.user))
        .catch(() => { /* no auth session — expected for public visitors */ })
    } catch {
      /* supabase client init failed — skip auth check */
    }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    window.location.href = '/'
  }

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

          {/* Right side: CTA + User menu */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild size="sm" className="bg-[#0033FF] hover:bg-[#0033FF]/80 text-white font-bold border-0 gap-1.5 uppercase tracking-wide text-xs">
              <Link href="/donate">
                Get Involved
              </Link>
            </Button>

            {/* Admin user menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-[#0033FF]/30 border border-[#0033FF]/50 flex items-center justify-center text-white hover:bg-[#0033FF]/50 transition-colors"
                  aria-label="Admin menu"
                >
                  <User className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-900 truncate">{user.email}</p>
                        <p className="text-[10px] text-gray-400">Administrator</p>
                      </div>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Admin Panel
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4 text-gray-400" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
              >
                Admin
              </Link>
            )}
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
            <div className="pt-3 pb-1 space-y-2">
              <Button asChild className="w-full bg-[#0033FF] hover:bg-[#0033FF]/80 text-white border-0 gap-1.5 font-bold">
                <Link href="/donate" onClick={() => setMobileOpen(false)}>
                  <Heart className="h-4 w-4" />
                  Donate Now
                </Link>
              </Button>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/dashboard"
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2.5 rounded-md text-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  className="block px-3 py-2.5 rounded-md text-sm text-white/40 hover:text-white/60 transition-colors text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
