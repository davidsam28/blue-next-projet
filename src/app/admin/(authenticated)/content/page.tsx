import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ContentEditor } from '@/components/admin/ContentEditor'

export const metadata: Metadata = { title: 'Page Content — Admin' }

async function getContent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_content')
    .select('*')
    .order('page')
    .order('section')
  return data ?? []
}

export default async function ContentPage() {
  const content = await getContent()
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Page Content</h1>
        <p className="text-gray-500 text-sm mt-1">Edit text content for public-facing pages. Changes take effect immediately.</p>
      </div>
      <ContentEditor initialContent={content} />
    </div>
  )
}
