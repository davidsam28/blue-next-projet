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
  Star, StarOff, Calendar, MapPin, ExternalLink,
} from 'lucide-react'
import type { LrcEvent, LrcStatus } from '@/types/database'

interface EventsManagerProps {
  initialEvents: LrcEvent[]
}

interface EventForm {
  title: string
  slug: string
  description: string
  cover_image: string
  location: string
  event_date: string
  end_date: string
  registration_url: string
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

const EMPTY_FORM: EventForm = {
  title: '',
  slug: '',
  description: '',
  cover_image: '',
  location: '',
  event_date: '',
  end_date: '',
  registration_url: '',
  status: 'draft',
  is_featured: false,
}

export function EventsManager({ initialEvents }: EventsManagerProps) {
  const [events, setEvents] = useState(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = events.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return e.title.toLowerCase().includes(q) || (e.location?.toLowerCase().includes(q) ?? false)
  })

  function openCreate() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(event: LrcEvent) {
    setEditingId(event.id)
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description ?? '',
      cover_image: event.cover_image ?? '',
      location: event.location ?? '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      registration_url: event.registration_url ?? '',
      status: event.status,
      is_featured: event.is_featured,
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
      location: formData.location || null,
      event_date: formData.event_date || null,
      end_date: formData.end_date || null,
      registration_url: formData.registration_url || null,
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/lrc/events/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update')
        const { data } = await res.json()
        setEvents(events.map(e => e.id === editingId ? data : e))
        toast.success('Event updated!')
      } else {
        const res = await fetch('/api/lrc/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create')
        const { data } = await res.json()
        setEvents([data, ...events])
        toast.success('Event created!')
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

  async function toggleFeatured(event: LrcEvent) {
    setLoadingId(event.id)
    try {
      const res = await fetch(`/api/lrc/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !event.is_featured }),
      })
      if (!res.ok) throw new Error()
      setEvents(events.map(e => e.id === event.id ? { ...e, is_featured: !e.is_featured } : e))
      toast.success(event.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch { toast.error('Failed to update') }
    finally { setLoadingId(null) }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/lrc/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setEvents(events.filter(e => e.id !== id))
      toast.success('Event deleted')
    } catch { toast.error('Failed to delete') }
    finally { setLoadingId(null) }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." className="pl-10 h-9" />
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
          <Plus className="h-4 w-4" />Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{events.length} total</span>
        <span>{events.filter(e => e.status === 'published').length} published</span>
        <span>{events.filter(e => e.status === 'draft').length} drafts</span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#0033FF]/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Event' : 'New Event'}</h3>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Event Start Date & Time</Label>
              <Input type="datetime-local" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Event End Date & Time</Label>
              <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Community Center, Online" />
            </div>
            <div className="space-y-1.5">
              <Label>Registration URL</Label>
              <Input value={formData.registration_url} onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })} placeholder="https://..." />
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
                <span className="text-sm text-gray-700">Featured event</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0033FF] text-white gap-2">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{editingId ? 'Update Event' : 'Create Event'}</>}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No events found</p>
        </div>
      ) : (
        filtered.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {event.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-900 truncate block">{event.title}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {event.event_date && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.event_date)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    {event.registration_url && (
                      <span className="flex items-center gap-0.5">
                        <ExternalLink className="h-3 w-3" />
                        Registration
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_COLORS[event.status]}`}>
                  {event.status}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggleFeatured(event)} disabled={loadingId === event.id} className="h-7 w-7 p-0">
                  {event.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(event)} className="h-7 gap-1 text-xs">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteEvent(event.id)} disabled={loadingId === event.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {event.description && (
              <div className="px-5 py-3">
                <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
