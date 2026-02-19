import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TeamManager } from '@/components/admin/TeamManager'

export const metadata: Metadata = { title: 'Team Members — Admin' }

async function getTeam() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order')
  return data ?? []
}

export default async function AdminTeamPage() {
  const team = await getTeam()
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-500 text-sm mt-1">Manage the staff and leadership profiles shown on the public Team page.</p>
      </div>
      <TeamManager initialTeam={team} />
    </div>
  )
}
