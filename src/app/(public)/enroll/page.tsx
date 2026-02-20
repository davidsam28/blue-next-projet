export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { EnrollmentForm } from '@/components/enroll/EnrollmentForm'

export const metadata: Metadata = {
  title: 'Enroll — Blue Next Project',
  description: 'Join our media arts programs. Apply for enrollment in Audio Production, Film, Photography, Music, Digital Media, and Graphic Design.',
}

export default function EnrollPage() {
  return (
    <>
      {/* Hero header */}
      <section className="bg-black py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-black text-[#0033FF] uppercase tracking-[0.2em] mb-6 block">
            Student Enrollment
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-6">
            Join Our Programs
          </h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            Ready to explore your creative potential? Fill out the form below to apply for our
            media arts programs. We&apos;ll review your application and be in touch soon.
          </p>
        </div>
      </section>

      {/* Enrollment Form */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F7F7F7] rounded-2xl p-6 sm:p-10">
            <EnrollmentForm />
          </div>
        </div>
      </section>
    </>
  )
}
