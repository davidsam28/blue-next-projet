import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm'

export const metadata: Metadata = { title: 'Settings — Admin' }

async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
  return Object.fromEntries((data ?? []).map((s) => [s.key, s.value]))
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update payment info, social media links, contact details, and account security.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <SettingsForm settings={settings} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
          Account Security
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Change your admin password. You will stay logged in after changing.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
