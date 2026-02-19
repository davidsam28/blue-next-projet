import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateShort } from '@/lib/utils'
import { Users, Mail, Phone, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Donors — Admin' }

async function getDonors() {
  const supabase = await createClient()
  const { data, count } = await supabase
    .from('donors')
    .select('*, donation_records(amount, status)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  return { donors: data ?? [], count: count ?? 0 }
}

export default async function DonorsPage() {
  const { donors, count } = await getDonors()

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
          <p className="text-gray-500 text-sm mt-1">{count} total donors</p>
        </div>
      </div>

      {donors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No donors yet. Donors are created automatically when donations are received.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Donors table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total Given</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Donations</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">First Donated</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => {
                const completedDonations = (donor.donation_records as { amount: number; status: string }[] ?? [])
                  .filter((d) => d.status === 'completed')
                const totalGiven = completedDonations.reduce((s, d) => s + Number(d.amount), 0)

                return (
                  <tr key={donor.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E6EBFF] flex items-center justify-center shrink-0">
                          <span className="text-[#0033FF] font-semibold text-xs">
                            {donor.first_name?.[0]?.toUpperCase()}{donor.last_name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{donor.first_name} {donor.last_name}</p>
                          {donor.notes && <p className="text-xs text-gray-400 truncate max-w-xs">{donor.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {donor.email && (
                          <a href={`mailto:${donor.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0033FF] transition-colors">
                            <Mail className="h-3 w-3" />
                            {donor.email}
                          </a>
                        )}
                        {donor.phone && (
                          <a href={`tel:${donor.phone}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
                            <Phone className="h-3 w-3" />
                            {donor.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${totalGiven.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {completedDonations.length}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDateShort(donor.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
