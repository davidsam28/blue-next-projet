import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDonationSourceLabel } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: donations, error } = await supabase
    .from('donation_records')
    .select('*, donor:donors(first_name, last_name, email, phone)')
    .order('donation_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }

  const headers = [
    'Date', 'Donor First Name', 'Donor Last Name', 'Email', 'Phone',
    'Amount', 'Source', 'Status', 'Stripe Payment ID', 'Notes',
  ]

  const rows = (donations ?? []).map((d) => [
    new Date(d.donation_date).toLocaleDateString('en-US'),
    d.donor?.first_name ?? '',
    d.donor?.last_name ?? '',
    d.donor?.email ?? '',
    d.donor?.phone ?? '',
    d.amount.toFixed(2),
    getDonationSourceLabel(d.source),
    d.status,
    d.stripe_payment_intent_id ?? '',
    (d.notes ?? '').replace(/"/g, '""'),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const filename = `donations-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
