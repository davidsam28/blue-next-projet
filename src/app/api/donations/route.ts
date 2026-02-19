import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/donations — admin: list all donations with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '50') || 50, 1), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0') || 0, 0)

  let query = supabase
    .from('donation_records')
    .select(`
      *,
      donor:donors(id, first_name, last_name, email, phone)
    `, { count: 'exact' })
    .order('donation_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (source) query = query.eq('source', source)
  if (status) query = query.eq('status', status)
  if (from) query = query.gte('donation_date', from)
  if (to) query = query.lte('donation_date', to)

  const { data, count, error } = await query

  if (error) {
    console.error('[GET /api/donations]', error)
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}

// POST /api/donations — admin: manually record a Zelle or Cash App donation
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { donorId, amount, source, notes, donationDate, donorData } = body

  // Validate
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }
  if (!source || !['zelle', 'cashapp'].includes(source)) {
    return NextResponse.json({ error: 'Source must be zelle or cashapp' }, { status: 400 })
  }

  let resolvedDonorId = donorId ?? null

  // If no donor ID but donor data provided, upsert donor
  if (!resolvedDonorId && donorData?.email) {
    const { data: existing } = await supabase
      .from('donors')
      .select('id')
      .eq('email', donorData.email)
      .single()

    if (existing) {
      resolvedDonorId = existing.id
    } else if (donorData.firstName) {
      const { data: newDonor } = await supabase
        .from('donors')
        .insert({
          first_name: donorData.firstName,
          last_name: donorData.lastName ?? '',
          email: donorData.email,
          phone: donorData.phone ?? null,
        })
        .select('id')
        .single()
      resolvedDonorId = newDonor?.id ?? null
    }
  }

  const { data, error } = await supabase
    .from('donation_records')
    .insert({
      donor_id: resolvedDonorId,
      amount,
      source,
      status: 'completed',
      notes: notes ?? null,
      recorded_by: user.id,
      donation_date: donationDate ?? new Date().toISOString(),
    })
    .select('*, donor:donors(*)')
    .single()

  if (error) {
    console.error('[POST /api/donations]', error)
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
