'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Send, Users, AlertTriangle } from 'lucide-react'

interface FormData {
  subject: string
  body: string
}

export function EmailComposer() {
  const [sendToAll, setSendToAll] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    if (!sendToAll) {
      toast.error('Select recipients first.')
      return
    }

    setIsSending(true)
    setResults(null)

    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: data.subject,
          htmlBody: data.body.replace(/\n/g, '<br>'),
          sendToAll: true,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to send emails')
      }

      const { results: r } = await res.json()
      setResults(r)

      if (r.sent > 0) {
        toast.success(`Sent to ${r.sent} donor${r.sent === 1 ? '' : 's'}!`)
        reset()
        setSendToAll(false)
      } else {
        toast.error('No emails were sent.')
      }
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* Recipients */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Recipients</h3>
        <div
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setSendToAll(!sendToAll)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSendToAll(!sendToAll)}
        >
          <Checkbox
            id="sendToAll"
            checked={sendToAll}
            onCheckedChange={(c) => setSendToAll(c === true)}
            className="border-[#0033FF] data-[state=checked]:bg-[#0033FF]"
          />
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-[#0033FF]" />
            <Label htmlFor="sendToAll" className="cursor-pointer font-medium text-gray-700">
              All donors with email addresses
            </Label>
          </div>
        </div>

        {sendToAll && (
          <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              This will send to ALL donors who have email addresses in your database. Please double-check your message before sending.
            </p>
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="emailSubject" className="text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </Label>
        <Input
          id="emailSubject"
          placeholder="Thank you for your support!"
          aria-invalid={!!errors.subject}
          {...register('subject', { required: 'Subject is required' })}
        />
        {errors.subject && <p className="text-xs text-red-500" role="alert">{errors.subject.message}</p>}
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label htmlFor="emailBody" className="text-sm font-medium text-gray-700">
          Message Body <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-400">
          Tip: Use <code className="bg-gray-100 px-1 rounded">{`{{first_name}}`}</code> to personalize greetings.
        </p>
        <Textarea
          id="emailBody"
          placeholder={`Dear {{first_name}},\n\nThank you for your continued support of Blue Next Projet...`}
          rows={10}
          className="resize-none font-mono text-sm"
          aria-invalid={!!errors.body}
          {...register('body', {
            required: 'Message body is required',
            minLength: { value: 30, message: 'Please write a more complete message (at least 30 characters)' },
          })}
        />
        {errors.body && <p className="text-xs text-red-500" role="alert">{errors.body.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSending || !sendToAll}
        className="w-full bg-[#0033FF] hover:bg-[#001A80] text-white h-12 gap-2 font-semibold disabled:opacity-60"
      >
        {isSending ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Sending…</>
        ) : (
          <><Send className="h-4 w-4" />Send to All Donors</>
        )}
      </Button>

      {results && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            Sent: {results.sent} &nbsp;|&nbsp; Failed: {results.failed}
          </p>
        </div>
      )}
    </form>
  )
}
