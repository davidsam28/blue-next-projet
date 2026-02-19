import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('programs').select('*').order('display_order')
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, description, displayOrder } = body

  if (!name?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('programs')
    .insert({ name: name.trim(), description: description.trim(), display_order: displayOrder ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
