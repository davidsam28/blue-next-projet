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

  const allowed: Record<string, unknown> = {}
  const fields = [
    'title', 'slug', 'excerpt', 'content', 'cover_image', 'category',
    'tags', 'author', 'read_time_minutes', 'status', 'is_featured',
    'sort_order', 'published_at',
  ]
  for (const f of fields) {
    if (body[f] !== undefined) allowed[f] = body[f]
  }

  // Auto-set published_at when publishing
  if (body.status === 'published' && !body.published_at) {
    allowed.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('lrc_posts')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  revalidatePath('/learn')
  revalidatePath('/admin/lrc')
  if (data?.slug) revalidatePath(`/learn/posts/${data.slug}`)
  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from('lrc_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  revalidatePath('/learn')
  revalidatePath('/admin/lrc')
  return NextResponse.json({ success: true })
}
