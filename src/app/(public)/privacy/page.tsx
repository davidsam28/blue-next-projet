export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the Blue Next Project — how we collect, use, and protect your information.',
}

async function getPrivacyContent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'legal')
    .eq('section', 'privacy_policy')
    .single()
  return data?.content ?? null
}

export default async function PrivacyPolicyPage() {
  const content = await getPrivacyContent()

  return (
    <>
      {/* Header */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-white/60 mt-4 text-lg">
            Last updated: February 20, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {content ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-[#0033FF]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-[#0033FF]">
              <p>
                Blue Next Project (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a Chicago-based 501(c)(3) nonprofit
                organization committed to protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our website,
                participate in our programs, or interact with us.
              </p>

              <h2>1. Information We Collect</h2>
              <h3>Information You Provide Directly</h3>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address when you contact us or enroll in programs.</li>
                <li><strong>Enrollment Data:</strong> Age, school, interests, experience level, and creative portfolio links submitted through our enrollment forms.</li>
                <li><strong>Donation Information:</strong> Name and email associated with donations. Payment processing is handled securely by Stripe; we do not store credit card numbers.</li>
                <li><strong>Communications:</strong> Messages, feedback, and other content you send to us.</li>
              </ul>

              <h3>Information Collected Automatically</h3>
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, referring URLs, and general browsing patterns.</li>
                <li><strong>Device Information:</strong> Browser type, operating system, and screen resolution.</li>
                <li><strong>Cookies:</strong> We use essential cookies to ensure our website functions properly. See Section 5 for details.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process program enrollments and communicate about our programs.</li>
                <li>Respond to inquiries and provide support.</li>
                <li>Process and acknowledge donations.</li>
                <li>Send updates about our programs, events, and organizational news (with your consent).</li>
                <li>Improve our website, programs, and services.</li>
                <li>Comply with legal obligations and protect our rights.</li>
              </ul>

              <h2>3. How We Share Your Information</h2>
              <p>
                We do not sell, rent, or trade your personal information. We may share information with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Trusted third parties that help us operate our website and programs (e.g., Stripe for payment processing, Resend for email delivery, Supabase for data hosting).</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation.</li>
                <li><strong>Organizational Transfers:</strong> In connection with a merger, acquisition, or asset transfer, with notice to affected individuals.</li>
              </ul>

              <h2>4. Donor Privacy</h2>
              <p>
                We respect the privacy of our donors. Donor information, including names, addresses, and
                donation amounts, is kept confidential. We do not share or sell donor lists. Donors may
                choose to remain anonymous. We will only use donor information to process donations, send
                acknowledgments, and provide tax receipts as required by law.
              </p>

              <h2>5. Cookies and Tracking</h2>
              <p>
                Our website uses essential cookies necessary for authentication and site functionality. We
                do not use third-party advertising cookies. You can control cookies through your browser
                settings, though disabling them may affect certain features of our website.
              </p>

              <h2>6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information, including
                encrypted data transmission (TLS/SSL), secure data storage, access controls, and regular
                security assessments. However, no method of electronic storage or transmission is 100%
                secure, and we cannot guarantee absolute security.
              </p>

              <h2>7. Children&apos;s Privacy</h2>
              <p>
                Our programs serve youth, and we take children&apos;s privacy seriously. We collect only the
                information necessary to facilitate program participation. For participants under 13, we
                require parental or guardian consent before collecting personal information, in compliance
                with the Children&apos;s Online Privacy Protection Act (COPPA). Parents or guardians may
                contact us to review, update, or delete their child&apos;s information.
              </p>

              <h2>8. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion of your personal information.</li>
                <li>Opt out of promotional communications at any time.</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the information below.
              </p>

              <h2>9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the
                privacy practices or content of those sites. We encourage you to review the privacy
                policies of any third-party sites you visit.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page
                with an updated effective date. We encourage you to review this policy periodically.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please
                contact us:
              </p>
              <ul>
                <li><strong>Email:</strong> partnerships@bluenextproject.org</li>
                <li><strong>Phone:</strong> 708-929-8745</li>
                <li><strong>Address:</strong> 7411 S. Stony Island Ave., Chicago, IL 60649</li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
