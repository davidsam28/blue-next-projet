import { Film, Heart, Users, Sparkles } from 'lucide-react'

interface MissionSectionProps {
  title: string
  body: string
  stats: { number: string; label: string }[]
}

const PILLARS = [
  {
    icon: Heart,
    title: 'Trauma-Informed',
    description: 'Every program is grounded in trauma-sensitive principles — safety, trust, choice, collaboration, and empowerment.',
  },
  {
    icon: Film,
    title: 'Media Arts',
    description: 'Photography, film, digital storytelling, and audio production as vehicles for healing and self-expression.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building connection, resilience, and solidarity among individuals and communities impacted by trauma.',
  },
  {
    icon: Sparkles,
    title: 'Empowerment',
    description: 'Reclaiming narratives and building agency through creative skill development and authentic expression.',
  },
]

export function MissionSection({ title, body, stats }: MissionSectionProps) {
  return (
    <section className="section-padding bg-white" aria-labelledby="mission-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mission */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-widest mb-3 block">
              Who We Are
            </span>
            <h2 id="mission-title" className="text-4xl font-bold text-[#001A80] mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {body}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-[#E6EBFF] border border-[#0033FF]/10">
                <div className="text-4xl font-bold text-[#0033FF] mb-2">{stat.number}</div>
                <div className="text-sm font-medium text-[#001A80]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-[#0033FF]/30 hover:shadow-lg hover:shadow-[#0033FF]/10 transition-all duration-300 bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6EBFF] flex items-center justify-center mb-4 group-hover:bg-[#0033FF] transition-colors">
                  <Icon className="h-5 w-5 text-[#0033FF] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#001A80] mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
