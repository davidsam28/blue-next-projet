'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from './ImageUpload'
import { Plus, Trash2, Eye, EyeOff, Loader2, Save, Pencil, Search, ChevronUp, ChevronDown } from 'lucide-react'
import type { Program } from '@/types'

interface ProgramsManagerProps {
  initialPrograms: Program[]
}

interface ProgramForm {
  name: string
  description: string
  image_url: string
}

export function ProgramsManager({ initialPrograms }: ProgramsManagerProps) {
  const [programs, setPrograms] = useState(initialPrograms)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ProgramForm>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { register, handleSubmit, reset, setValue, watch } = useForm<ProgramForm>()
  const newImageUrl = watch('image_url')

  const filtered = programs.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  })

  async function addProgram(data: ProgramForm) {
    setIsAdding(true)
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          image_url: data.image_url || null,
          displayOrder: programs.length + 1,
        }),
      })
      if (!res.ok) throw new Error('Failed to add program')
      const { data: newProgram } = await res.json()
      setPrograms([...programs, newProgram])
      toast.success('Program added!')
      reset()
      setShowAddForm(false)
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsAdding(false)
    }
  }

  function startEdit(program: Program) {
    setEditingId(program.id)
    setEditData({ name: program.name, description: program.description, image_url: program.image_url ?? '' })
  }

  async function saveEdit(id: string) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!res.ok) throw new Error('Failed to update')
      setPrograms(programs.map((p) => p.id === id ? { ...p, ...editData } as Program : p))
      setEditingId(null)
      toast.success('Program updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoadingId(null)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })
      if (!res.ok) throw new Error()
      setPrograms(programs.map((p) => p.id === id ? { ...p, is_active: !isActive } : p))
      toast.success(isActive ? 'Program hidden' : 'Program visible')
    } catch { toast.error('Error') }
    finally { setLoadingId(null) }
  }

  async function deleteProgram(id: string) {
    if (!confirm('Delete this program? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPrograms(programs.filter((p) => p.id !== id))
      toast.success('Program deleted')
    } catch { toast.error('Error') }
    finally { setLoadingId(null) }
  }

  async function reorder(id: string, direction: 'up' | 'down') {
    const idx = programs.findIndex(p => p.id === id)
    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= programs.length - 1) return

    const newList = [...programs]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]]

    setPrograms(newList)

    await Promise.all([
      fetch(`/api/programs/${newList[idx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: idx + 1 }),
      }),
      fetch(`/api/programs/${newList[swapIdx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: swapIdx + 1 }),
      }),
    ])
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search programs..."
          className="pl-10 h-9"
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{programs.length} program{programs.length !== 1 ? 's' : ''}</span>
        <span>{programs.filter(p => p.is_active).length} visible</span>
        <span>{programs.filter(p => !p.is_active).length} hidden</span>
      </div>

      {filtered.map((program, index) => (
        <div key={program.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-gray-400 w-5 shrink-0">#{index + 1}</span>
              {program.image_url && (
                <img src={program.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
              )}
              <h3 className="font-semibold text-sm text-gray-900 truncate">{program.name}</h3>
              {!program.is_active && (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 shrink-0">Hidden</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => reorder(program.id, 'up')} className="h-7 w-7 p-0" disabled={index === 0}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => reorder(program.id, 'down')} className="h-7 w-7 p-0" disabled={index === filtered.length - 1}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => startEdit(program)} className="h-7 gap-1 text-xs">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleActive(program.id, program.is_active)} disabled={loadingId === program.id} className="h-7 gap-1 text-xs">
                {program.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteProgram(program.id)} disabled={loadingId === program.id} className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Inline editor */}
          {editingId === program.id && (
            <div className="p-5 space-y-4 bg-[#FAFBFF] border-t border-[#0033FF]/10">
              <div className="space-y-1.5">
                <Label>Program Name</Label>
                <Input value={editData.name ?? ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={editData.description ?? ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={4} className="resize-y" />
              </div>
              <ImageUpload
                value={editData.image_url ?? ''}
                onChange={(url) => setEditData({ ...editData, image_url: url })}
                folder="programs"
                label="Program Image"
              />
              <div className="flex gap-2">
                <Button onClick={() => saveEdit(program.id)} disabled={loadingId === program.id} className="bg-[#0033FF] text-white gap-1.5 text-xs">
                  {loadingId === program.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)} className="text-xs">Cancel</Button>
              </div>
            </div>
          )}

          {/* Description preview when not editing */}
          {editingId !== program.id && (
            <div className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{program.description}</p>
            </div>
          )}
        </div>
      ))}

      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full border-dashed border-[#0033FF]/30 text-[#0033FF] hover:bg-[#E6EBFF] gap-2">
          <Plus className="h-4 w-4" />
          Add New Program
        </Button>
      ) : (
        <form onSubmit={handleSubmit(addProgram)} className="bg-white rounded-xl border border-[#0033FF]/20 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Program</h3>
          <div className="space-y-1.5">
            <Label htmlFor="prog-name">Program Name <span className="text-red-500">*</span></Label>
            <Input id="prog-name" {...register('name', { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-desc">Description <span className="text-red-500">*</span></Label>
            <Textarea id="prog-desc" rows={4} className="resize-none" {...register('description', { required: true })} />
          </div>
          <ImageUpload
            value={newImageUrl ?? ''}
            onChange={(url) => setValue('image_url', url)}
            folder="programs"
            label="Program Image"
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={isAdding} className="bg-[#0033FF] text-white gap-2">
              {isAdding ? <><Loader2 className="h-4 w-4 animate-spin" />Adding...</> : <><Save className="h-4 w-4" />Add Program</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); reset() }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
