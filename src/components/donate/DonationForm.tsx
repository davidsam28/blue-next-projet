'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DonationAmountSelector } from './DonationAmountSelector'
import { Lock, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import type { DonationFormData } from '@/types'

export function DonationForm() {
  const [amount, setAmount] = useState(50)
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonationFormData>()

  async function onSubmit(data: DonationFormData) {
    if (amount < 1) {
      toast.error('Please select a valid donation amount.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/donations/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          isRecurring,
          frequency: isRecurring ? frequency : undefined,
          message: data.message,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error ?? 'Could not start checkout')
      }

      if (!result.url) throw new Error('No checkout URL returned')
      window.location.href = result.url
    } catch (err) {
      toast.error('Payment error', {
        description: err instanceof Error ? err.message : 'Please try again or use another payment method.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* Amount selector */}
      <DonationAmountSelector value={amount} onChange={setAmount} />

      {/* Recurring */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#E6EBFF] border border-[#0033FF]/10 cursor-pointer group"
          onClick={() => setIsRecurring(!isRecurring)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsRecurring(!isRecurring)}
          aria-pressed={isRecurring}
        >
          <Checkbox
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(checked === true)}
            className="border-[#0033FF] data-[state=checked]:bg-[#0033FF]"
          />
          <div>
            <Label htmlFor="recurring" className="font-medium text-[#001A80] cursor-pointer">
              Make this a recurring donation
            </Label>
            <p className="text-xs text-gray-500 mt-0.5">Sustained giving makes the greatest impact</p>
          </div>
        </div>

        {isRecurring && (
          <div className="space-y-1.5 pl-1">
            <Label htmlFor="frequency" className="text-sm text-gray-600">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Donor info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-t border-gray-100 pt-5">
          Your Information
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Jane"
              className="bg-white"
              aria-required="true"
              aria-invalid={!!errors.firstName}
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && <p className="text-xs text-red-500" role="alert">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Smith"
              className="bg-white"
              aria-required="true"
              aria-invalid={!!errors.lastName}
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName && <p className="text-xs text-red-500" role="alert">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="donorEmail" className="text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id="donorEmail"
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
          {errors.email && <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>}
          <p className="text-xs text-gray-400">Your receipt will be sent to this email.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="donorMessage" className="text-sm font-medium text-gray-700">
            Message <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="donorMessage"
            placeholder="Share why you're giving…"
            className="bg-white"
            {...register('message')}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading || amount < 1}
        className="w-full bg-[#0033FF] hover:bg-[#001A80] text-white h-14 gap-2 font-semibold text-base shadow-lg shadow-[#0033FF]/20 disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing checkout…
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Donate ${amount.toFixed(2)}{isRecurring ? ` / ${frequency}` : ''}
          </>
        )}
      </Button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock className="h-3.5 w-3.5" />
        <span>Secured by Stripe. Your payment info is never stored on our servers.</span>
      </div>

      {/* Tax note */}
      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
        <span>Blue Next Projet is a registered 501(c)(3) nonprofit. Your donation may be tax-deductible. A receipt will be emailed to you.</span>
      </div>
    </form>
  )
}
