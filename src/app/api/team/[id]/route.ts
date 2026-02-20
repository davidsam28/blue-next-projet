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

  // Whitelist allowed fields
  const allowed: Record<string, unknown> = {}
  if (body.name !== undefined) allowed.name = body.name
  if (body.title !== undefined) allowed.title = body.title
  if (body.bio !== undefined) allowed.bio = body.bio
  if (body.image_url !== undefined) allowed.image_url = body.image_url
  if (body.display_order !== undefined) allowed.display_order = body.display_order
  if (body.is_active !== undefined) allowed.is_active = body.is_active

  const { data, error } = await supabase
    .from('team_members')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  revalidatePath('/team')
  revalidatePath('/admin/team')
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
  const { error } = await supabase.from('team_members').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  revalidatePath('/team')
  revalidatePath('/admin/team')
  return NextResponse.json({ success: true })
}
