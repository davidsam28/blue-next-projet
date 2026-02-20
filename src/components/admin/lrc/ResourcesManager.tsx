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
  Star, StarOff, BookOpen, Download,
} from 'lucide-react'
import type { LrcResource, LrcStatus } from '@/types/database'

interface ResourcesManagerProps {
  initialResources: LrcResource[]
}

interface ResourceForm {
  title: string
  slug: string
  description: string
  content: string
  cover_image: string
  category: string
  file_url: string
  status: LrcStatus
  is_featured: boolean
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-500',
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const EMPTY_FORM: ResourceForm = {
  title: '',
  slug: '',
  description: '',
  content: '',
  cover_image: '',
  category: '',
  file_url: '',
  status: 'draft',
  is_featured: false,
}

export function ResourcesManager({ initialResources }: ResourcesManagerProps) {
  const [resources, setResources] = useState(initialResources)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = resources.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return r.title.toLowerCase().includes(q) || (r.category?.toLowerCase().includes(q) ?? false)
  })

  function openCreate() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(resource: LrcResource) {
    setEditingId(resource.id)
    setFormData({
      title: resource.title,
      slug: resource.slug,
      description: resource.description ?? '',
      content: resource.content ?? '',
      cover_image: resource.cover_image ?? '',
      category: resource.category ?? '',
      file_url: resource.file_url ?? '',
      status: resource.status,
      is_featured: resource.is_featured,
    })
    setShowForm(true)
  }

  async function handleSubmit() {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setIsSubmitting(true)

    const payload = {
      ...formData,
      slug: formData.slug || slugify(formData.title),
      cover_image: formData.cover_image || null,
      description: formData.description || null,
      content: formData.content || null,
      category: formData.category || null,
      file_url: formData.file_url || null,
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/lrc/resources/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update')
        const { data } = await res.json()
        setResources(resources.map(r => r.id === editingId ? data : r))
        toast.success('Resource updated!')
      } else {
        const res = await fetch('/api/lrc/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create')
        const { data } = await res.json()
        setResources([data, ...resources])
        toast.success('Resource created!')
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(EMPTY_FORM)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleFeatured(resource: LrcResource) {
    setLoadingId(resource.id)
    try {
      const res = await fetch(`/api/lrc/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !resource.is_featured }),
      })
      if (!res.ok) throw new Error()
      setResources(resources.map(r => r.id === resource.id ? { ...r, is_featured: !r.is_featured } : r))
      toast.success(resource.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch { toast.error('Failed to update') }
    finally { setLoadingId(null) }
  }

  async function deleteResource(id: string) {
    if (!confirm('Delete this resource? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/lrc/resources/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setResources(resources.filter(r => r.id !== id))
      toast.success('Resource deleted')
    } catch { toast.error('Failed to delete') }
    finally { setLoadingId(null) }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search resources..." className="pl-10 h-9" />
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
          <Plus className="h-4 w-4" />Add Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{resources.length} total</span>
        <span>{resources.filter(r => r.status === 'published').length} published</span>
        <span>{resources.filter(r => r.status === 'draft').length} drafts</span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#0033FF]/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Resource' : 'New Resource'}</h3>
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
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="resize-none" />
          </div>

          <div className="space-y-1.5">
            <Label>Content (Markdown)</Label>
            <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} className="resize-y font-mono text-sm" />
          </div>

          <ImageUpload value={formData.cover_image} onChange={(url) => setFormData({ ...formData, cover_image: url })} folder="lrc" label="Cover Image" />

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Guides" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>File / Download URL</Label>
              <Input value={formData.file_url} onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} placeholder="https://..." />
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
                <span className="text-sm text-gray-700">Featured resource</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0033FF] text-white gap-2">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{editingId ? 'Update Resource' : 'Create Resource'}</>}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No resources found</p>
        </div>
      ) : (
        filtered.map((resource) => (
          <div key={resource.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {resource.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-900 truncate block">{resource.title}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {resource.category && <span>{resource.category}</span>}
                    {resource.file_url && <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />Download</span>}
                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_COLORS[resource.status]}`}>
                  {resource.status}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggleFeatured(resource)} disabled={loadingId === resource.id} className="h-7 w-7 p-0">
                  {resource.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(resource)} className="h-7 gap-1 text-xs">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteResource(resource.id)} disabled={loadingId === resource.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {resource.description && (
              <div className="px-5 py-3">
                <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
