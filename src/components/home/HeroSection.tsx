import Link from 'next/link'
import { ArrowRight, Heart, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

export function HeroSection({ headline, subheadline, ctaPrimary, ctaSecondary }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden min-h-[90vh] flex items-center"
      aria-label="Hero"
    >
      {/* Background */}
      <div className="absolute inset-0 brand-gradient" aria-hidden="true" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#0033FF]/30 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium mb-8 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#E6EBFF] animate-pulse" />
            Nonprofit Organization
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-blue-100/90 leading-relaxed max-w-xl mb-10">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#001A80] hover:bg-blue-50 font-semibold text-base h-12 px-8 gap-2 shadow-lg"
            >
              <Link href="/donate">
                <Heart className="h-4 w-4 fill-[#0033FF] text-[#0033FF]" />
                {ctaPrimary}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent font-medium text-base h-12 px-8 gap-2"
            >
              <Link href="/about">
                {ctaSecondary}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-px flex-1 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-1.5">
                <span className="text-white font-semibold">501(c)(3)</span> Registered Nonprofit
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                Tax-Deductible Donations
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
