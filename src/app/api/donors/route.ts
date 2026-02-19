import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/donors — list all donors
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '50') || 50, 1), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0') || 0, 0)

  let query = supabase
    .from('donors')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}

// POST /api/donors — create a donor
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { firstName, lastName, email, phone, notes } = body

  if (!firstName?.trim()) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('donors')
    .insert({
      first_name: firstName.trim(),
      last_name: lastName?.trim() ?? '',
      email: email?.trim() ?? null,
      phone: phone?.trim() ?? null,
      notes: notes?.trim() ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A donor with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create donor' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
