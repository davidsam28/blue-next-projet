import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowRight, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DonateCTAProps {
  impactNote: string
  partnerImage?: string
}

const DEFAULT_PARTNER_IMAGE = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&q=80'

export function DonateCTA({ impactNote, partnerImage }: DonateCTAProps) {
  return (
    <section className="relative section-padding overflow-hidden" aria-labelledby="donate-cta-title">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={partnerImage || DEFAULT_PARTNER_IMAGE}
          alt="Youth collaborating in creative studio environment"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 bg-white/10 text-white/80 text-sm font-bold mb-8 border border-white/20 backdrop-blur-sm">
            <Handshake className="h-4 w-4" />
            Partner With Us
          </div>
          <h2 id="donate-cta-title" className="text-display text-white mb-6">
            Collaborate with Blue Next Project
          </h2>
          <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            We collaborate with grant funders, foundations, and community organizations to expand opportunities in media arts. Together, we support Chicago youth in developing technical skills, creative expression, and pathways to professional growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#0033FF] hover:bg-[#0033FF]/90 text-white font-bold text-base h-14 px-10 gap-3 shadow-2xl shadow-[#0033FF]/30"
            >
              <Link href="/donate">
                <Heart className="h-5 w-5 fill-white" />
                Donate Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-bold text-base h-14 px-10 gap-3"
            >
              <Link href="/contact">
                Become an Institutional Partner
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
