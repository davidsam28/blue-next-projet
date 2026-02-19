import Image from 'next/image'
import { Mic, Film, Monitor, Briefcase } from 'lucide-react'

interface MissionSectionProps {
  title: string
  body: string
  stats: { number: string; label: string }[]
}

const PROGRAMS = [
  {
    icon: Film,
    tag: 'CREATIVE EXPRESSION',
    title: 'Media Arts Education',
    description: 'Professional media literacy and digital storytelling training that builds technical competence and creative direction in structured, safe learning environments.',
  },
  {
    icon: Mic,
    tag: 'AUDIO PRODUCTION',
    title: 'Production Training',
    description: 'Professional audio engineering and music production training that gives youth direct experience in studio workflows, industry tools, and real-world production practices.',
  },
  {
    icon: Monitor,
    tag: 'DIGITAL LITERACY',
    title: 'Media Engagement',
    description: 'Building digital literacy and media analysis skills that prepare youth to navigate digital spaces responsibly and participate effectively in professional communication environments.',
  },
  {
    icon: Briefcase,
    tag: 'WORKFORCE DEVELOPMENT',
    title: 'Creative Career Pathways',
    description: 'Connecting training to real-world opportunities through workforce initiatives, internships, and mentorship with industry and institutional partners.',
  },
]

export function MissionSection({ title, body, stats }: MissionSectionProps) {
  return (
    <>
      {/* Programs Section */}
      <section className="section-padding bg-white" aria-labelledby="programs-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-4 block">
              Our Programs
            </span>
            <h2 id="programs-section" className="text-display text-black mb-6">
              Advancing Chicago Youth Through Media Arts and Audio Production
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              We envision a future where Chicago youth use media arts to shape their own narratives, build technical expertise, and access sustainable opportunities in the creative economy.
            </p>
          </div>
        </div>
      </section>

      {/* Developing the Next Gen */}
      <section className="py-16 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-section text-black mb-6">
                Developing the Next Generation of Media Innovators
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through trauma-informed training and career-focused programs, Blue Next Project equips Chicago youth with technical skills and industry guidance to tell their own stories and thrive in the digital media world.
              </p>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80"
                alt="Youth learning music production at audio console"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Program Cards */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {PROGRAMS.map((program) => {
              const Icon = program.icon
              return (
                <div
                  key={program.title}
                  className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#0033FF] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-[#0033FF] uppercase tracking-[0.15em]">
                      {program.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-black mb-3">{program.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{program.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section-padding bg-[#F7F7F7]" aria-labelledby="impact-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 id="impact-title" className="text-display text-black mb-6">
                Transforming Chicago&apos;s Creative Future Through Media Arts
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Blue Next Project provides Chicago youth with professional training in audio production and digital media, preparing them for real opportunities in the creative industry.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l-4 border-[#0033FF] pl-8">
                  <div className="text-6xl sm:text-7xl font-black text-black tracking-tighter">{stat.number}</div>
                  <div className="text-lg font-bold text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee Band */}
      <section className="bg-black py-5 overflow-hidden" aria-hidden="true">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4 whitespace-nowrap text-sm font-bold text-white/80 tracking-wider uppercase">
              <span>Empowering Chicago Youth</span>
              <span className="text-[#0033FF]">&bull;</span>
              <span>Media Arts Education</span>
              <span className="text-[#0033FF]">&bull;</span>
              <span>Creative Workforce Development</span>
              <span className="text-[#0033FF]">&bull;</span>
              <span>Trauma-Informed Production</span>
              <span className="text-[#0033FF]">&bull;</span>
              <span>Community Impact</span>
              <span className="text-[#0033FF]">&bull;</span>
              <span>Violence Prevention</span>
              <span className="text-[#0033FF]">&bull;</span>
              <span>Safe Creative Spaces</span>
              <span className="text-[#0033FF]">&bull;</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
