'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from './ImageUpload'
import {
  Save, Loader2, Eye, RotateCcw, ChevronDown, ChevronUp,
  Home, Info, BookOpen, Phone, Heart, Layout, Search, ExternalLink, Scale,
} from 'lucide-react'
import type { SiteContent, SiteSetting } from '@/types'

interface WebsiteEditorProps {
  initialContent: SiteContent[]
  initialSettings: Record<string, string>
}

interface SectionConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'html'
  placeholder?: string
  description?: string
  imageFolder?: string
}

// Default values that match what the public site renders when DB has no entry
const DEFAULTS: Record<string, string> = {
  'home::hero_headline': 'Amplify the Next Creative',
  'home::hero_subheadline': 'Through trauma-informed training and career-focused programs, Blue Next Project equips Chicago youth with technical skills and industry guidance to tell their own stories and thrive in the digital media world.',
  'home::hero_image': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80',
  'home::hero_cta_primary': 'Partner With Us',
  'home::hero_cta_secondary': 'Our Programs',
  'home::mission_title': 'Our Programs',
  'home::mission_body': 'Advancing Chicago youth through media arts and audio production.',
  'home::impact_stat_1_number': '150+',
  'home::impact_stat_1_label': 'Annual Youth Participants',
  'home::impact_stat_2_number': '92%',
  'home::impact_stat_2_label': 'Creative Skill Advancement',
  'home::impact_stat_3_number': '100%',
  'home::impact_stat_3_label': 'Safe Creative Environment',
  'home::impact_note': 'We collaborate with grant funders, foundations, and community organizations to expand opportunities in media arts.',
}

const PAGE_CONFIGS: { id: string; label: string; icon: typeof Home; sections: SectionConfig[] }[] = [
  {
    id: 'home',
    label: 'Home Page',
    icon: Home,
    sections: [
      { key: 'hero_headline', label: 'Hero Headline', type: 'text', placeholder: 'Amplify the Next Creative' },
      { key: 'hero_subheadline', label: 'Hero Subheadline', type: 'textarea', placeholder: 'Through trauma-informed training...' },
      { key: 'hero_image', label: 'Hero Background Image', type: 'image', imageFolder: 'hero', description: 'Full-width background image for the hero section' },
      { key: 'hero_cta_primary', label: 'Primary CTA Text', type: 'text', placeholder: 'Partner With Us' },
      { key: 'hero_cta_secondary', label: 'Secondary CTA Text', type: 'text', placeholder: 'Our Programs' },
      { key: 'programs_headline', label: 'Programs Section Headline', type: 'text', placeholder: 'Advancing Chicago Youth...' },
      { key: 'programs_subtext', label: 'Programs Description', type: 'textarea' },
      { key: 'next_gen_headline', label: 'Next Gen Section Headline', type: 'text', placeholder: 'Developing the Next Generation...' },
      { key: 'next_gen_body', label: 'Next Gen Section Body', type: 'textarea' },
      { key: 'next_gen_image', label: 'Next Gen Section Image', type: 'image', imageFolder: 'home' },
      { key: 'impact_headline', label: 'Impact Section Headline', type: 'text' },
      { key: 'impact_body', label: 'Impact Section Body', type: 'textarea' },
      { key: 'impact_stat_1_number', label: 'Stat 1 Number', type: 'text', placeholder: '150+' },
      { key: 'impact_stat_1_label', label: 'Stat 1 Label', type: 'text', placeholder: 'Annual Youth Participants' },
      { key: 'impact_stat_2_number', label: 'Stat 2 Number', type: 'text', placeholder: '92%' },
      { key: 'impact_stat_2_label', label: 'Stat 2 Label', type: 'text', placeholder: 'Creative Skill Advancement' },
      { key: 'impact_stat_3_number', label: 'Stat 3 Number', type: 'text', placeholder: '100%' },
      { key: 'impact_stat_3_label', label: 'Stat 3 Label', type: 'text', placeholder: 'Safe Creative Environment' },
      { key: 'partner_headline', label: 'Partner CTA Headline', type: 'text', placeholder: 'Collaborate with Blue Next Project' },
      { key: 'partner_body', label: 'Partner CTA Body', type: 'textarea' },
      { key: 'partner_image', label: 'Partner CTA Background Image', type: 'image', imageFolder: 'home' },
      { key: 'marquee_text', label: 'Scrolling Marquee Items (comma separated)', type: 'text', description: 'e.g. Empowering Chicago Youth, Media Arts Education, ...' },
    ],
  },
  {
    id: 'about',
    label: 'About Page',
    icon: Info,
    sections: [
      { key: 'about_hero_headline', label: 'Hero Headline', type: 'text', placeholder: 'The Roots of Blue Next Project' },
      { key: 'about_hero_image', label: 'Hero Background Image', type: 'image', imageFolder: 'about' },
      { key: 'origin_paragraph_1', label: 'Origin Story - Paragraph 1', type: 'textarea' },
      { key: 'origin_paragraph_2', label: 'Origin Story - Paragraph 2', type: 'textarea' },
      { key: 'origin_image', label: 'Origin Story Image', type: 'image', imageFolder: 'about' },
      { key: 'methodology_headline', label: 'Methodology Headline', type: 'text' },
      { key: 'methodology_subtext', label: 'Methodology Description', type: 'textarea' },
      { key: 'safety_title', label: 'Safety Card Title', type: 'text', placeholder: 'Physical & Emotional Safety' },
      { key: 'safety_body', label: 'Safety Card Body', type: 'textarea' },
      { key: 'empowerment_title', label: 'Empowerment Card Title', type: 'text', placeholder: 'Empowerment & Agency' },
      { key: 'empowerment_body', label: 'Empowerment Card Body', type: 'textarea' },
      { key: 'photo_strip_1', label: 'Photo Strip Image 1', type: 'image', imageFolder: 'about' },
      { key: 'photo_strip_2', label: 'Photo Strip Image 2', type: 'image', imageFolder: 'about' },
      { key: 'photo_strip_3', label: 'Photo Strip Image 3', type: 'image', imageFolder: 'about' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Page',
    icon: Phone,
    sections: [
      { key: 'contact_hero_headline', label: 'Hero Headline', type: 'text', placeholder: 'Connect with Blue Next Project' },
      { key: 'studio_name', label: 'Studio Name', type: 'text', placeholder: 'Clear Ear Studios' },
      { key: 'studio_address', label: 'Studio Address', type: 'text', placeholder: '7411 S. Stony Island Ave.' },
      { key: 'studio_city', label: 'City, State, ZIP', type: 'text', placeholder: 'Chicago, IL 60649' },
      { key: 'hours_weekday', label: 'Weekday Hours', type: 'text', placeholder: 'MON — FRI: 11:00am — 8:00pm' },
      { key: 'hours_weekend', label: 'Weekend Hours', type: 'text', placeholder: 'SATURDAY: 11:00am — 6:00pm' },
      { key: 'map_embed_url', label: 'Google Maps Embed URL', type: 'text', description: 'Get from Google Maps → Share → Embed' },
      { key: 'maps_directions_url', label: 'Google Maps Directions URL', type: 'text' },
      { key: 'contact_email', label: 'Contact Email', type: 'text', placeholder: 'partnerships@bluenextproject.org' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '708-929-8745' },
    ],
  },
  {
    id: 'donate',
    label: 'Donate Page',
    icon: Heart,
    sections: [
      { key: 'donate_headline', label: 'Page Headline', type: 'text', placeholder: 'Support Our Mission' },
      { key: 'donate_subheadline', label: 'Page Subheadline', type: 'textarea' },
      { key: 'donate_image', label: 'Hero Image', type: 'image', imageFolder: 'donate' },
    ],
  },
  {
    id: 'global',
    label: 'Global / Layout',
    icon: Layout,
    sections: [
      { key: 'navbar_cta_text', label: 'Navbar CTA Button Text', type: 'text', placeholder: 'Get Involved' },
      { key: 'footer_tagline', label: 'Footer Tagline', type: 'text', placeholder: 'Developing Youth Skills Through Media Arts...' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'text' },
      { key: 'social_twitter', label: 'X (Twitter) URL', type: 'text' },
      { key: 'social_tiktok', label: 'TikTok URL', type: 'text' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'text' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal Pages',
    icon: Scale,
    sections: [
      { key: 'privacy_policy', label: 'Privacy Policy', type: 'html', description: 'Full privacy policy content. Supports HTML.' },
      { key: 'terms_of_service', label: 'Terms of Service', type: 'html', description: 'Full terms of service content. Supports HTML.' },
    ],
  },
]

export function WebsiteEditor({ initialContent, initialSettings }: WebsiteEditorProps) {
  const [content, setContent] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const c of initialContent) {
      map[`${c.page}::${c.section}`] = c.content
    }
    // Also load settings into content map for global sections
    for (const [k, v] of Object.entries(initialSettings)) {
      if (!map[`global::${k}`]) map[`global::${k}`] = v
    }
    return map
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  function getContentKey(pageId: string, sectionKey: string) {
    return `${pageId}::${sectionKey}`
  }

  function getValue(pageId: string, sectionKey: string) {
    const key = getContentKey(pageId, sectionKey)
    return content[key] ?? DEFAULTS[key] ?? ''
  }

  function setValue(pageId: string, sectionKey: string, value: string) {
    setContent(prev => ({ ...prev, [getContentKey(pageId, sectionKey)]: value }))
  }

  async function saveSection(pageId: string, sectionKey: string, overrideValue?: string) {
    const key = getContentKey(pageId, sectionKey)
    const value = overrideValue ?? content[key] ?? ''
    setSaving(key)
    try {
      if (pageId === 'global') {
        // Save as site_settings
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: [{ key: sectionKey, value, updated_at: new Date().toISOString() }],
          }),
        })
        if (!res.ok) throw new Error('Failed to save setting')
      } else {
        // Save as site_content
        const section = PAGE_CONFIGS.find(p => p.id === pageId)?.sections.find(s => s.key === sectionKey)
        const contentType = section?.type === 'image' ? 'image_url' : section?.type === 'html' ? 'html' : 'text'
        const res = await fetch('/api/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: pageId, section: sectionKey, content: value, contentType }),
        })
        if (!res.ok) throw new Error('Failed to save')
      }
      toast.success('Saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function saveAllForPage(pageId: string) {
    setSavingAll(true)
    const page = PAGE_CONFIGS.find(p => p.id === pageId)
    if (!page) return

    try {
      const promises = page.sections.map(section => {
        const key = getContentKey(pageId, section.key)
        const value = content[key] ?? ''
        if (!value) return Promise.resolve()

        if (pageId === 'global') {
          return fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: [{ key: section.key, value, updated_at: new Date().toISOString() }],
            }),
          })
        }

        const contentType = section.type === 'image' ? 'image_url' : section.type === 'html' ? 'html' : 'text'
        return fetch('/api/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: pageId, section: section.key, content: value, contentType }),
        })
      })

      await Promise.all(promises)
      toast.success(`All ${page.label} content saved!`)
    } catch {
      toast.error('Some saves failed. Please try again.')
    } finally {
      setSavingAll(false)
    }
  }

  function toggleSection(id: string) {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function filterSections(sections: SectionConfig[]) {
    if (!searchQuery.trim()) return sections
    const q = searchQuery.toLowerCase()
    return sections.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      (s.description?.toLowerCase().includes(q) ?? false)
    )
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fields... (e.g. hero, headline, image)"
          className="pl-10 h-10"
        />
      </div>

      <Tabs defaultValue="home">
        <TabsList className="bg-gray-100 rounded-xl p-1 h-auto flex-wrap gap-1 mb-6">
          {PAGE_CONFIGS.map((page) => {
            const Icon = page.icon
            return (
              <TabsTrigger
                key={page.id}
                value={page.id}
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0033FF] data-[state=active]:shadow-sm gap-1.5 text-sm"
              >
                <Icon className="h-3.5 w-3.5" />
                {page.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {PAGE_CONFIGS.map((page) => {
          const filtered = filterSections(page.sections)

          return (
            <TabsContent key={page.id} value={page.id} className="space-y-3">
              {/* Page header with Save All + Preview */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{page.label}</h2>
                  <p className="text-xs text-gray-400">{filtered.length} editable field{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => window.open(page.id === 'home' ? '/' : page.id === 'global' ? '/' : `/${page.id === 'donate' ? 'donate' : page.id}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveAllForPage(page.id)}
                    disabled={savingAll}
                    className="bg-[#0033FF] text-white gap-1.5 text-xs h-8"
                  >
                    {savingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save All
                  </Button>
                </div>
              </div>

              {/* Section fields */}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No fields match &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}

              {filtered.map((section) => {
                const key = getContentKey(page.id, section.key)
                const isSaving = saving === key
                const value = getValue(page.id, section.key)

                return (
                  <div key={section.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{section.label}</span>
                          <code className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{section.key}</code>
                        </div>
                        {section.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveSection(page.id, section.key)}
                        disabled={isSaving}
                        className="bg-[#0033FF] hover:bg-[#001A80] text-white h-7 text-xs gap-1 ml-3 shrink-0"
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Save
                      </Button>
                    </div>
                    <div className="p-5">
                      {section.type === 'image' ? (
                        <ImageUpload
                          value={value}
                          onChange={(url) => {
                            setValue(page.id, section.key, url)
                            // Auto-save image URLs immediately to prevent data loss
                            if (url) saveSection(page.id, section.key, url)
                          }}
                          folder={section.imageFolder ?? page.id}
                          aspectRatio="aspect-video"
                        />
                      ) : section.type === 'textarea' || section.type === 'html' ? (
                        <Textarea
                          value={value}
                          onChange={(e) => setValue(page.id, section.key, e.target.value)}
                          rows={4}
                          placeholder={section.placeholder}
                          className="font-mono text-sm resize-y"
                        />
                      ) : (
                        <Input
                          value={value}
                          onChange={(e) => setValue(page.id, section.key, e.target.value)}
                          placeholder={section.placeholder}
                          className="text-sm"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
