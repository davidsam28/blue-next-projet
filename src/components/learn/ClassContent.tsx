'use client'

import { useState } from 'react'
import { BookOpen, Video, ChevronRight } from 'lucide-react'
import { MarkdownContent } from './MarkdownContent'
import type { LrcClassSection } from '@/types/database'

interface ClassContentProps {
  sections: LrcClassSection[]
}

export function ClassContent({ sections }: ClassContentProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (sections.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No sections have been added to this class yet.</p>
      </div>
    )
  }

  const activeSection = sections[activeIndex]

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Section List */}
      <nav className="md:w-72 shrink-0" aria-label="Class sections">
        <div className="bg-[#F2F2F2] rounded-xl p-4 sticky top-24">
          <h3 className="font-bold text-[#001A80] text-sm uppercase tracking-wider mb-3">
            Sections
          </h3>
          <ul className="space-y-1">
            {sections.map((section, idx) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    idx === activeIndex
                      ? 'bg-[#0033FF] text-white font-medium'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span className={`shrink-0 ${idx === activeIndex ? 'text-white/70' : 'text-gray-400'}`}>
                    {section.content_type === 'video' ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </span>
                  <span className="truncate flex-1">{section.title}</span>
                  {idx === activeIndex && <ChevronRight className="h-3 w-3 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[#0033FF] uppercase tracking-wider">
              Section {activeIndex + 1} of {sections.length}
            </span>
            {activeSection.content_type === 'video' && (
              <span className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Video className="h-3 w-3" />Video
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#001A80]">{activeSection.title}</h2>
        </div>

        {/* Video embed */}
        {activeSection.content_type === 'video' && activeSection.video_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-8">
            <iframe
              src={getEmbedUrl(activeSection.video_url)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeSection.title}
            />
          </div>
        )}

        {/* Section content */}
        {activeSection.content && <MarkdownContent content={activeSection.content} />}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="text-sm font-medium text-[#0033FF] disabled:text-gray-300 disabled:cursor-not-allowed hover:underline"
          >
            Previous Section
          </button>
          <span className="text-xs text-gray-400">
            {activeIndex + 1} / {sections.length}
          </span>
          <button
            onClick={() => setActiveIndex(Math.min(sections.length - 1, activeIndex + 1))}
            disabled={activeIndex === sections.length - 1}
            className="text-sm font-medium text-[#0033FF] disabled:text-gray-300 disabled:cursor-not-allowed hover:underline"
          >
            Next Section
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Convert YouTube/Vimeo URLs to embeddable format
 */
function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  // Already an embed URL or other
  return url
}
