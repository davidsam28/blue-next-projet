import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, GraduationCap, User, BarChart3 } from 'lucide-react'
import { ClassContent } from '@/components/learn/ClassContent'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getClass(slug: string) {
  const supabase = await createClient()
  const { data: cls } = await supabase
    .from('lrc_classes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!cls) return null

  const { data: sections } = await supabase
    .from('lrc_class_sections')
    .select('*')
    .eq('class_id', cls.id)
    .order('sort_order')

  return { ...cls, sections: sections ?? [] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cls = await getClass(slug)
  if (!cls) return { title: 'Class Not Found' }
  return {
    title: cls.title,
    description: cls.description ?? `Learn ${cls.title} on Blue Next Projet.`,
  }
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-blue-100 text-blue-700' },
  intermediate: { label: 'Intermediate', color: 'bg-purple-100 text-purple-700' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700' },
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params
  const cls = await getClass(slug)
  if (!cls) notFound()

  const diffConfig = DIFFICULTY_LABELS[cls.difficulty] ?? DIFFICULTY_LABELS.beginner

  return (
    <>
      {/* Hero */}
      <div className="relative">
        {cls.cover_image ? (
          <div className="relative h-64 sm:h-80 bg-[#001A80]">
            <Image
              src={cls.cover_image}
              alt={cls.title}
              fill
              className="object-cover opacity-40"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001A80] via-[#001A80]/60 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
                <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" />Back to Learning Center
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />Class
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diffConfig.color}`}>
                    {diffConfig.label}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{cls.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                  {cls.author && <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{cls.author}</span>}
                  {cls.duration_minutes && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{cls.duration_minutes} min</span>}
                  <span className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" />{cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="brand-gradient py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />Back to Learning Center
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />Class
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diffConfig.color}`}>
                  {diffConfig.label}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{cls.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                {cls.author && <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{cls.author}</span>}
                {cls.duration_minutes && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{cls.duration_minutes} min</span>}
                <span className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" />{cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {cls.description && (
            <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-3xl">
              {cls.description}
            </p>
          )}
          <ClassContent sections={cls.sections} />
        </div>
      </div>

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
