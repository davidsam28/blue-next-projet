import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LrcAdmin } from '@/components/admin/lrc/LrcAdmin'

export const metadata: Metadata = { title: 'Learning Resource Center — Admin' }

async function getLrcData() {
  const supabase = await createClient()

  const [postsRes, classesRes, resourcesRes, eventsRes] = await Promise.all([
    supabase.from('lrc_posts').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('lrc_classes').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('lrc_resources').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('lrc_events').select('*').order('event_date', { ascending: true }).order('created_at', { ascending: false }),
  ])

  return {
    posts: postsRes.data ?? [],
    classes: classesRes.data ?? [],
    resources: resourcesRes.data ?? [],
    events: eventsRes.data ?? [],
  }
}

export default async function AdminLrcPage() {
  const data = await getLrcData()

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Resource Center</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage blog posts, classes, resources, and events for the public learning hub.
        </p>
      </div>
      <LrcAdmin
        initialPosts={data.posts}
        initialClasses={data.classes}
        initialResources={data.resources}
        initialEvents={data.events}
      />
    </div>
  )
}
