import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: donors, error } = await supabase
    .from('donors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 })
  }

  const headers = ['Name', 'Email', 'Phone', 'Notes', 'Created At']

  const rows = (donors ?? []).map((d) => [
    [d.first_name, d.last_name].filter(Boolean).join(' '),
    d.email ?? '',
    d.phone ?? '',
    (d.notes ?? '').replace(/"/g, '""'),
    d.created_at ? new Date(d.created_at).toLocaleDateString('en-US') : '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const filename = `donors-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
