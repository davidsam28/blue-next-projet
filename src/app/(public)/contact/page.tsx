export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ContactForm } from '@/components/contact/ContactForm'
import { MapPin, Mail, Phone, Clock, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Connect with Blue Next Project at Clear Ear Studios — 7411 S. Stony Island Ave, Chicago, IL 60649.',
}

async function getContactContent() {
  const supabase = await createClient()

  const { data: content } = await supabase
    .from('site_content')
    .select('section, content')
    .eq('page', 'contact')

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['contact_email', 'contact_phone'])

  const contentMap = Object.fromEntries(
    (content ?? []).map((c) => [c.section, c.content])
  )
  const settingsMap = Object.fromEntries(
    (settings ?? []).map((s) => [s.key, s.value])
  )

  return { contentMap, settingsMap }
}

export default async function ContactPage() {
  const { contentMap, settingsMap } = await getContactContent()

  const heroHeadline = contentMap.contact_hero_headline ?? 'Connect with Blue Next Project'
  const studioName = contentMap.studio_name ?? 'Clear Ear Studios'
  const studioAddress = contentMap.studio_address ?? '7411 S. Stony Island Ave.'
  const studioCity = contentMap.studio_city ?? 'Chicago, IL 60649'
  const hoursWeekday = contentMap.hours_weekday ?? 'MON — FRI: 11:00am — 8:00pm'
  const hoursWeekend = contentMap.hours_weekend ?? 'SATURDAY: 11:00am — 6:00pm'
  const mapEmbedUrl = contentMap.map_embed_url ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2976.8!2d-87.5862!3d41.7602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e295f5f0f5a4b%3A0x7a89f72e6a7c0b!2s7411+S+Stony+Island+Ave%2C+Chicago%2C+IL+60649!5e0!3m2!1sen!2sus!4v1'
  const directionsUrl = contentMap.maps_directions_url ?? 'https://www.google.com/maps/dir//7411+S+Stony+Island+Ave,+Chicago,+IL+60649'
  const contactEmail = settingsMap.contact_email ?? 'partnerships@bluenextproject.org'
  const contactPhone = settingsMap.contact_phone ?? '708-929-8745'

  return (
    <>
      {/* Hero header */}
      <section className="bg-black py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-6 block">
            Get Involved
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-8">
            {heroHeadline}
          </h1>

          {/* Contact cards row */}
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#0033FF] flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-black text-white/50 uppercase tracking-[0.15em] mb-2">Location</p>
              <p className="text-white font-bold text-lg">{studioAddress}</p>
              <p className="text-white/70">{studioCity}</p>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#0033FF] flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-black text-white/50 uppercase tracking-[0.15em] mb-2">Partnerships</p>
              <a href={`mailto:${contactEmail}`} className="text-white font-bold text-lg hover:text-[#0033FF] transition-colors">
                {contactEmail}
              </a>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#0033FF] flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-black text-white/50 uppercase tracking-[0.15em] mb-2">Inquiries</p>
              <a href={`tel:${contactPhone}`} className="text-white font-bold text-lg hover:text-[#0033FF] transition-colors">
                {contactPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-section text-black mb-6">Send Us a Message</h2>
              <p className="text-gray-500 mb-8 text-lg">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>
              <div className="bg-[#F7F7F7] rounded-2xl p-8">
                <ContactForm />
              </div>
            </div>

            {/* Map + Studio Info */}
            <div className="space-y-8">
              {/* Interactive Google Map */}
              <div className="rounded-2xl overflow-hidden h-[400px] border border-gray-200">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${studioName} location`}
                />
              </div>

              {/* Studio details */}
              <div className="bg-black text-white rounded-2xl p-8">
                <h3 className="text-3xl font-black tracking-tighter mb-1">{studioName}</h3>
                <p className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-8">Our Space</p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-[#0033FF] shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-lg">{studioAddress}</p>
                      <p className="text-white/60">{studioCity}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-[#0033FF] shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-lg mb-1">Office Hours</p>
                      <p className="text-white/60">{hoursWeekday}</p>
                      <p className="text-white/60">{hoursWeekend}</p>
                    </div>
                  </div>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0033FF] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#0033FF]/90 transition-colors mt-2"
                  >
                    Get Directions
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
