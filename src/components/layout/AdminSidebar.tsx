'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, DollarSign, Users, Mail, FileText,
  Settings, LogOut, Heart, Plus, UserCog, BookOpen, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Fundraising',
    items: [
      { href: '/admin/donations', icon: DollarSign, label: 'Donations' },
      { href: '/admin/donations/new', icon: Plus, label: 'Log Donation' },
      { href: '/admin/donors', icon: Users, label: 'Donors' },
    ],
  },
  {
    label: 'Communications',
    items: [
      { href: '/admin/emails', icon: Mail, label: 'Email Donors' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/content', icon: FileText, label: 'Page Content' },
      { href: '/admin/programs', icon: BookOpen, label: 'Programs' },
      { href: '/admin/team', icon: UserCog, label: 'Team Members' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/admin/login')
    router.refresh()
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-sm bg-[#0033FF] flex items-center justify-center text-white font-bold text-sm">
            BN
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Blue Next Projet</p>
            <p className="text-blue-300 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto" aria-label="Admin menu">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[#0033FF] text-white shadow-sm'
                          : 'text-blue-200 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Heart className="h-4 w-4 shrink-0" />
          View Public Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-300 hover:text-white hover:bg-white/10 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-[#001A80] text-white flex items-center justify-center shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in */}
      <aside
        className={cn(
          'w-64 shrink-0 bg-[#001A80] min-h-screen flex flex-col z-40',
          'lg:relative lg:translate-x-0',
          'fixed top-0 left-0 transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Admin navigation"
      >
        {sidebarContent}
      </aside>
    </>
  )
}
