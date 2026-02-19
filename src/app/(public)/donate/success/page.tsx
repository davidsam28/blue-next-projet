import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Thank You for Your Donation',
  description: 'Your donation to Blue Next Projet has been received. Thank you for supporting trauma-informed media arts.',
}

export default function DonationSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-20 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#E6EBFF] flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-[#0033FF]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0033FF] flex items-center justify-center">
              <Heart className="h-3 w-3 text-white fill-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#001A80] mb-3">
          Thank You for Your Generosity!
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-3">
          Your donation has been received and is already making a difference.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          A receipt has been sent to your email address. If you have any questions, please contact us at{' '}
          <a href="mailto:contact@bluenextprojet.org" className="text-[#0033FF] hover:underline">
            contact@bluenextprojet.org
          </a>
        </p>

        {/* Impact reminder */}
        <div className="bg-[#E6EBFF] rounded-2xl p-6 mb-8 text-left space-y-3">
          <h2 className="text-sm font-semibold text-[#001A80] uppercase tracking-wide">Your donation helps:</h2>
          {[
            'Provide trauma-informed media arts programming',
            'Equip participants with cameras, software, and supplies',
            'Fund community screenings and exhibitions',
            'Support trained facilitators and staff',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#0033FF] shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#0033FF] hover:bg-[#001A80] text-white gap-2">
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-[#0033FF]/30 text-[#0033FF] hover:bg-[#E6EBFF] gap-2">
            <Link href="/programs">
              Explore Our Programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
