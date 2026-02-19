import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/HeroSection'
import { MissionSection } from '@/components/home/MissionSection'
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
  const { contentMap } = await getHomeContent()

  const stats = [
    {
      number: contentMap.impact_stat_1_number ?? '150+',
      label: contentMap.impact_stat_1_label ?? 'Annual Youth Participants',
    },
    {
      number: contentMap.impact_stat_2_number ?? '92%',
      label: contentMap.impact_stat_2_label ?? 'Creative Skill Advancement',
    },
    {
      number: contentMap.impact_stat_3_number ?? '100%',
      label: contentMap.impact_stat_3_label ?? 'Safe Creative Environment',
    },
  ]

  return (
    <>
      <HeroSection
        headline={contentMap.hero_headline ?? 'Amplify the Next Creative'}
        subheadline={contentMap.hero_subheadline ?? 'Through trauma-informed training and career-focused programs, Blue Next Project equips Chicago youth with technical skills and industry guidance to tell their own stories and thrive in the digital media world.'}
        ctaPrimary={contentMap.hero_cta_primary ?? 'Partner With Us'}
        ctaSecondary={contentMap.hero_cta_secondary ?? 'Our Programs'}
      />
      <MissionSection
        title={contentMap.mission_title ?? 'Our Programs'}
        body={contentMap.mission_body ?? 'Advancing Chicago youth through media arts and audio production.'}
        stats={stats}
      />
      <DonateCTA
        impactNote={contentMap.impact_note ?? 'We collaborate with grant funders, foundations, and community organizations to expand opportunities in media arts.'}
      />
    </>
  )
}
