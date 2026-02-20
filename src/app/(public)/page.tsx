export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/HeroSection'
import { MissionSection } from '@/components/home/MissionSection'
import { LRCShowcase } from '@/components/home/LRCShowcase'
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

async function getLRCItems() {
  const supabase = await createClient()

  // Fetch latest published items from each LRC table (gracefully handle tables not existing yet)
  const results = await Promise.allSettled([
    supabase.from('lrc_posts').select('id, title, slug, excerpt, cover_image, category, published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
    supabase.from('lrc_classes').select('id, title, slug, description, cover_image, category, published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
    supabase.from('lrc_resources').select('id, title, slug, description, cover_image, category, published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
    supabase.from('lrc_events').select('id, title, slug, description, cover_image, category, published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
  ])

  const items: { id: string; title: string; slug: string; excerpt?: string; description?: string; cover_image?: string; category?: string; published_at?: string; type: 'post' | 'class' | 'resource' | 'event' }[] = []

  const types = ['post', 'class', 'resource', 'event'] as const
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.data) {
      for (const row of result.value.data) {
        items.push({ ...row, type: types[i] })
      }
    }
  })

  // Sort by published_at desc, take top 6
  items.sort((a, b) => {
    const da = a.published_at ? new Date(a.published_at).getTime() : 0
    const db = b.published_at ? new Date(b.published_at).getTime() : 0
    return db - da
  })

  return items.slice(0, 6)
}

export default async function HomePage() {
  const [{ contentMap }, lrcItems] = await Promise.all([
    getHomeContent(),
    getLRCItems(),
  ])

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
        heroImage={contentMap.hero_image}
      />
      <MissionSection
        title={contentMap.mission_title ?? 'Our Programs'}
        body={contentMap.mission_body ?? 'Advancing Chicago youth through media arts and audio production.'}
        stats={stats}
        nextGenImage={contentMap.next_gen_image}
        marqueeItems={contentMap.marquee_text?.split(',').map((s: string) => s.trim()).filter(Boolean)}
      />
      <LRCShowcase items={lrcItems} />
      <DonateCTA
        impactNote={contentMap.impact_note ?? 'We collaborate with grant funders, foundations, and community organizations to expand opportunities in media arts.'}
        partnerImage={contentMap.partner_image}
      />
    </>
  )
}
