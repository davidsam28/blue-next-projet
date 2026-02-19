'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Eye, EyeOff, Loader2, Save, User } from 'lucide-react'
import type { TeamMember } from '@/types'

interface TeamManagerProps {
  initialTeam: TeamMember[]
}

interface NewMemberForm {
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

  const { register, handleSubmit, reset } = useForm<NewMemberForm>()

  async function addMember(data: NewMemberForm) {
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
    if (!confirm('Delete this team member?')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTeam(team.filter((m) => m.id !== id))
      toast.success('Team member deleted')
    } catch { toast.error('Error') }
    finally { setLoadingId(null) }
  }

  return (
    <div className="space-y-4">
      {team.map((member, index) => (
        <div key={member.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#E6EBFF] flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 text-[#0033FF]" />
              </div>
              <div>
                <span className="font-semibold text-sm text-gray-900">{member.name}</span>
                <span className="text-xs text-gray-400 ml-2">{member.title}</span>
              </div>
              {!member.is_active && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">Hidden</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => toggleActive(member.id, member.is_active)} disabled={loadingId === member.id} className="h-7 gap-1 text-xs">
                {member.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {member.is_active ? 'Hide' : 'Show'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMember(member.id)} disabled={loadingId === member.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {member.bio && <div className="px-5 py-4"><p className="text-sm text-gray-500 line-clamp-2">{member.bio}</p></div>}
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
          <div className="space-y-1.5">
            <Label htmlFor="tm-image">Photo URL</Label>
            <Input id="tm-image" type="url" placeholder="https://..." {...register('image_url')} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isAdding} className="bg-[#0033FF] text-white gap-2">
              {isAdding ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</> : <><Save className="h-4 w-4" />Add Member</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); reset() }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
