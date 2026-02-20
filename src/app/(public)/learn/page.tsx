import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { LrcHub } from '@/components/learn/LrcHub'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Learning Resource Center',
  description: 'Explore blog posts, classes, resources, and events from Blue Next Projet — empowering communities through media arts education.',
}

async function getLrcContent() {
  const supabase = await createClient()

  const [postsRes, classesRes, resourcesRes, eventsRes] = await Promise.all([
    supabase.from('lrc_posts').select('*').eq('status', 'published').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('lrc_classes').select('*').eq('status', 'published').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('lrc_resources').select('*').eq('status', 'published').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('lrc_events').select('*').eq('status', 'published').order('event_date', { ascending: true }),
  ])

  return {
    posts: postsRes.data ?? [],
    classes: classesRes.data ?? [],
    resources: resourcesRes.data ?? [],
    events: eventsRes.data ?? [],
  }
}

export default async function LearnPage() {
  const data = await getLrcContent()

  return (
    <>
      <PageHeader
        accent="Learn & Grow"
        title="Learning Resource Center"
        subtitle="Explore our blog posts, classes, resources, and upcoming events designed to empower and educate."
      />
      <LrcHub
        posts={data.posts}
        classes={data.classes}
        resources={data.resources}
        events={data.events}
      />
    </>
  )
}
