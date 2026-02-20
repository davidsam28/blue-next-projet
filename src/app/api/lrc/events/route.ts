import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase.from('lrc_events').select('*')

  if (!user) {
    query = query.eq('status', 'published')
  } else if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('event_date', { ascending: true }).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
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
    .from('lrc_events')
    .insert({
      title: body.title.trim(),
      slug: body.slug?.trim() || slugify(body.title),
      description: body.description ?? null,
      cover_image: body.cover_image ?? null,
      location: body.location ?? null,
      event_date: body.event_date ?? null,
      end_date: body.end_date ?? null,
      registration_url: body.registration_url ?? null,
      status: body.status ?? 'draft',
      is_featured: body.is_featured ?? false,
      sort_order: body.sort_order ?? 0,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
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
