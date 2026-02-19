import { Metadata } from 'next'
import { EmailComposer } from '@/components/admin/EmailComposer'

export const metadata: Metadata = { title: 'Email Donors — Admin' }

export default function EmailsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Donors</h1>
        <p className="text-gray-500 text-sm mt-1">
          Send messages to your donor community. Use <code className="bg-gray-100 px-1 rounded text-xs">{`{{first_name}}`}</code> for personalization.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <EmailComposer />
      </div>
    </div>
  )
}
