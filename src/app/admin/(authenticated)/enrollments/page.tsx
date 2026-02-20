import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EnrollmentsManager } from '@/components/admin/EnrollmentsManager'

export const metadata: Metadata = { title: 'Enrollments — Admin' }

async function getEnrollments() {
  const supabase = await createClient()

  const { data, count } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(200)

  return { enrollments: data ?? [], count: count ?? 0 }
}

export default async function EnrollmentsPage() {
  const { enrollments, count } = await getEnrollments()

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {count} total application{count !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <> — <span className="font-semibold text-yellow-600">{pendingCount} pending review</span></>
            )}
          </p>
        </div>
      </div>

      <EnrollmentsManager initialEnrollments={enrollments} />
    </div>
  )
}
