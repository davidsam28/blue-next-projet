import Link from 'next/link'
import { Heart, ArrowRight, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DonateCTAProps {
  impactNote: string
}

const IMPACT_ITEMS = [
  { amount: '$25', impact: 'Provides art supplies for one participant for a month' },
  { amount: '$50', impact: 'Funds a full media arts workshop session' },
  { amount: '$100', impact: 'Supports one individual through a complete program cycle' },
  { amount: '$250', impact: 'Sponsors a community screening or exhibition event' },
]

export function DonateCTA({ impactNote }: DonateCTAProps) {
  return (
    <section className="section-padding brand-gradient relative overflow-hidden" aria-labelledby="donate-cta-title">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
        aria-hidden="true"
      />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left: CTA */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white/10 text-white/80 text-sm font-medium mb-6 border border-white/20">
              <Heart className="h-3.5 w-3.5 fill-white" />
              Support Our Mission
            </div>
            <h2 id="donate-cta-title" className="text-4xl font-bold text-white mb-5 leading-tight">
              Every Contribution <br className="hidden sm:block" />
              Creates Change
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              {impactNote}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#001A80] hover:bg-blue-50 font-semibold text-base h-12 px-8 gap-2 shadow-lg"
              >
                <Link href="/donate">
                  <Heart className="h-4 w-4 fill-[#0033FF] text-[#0033FF]" />
                  Donate Now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent font-medium h-12 px-8 gap-2"
              >
                <Link href="/about">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Impact grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {IMPACT_ITEMS.map((item) => (
              <div
                key={item.amount}
                className="p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm hover:bg-white/15 transition-colors"
              >
                <div className="text-2xl font-bold text-white mb-2">{item.amount}</div>
                <p className="text-blue-100/80 text-sm leading-relaxed">{item.impact}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
