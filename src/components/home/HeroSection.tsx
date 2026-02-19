import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

export function HeroSection({ headline, subheadline, ctaPrimary, ctaSecondary }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black overflow-hidden" aria-label="Hero">
      {/* Background studio image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80"
          alt="Professional recording studio with audio mixing console"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl">
          {/* Top labels */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xs font-bold text-[#0033FF] uppercase tracking-[0.2em] bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
              Chicago Youth Media
            </span>
            <span className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">
              501(c)(3) Nonprofit
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-8">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-white/80 leading-relaxed max-w-2xl mb-12 font-light">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-[#0033FF] hover:bg-[#0033FF]/90 text-white font-bold text-base h-14 px-10 gap-3 shadow-2xl shadow-[#0033FF]/30"
            >
              <Link href="/donate">
                <Heart className="h-5 w-5 fill-white" />
                {ctaPrimary}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold text-base h-14 px-10 gap-3"
            >
              <Link href="/about">
                {ctaSecondary}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Trust bar */}
          <div className="mt-16 flex flex-wrap items-center gap-8 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0033FF]" />
              <span className="font-semibold text-white/80">Clear Ear Studios</span> — Chicago, IL
            </span>
            <span className="hidden sm:block w-px h-4 bg-white/20" />
            <span>Impacting Lives Since 2024</span>
            <span className="hidden sm:block w-px h-4 bg-white/20" />
            <span>Tax-Deductible Donations</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
        <div className="w-px h-8 bg-white/30" />
      </div>
    </section>
  )
}
