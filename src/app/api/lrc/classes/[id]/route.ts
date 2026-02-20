import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Handle section updates separately
  if (body.sections !== undefined) {
    // Delete existing sections and re-insert
    await supabase.from('lrc_class_sections').delete().eq('class_id', id)
    if (body.sections.length > 0) {
      const sectionsToInsert = body.sections.map((s: Record<string, unknown>, i: number) => ({
        class_id: id,
        title: s.title || 'Untitled Section',
        content: s.content ?? null,
        content_type: s.content_type ?? 'reading',
        video_url: s.video_url ?? null,
        sort_order: i,
      }))
      await supabase.from('lrc_class_sections').insert(sectionsToInsert)
    }
  }

  const allowed: Record<string, unknown> = {}
  const fields = [
    'title', 'slug', 'description', 'cover_image', 'category',
    'author', 'difficulty', 'duration_minutes', 'status', 'is_featured',
    'sort_order', 'published_at',
  ]
  for (const f of fields) {
    if (body[f] !== undefined) allowed[f] = body[f]
  }

  if (body.status === 'published' && !body.published_at) {
    allowed.published_at = new Date().toISOString()
  }

  // Only update class fields if there are any
  if (Object.keys(allowed).length > 0) {
    const { data, error } = await supabase
      .from('lrc_classes')
      .update(allowed)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })

    revalidatePath('/learn')
    revalidatePath('/admin/lrc')
    if (data?.slug) revalidatePath(`/learn/classes/${data.slug}`)
    return NextResponse.json({ data })
  }

  revalidatePath('/learn')
  revalidatePath('/admin/lrc')
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from('lrc_classes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  revalidatePath('/learn')
  revalidatePath('/admin/lrc')
  return NextResponse.json({ success: true })
}
