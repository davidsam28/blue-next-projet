import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }

  const headers = [
    'First Name', 'Last Name', 'Email', 'Phone', 'Age',
    'School', 'City', 'State', 'Status', 'Experience',
    'Interests', 'Created At',
  ]

  const rows = (enrollments ?? []).map((e) => [
    e.first_name ?? '',
    e.last_name ?? '',
    e.email ?? '',
    e.phone ?? '',
    e.age != null ? String(e.age) : '',
    e.school ?? '',
    e.city ?? '',
    e.state ?? '',
    e.status ?? '',
    e.experience_level ?? '',
    Array.isArray(e.interests) ? e.interests.join('; ') : '',
    e.created_at ? new Date(e.created_at).toLocaleDateString('en-US') : '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const filename = `enrollments-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
