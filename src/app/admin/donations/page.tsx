import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { DonationTable } from '@/components/admin/DonationTable'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Donations — Admin' }

async function getDonations(source?: string, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('donation_records')
    .select('*, donor:donors(id, first_name, last_name, email)', { count: 'exact' })
    .order('donation_date', { ascending: false })
    .limit(100)

  if (source && source !== 'all') query = query.eq('source', source)
  if (status && status !== 'all') query = query.eq('status', status)

  const { data, count } = await query

  const total = (data ?? []).filter(d => d.status === 'completed').reduce((s, d) => s + Number(d.amount), 0)

  return { donations: data ?? [], count: count ?? 0, total }
}

interface PageProps {
  searchParams: Promise<{ source?: string; status?: string }>
}

export default async function DonationsPage({ searchParams }: PageProps) {
  const { source, status } = await searchParams
  const { donations, count, total } = await getDonations(source, status)

  const filters = [
    { key: 'source', options: [{ v: 'all', l: 'All Sources' }, { v: 'stripe', l: 'Stripe' }, { v: 'zelle', l: 'Zelle' }, { v: 'cashapp', l: 'Cash App' }] },
    { key: 'status', options: [{ v: 'all', l: 'All Statuses' }, { v: 'completed', l: 'Completed' }, { v: 'pending', l: 'Pending' }, { v: 'failed', l: 'Failed' }] },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-500 text-sm mt-1">
            {count} total donations — <span className="font-semibold text-[#0033FF]">{formatCurrency(total)}</span> raised
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href="/api/donations/export" download>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </a>
          </Button>
          <Button asChild size="sm" className="bg-[#0033FF] hover:bg-[#001A80] text-white gap-1.5">
            <Link href="/admin/donations/new">
              <Plus className="h-3.5 w-3.5" />
              Log Donation
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {filter.key}:
            </span>
            <div className="flex gap-1">
              {filter.options.map((opt) => {
                const current = filter.key === 'source' ? (source ?? 'all') : (status ?? 'all')
                const isActive = current === opt.v
                const params = new URLSearchParams({
                  ...(source && { source }),
                  ...(status && { status }),
                  [filter.key]: opt.v,
                })
                return (
                  <Link
                    key={opt.v}
                    href={`/admin/donations?${params.toString()}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0033FF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.l}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <DonationTable donations={donations as Parameters<typeof DonationTable>[0]['donations']} />
      </div>
    </div>
  )
}
