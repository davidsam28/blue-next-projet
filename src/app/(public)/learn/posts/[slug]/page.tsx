import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react'
import { MarkdownContent } from '@/components/learn/MarkdownContent'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lrc_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt ?? `Read ${post.title} on Blue Next Projet.`,
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const publishDate = post.published_at ?? post.created_at

  return (
    <>
      {/* Hero */}
      <div className="relative">
        {post.cover_image ? (
          <div className="relative h-64 sm:h-80 md:h-96 bg-[#001A80]">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover opacity-40"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001A80] via-[#001A80]/60 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
                <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Learning Center
                </Link>
                <div className="inline-block bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  Blog Post
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                  {post.author && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {post.read_time_minutes} min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="brand-gradient py-16 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/learn" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Learning Center
              </Link>
              <div className="inline-block bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                Blog Post
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                {post.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {post.author}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.read_time_minutes} min read
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <article className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-[#0033FF] pl-4">
              {post.excerpt}
            </p>
          )}

          {post.content && <MarkdownContent content={post.content} />}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-400" />
                {post.tags.map((tag: string) => (
                  <span key={tag} className="bg-[#E6EBFF] text-[#0033FF] text-xs font-medium px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          {post.category && (
            <div className="mt-4">
              <span className="text-sm text-gray-400">Category: </span>
              <span className="text-sm font-medium text-[#0033FF]">{post.category}</span>
            </div>
          )}
        </div>
      </article>

      {/* CTA */}
      <section className="py-12 bg-[#F2F2F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-[#0033FF] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#001A80] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore More Resources
          </Link>
        </div>
      </section>
    </>
  )
}
