'use client'

import { formatCurrency, formatDateShort, getDonationSourceLabel, getDonationStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DonationRecord } from '@/types'

interface DonationTableProps {
  donations: DonationRecord[]
  showDonor?: boolean
}

const SOURCE_BADGES: Record<string, string> = {
  stripe: 'bg-[#E6EBFF] text-[#0033FF]',
  zelle: 'bg-purple-50 text-purple-700',
  cashapp: 'bg-green-50 text-green-700',
}

export function DonationTable({ donations, showDonor = true }: DonationTableProps) {
  if (donations.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No donations found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Donations table">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
            {showDonor && <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Donor</th>}
            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Source</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {formatDateShort(donation.donation_date)}
              </td>
              {showDonor && (
                <td className="px-4 py-3">
                  {donation.donor ? (
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.donor.first_name} {donation.donor.last_name}
                      </p>
                      {donation.donor.email && (
                        <p className="text-xs text-gray-400">{donation.donor.email}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Anonymous</span>
                  )}
                </td>
              )}
              <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                {formatCurrency(donation.amount)}
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  SOURCE_BADGES[donation.source] ?? 'bg-gray-100 text-gray-600'
                )}>
                  {getDonationSourceLabel(donation.source)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  getDonationStatusColor(donation.status)
                )}>
                  {donation.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                {donation.notes ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
