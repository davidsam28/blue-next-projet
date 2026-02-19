import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/HeroSection'
import { MissionSection } from '@/components/home/MissionSection'
import { SocialFeedSection } from '@/components/home/SocialFeedSection'
import { DonateCTA } from '@/components/home/DonateCTA'

async function getHomeContent() {
  const supabase = await createClient()

  const { data: content } = await supabase
    .from('site_content')
    .select('section, content')
    .eq('page', 'home')

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['instagram_handle', 'facebook_url'])

  const contentMap = Object.fromEntries(
    (content ?? []).map((c) => [c.section, c.content])
  )
  const settingsMap = Object.fromEntries(
    (settings ?? []).map((s) => [s.key, s.value])
  )

  return { contentMap, settingsMap }
}

export default async function HomePage() {
  const { contentMap, settingsMap } = await getHomeContent()

  const stats = [
    {
      number: contentMap.impact_stat_1_number ?? '500+',
      label: contentMap.impact_stat_1_label ?? 'Individuals Served',
    },
    {
      number: contentMap.impact_stat_2_number ?? '12+',
      label: contentMap.impact_stat_2_label ?? 'Community Programs',
    },
    {
      number: contentMap.impact_stat_3_number ?? '5+',
      label: contentMap.impact_stat_3_label ?? 'Years of Service',
    },
  ]

  return (
    <>
      <HeroSection
        headline={contentMap.hero_headline ?? 'Healing Through Creative Expression'}
        subheadline={contentMap.hero_subheadline ?? 'Blue Next Projet harnesses the power of media arts to support trauma-informed healing and community empowerment.'}
        ctaPrimary={contentMap.hero_cta_primary ?? 'Make a Donation'}
        ctaSecondary={contentMap.hero_cta_secondary ?? 'Learn About Our Work'}
      />
      <MissionSection
        title={contentMap.mission_title ?? 'Our Mission'}
        body={contentMap.mission_body ?? 'Blue Next Projet is a nonprofit organization dedicated to the intersection of trauma-informed care and media arts.'}
        stats={stats}
      />
      <SocialFeedSection
        instagramHandle={settingsMap.instagram_handle || undefined}
        facebookUrl={settingsMap.facebook_url || undefined}
      />
      <DonateCTA
        impactNote={contentMap.impact_note ?? 'Every dollar you donate directly supports programming, resources, and outreach for individuals and communities impacted by trauma.'}
      />
    </>
  )
}
