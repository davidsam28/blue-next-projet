export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for the Blue Next Project website and programs.',
}

async function getTermsContent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'legal')
    .eq('section', 'terms_of_service')
    .single()
  return data?.content ?? null
}

export default async function TermsOfServicePage() {
  const content = await getTermsContent()

  return (
    <>
      {/* Header */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Terms of Service</h1>
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
                Welcome to the Blue Next Project website. By accessing or using our website and
                services, you agree to be bound by these Terms of Service. If you do not agree to
                these terms, please do not use our website.
              </p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing this website, you acknowledge that you have read, understood, and agree
                to be bound by these Terms of Service and our Privacy Policy. We reserve the right to
                modify these terms at any time, and your continued use of the website constitutes
                acceptance of any changes.
              </p>

              <h2>2. Use of Services</h2>
              <p>
                You agree to use our website and services only for lawful purposes and in accordance
                with these terms. You agree not to:
              </p>
              <ul>
                <li>Use the website in any way that violates applicable laws or regulations.</li>
                <li>Attempt to gain unauthorized access to any part of the website or its systems.</li>
                <li>Interfere with or disrupt the website&apos;s functionality.</li>
                <li>Transmit any viruses, malware, or other harmful code.</li>
                <li>Submit false or misleading information through our forms.</li>
                <li>Use automated tools to scrape or collect data from the website without permission.</li>
              </ul>

              <h2>3. Program Enrollment</h2>
              <p>
                By submitting an enrollment application, you represent that the information provided is
                accurate and complete. Enrollment in our programs is subject to availability and our
                review process. We reserve the right to accept or decline any application at our
                discretion.
              </p>

              <h2>4. Donations</h2>
              <p>
                Donations made through our website are processed securely by Stripe. All donations to
                Blue Next Project are tax-deductible to the extent allowed by law as we are a
                registered 501(c)(3) nonprofit organization. Donation refund requests will be reviewed
                on a case-by-case basis. Please contact us if you need to request a refund.
              </p>

              <h2>5. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, audio, video, and
                software, is the property of Blue Next Project or its content providers and is
                protected by copyright and intellectual property laws. You may not reproduce,
                distribute, modify, or create derivative works from any content without our prior
                written consent.
              </p>

              <h2>6. User Content</h2>
              <p>
                By submitting content through our forms (including enrollment applications, contact
                messages, and creative portfolio links), you grant Blue Next Project a non-exclusive,
                royalty-free license to use, store, and process that content for the purpose of
                providing our services and programs.
              </p>

              <h2>7. Disclaimer of Warranties</h2>
              <p>
                Our website and services are provided on an &quot;as is&quot; and &quot;as available&quot; basis without
                warranties of any kind, either express or implied. We do not warrant that the website
                will be uninterrupted, error-free, or free of viruses or other harmful components.
              </p>

              <h2>8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Blue Next Project, its officers, directors,
                employees, and volunteers shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising from your use of or inability to use the
                website or services, even if we have been advised of the possibility of such damages.
              </p>

              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Blue Next Project and its officers, directors,
                employees, and volunteers from any claims, damages, or expenses arising from your use
                of the website, violation of these terms, or infringement of any third-party rights.
              </p>

              <h2>10. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites or services that are not owned or
                controlled by Blue Next Project. We are not responsible for the content, privacy
                policies, or practices of any third-party sites.
              </p>

              <h2>11. Changes to These Terms</h2>
              <p>
                We may revise these Terms of Service at any time by updating this page. Changes are
                effective immediately upon posting. We encourage you to review this page periodically
                for any changes.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of the
                State of Illinois, without regard to its conflict of law provisions. Any disputes
                arising under these terms shall be subject to the exclusive jurisdiction of the courts
                located in Cook County, Illinois.
              </p>

              <h2>13. Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please contact us:
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
