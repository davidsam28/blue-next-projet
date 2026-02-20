'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownEditor } from '../MarkdownEditor'
import { ImageUpload } from '../ImageUpload'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Plus, Trash2, Loader2, Save, Pencil, Search, X,
  Star, StarOff, FileText,
} from 'lucide-react'
import type { LrcPost, LrcStatus } from '@/types/database'

interface PostsManagerProps {
  initialPosts: LrcPost[]
}

interface PostForm {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  tags: string
  author: string
  read_time_minutes: number
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

const EMPTY_FORM: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: '',
  tags: '',
  author: '',
  read_time_minutes: 5,
  status: 'draft',
  is_featured: false,
}

export function PostsManager({ initialPosts }: PostsManagerProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return p.title.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q) ?? false)
  })

  function openCreate() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(post: LrcPost) {
    setEditingId(post.id)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      cover_image: post.cover_image ?? '',
      category: post.category ?? '',
      tags: (post.tags ?? []).join(', '),
      author: post.author ?? '',
      read_time_minutes: post.read_time_minutes ?? 5,
      status: post.status,
      is_featured: post.is_featured,
    })
    setShowForm(true)
  }

  async function handleSubmit() {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setIsSubmitting(true)

    const payload = {
      ...formData,
      slug: formData.slug || slugify(formData.title),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      read_time_minutes: Number(formData.read_time_minutes) || 5,
      cover_image: formData.cover_image || null,
      excerpt: formData.excerpt || null,
      content: formData.content || null,
      category: formData.category || null,
      author: formData.author || null,
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/lrc/posts/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update')
        const { data } = await res.json()
        setPosts(posts.map(p => p.id === editingId ? data : p))
        toast.success('Post updated!')
      } else {
        const res = await fetch('/api/lrc/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create')
        const { data } = await res.json()
        setPosts([data, ...posts])
        toast.success('Post created!')
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

  async function toggleFeatured(post: LrcPost) {
    setLoadingId(post.id)
    try {
      const res = await fetch(`/api/lrc/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !post.is_featured }),
      })
      if (!res.ok) throw new Error()
      setPosts(posts.map(p => p.id === post.id ? { ...p, is_featured: !p.is_featured } : p))
      toast.success(post.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch { toast.error('Failed to update') }
    finally { setLoadingId(null) }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/lrc/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPosts(posts.filter(p => p.id !== id))
      toast.success('Post deleted')
    } catch { toast.error('Failed to delete') }
    finally { setLoadingId(null) }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="bg-[#0033FF] text-white gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{posts.length} total</span>
        <span>{posts.filter(p => p.status === 'published').length} published</span>
        <span>{posts.filter(p => p.status === 'draft').length} drafts</span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#0033FF]/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Post' : 'New Post'}</h3>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: editingId ? formData.slug : slugify(e.target.value),
                  })
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="resize-none"
              placeholder="Brief description for cards and previews..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Content (Markdown)</Label>
            <MarkdownEditor
              value={formData.content ?? ''}
              onChange={(v) => setFormData({ ...formData, content: v })}
              rows={12}
              placeholder="Write your post content in markdown..."
            />
          </div>

          <ImageUpload
            value={formData.cover_image}
            onChange={(url) => setFormData({ ...formData, cover_image: url })}
            folder="lrc"
            label="Cover Image"
          />

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Healing Arts"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Read Time (min)</Label>
              <Input
                type="number"
                value={formData.read_time_minutes}
                onChange={(e) => setFormData({ ...formData, read_time_minutes: Number(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="healing, arts, community"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LrcStatus })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Featured post</span>
          </label>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0033FF] text-white gap-2">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{editingId ? 'Update Post' : 'Create Post'}</>}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No posts found</p>
        </div>
      ) : (
        filtered.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {post.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-900 truncate block">{post.title}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {post.category && <span>{post.category}</span>}
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_COLORS[post.status]}`}>
                  {post.status}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggleFeatured(post)} disabled={loadingId === post.id} className="h-7 w-7 p-0">
                  {post.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(post)} className="h-7 gap-1 text-xs">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)} disabled={loadingId === post.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {post.excerpt && (
              <div className="px-5 py-3">
                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
