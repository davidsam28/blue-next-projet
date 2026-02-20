'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, GraduationCap, BookOpen, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import type { LrcPost, LrcClass, LrcResource, LrcEvent } from '@/types/database'

type ContentItem =
  | (LrcPost & { _type: 'post' })
  | (LrcClass & { _type: 'class' })
  | (LrcResource & { _type: 'resource' })
  | (LrcEvent & { _type: 'event' })

const TYPE_CONFIG = {
  post: { label: 'Blog', color: 'bg-blue-600', icon: FileText, href: '/learn/posts' },
  class: { label: 'Class', color: 'bg-purple-600', icon: GraduationCap, href: '/learn/classes' },
  resource: { label: 'Resource', color: 'bg-emerald-600', icon: BookOpen, href: '/learn/resources' },
  event: { label: 'Event', color: 'bg-orange-600', icon: Calendar, href: '/learn/events' },
}

interface LrcHubProps {
  posts: LrcPost[]
  classes: LrcClass[]
  resources: LrcResource[]
  events: LrcEvent[]
}

const FILTERS = ['all', 'post', 'class', 'resource', 'event'] as const
type FilterKey = (typeof FILTERS)[number]

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  post: 'Blog',
  class: 'Classes',
  resource: 'Resources',
  event: 'Events',
}

export function LrcHub({ posts, classes, resources, events }: LrcHubProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const allItems: ContentItem[] = [
    ...posts.map(p => ({ ...p, _type: 'post' as const })),
    ...classes.map(c => ({ ...c, _type: 'class' as const })),
    ...resources.map(r => ({ ...r, _type: 'resource' as const })),
    ...events.map(e => ({ ...e, _type: 'event' as const })),
  ]

  const filtered = activeFilter === 'all' ? allItems : allItems.filter(item => item._type === activeFilter)

  const counts: Record<FilterKey, number> = {
    all: allItems.length,
    post: posts.length,
    class: classes.length,
    resource: resources.length,
    event: events.length,
  }

  function getDescription(item: ContentItem): string | null {
    if (item._type === 'post') return item.excerpt
    if (item._type === 'class') return item.description
    if (item._type === 'resource') return item.description
    if (item._type === 'event') return item.description
    return null
  }

  function getHref(item: ContentItem): string {
    const config = TYPE_CONFIG[item._type]
    return `${config.href}/${item.slug}`
  }

  function getDate(item: ContentItem): string {
    if (item._type === 'event' && item.event_date) {
      return new Date(item.event_date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    }
    const date = item.published_at ?? item.created_at
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[#0033FF] text-white'
                  : 'bg-[#F2F2F2] text-gray-600 hover:bg-[#E6EBFF] hover:text-[#0033FF]'
              }`}
            >
              {FILTER_LABELS[filter]}
              <span className={`ml-1.5 text-xs ${activeFilter === filter ? 'text-white/70' : 'text-gray-400'}`}>
                {counts[filter]}
              </span>
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#E6EBFF] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-[#0033FF]" />
            </div>
            <p className="text-gray-500 text-lg">No content available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new learning resources.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => {
              const config = TYPE_CONFIG[item._type]
              const Icon = config.icon
              const description = getDescription(item)

              return (
                <Link
                  key={`${item._type}-${item.id}`}
                  href={getHref(item)}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0033FF]/20 hover:shadow-xl hover:shadow-[#0033FF]/5 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 bg-[#E6EBFF] overflow-hidden">
                    {item.cover_image ? (
                      <Image
                        src={item.cover_image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-12 w-12 text-[#0033FF]/30" />
                      </div>
                    )}
                    {/* Type badge */}
                    <div className={`absolute top-3 left-3 ${config.color} text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1`}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </div>
                    {item.is_featured && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#001A80] mb-2 group-hover:text-[#0033FF] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                        {description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        {item._type === 'post' && item.category && (
                          <span className="text-[#0033FF] font-medium">{item.category}</span>
                        )}
                        {item._type === 'class' && item.category && (
                          <span className="text-[#0033FF] font-medium">{item.category}</span>
                        )}
                        {item._type === 'resource' && item.category && (
                          <span className="text-[#0033FF] font-medium">{item.category}</span>
                        )}
                        {item._type === 'event' && item.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </span>
                        )}
                        {item._type === 'post' && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {item.read_time_minutes} min read
                          </span>
                        )}
                      </div>
                      <span>{getDate(item)}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-[#0033FF] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
