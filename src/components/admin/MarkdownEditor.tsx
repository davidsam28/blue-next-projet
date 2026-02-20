'use client'

import { useState } from 'react'
import { Pencil, Eye, Columns2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownContent } from '@/components/learn/MarkdownContent'

type EditorMode = 'edit' | 'preview' | 'split'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  label?: string
}

export function MarkdownEditor({
  value,
  onChange,
  rows = 8,
  placeholder = 'Write markdown content...',
  label,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('edit')

  const modes: { key: EditorMode; icon: typeof Pencil; label: string }[] = [
    { key: 'edit', icon: Pencil, label: 'Edit' },
    { key: 'preview', icon: Eye, label: 'Preview' },
    { key: 'split', icon: Columns2, label: 'Split' },
  ]

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-100 p-1 w-fit">
        {modes.map(({ key, icon: Icon, label: modeLabel }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === key
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {modeLabel}
          </button>
        ))}
      </div>

      {/* Editor content */}
      {mode === 'edit' && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="resize-y font-mono text-sm"
          placeholder={placeholder}
        />
      )}

      {mode === 'preview' && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4" style={{ minHeight: `${rows * 1.5}rem` }}>
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-sm text-gray-400 italic">Nothing to preview</p>
          )}
        </div>
      )}

      {mode === 'split' && (
        <div className="grid grid-cols-2 gap-3">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="resize-y font-mono text-sm"
            placeholder={placeholder}
          />
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 overflow-y-auto" style={{ minHeight: `${rows * 1.5}rem` }}>
            {value.trim() ? (
              <MarkdownContent content={value} />
            ) : (
              <p className="text-sm text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
