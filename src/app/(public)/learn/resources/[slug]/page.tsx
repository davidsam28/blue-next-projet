import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Download, Calendar } from 'lucide-react'
import { MarkdownContent } from '@/components/learn/MarkdownContent'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getResource(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lrc_resources')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) return { title: 'Resource Not Found' }
  return {
    title: resource.title,
    description: resource.description ?? `${resource.title} — Blue Next Projet Learning Resource.`,
  }
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) notFound()

  const publishDate = resource.published_at ?? resource.created_at

  return (
    <>
      {/* Hero */}
      <div className="relative">
        {resource.cover_image ? (
          <div className="relative h-64 sm:h-80 bg-[#001A80]">
            <Image
              src={resource.cover_image}
              alt={resource.title}
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
                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  <BookOpen className="h-3 w-3" />Resource
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{resource.title}</h1>
                <div className="flex items-center gap-4 text-sm text-blue-200">
                  {resource.category && <span className="font-medium">{resource.category}</span>}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="brand-gradient py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />Back to Learning Center
              </Link>
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                <BookOpen className="h-3 w-3" />Resource
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{resource.title}</h1>
              <div className="flex items-center gap-4 text-sm text-blue-200">
                {resource.category && <span className="font-medium">{resource.category}</span>}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <article className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {resource.description && (
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {resource.description}
            </p>
          )}

          {resource.file_url && (
            <div className="bg-[#E6EBFF] rounded-xl p-6 mb-8 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#001A80]">Download Resource</p>
                <p className="text-sm text-gray-500 mt-1">Access the resource file directly.</p>
              </div>
              <Button asChild className="bg-[#0033FF] text-white gap-2 hover:bg-[#001A80]">
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          )}

          {resource.content && <MarkdownContent content={resource.content} />}
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
