#!/usr/bin/env node
/**
 * One-time migration: Rename old site_content keys to new keys used by
 * the rewritten public pages and WebsiteEditor.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const migrations = [
  { from: { page: 'about', section: 'page_title' }, to: { page: 'about', section: 'about_hero_headline' } },
  { from: { page: 'about', section: 'approach_body' }, to: { page: 'about', section: 'methodology_subtext' } },
  { from: { page: 'about', section: 'approach_title' }, to: { page: 'about', section: 'methodology_headline' } },
  { from: { page: 'donate', section: 'page_title' }, to: { page: 'donate', section: 'donate_headline' } },
  { from: { page: 'donate', section: 'page_subtitle' }, to: { page: 'donate', section: 'donate_subheadline' } },
  { from: { page: 'contact', section: 'page_title' }, to: { page: 'contact', section: 'contact_hero_headline' } },
]

const orphanedKeys = [
  { page: 'about', section: 'page_title' },
  { page: 'about', section: 'page_subtitle' },
  { page: 'about', section: 'mission_title' },
  { page: 'about', section: 'mission_body' },
  { page: 'about', section: 'vision_title' },
  { page: 'about', section: 'vision_body' },
  { page: 'about', section: 'approach_title' },
  { page: 'about', section: 'approach_body' },
  { page: 'contact', section: 'page_title' },
  { page: 'contact', section: 'page_subtitle' },
  { page: 'donate', section: 'page_title' },
  { page: 'donate', section: 'page_subtitle' },
  { page: 'donate', section: 'impact_note' },
]

async function main() {
  console.log('=== MIGRATING OLD KEYS TO NEW ===')
  for (const m of migrations) {
    const { data: old } = await supabase
      .from('site_content')
      .select('content, content_type')
      .eq('page', m.from.page)
      .eq('section', m.from.section)
      .single()

    if (!old) {
      console.log(`  SKIP (no data): ${m.from.page}::${m.from.section}`)
      continue
    }

    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('page', m.to.page)
      .eq('section', m.to.section)
      .single()

    if (existing) {
      console.log(`  SKIP (new key exists): ${m.to.page}::${m.to.section}`)
      continue
    }

    const { error } = await supabase
      .from('site_content')
      .upsert({
        page: m.to.page,
        section: m.to.section,
        content: old.content,
        content_type: old.content_type || 'text',
      }, { onConflict: 'page,section' })

    if (error) {
      console.log(`  ERROR: ${m.to.page}::${m.to.section} — ${error.message}`)
    } else {
      console.log(`  MIGRATED: ${m.from.page}::${m.from.section} -> ${m.to.page}::${m.to.section}`)
    }
  }

  console.log('\n=== CLEANING UP ORPHANED KEYS ===')
  for (const k of orphanedKeys) {
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('page', k.page)
      .eq('section', k.section)

    if (error) {
      console.log(`  ERROR: ${k.page}::${k.section} — ${error.message}`)
    } else {
      console.log(`  DELETED: ${k.page}::${k.section}`)
    }
  }

  console.log('\n=== FINAL DB STATE ===')
  const { data: final } = await supabase
    .from('site_content')
    .select('page, section, content')
    .order('page')
    .order('section')

  for (const r of final || []) {
    const preview = r.content?.substring(0, 60) || '(empty)'
    console.log(`  [${r.page}] ${r.section} => ${preview}`)
  }

  console.log('\nDone!')
}

main().catch(console.error)
