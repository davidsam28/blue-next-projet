import { Metadata } from 'next'
import { ManualDonationForm } from '@/components/admin/ManualDonationForm'

export const metadata: Metadata = { title: 'Log Donation — Admin' }

export default function NewDonationPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log Manual Donation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Record a Zelle or Cash App donation received outside of Stripe.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <ManualDonationForm />
      </div>
    </div>
  )
}
