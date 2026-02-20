import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blue-next-projet.vercel.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/donate`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/team`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/programs`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/learn`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/enroll`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic pages from LRC tables
  const supabase = await createClient()

  const [postsResult, classesResult, resourcesResult, eventsResult] = await Promise.allSettled([
    supabase
      .from('lrc_posts')
      .select('slug, updated_at')
      .eq('published', true),
    supabase
      .from('lrc_classes')
      .select('slug, updated_at')
      .eq('published', true),
    supabase
      .from('lrc_resources')
      .select('slug, updated_at')
      .eq('published', true),
    supabase
      .from('lrc_events')
      .select('slug, updated_at')
      .eq('published', true),
  ])

  const dynamicPages: MetadataRoute.Sitemap = []

  if (postsResult.status === 'fulfilled' && postsResult.value.data) {
    for (const post of postsResult.value.data) {
      dynamicPages.push({
        url: `${baseUrl}/learn/posts/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  if (classesResult.status === 'fulfilled' && classesResult.value.data) {
    for (const cls of classesResult.value.data) {
      dynamicPages.push({
        url: `${baseUrl}/learn/classes/${cls.slug}`,
        lastModified: cls.updated_at ? new Date(cls.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  if (resourcesResult.status === 'fulfilled' && resourcesResult.value.data) {
    for (const resource of resourcesResult.value.data) {
      dynamicPages.push({
        url: `${baseUrl}/learn/resources/${resource.slug}`,
        lastModified: resource.updated_at ? new Date(resource.updated_at) : undefined,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
    for (const event of eventsResult.value.data) {
      dynamicPages.push({
        url: `${baseUrl}/learn/events/${event.slug}`,
        lastModified: event.updated_at ? new Date(event.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  return [...staticPages, ...dynamicPages]
}
