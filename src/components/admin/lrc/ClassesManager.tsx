'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '../ImageUpload'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Plus, Trash2, Loader2, Save, Pencil, Search, X,
  Star, StarOff, GraduationCap, ChevronUp, ChevronDown, Video, BookOpen,
} from 'lucide-react'
import type { LrcClass, LrcClassSection, LrcStatus, LrcDifficulty } from '@/types/database'

interface ClassesManagerProps {
  initialClasses: LrcClass[]
}

interface ClassForm {
  title: string
  slug: string
  description: string
  cover_image: string
  category: string
  author: string
  difficulty: LrcDifficulty
  duration_minutes: number
  status: LrcStatus
  is_featured: boolean
}

interface SectionForm {
  title: string
  content: string
  content_type: 'reading' | 'video'
  video_url: string
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-500',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-purple-100 text-purple-700',
  advanced: 'bg-red-100 text-red-700',
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const EMPTY_FORM: ClassForm = {
  title: '',
  slug: '',
  description: '',
  cover_image: '',
  category: '',
  author: '',
  difficulty: 'beginner',
  duration_minutes: 0,
  status: 'draft',
  is_featured: false,
}

const EMPTY_SECTION: SectionForm = {
  title: '',
  content: '',
  content_type: 'reading',
  video_url: '',
}

export function ClassesManager({ initialClasses }: ClassesManagerProps) {
  const [classes, setClasses] = useState(initialClasses)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [sections, setSections] = useState<SectionForm[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = classes.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return c.title.toLowerCase().includes(q) || (c.category?.toLowerCase().includes(q) ?? false)
  })

  function openCreate() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setSections([])
    setShowForm(true)
  }

  async function openEdit(cls: LrcClass) {
    setEditingId(cls.id)
    setFormData({
      title: cls.title,
      slug: cls.slug,
      description: cls.description ?? '',
      cover_image: cls.cover_image ?? '',
      category: cls.category ?? '',
      author: cls.author ?? '',
      difficulty: cls.difficulty,
      duration_minutes: cls.duration_minutes ?? 0,
      status: cls.status,
      is_featured: cls.is_featured,
    })
    // Fetch sections for this class
    try {
      const sectionsRes = await fetch(`/api/lrc/classes/${cls.id}?sections=true`)
      if (sectionsRes.ok) {
        const data = await sectionsRes.json()
        if (data.sections) {
          setSections(data.sections.map((s: LrcClassSection) => ({
            title: s.title,
            content: s.content ?? '',
            content_type: s.content_type,
            video_url: s.video_url ?? '',
          })))
        } else {
          setSections([])
        }
      } else {
        setSections([])
      }
    } catch {
      setSections([])
    }
    setShowForm(true)
  }

  function addSection() {
    setSections([...sections, { ...EMPTY_SECTION }])
  }

  function updateSection(index: number, field: keyof SectionForm, value: string) {
    const updated = [...sections]
    updated[index] = { ...updated[index], [field]: value }
    setSections(updated)
  }

  function removeSection(index: number) {
    setSections(sections.filter((_, i) => i !== index))
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return
    const newSections = [...sections]
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[swapIdx]] = [newSections[swapIdx], newSections[index]]
    setSections(newSections)
  }

  async function handleSubmit() {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setIsSubmitting(true)

    const payload = {
      ...formData,
      slug: formData.slug || slugify(formData.title),
      duration_minutes: Number(formData.duration_minutes) || null,
      cover_image: formData.cover_image || null,
      description: formData.description || null,
      category: formData.category || null,
      author: formData.author || null,
      sections: sections.map(s => ({
        title: s.title || 'Untitled',
        content: s.content || null,
        content_type: s.content_type,
        video_url: s.video_url || null,
      })),
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/lrc/classes/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update')
        const { data } = await res.json()
        if (data) {
          setClasses(classes.map(c => c.id === editingId ? data : c))
        }
        toast.success('Class updated!')
      } else {
        const res = await fetch('/api/lrc/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create')
        const { data } = await res.json()

        // Save sections for the new class
        if (sections.length > 0 && data?.id) {
          await fetch(`/api/lrc/classes/${data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sections: payload.sections }),
          })
        }

        setClasses([data, ...classes])
        toast.success('Class created!')
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(EMPTY_FORM)
      setSections([])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleFeatured(cls: LrcClass) {
    setLoadingId(cls.id)
    try {
      const res = await fetch(`/api/lrc/classes/${cls.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !cls.is_featured }),
      })
      if (!res.ok) throw new Error()
      setClasses(classes.map(c => c.id === cls.id ? { ...c, is_featured: !c.is_featured } : c))
      toast.success(cls.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch { toast.error('Failed to update') }
    finally { setLoadingId(null) }
  }

  async function deleteClass(id: string) {
    if (!confirm('Delete this class and all its sections? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/lrc/classes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setClasses(classes.filter(c => c.id !== id))
      toast.success('Class deleted')
    } catch { toast.error('Failed to delete') }
    finally { setLoadingId(null) }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search classes..." className="pl-10 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="bg-[#0033FF] text-white gap-1.5 h-9">
          <Plus className="h-4 w-4" />Add Class
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{classes.length} total</span>
        <span>{classes.filter(c => c.status === 'published').length} published</span>
        <span>{classes.filter(c => c.status === 'draft').length} drafts</span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#0033FF]/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Class' : 'New Class'}</h3>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: editingId ? formData.slug : slugify(e.target.value),
                })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="resize-none" />
          </div>

          <ImageUpload value={formData.cover_image} onChange={(url) => setFormData({ ...formData, cover_image: url })} folder="lrc" label="Cover Image" />

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Music" />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v as LrcDifficulty })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" value={formData.duration_minutes || ''} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LrcStatus })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Featured class</span>
              </label>
            </div>
          </div>

          {/* Sections */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Sections ({sections.length})</Label>
              <Button size="sm" variant="outline" onClick={addSection} className="gap-1 text-xs">
                <Plus className="h-3 w-3" />Add Section
              </Button>
            </div>

            {sections.map((section, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Section {idx + 1}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="h-6 w-6 p-0">
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} className="h-6 w-6 p-0">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeSection(idx)} className="h-6 w-6 p-0 text-red-400 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input value={section.title} onChange={(e) => updateSection(idx, 'title', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={section.content_type} onValueChange={(v) => updateSection(idx, 'content_type', v)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading"><span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />Reading</span></SelectItem>
                        <SelectItem value="video"><span className="flex items-center gap-1"><Video className="h-3 w-3" />Video</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {section.content_type === 'video' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Video URL</Label>
                    <Input value={section.video_url} onChange={(e) => updateSection(idx, 'video_url', e.target.value)} className="h-8 text-sm" placeholder="https://youtube.com/..." />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Content (Markdown)</Label>
                  <Textarea value={section.content} onChange={(e) => updateSection(idx, 'content', e.target.value)} rows={4} className="resize-y font-mono text-xs" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0033FF] text-white gap-2">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{editingId ? 'Update Class' : 'Create Class'}</>}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No classes found</p>
        </div>
      ) : (
        filtered.map((cls) => (
          <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {cls.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-900 truncate block">{cls.title}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {cls.category && <span>{cls.category}</span>}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[cls.difficulty]}`}>
                      {cls.difficulty}
                    </span>
                    {cls.duration_minutes && <span>{cls.duration_minutes} min</span>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_COLORS[cls.status]}`}>
                  {cls.status}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggleFeatured(cls)} disabled={loadingId === cls.id} className="h-7 w-7 p-0">
                  {cls.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(cls)} className="h-7 gap-1 text-xs">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteClass(cls.id)} disabled={loadingId === cls.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {cls.description && (
              <div className="px-5 py-3">
                <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
