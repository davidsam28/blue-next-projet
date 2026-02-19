import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.name?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: 'Name and title are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name: body.name.trim(),
      title: body.title.trim(),
      bio: body.bio ?? null,
      image_url: body.image_url ?? null,
      display_order: body.display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
