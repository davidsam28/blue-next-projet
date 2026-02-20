import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Video, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LRCItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  description?: string
  cover_image?: string
  category?: string
  published_at?: string
  type: 'post' | 'class' | 'resource' | 'event'
}

interface LRCShowcaseProps {
  items: LRCItem[]
}

const TYPE_CONFIG = {
  post: { label: 'Blog', icon: FileText, color: 'bg-blue-500', href: '/learn/posts' },
  class: { label: 'Course', icon: Video, color: 'bg-purple-500', href: '/learn/classes' },
  resource: { label: 'Resource', icon: BookOpen, color: 'bg-emerald-500', href: '/learn/resources' },
  event: { label: 'Event', icon: Calendar, color: 'bg-orange-500', href: '/learn/events' },
}

export function LRCShowcase({ items }: LRCShowcaseProps) {
  if (items.length === 0) return null

  return (
    <section className="section-padding bg-white" aria-labelledby="lrc-showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-3 block">
              Learn &amp; Grow
            </span>
            <h2 id="lrc-showcase" className="text-4xl sm:text-5xl font-black text-black tracking-tight">
              Resource Center
            </h2>
            <p className="text-lg text-gray-500 mt-3 max-w-2xl">
              Explore our latest blog posts, courses, resources, and upcoming events.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="hidden sm:inline-flex border-[#0033FF]/30 text-[#0033FF] hover:bg-[#E6EBFF] gap-2"
          >
            <Link href="/learn">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map((item) => {
            const config = TYPE_CONFIG[item.type]
            const Icon = config.icon
            const href = `${config.href}/${item.slug}`

            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={href}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0033FF]/20 hover:shadow-xl hover:shadow-[#0033FF]/5 transition-all duration-300"
              >
                {/* Cover image */}
                <div className="relative h-44 bg-[#E6EBFF] overflow-hidden">
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
                  <div className={`absolute top-3 left-3 ${config.color} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {item.category && (
                    <span className="text-[10px] font-bold text-[#0033FF] uppercase tracking-wider block mb-1.5">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-bold text-[#001A80] mb-2 line-clamp-2 group-hover:text-[#0033FF] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.excerpt || item.description || ''}
                  </p>
                  {item.published_at && (
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(item.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Button
            asChild
            className="bg-[#0033FF] hover:bg-[#001A80] text-white gap-2"
          >
            <Link href="/learn">
              View All Resources
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
