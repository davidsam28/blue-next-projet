import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProgramsManager } from '@/components/admin/ProgramsManager'

export const metadata: Metadata = { title: 'Programs — Admin' }

async function getPrograms() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('programs')
    .select('*')
    .order('display_order')
  return data ?? []
}

export default async function AdminProgramsPage() {
  const programs = await getPrograms()
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        <p className="text-gray-500 text-sm mt-1">Manage the programs displayed on the public Programs page.</p>
      </div>
      <ProgramsManager initialPrograms={programs} />
    </div>
  )
}
