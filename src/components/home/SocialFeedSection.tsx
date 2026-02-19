'use client'

import { Instagram, Facebook, ExternalLink } from 'lucide-react'

interface SocialFeedSectionProps {
  instagramHandle?: string
  facebookUrl?: string
}

export function SocialFeedSection({ instagramHandle, facebookUrl }: SocialFeedSectionProps) {
  const igHandle = instagramHandle || 'bluenextprojet'
  const fbUrl = facebookUrl || 'https://facebook.com/bluenextprojet'

  return (
    <section className="section-padding bg-[#F2F2F2]" aria-labelledby="social-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-widest mb-3 block">
            Stay Connected
          </span>
          <h2 id="social-title" className="text-3xl font-bold text-[#001A80] mb-3">
            Follow Our Journey
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            See our work in action — stories, programs, and community moments shared daily.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Instagram embed */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">@{igHandle}</p>
                <p className="text-xs text-gray-400">Instagram</p>
              </div>
              <a
                href={`https://instagram.com/${igHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Open Instagram profile"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            {/* Instagram embed via Snap Widget or fallback CTA */}
            <div className="p-6 text-center">
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-[#E6EBFF] to-[#0033FF]/10 flex items-center justify-center"
                    aria-label={`Instagram post placeholder ${i}`}
                  >
                    <Instagram className="h-6 w-6 text-[#0033FF]/30" />
                  </div>
                ))}
              </div>
              <a
                href={`https://instagram.com/${igHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0033FF] hover:text-[#001A80] transition-colors"
              >
                View all posts on Instagram
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Facebook embed */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                <Facebook className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Blue Next Projet</p>
                <p className="text-xs text-gray-400">Facebook</p>
              </div>
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Open Facebook page"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="p-6 text-center">
              {/* Facebook Page Plugin iframe */}
              <div className="overflow-hidden rounded-lg bg-[#F2F2F2] mb-5">
                <iframe
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbUrl)}&tabs=timeline&width=340&height=200&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                  width="100%"
                  height="200"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook page feed"
                  loading="lazy"
                />
              </div>
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0033FF] hover:text-[#001A80] transition-colors"
              >
                Follow us on Facebook
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
