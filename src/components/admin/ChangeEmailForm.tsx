'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'

interface ChangeEmailFormProps {
  currentEmail: string
}

export function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      toast.error('New email must be different from your current email')
      return
    }

    setSaving(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to change email')
      }

      setSuccess(true)
      setNewEmail('')
      toast.success('Confirmation email sent!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change email')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Current Email</Label>
        <p className="text-sm text-gray-600 bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
          {currentEmail}
        </p>
      </div>

      {success ? (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Confirmation email sent</p>
            <p className="text-xs text-green-600 mt-1">
              Please check your new email inbox and click the confirmation link to complete the change.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="new-email">New Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving || !newEmail}
            className="bg-[#0033FF] hover:bg-[#001A80] text-white gap-2 font-semibold"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Sending Confirmation…</>
            ) : (
              <><Mail className="h-4 w-4" />Change Email</>
            )}
          </Button>
        </>
      )}
    </form>
  )
}
