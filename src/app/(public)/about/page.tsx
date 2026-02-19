import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Blue Next Project — a Chicago-based nonprofit providing youth with safe, creative spaces to explore media arts and audio production.',
}

const TEAM = [
  { name: 'Brian Bolton', title: 'Executive Director & Founder' },
  { name: 'Millard Robbins', title: 'Director of Trauma-Informed Programs' },
  { name: 'Ryan Baggett', title: 'Head of Audio Production & Engineering' },
  { name: 'Roni Bolton', title: 'Administrative Director' },
  { name: 'John Bolton', title: 'Creative Director' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80"
            alt="Audio mixing board in professional recording studio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-6 block">
            About Us
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] max-w-4xl">
            The Roots of Blue Next Project
          </h1>
        </div>
      </section>

      {/* Origin Story */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Founded in Chicago in 2024, Blue Next Project provides youth with safe, creative spaces to explore media arts and audio production on their own terms. Originally launched to address neighborhood violence, the organization has grown into a trusted hub for trauma-informed creative education and a bridge to new skills and opportunities.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                By connecting creative interests with vocational pathways, we equip students with the skills and tools to pursue professional opportunities in the media industry.
              </p>
            </div>
            <div className="relative h-[450px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80"
                alt="Young person working at professional audio console"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-[#F7F7F7]" aria-labelledby="team-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-4 block">
              Expertise &amp; Leadership
            </span>
            <h2 id="team-heading" className="text-section text-black mb-4">
              Leading youth media arts innovation through trauma-informed education
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl">
              Equipping Chicago youth with skills and pathways to professional opportunities.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-[#0033FF] transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-[#0033FF]/10 flex items-center justify-center mb-5">
                  <Users className="h-7 w-7 text-[#0033FF]" />
                </div>
                <h3 className="text-xl font-black text-black mb-1">{member.name}</h3>
                <p className="text-[#0033FF] font-semibold text-sm">{member.title}</p>
              </div>
            ))}
            <div className="bg-[#0033FF] p-8 rounded-2xl text-white flex flex-col justify-center">
              <h3 className="text-xl font-black mb-3">Partner with our Team</h3>
              <p className="text-white/70 text-sm mb-6">Join us in empowering Chicago youth through media arts education.</p>
              <Button asChild className="bg-white text-[#0033FF] hover:bg-white/90 font-bold w-fit">
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-padding bg-white" aria-labelledby="methodology-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-4 block">
              Methodology
            </span>
            <h2 id="methodology-heading" className="text-section text-black mb-4">
              Creating Safe, Skill-Building Spaces for Chicago Youth
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Our approach combines emotional safety with hands-on training. At our Chicago studio, media arts are more than technical skills — they&apos;re a pathway to personal and professional growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#F7F7F7] p-10 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4">Physical &amp; Emotional Safety</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                We provide structured, predictable environments where youth feel secure expressing their creative voice. By emphasizing stability and respect, the studio supports focus, confidence, and consistent engagement.
              </p>
            </div>
            <div className="bg-[#F7F7F7] p-10 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4">Empowerment &amp; Agency</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Hands-on audio production and media training build technical competence and professional confidence. Students acquire the skills and experience to pursue media careers and take ownership of their creative pathways.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Photo Strip */}
      <section className="grid grid-cols-3 h-[300px]" aria-label="Studio photos">
        <div className="relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80"
            alt="Recording studio mixing console"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="33vw"
          />
        </div>
        <div className="relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1598520106830-a4c46c286093?w=600&q=80"
            alt="Microphone in studio setting"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="33vw"
          />
        </div>
        <div className="relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80"
            alt="Professional studio headphones on mixing desk"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="33vw"
          />
        </div>
      </section>
    </>
  )
}
