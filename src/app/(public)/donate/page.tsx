import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { DonationForm } from '@/components/donate/DonationForm'
import { ZelleInfo } from '@/components/donate/ZelleInfo'
import { CashAppInfo } from '@/components/donate/CashAppInfo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Shield, Heart, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Blue Next Projet\'s trauma-informed media arts programming. Donate via credit card (Stripe), Zelle, or Cash App.',
}

async function getDonateSettings() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['cashapp_cashtag', 'cashapp_qr_url', 'zelle_recipient', 'zelle_instructions'])

  const { data: content } = await supabase
    .from('site_content')
    .select('section, content')
    .eq('page', 'donate')

  const settingsMap = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]))
  const contentMap = Object.fromEntries((content ?? []).map((c) => [c.section, c.content]))

  return { settingsMap, contentMap }
}

const WHY_GIVE = [
  { icon: Heart, text: '100% of donations fund direct programming and community services.' },
  { icon: Shield, text: 'Blue Next Projet is a registered 501(c)(3) nonprofit organization.' },
  { icon: CheckCircle2, text: 'All donations are tax-deductible to the extent permitted by law.' },
  { icon: CheckCircle2, text: 'Every donor receives an official receipt via email.' },
]

export default async function DonatePage() {
  const { settingsMap, contentMap } = await getDonateSettings()

  return (
    <>
      <PageHeader
        accent="Give Today"
        title={contentMap.page_title ?? 'Support Our Mission'}
        subtitle={contentMap.page_subtitle ?? 'Your generosity powers trauma-informed healing through media arts'}
      />

      <section className="section-padding bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Left: why give */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#001A80] mb-4">Why Give?</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {contentMap.impact_note ?? 'Every dollar you donate directly supports programming, resources, and outreach for individuals and communities impacted by trauma.'}
                </p>
                <div className="space-y-3">
                  {WHY_GIVE.map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-[#0033FF] shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Impact levels */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Impact</h3>
                <div className="space-y-3">
                  {[
                    { amount: '$25', impact: 'Art supplies for one participant' },
                    { amount: '$50', impact: 'One full workshop session' },
                    { amount: '$100', impact: 'Complete program cycle for one person' },
                    { amount: '$250', impact: 'Community screening or exhibition' },
                    { amount: '$500+', impact: 'Full program sponsorship' },
                  ].map((item) => (
                    <div key={item.amount} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#0033FF] w-12 shrink-0">{item.amount}</span>
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-sm text-gray-500 text-right">{item.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: donation form with tabs */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="brand-gradient px-7 py-5">
                  <h2 className="text-xl font-bold text-white">Choose Your Payment Method</h2>
                  <p className="text-blue-100/80 text-sm mt-1">All methods are secure and tracked in our system.</p>
                </div>

                <div className="p-7">
                  <Tabs defaultValue="card" className="space-y-6">
                    <TabsList className="w-full grid grid-cols-3 h-11 bg-gray-100 p-1 rounded-xl">
                      <TabsTrigger value="card" className="gap-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0033FF] data-[state=active]:shadow-sm rounded-lg">
                        <CreditCard className="h-3.5 w-3.5" />
                        Card / Online
                      </TabsTrigger>
                      <TabsTrigger value="zelle" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0033FF] data-[state=active]:shadow-sm rounded-lg">
                        Zelle
                      </TabsTrigger>
                      <TabsTrigger value="cashapp" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#00D632] data-[state=active]:shadow-sm rounded-lg">
                        Cash App
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="card" className="mt-0">
                      <DonationForm />
                    </TabsContent>

                    <TabsContent value="zelle" className="mt-0">
                      <ZelleInfo
                        recipient={settingsMap.zelle_recipient ?? 'donations@bluenextprojet.org'}
                        instructions={settingsMap.zelle_instructions ?? 'Send your donation via Zelle to the email address above. Please include your name in the memo field.'}
                      />
                    </TabsContent>

                    <TabsContent value="cashapp" className="mt-0">
                      <CashAppInfo
                        cashtag={settingsMap.cashapp_cashtag ?? '$YourCashTag'}
                        qrUrl={settingsMap.cashapp_qr_url || undefined}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
