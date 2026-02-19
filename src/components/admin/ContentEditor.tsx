'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import type { SiteContent } from '@/types'

interface ContentEditorProps {
  initialContent: SiteContent[]
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home Page',
  about: 'About Page',
  programs: 'Programs Page',
  donate: 'Donate Page',
  contact: 'Contact Page',
}

export function ContentEditor({ initialContent }: ContentEditorProps) {
  const [content, setContent] = useState<Record<string, string>>(
    Object.fromEntries(initialContent.map((c) => [`${c.page}::${c.section}`, c.content]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ home: true })

  const pages = [...new Set(initialContent.map((c) => c.page))]

  async function saveSection(page: string, section: string, contentType: string) {
    const key = `${page}::${section}`
    setSaving(key)

    try {
      const res = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, section, content: content[key] ?? '', contentType }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to save')
      }

      toast.success('Content saved!')
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <Tabs defaultValue="home">
      <TabsList className="bg-gray-100 rounded-xl p-1 h-auto flex-wrap gap-1 mb-6">
        {pages.map((page) => (
          <TabsTrigger key={page} value={page} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0033FF] data-[state=active]:shadow-sm">
            {PAGE_LABELS[page] ?? page}
          </TabsTrigger>
        ))}
      </TabsList>

      {pages.map((page) => {
        const pageContent = initialContent.filter((c) => c.page === page)

        return (
          <TabsContent key={page} value={page} className="space-y-4">
            {pageContent.map((item) => {
              const key = `${item.page}::${item.section}`
              const isSaving = saving === key
              const isLong = item.content_type === 'html' || (item.content?.length ?? 0) > 100

              return (
                <div key={key} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <code className="text-xs text-[#0033FF] font-mono font-semibold">{item.section}</code>
                      <span className="ml-2 text-xs text-gray-400 capitalize">({item.content_type})</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveSection(item.page, item.section, item.content_type)}
                      disabled={isSaving}
                      className="bg-[#0033FF] hover:bg-[#001A80] text-white h-8 text-xs gap-1.5"
                    >
                      {isSaving ? <><Loader2 className="h-3 w-3 animate-spin" />Saving…</> : <><Save className="h-3 w-3" />Save</>}
                    </Button>
                  </div>
                  <div className="p-5">
                    {isLong ? (
                      <Textarea
                        value={content[key] ?? ''}
                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                        rows={5}
                        className="font-mono text-sm resize-y"
                      />
                    ) : (
                      <Input
                        value={content[key] ?? ''}
                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                        className="font-mono text-sm"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
