'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Loader2 } from 'lucide-react'
import type { ContactFormData } from '@/types'

const SUBJECTS = [
  'General Inquiry',
  'Program Information',
  'Volunteer Opportunities',
  'Partnership / Collaboration',
  'Media / Press',
  'Donation Question',
  'Other',
]

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subject, setSubject] = useState('')
  const honeypotRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>()

  async function onSubmit(data: ContactFormData) {
    if (!subject) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, subject, website: honeypotRef.current?.value ?? '' }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to send message')
      }

      toast.success('Message sent!', {
        description: 'Thank you for reaching out. We\'ll be in touch within 2 business days.',
      })
      reset()
      setSubject('')
    } catch (err) {
      toast.error('Could not send message', {
        description: err instanceof Error ? err.message : 'Please try emailing us directly.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot — hidden from real users, bots will fill it */}
      <input
        type="text"
        name="website"
        ref={honeypotRef}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-name"
            placeholder="Jane Smith"
            className="bg-white"
            aria-required="true"
            aria-invalid={!!errors.name}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && (
            <p className="text-xs text-red-500" role="alert">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="jane@example.com"
            className="bg-white"
            aria-required="true"
            aria-invalid={!!errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="contact-subject" className="text-sm font-medium text-gray-700">
          Subject <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={subject} onValueChange={setSubject} required>
          <SelectTrigger id="contact-subject" className="bg-white" aria-required="true">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
          Message <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="contact-message"
          placeholder="Tell us how we can help…"
          rows={5}
          className="bg-white resize-none"
          aria-required="true"
          aria-invalid={!!errors.message}
          {...register('message', {
            required: 'Message is required',
            minLength: { value: 20, message: 'Please provide at least 20 characters' },
          })}
        />
        {errors.message && (
          <p className="text-xs text-red-500" role="alert">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#0033FF] hover:bg-[#001A80] text-white h-12 gap-2 font-medium text-base"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
