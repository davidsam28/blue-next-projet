import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { page, section, content, contentType } = body

  if (!page?.trim() || !section?.trim()) {
    return NextResponse.json({ error: 'Page and section are required' }, { status: 400 })
  }
  if (content === undefined || content === null) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('site_content')
    .upsert({
      page,
      section,
      content,
      content_type: contentType ?? 'text',
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'page,section' })

  if (error) {
    console.error('[PATCH /api/content]', error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
