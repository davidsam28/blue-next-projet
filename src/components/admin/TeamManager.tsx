'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from './ImageUpload'
import { Plus, Trash2, Eye, EyeOff, Loader2, Save, User, Pencil, Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { TeamMember } from '@/types'

interface TeamManagerProps {
  initialTeam: TeamMember[]
}

interface MemberForm {
  name: string
  title: string
  bio: string
  image_url: string
}

export function TeamManager({ initialTeam }: TeamManagerProps) {
  const [team, setTeam] = useState(initialTeam)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<MemberForm>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { register, handleSubmit, reset, setValue, watch } = useForm<MemberForm>()
  const newImageUrl = watch('image_url')

  const filtered = team.filter((m) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || (m.bio?.toLowerCase().includes(q) ?? false)
  })

  async function addMember(data: MemberForm) {
    setIsAdding(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          title: data.title,
          bio: data.bio || null,
          image_url: data.image_url || null,
          display_order: team.length + 1,
        }),
      })
      if (!res.ok) throw new Error('Failed to add member')
      const { data: newMember } = await res.json()
      setTeam([...team, newMember])
      toast.success('Team member added!')
      reset()
      setShowAddForm(false)
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsAdding(false)
    }
  }

  function startEdit(member: TeamMember) {
    setEditingId(member.id)
    setEditData({ name: member.name, title: member.title, bio: member.bio ?? '', image_url: member.image_url ?? '' })
  }

  async function saveEdit(id: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!res.ok) throw new Error('Failed to update')
      setTeam(team.map((m) => m.id === id ? { ...m, ...editData } as TeamMember : m))
      setEditingId(null)
      toast.success('Team member updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoadingId(null)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })
      if (!res.ok) throw new Error()
      setTeam(team.map((m) => m.id === id ? { ...m, is_active: !isActive } : m))
      toast.success(isActive ? 'Member hidden' : 'Member visible')
    } catch { toast.error('Error') }
    finally { setLoadingId(null) }
  }

  async function deleteMember(id: string) {
    if (!confirm('Delete this team member? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTeam(team.filter((m) => m.id !== id))
      toast.success('Team member deleted')
    } catch { toast.error('Error') }
    finally { setLoadingId(null) }
  }

  async function reorder(id: string, direction: 'up' | 'down') {
    const idx = team.findIndex(m => m.id === id)
    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= team.length - 1) return

    const prevTeam = [...team]
    const newTeam = [...team]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newTeam[idx], newTeam[swapIdx]] = [newTeam[swapIdx], newTeam[idx]]

    setTeam(newTeam) // Optimistic update

    try {
      const results = await Promise.all([
        fetch(`/api/team/${newTeam[idx].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: idx + 1 }),
        }),
        fetch(`/api/team/${newTeam[swapIdx].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: swapIdx + 1 }),
        }),
      ])
      if (results.some(r => !r.ok)) throw new Error('Failed to save order')
    } catch {
      setTeam(prevTeam) // Revert on failure
      toast.error('Failed to reorder. Changes reverted.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team members..."
          className="pl-10 h-9"
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{team.length} member{team.length !== 1 ? 's' : ''}</span>
        <span>{team.filter(m => m.is_active).length} visible</span>
        <span>{team.filter(m => !m.is_active).length} hidden</span>
      </div>

      {filtered.map((member, index) => (
        <div key={member.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {member.image_url ? (
                <img src={member.image_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E6EBFF] flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-[#0033FF]" />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-semibold text-sm text-gray-900 truncate block">{member.name}</span>
                <span className="text-xs text-gray-400 truncate block">{member.title}</span>
              </div>
              {!member.is_active && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 shrink-0">Hidden</span>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => reorder(member.id, 'up')} className="h-7 w-7 p-0" disabled={index === 0}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => reorder(member.id, 'down')} className="h-7 w-7 p-0" disabled={index === filtered.length - 1}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => startEdit(member)} className="h-7 gap-1 text-xs">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleActive(member.id, member.is_active)} disabled={loadingId === member.id} className="h-7 gap-1 text-xs">
                {member.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMember(member.id)} disabled={loadingId === member.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Inline editor */}
          {editingId === member.id && (
            <div className="p-5 space-y-4 bg-[#FAFBFF] border-t border-[#0033FF]/10">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={editData.name ?? ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Title / Role</Label>
                  <Input value={editData.title ?? ''} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea value={editData.bio ?? ''} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} rows={3} className="resize-none" />
              </div>
              <ImageUpload
                value={editData.image_url ?? ''}
                onChange={(url) => setEditData({ ...editData, image_url: url })}
                folder="team"
                label="Profile Photo"
                aspectRatio="aspect-square"
              />
              <div className="flex gap-2">
                <Button onClick={() => saveEdit(member.id)} disabled={loadingId === member.id} className="bg-[#0033FF] text-white gap-1.5 text-xs">
                  {loadingId === member.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)} className="text-xs">Cancel</Button>
              </div>
            </div>
          )}

          {/* Bio preview when not editing */}
          {editingId !== member.id && member.bio && (
            <div className="px-5 py-3">
              <p className="text-sm text-gray-500 line-clamp-2">{member.bio}</p>
            </div>
          )}
        </div>
      ))}

      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full border-dashed border-[#0033FF]/30 text-[#0033FF] hover:bg-[#E6EBFF] gap-2">
          <Plus className="h-4 w-4" />
          Add Team Member
        </Button>
      ) : (
        <form onSubmit={handleSubmit(addMember)} className="bg-white rounded-xl border border-[#0033FF]/20 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Team Member</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tm-name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="tm-name" {...register('name', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tm-title">Title / Role <span className="text-red-500">*</span></Label>
              <Input id="tm-title" {...register('title', { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tm-bio">Bio</Label>
            <Textarea id="tm-bio" rows={3} className="resize-none" {...register('bio')} />
          </div>
          <ImageUpload
            value={newImageUrl ?? ''}
            onChange={(url) => setValue('image_url', url)}
            folder="team"
            label="Profile Photo"
            aspectRatio="aspect-square"
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={isAdding} className="bg-[#0033FF] text-white gap-2">
              {isAdding ? <><Loader2 className="h-4 w-4 animate-spin" />Adding...</> : <><Save className="h-4 w-4" />Add Member</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); reset() }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
