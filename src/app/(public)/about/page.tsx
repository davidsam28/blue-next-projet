import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { sanitizeHtml } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { CheckCircle2, Target, Eye, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Blue Next Projet — a nonprofit organization dedicated to trauma-informed healing through media arts.',
}

async function getAboutContent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_content')
    .select('section, content, content_type')
    .eq('page', 'about')

  return Object.fromEntries((data ?? []).map((c) => [c.section, c]))
}

const CORE_VALUES = [
  { label: 'Safety', description: 'Creating physical and emotional safety in all programming environments.' },
  { label: 'Trustworthiness', description: 'Maintaining transparency and doing what we say we will do.' },
  { label: 'Choice', description: 'Prioritizing participant voice, choice, and control.' },
  { label: 'Collaboration', description: 'Sharing power and working together with the communities we serve.' },
  { label: 'Empowerment', description: 'Recognizing strengths and building resilience through creative expression.' },
  { label: 'Cultural Sensitivity', description: 'Acknowledging cultural context and celebrating diverse backgrounds.' },
]

const WHAT_IS_TIMA = [
  'Trauma-Informed Media Arts (TIMA) is a practice framework that integrates trauma-sensitive principles with media arts education.',
  'It recognizes that many community members have experienced adverse life events that affect how they engage with learning environments.',
  'By creating intentional, safe, and supportive creative spaces, TIMA practitioners help participants process experiences, build resilience, and develop meaningful skills.',
  'The media arts — film, photography, audio, digital storytelling — serve as powerful vehicles for self-expression when traditional verbal processing may be difficult.',
]

export default async function AboutPage() {
  const content = await getAboutContent()

  const get = (section: string) => content[section]?.content ?? ''

  return (
    <>
      <PageHeader
        accent="About Us"
        title={get('page_title') || 'About Blue Next Projet'}
        subtitle={get('page_subtitle') || 'A nonprofit dedicated to trauma-informed media arts'}
      />

      {/* Mission & Vision */}
      <section className="section-padding bg-white" aria-labelledby="mission-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Mission */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6EBFF] flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#0033FF]" />
                </div>
                <h2 id="mission-heading" className="text-2xl font-bold text-[#001A80]">
                  {get('mission_title') || 'Our Mission'}
                </h2>
              </div>
              <div
                className="prose prose-blue max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(get('mission_body') || '<p>Blue Next Projet is committed to providing trauma-informed media arts programming that creates safe spaces for healing, self-expression, and community building.</p>'),
                }}
              />
            </div>

            {/* Vision */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6EBFF] flex items-center justify-center">
                  <Eye className="h-5 w-5 text-[#0033FF]" />
                </div>
                <h2 className="text-2xl font-bold text-[#001A80]">
                  {get('vision_title') || 'Our Vision'}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                {get('vision_body') || 'A world where every individual, regardless of their trauma history, has access to the healing power of creative expression and media arts.'}
              </p>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E6EBFF] flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#0033FF]" />
                </div>
                <h2 className="text-2xl font-bold text-[#001A80]">
                  {get('approach_title') || 'Our Approach'}
                </h2>
              </div>
              <div
                className="prose prose-blue max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(get('approach_body') || '<p>Our trauma-informed approach ensures that all programming prioritizes safety, trust, choice, collaboration, and empowerment.</p>'),
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* What is Trauma-Informed Media Arts */}
      <section className="section-padding bg-[#F2F2F2]" aria-labelledby="tima-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-widest mb-3 block">
              Our Framework
            </span>
            <h2 id="tima-heading" className="text-3xl font-bold text-[#001A80] mb-4">
              What Is Trauma-Informed Media Arts?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {WHAT_IS_TIMA.map((text, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-[#0033FF] shrink-0 mt-0.5" />
                <p className="text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-white" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-widest mb-3 block">
              What We Stand For
            </span>
            <h2 id="values-heading" className="text-3xl font-bold text-[#001A80]">
              Our Core Values
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_VALUES.map((value, i) => (
              <div
                key={value.label}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-[#0033FF]/30 hover:shadow-lg hover:shadow-[#0033FF]/5 transition-all bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#0033FF] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-[#001A80]">{value.label}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
