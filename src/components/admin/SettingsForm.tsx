'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'

interface SettingsFormProps {
  settings: Record<string, string>
}

interface FormData {
  cashapp_cashtag: string
  zelle_recipient: string
  zelle_instructions: string
  instagram_handle: string
  facebook_url: string
  contact_email: string
  contact_phone: string
  org_address: string
  org_ein: string
  org_name: string
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      cashapp_cashtag: settings.cashapp_cashtag ?? '',
      zelle_recipient: settings.zelle_recipient ?? '',
      zelle_instructions: settings.zelle_instructions ?? '',
      instagram_handle: settings.instagram_handle ?? '',
      facebook_url: settings.facebook_url ?? '',
      contact_email: settings.contact_email ?? '',
      contact_phone: settings.contact_phone ?? '',
      org_address: settings.org_address ?? '',
      org_ein: settings.org_ein ?? '',
      org_name: settings.org_name ?? 'Blue Next Project',
    },
  })

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    try {
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: value ?? '',
        updated_at: new Date().toISOString(),
      }))

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to save settings')
      }

      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Organization */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
          Organization
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org_name">Organization Name</Label>
            <Input id="org_name" {...register('org_name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org_ein">EIN (Tax ID)</Label>
            <Input id="org_ein" placeholder="XX-XXXXXXX" {...register('org_ein')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org_address">Address</Label>
            <Input id="org_address" placeholder="123 Main St, City, ST 00000" {...register('org_address')} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
          Contact
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" type="email" {...register('contact_email')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input id="contact_phone" type="tel" placeholder="+1 555 000 0000" {...register('contact_phone')} />
          </div>
        </div>
      </section>

      {/* Donations */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
          Donation Channels
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cashapp_cashtag">Cash App $Cashtag</Label>
            <Input id="cashapp_cashtag" placeholder="$YourCashTag" {...register('cashapp_cashtag')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zelle_recipient">Zelle Recipient (Email or Phone)</Label>
            <Input id="zelle_recipient" placeholder="donations@yourdomain.org" {...register('zelle_recipient')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zelle_instructions">Zelle Instructions</Label>
            <Textarea
              id="zelle_instructions"
              rows={3}
              className="resize-none"
              {...register('zelle_instructions')}
            />
          </div>
        </div>
      </section>

      {/* Social */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
          Social Media
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="instagram_handle">Instagram Handle (without @)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <Input id="instagram_handle" className="pl-7" placeholder="bluenextprojet" {...register('instagram_handle')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook_url">Facebook Page URL</Label>
            <Input id="facebook_url" type="url" placeholder="https://facebook.com/bluenextprojet" {...register('facebook_url')} />
          </div>
        </div>
      </section>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[#0033FF] hover:bg-[#001A80] text-white h-12 gap-2 font-semibold"
      >
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Save className="h-4 w-4" />Save Settings</>}
      </Button>
    </form>
  )
}
