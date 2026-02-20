import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase.from('lrc_classes').select('*')

  if (!user) {
    query = query.eq('status', 'published')
  } else if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('sort_order').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('lrc_classes')
    .insert({
      title: body.title.trim(),
      slug: body.slug?.trim() || slugify(body.title),
      description: body.description ?? null,
      cover_image: body.cover_image ?? null,
      category: body.category ?? null,
      author: body.author ?? null,
      difficulty: body.difficulty ?? 'beginner',
      duration_minutes: body.duration_minutes ?? null,
      status: body.status ?? 'draft',
      is_featured: body.is_featured ?? false,
      sort_order: body.sort_order ?? 0,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  revalidatePath('/learn')
  revalidatePath('/admin/lrc')
  return NextResponse.json({ data }, { status: 201 })
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
