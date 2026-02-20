import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lrc_events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event Not Found' }
  return {
    title: event.title,
    description: event.description ?? `${event.title} — Blue Next Projet Event.`,
  }
}

function formatEventDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const isPast = event.event_date ? new Date(event.event_date) < new Date() : false

  return (
    <>
      {/* Hero */}
      <div className="relative">
        {event.cover_image ? (
          <div className="relative h-64 sm:h-80 bg-[#001A80]">
            <Image
              src={event.cover_image}
              alt={event.title}
              fill
              className="object-cover opacity-40"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001A80] via-[#001A80]/60 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
                <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" />Back to Learning Center
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="h-3 w-3" />Event
                  </span>
                  {isPast && (
                    <span className="bg-gray-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      Past Event
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{event.title}</h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="brand-gradient py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />Back to Learning Center
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="h-3 w-3" />Event
                </span>
                {isPast && (
                  <span className="bg-gray-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Past Event
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{event.title}</h1>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <article className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="md:col-span-2">
              {event.description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <div className="bg-[#F2F2F2] rounded-xl p-6 space-y-4">
                <h2 className="font-bold text-[#001A80] text-lg">Event Details</h2>

                {event.event_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#0033FF] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Date & Time</p>
                      <p className="text-sm text-gray-500">{formatEventDate(event.event_date)}</p>
                      {event.end_date && (
                        <p className="text-sm text-gray-400">
                          Ends: {formatTime(event.end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#0033FF] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Location</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.end_date && event.event_date && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#0033FF] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Duration</p>
                      <p className="text-sm text-gray-500">
                        {Math.round((new Date(event.end_date).getTime() - new Date(event.event_date).getTime()) / (1000 * 60 * 60))} hours
                      </p>
                    </div>
                  </div>
                )}

                {event.registration_url && !isPast && (
                  <Button asChild className="w-full bg-[#0033FF] text-white hover:bg-[#001A80] gap-2 mt-2">
                    <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Register Now
                    </a>
                  </Button>
                )}

                {isPast && (
                  <p className="text-sm text-gray-400 text-center pt-2">
                    This event has already taken place.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="py-12 bg-[#F2F2F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/learn" className="inline-flex items-center gap-2 bg-[#0033FF] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#001A80] transition-colors">
            <ArrowLeft className="h-4 w-4" />Explore More Resources
          </Link>
        </div>
      </section>
    </>
  )
}
