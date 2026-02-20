import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/enrollments/:id — admin: update enrollment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // Whitelist allowed fields
  const allowed: Record<string, unknown> = {}

  if (body.status !== undefined) {
    const validStatuses = ['pending', 'approved', 'enrolled', 'waitlisted', 'declined']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    allowed.status = body.status
    allowed.reviewed_by = user.id
    allowed.reviewed_at = new Date().toISOString()
  }

  if (body.additional_notes !== undefined) allowed.additional_notes = body.additional_notes

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('enrollments')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/enrollments/:id]', error)
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }

  revalidatePath('/admin/enrollments')

  return NextResponse.json({ data })
}

// DELETE /api/enrollments/:id — admin: remove enrollment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { error } = await supabase.from('enrollments').delete().eq('id', id)

  if (error) {
    console.error('[DELETE /api/enrollments/:id]', error)
    return NextResponse.json({ error: 'Failed to delete enrollment' }, { status: 500 })
  }

  revalidatePath('/admin/enrollments')

  return NextResponse.json({ success: true })
}
