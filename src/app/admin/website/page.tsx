import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { WebsiteEditor } from '@/components/admin/WebsiteEditor'

export const metadata: Metadata = { title: 'Website Editor — Admin' }

async function getData() {
  const supabase = await createClient()

  const [contentRes, settingsRes] = await Promise.all([
    supabase.from('site_content').select('*').order('page').order('section'),
    supabase.from('site_settings').select('key, value'),
  ])

  const settings = Object.fromEntries(
    (settingsRes.data ?? []).map((s) => [s.key, s.value])
  )

  return { content: contentRes.data ?? [], settings }
}

export default async function WebsiteEditorPage() {
  const { content, settings } = await getData()

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Editor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit all text, images, and content across every page of your website. Upload images or paste URLs. Changes take effect immediately.
        </p>
      </div>
      <WebsiteEditor initialContent={content} initialSettings={settings} />
    </div>
  )
}
