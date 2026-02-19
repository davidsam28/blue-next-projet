'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Eye, EyeOff, Loader2, Save } from 'lucide-react'
import type { Program } from '@/types'

interface ProgramsManagerProps {
  initialPrograms: Program[]
}

interface NewProgramForm {
  name: string
  description: string
}

export function ProgramsManager({ initialPrograms }: ProgramsManagerProps) {
  const [programs, setPrograms] = useState(initialPrograms)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewProgramForm>()

  async function addProgram(data: NewProgramForm) {
    setIsAdding(true)
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, description: data.description, displayOrder: programs.length + 1 }),
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

  async function toggleActive(id: string, isActive: boolean) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })
      if (!res.ok) throw new Error('Failed to update program')
      setPrograms(programs.map((p) => p.id === id ? { ...p, is_active: !isActive } : p))
      toast.success(isActive ? 'Program hidden' : 'Program visible')
    } catch (err) {
      toast.error('Error')
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteProgram(id: string) {
    if (!confirm('Delete this program? This cannot be undone.')) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setPrograms(programs.filter((p) => p.id !== id))
      toast.success('Program deleted')
    } catch (err) {
      toast.error('Error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {programs.map((program, index) => (
        <div key={program.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 w-5">#{index + 1}</span>
              <h3 className="font-semibold text-sm text-gray-900">{program.name}</h3>
              {!program.is_active && (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">Hidden</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleActive(program.id, program.is_active)}
                disabled={loadingId === program.id}
                className="h-7 gap-1 text-xs"
              >
                {program.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {program.is_active ? 'Hide' : 'Show'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteProgram(program.id)}
                disabled={loadingId === program.id}
                className="h-7 text-red-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 leading-relaxed">{program.description}</p>
          </div>
        </div>
      ))}

      {!showAddForm ? (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full border-dashed border-[#0033FF]/30 text-[#0033FF] hover:bg-[#E6EBFF] gap-2"
        >
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
          <div className="flex gap-3">
            <Button type="submit" disabled={isAdding} className="bg-[#0033FF] text-white gap-2">
              {isAdding ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</> : <><Save className="h-4 w-4" />Add Program</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); reset() }}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
