import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import Image from 'next/image'
import { User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the dedicated team behind Blue Next Projet — passionate advocates for trauma-informed healing and media arts.',
}

async function getTeam() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return data ?? []
}

export default async function TeamPage() {
  const team = await getTeam()

  return (
    <>
      <PageHeader
        accent="Our Team"
        title="The People Behind the Mission"
        subtitle="Dedicated professionals and advocates committed to trauma-informed healing through media arts."
      />

      <section className="section-padding bg-white" aria-labelledby="team-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sr-only" id="team-heading">Team members</div>

          {team.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#E6EBFF] flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-[#0033FF]" />
              </div>
              <p className="text-gray-500 text-lg">Team information coming soon.</p>
              <p className="text-gray-400 text-sm mt-2">Our team page is being updated. Please check back shortly.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member) => (
                <article
                  key={member.id}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0033FF]/20 hover:shadow-xl hover:shadow-[#0033FF]/5 transition-all"
                >
                  {/* Photo */}
                  <div className="relative h-64 bg-[#E6EBFF] overflow-hidden">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={`Photo of ${member.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-[#0033FF]/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-[#0033FF]/40" />
                        </div>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-[#001A80] mb-0.5">{member.name}</h2>
                    <p className="text-sm font-medium text-[#0033FF] mb-3">{member.title}</p>
                    {member.bio && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">{member.bio}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join the team */}
      <section className="py-16 bg-[#F2F2F2]" aria-label="Join the team">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#001A80] mb-3">Join Our Team</h2>
          <p className="text-gray-600 mb-6">
            Passionate about trauma-informed care and media arts? We&apos;d love to connect with you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#0033FF] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#001A80] transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </>
  )
}
