import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { settings } = body

  if (!Array.isArray(settings)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const upserts = settings.map((s: { key: string; value: string }) => ({
    key: s.key,
    value: s.value ?? '',
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  }))

  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) {
    console.error('[POST /api/settings]', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
