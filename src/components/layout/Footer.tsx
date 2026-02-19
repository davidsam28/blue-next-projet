import Link from 'next/link'
import { Heart, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#001A80] text-white" role="contentinfo">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4" aria-label="Blue Next Projet">
              <div className="w-8 h-8 rounded-sm bg-[#0033FF] flex items-center justify-center text-white font-bold text-sm">
                BN
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Blue Next Projet
              </span>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              A nonprofit organization dedicated to trauma-informed healing through the transformative power of media arts.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0033FF] transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0033FF] transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/programs', label: 'Programs' },
                { href: '/team', label: 'Our Team' },
                { href: '/donate', label: 'Donate' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-200 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@bluenextprojet.org"
                  className="flex items-center gap-2.5 text-blue-200 hover:text-white text-sm transition-colors group"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#0033FF] group-hover:text-blue-300 transition-colors" />
                  contact@bluenextprojet.org
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-blue-200 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#0033FF]" />
                  <span>Address available upon request</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-xs">
            &copy; {currentYear} Blue Next Projet. All rights reserved.
          </p>
          <p className="text-blue-300 text-xs flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-[#0033FF] fill-[#0033FF]" /> for community healing
          </p>
        </div>
      </div>
    </footer>
  )
}
