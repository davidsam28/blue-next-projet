import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { ContactForm } from '@/components/contact/ContactForm'
import { Mail, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Blue Next Projet. We would love to hear from you about programs, partnerships, or volunteer opportunities.',
}

async function getContactSettings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['contact_email', 'contact_phone', 'org_address', 'instagram_handle', 'facebook_url'])

  return Object.fromEntries((data ?? []).map((s) => [s.key, s.value]))
}

export default async function ContactPage() {
  const settings = await getContactSettings()

  const contactItems = [
    {
      icon: Mail,
      label: 'Email',
      value: settings.contact_email || 'contact@bluenextprojet.org',
      href: `mailto:${settings.contact_email || 'contact@bluenextprojet.org'}`,
    },
    ...(settings.contact_phone
      ? [{ icon: Phone, label: 'Phone', value: settings.contact_phone, href: `tel:${settings.contact_phone}` }]
      : []),
    ...(settings.org_address
      ? [{ icon: MapPin, label: 'Address', value: settings.org_address, href: undefined }]
      : []),
  ]

  return (
    <>
      <PageHeader
        accent="Contact"
        title="Get In Touch"
        subtitle="We would love to hear from you. Reach out with questions, partnership inquiries, or to learn more about our programs."
      />

      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#001A80] mb-6">Contact Information</h2>
                <div className="space-y-5">
                  {contactItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#E6EBFF] flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-[#0033FF]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                          {item.href ? (
                            <a href={item.href} className="text-[#001A80] font-medium hover:text-[#0033FF] transition-colors">
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-[#001A80] font-medium">{item.value}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E6EBFF] flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-[#0033FF]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Response Time</p>
                      <p className="text-[#001A80] font-medium">Within 2 business days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social links */}
              {(settings.instagram_handle || settings.facebook_url) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Follow Us</h3>
                  <div className="flex items-center gap-3">
                    {settings.instagram_handle && (
                      <a
                        href={`https://instagram.com/${settings.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#0033FF] hover:text-[#0033FF] transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    )}
                    {settings.facebook_url && (
                      <a
                        href={settings.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#0033FF] hover:text-[#0033FF] transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="bg-[#F2F2F2] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#001A80] mb-2">Send Us a Message</h2>
                <p className="text-gray-500 mb-8 text-sm">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
