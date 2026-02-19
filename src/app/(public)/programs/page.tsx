import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { ArrowRight, Film, Mic, Camera, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Explore Blue Next Projet\'s trauma-informed media arts programs — healing, empowering, and community-building through creative expression.',
}

const PROGRAM_ICONS = [Film, Camera, Mic, Users]

async function getPrograms() {
  const supabase = await createClient()

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const { data: content } = await supabase
    .from('site_content')
    .select('section, content')
    .eq('page', 'programs')

  const contentMap = Object.fromEntries((content ?? []).map((c) => [c.section, c.content]))

  return { programs: programs ?? [], contentMap }
}

export default async function ProgramsPage() {
  const { programs, contentMap } = await getPrograms()

  return (
    <>
      <PageHeader
        accent="What We Do"
        title={contentMap.page_title ?? 'Our Programs'}
        subtitle={contentMap.page_subtitle ?? 'Evidence-based, trauma-informed media arts programming for healing and growth'}
      />

      {/* Programs grid */}
      <section className="section-padding bg-white" aria-labelledby="programs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sr-only" id="programs-heading">Our programs</div>

          {programs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#E6EBFF] flex items-center justify-center mx-auto mb-4">
                <Film className="h-8 w-8 text-[#0033FF]" />
              </div>
              <p className="text-gray-500 text-lg">Programs information coming soon.</p>
              <p className="text-gray-400 text-sm mt-2">Please check back or contact us for more details.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {programs.map((program, index) => {
                const Icon = PROGRAM_ICONS[index % PROGRAM_ICONS.length]
                return (
                  <div
                    key={program.id}
                    className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0033FF]/20 hover:shadow-xl hover:shadow-[#0033FF]/5 transition-all duration-300"
                  >
                    {/* Color bar */}
                    <div className="h-1.5 w-full brand-gradient" />

                    <div className="p-8">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-[#E6EBFF] flex items-center justify-center shrink-0 group-hover:bg-[#0033FF] transition-colors">
                          <Icon className="h-6 w-6 text-[#0033FF] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-wider block mb-1">
                            Program {String(index + 1).padStart(2, '0')}
                          </span>
                          <h2 className="text-xl font-bold text-[#001A80]">{program.name}</h2>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{program.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="section-padding bg-[#F2F2F2]" aria-label="Get involved">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-widest mb-4 block">
            Join Us
          </span>
          <h2 className="text-3xl font-bold text-[#001A80] mb-5">
            Ready to Get Involved?
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Whether you want to participate in a program, volunteer, or support our mission financially — there are many ways to make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#0033FF] hover:bg-[#0033FF]/90 text-white h-12 px-8 gap-2"
            >
              <Link href="/contact">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#0033FF]/30 text-[#0033FF] hover:bg-[#E6EBFF] h-12 px-8"
            >
              <Link href="/donate">Support Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
