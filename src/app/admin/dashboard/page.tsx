import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/StatsCard'
import { DonationTable } from '@/components/admin/DonationTable'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Users, TrendingUp, CreditCard, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { data: allDonations },
    { count: totalDonors },
    { data: recentDonations },
  ] = await Promise.all([
    supabase
      .from('donation_records')
      .select('amount, source, status, donation_date')
      .eq('status', 'completed'),
    supabase
      .from('donors')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('donation_records')
      .select('*, donor:donors(id, first_name, last_name, email)')
      .eq('status', 'completed')
      .order('donation_date', { ascending: false })
      .limit(10),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const total = (allDonations ?? []).reduce((s, d) => s + Number(d.amount), 0)
  const monthly = (allDonations ?? [])
    .filter((d) => d.donation_date >= startOfMonth)
    .reduce((s, d) => s + Number(d.amount), 0)

  const stripeTotal = (allDonations ?? [])
    .filter((d) => d.source === 'stripe')
    .reduce((s, d) => s + Number(d.amount), 0)
  const zelleTotal = (allDonations ?? [])
    .filter((d) => d.source === 'zelle')
    .reduce((s, d) => s + Number(d.amount), 0)
  const cashappTotal = (allDonations ?? [])
    .filter((d) => d.source === 'cashapp')
    .reduce((s, d) => s + Number(d.amount), 0)

  return {
    total,
    monthly,
    totalDonors: totalDonors ?? 0,
    stripeTotal,
    zelleTotal,
    cashappTotal,
    recentDonations: recentDonations ?? [],
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of donations, donors, and site activity.</p>
      </div>

      {/* Stats row 1 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Raised"
          value={formatCurrency(stats.total)}
          icon={DollarSign}
        />
        <StatsCard
          label="This Month"
          value={formatCurrency(stats.monthly)}
          icon={TrendingUp}
        />
        <StatsCard
          label="Total Donors"
          value={stats.totalDonors.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          label="Stripe Revenue"
          value={formatCurrency(stats.stripeTotal)}
          icon={CreditCard}
        />
      </div>

      {/* Payment channel breakdown */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#E6EBFF] flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-[#0033FF]" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Stripe (Card)</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.stripeTotal)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <span className="text-purple-700 font-bold text-xs">Z</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">Zelle</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.zelleTotal)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <span className="text-green-700 font-bold text-sm">$</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">Cash App</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.cashappTotal)}</p>
        </div>
      </div>

      {/* Recent donations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Donations</h2>
          <Link
            href="/admin/donations"
            className="text-xs font-medium text-[#0033FF] hover:text-[#001A80] flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <DonationTable donations={stats.recentDonations as Parameters<typeof DonationTable>[0]['donations']} />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/donations/new', icon: DollarSign, label: 'Log Manual Donation', desc: 'Record a Zelle or Cash App donation' },
          { href: '/admin/emails', icon: Heart, label: 'Email Donors', desc: 'Send a message to your donor list' },
          { href: '/admin/settings', icon: Users, label: 'Update Settings', desc: 'Update CashApp tag, Zelle info, social links' },
        ].map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-[#0033FF]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E6EBFF] flex items-center justify-center group-hover:bg-[#0033FF] transition-colors">
                  <Icon className="h-4 w-4 text-[#0033FF] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
