'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'

interface FormData {
  amount: string
  source: string
  donorFirstName: string
  donorLastName: string
  donorEmail: string
  donorPhone: string
  donationDate: string
  notes: string
}

export function ManualDonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [source, setSource] = useState('')
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      donationDate: new Date().toISOString().slice(0, 16),
    },
  })

  async function onSubmit(data: FormData) {
    if (!source) return
    const amount = parseFloat(data.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid donation amount.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          source,
          notes: data.notes || null,
          donationDate: data.donationDate ? new Date(data.donationDate).toISOString() : new Date().toISOString(),
          donorData: {
            firstName: data.donorFirstName,
            lastName: data.donorLastName,
            email: data.donorEmail || null,
            phone: data.donorPhone || null,
          },
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to log donation')
      }

      toast.success('Donation logged successfully!')
      reset()
      setSource('')
      router.push('/admin/donations')
      router.refresh()
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* Amount + Source */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
            Amount <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="pl-7"
              aria-required="true"
              aria-invalid={!!errors.amount}
              {...register('amount', { required: 'Amount is required' })}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-500" role="alert">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="source" className="text-sm font-medium text-gray-700">
            Payment Method <span className="text-red-500">*</span>
          </Label>
          <Select value={source} onValueChange={setSource} required>
            <SelectTrigger id="source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zelle">Zelle</SelectItem>
              <SelectItem value="cashapp">Cash App</SelectItem>
            </SelectContent>
          </Select>
          {!source && <p className="text-xs text-gray-400">Stripe donations are recorded automatically via webhook.</p>}
        </div>
      </div>

      {/* Donation date */}
      <div className="space-y-1.5">
        <Label htmlFor="donationDate" className="text-sm font-medium text-gray-700">
          Donation Date & Time <span className="text-red-500">*</span>
        </Label>
        <Input
          id="donationDate"
          type="datetime-local"
          {...register('donationDate', { required: 'Date is required' })}
        />
        {errors.donationDate && <p className="text-xs text-red-500">{errors.donationDate.message}</p>}
      </div>

      {/* Donor info */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Donor Information</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="donorFirstName" className="text-sm font-medium text-gray-700">First Name</Label>
            <Input id="donorFirstName" placeholder="Jane" {...register('donorFirstName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donorLastName" className="text-sm font-medium text-gray-700">Last Name</Label>
            <Input id="donorLastName" placeholder="Smith" {...register('donorLastName')} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="donorEmail" className="text-sm font-medium text-gray-700">Email</Label>
            <Input id="donorEmail" type="email" placeholder="jane@example.com" {...register('donorEmail')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donorPhone" className="text-sm font-medium text-gray-700">Phone</Label>
            <Input id="donorPhone" type="tel" placeholder="+1 555 000 0000" {...register('donorPhone')} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Admin Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this donation…"
          rows={3}
          className="resize-none"
          {...register('notes')}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !source}
        className="w-full bg-[#0033FF] hover:bg-[#001A80] text-white h-12 gap-2 font-semibold"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
        ) : (
          <><Save className="h-4 w-4" />Log Donation</>
        )}
      </Button>
    </form>
  )
}
