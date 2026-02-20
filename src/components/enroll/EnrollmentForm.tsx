'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Send, Loader2, User, MapPin, Palette, BarChart3, Link2, MessageSquare, CheckCircle2,
} from 'lucide-react'
import type { EnrollmentFormData } from '@/types'

const INTERESTS = [
  'Audio Production',
  'Film',
  'Photography',
  'Music',
  'Digital Media',
  'Graphic Design',
] as const

const EXPERIENCE_LEVELS = [
  { value: 'none', label: 'None — I\'m completely new' },
  { value: 'beginner', label: 'Beginner — I\'ve tried a little' },
  { value: 'intermediate', label: 'Intermediate — I have some experience' },
  { value: 'advanced', label: 'Advanced — I\'m experienced' },
] as const

const HOW_HEARD_OPTIONS = [
  'Social Media',
  'School',
  'Friend/Family',
  'Community Event',
  'Website',
  'Other',
] as const

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
] as const

export function EnrollmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [experienceLevel, setExperienceLevel] = useState('')
  const [howHeard, setHowHeard] = useState('')
  const [selectedState, setSelectedState] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormData>()

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  async function onSubmit(data: EnrollmentFormData) {
    setIsSubmitting(true)

    try {
      // Build social_links object
      const social_links: Record<string, string> = {}
      if (data.instagram?.trim()) social_links.instagram = data.instagram.trim()
      if (data.tiktok?.trim()) social_links.tiktok = data.tiktok.trim()
      if (data.soundcloud?.trim()) social_links.soundcloud = data.soundcloud.trim()
      if (data.youtube?.trim()) social_links.youtube = data.youtube.trim()

      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        age: data.age || null,
        school: data.school || null,
        address: data.address || null,
        city: data.city || null,
        state: selectedState || null,
        zip: data.zip || null,
        interests: selectedInterests.length > 0 ? selectedInterests : null,
        experience_level: experienceLevel || null,
        social_links,
        music_links: data.music_links || null,
        how_heard: howHeard || null,
        additional_notes: data.additional_notes || null,
      }

      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to submit application')
      }

      setIsSuccess(true)
    } catch (err) {
      toast.error('Could not submit application', {
        description: err instanceof Error ? err.message : 'Please try again or contact us directly.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
          Application Received!
        </h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
          Thank you for your interest in Blue Next Project. We&apos;ll review your application and
          be in touch soon.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 mt-8 bg-[#0033FF] hover:bg-[#001A80] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">

      {/* ─── Section 1: Personal Info ─── */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2.5 text-lg font-black text-gray-900 tracking-tight mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          Personal Information
        </legend>
        <p className="text-sm text-gray-400 -mt-3 ml-[42px]">Tell us a bit about yourself.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-first-name" className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="enroll-first-name"
              placeholder="First name"
              className="bg-white"
              aria-required="true"
              aria-invalid={!!errors.first_name}
              {...register('first_name', { required: 'First name is required' })}
            />
            {errors.first_name && (
              <p className="text-xs text-red-500" role="alert">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-last-name" className="text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="enroll-last-name"
              placeholder="Last name"
              className="bg-white"
              aria-required="true"
              aria-invalid={!!errors.last_name}
              {...register('last_name', { required: 'Last name is required' })}
            />
            {errors.last_name && (
              <p className="text-xs text-red-500" role="alert">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-email" className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="enroll-email"
              type="email"
              placeholder="you@example.com"
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

          <div className="space-y-1.5">
            <Label htmlFor="enroll-phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <Input
              id="enroll-phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="bg-white"
              {...register('phone')}
            />
          </div>
        </div>

        <div className="w-32">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-age" className="text-sm font-medium text-gray-700">
              Age
            </Label>
            <Input
              id="enroll-age"
              type="number"
              placeholder="16"
              min={5}
              max={120}
              className="bg-white"
              {...register('age')}
            />
          </div>
        </div>
      </fieldset>

      {/* ─── Section 2: School & Location ─── */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2.5 text-lg font-black text-gray-900 tracking-tight mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          School &amp; Location
        </legend>
        <p className="text-sm text-gray-400 -mt-3 ml-[42px]">Where are you based?</p>

        <div className="space-y-1.5">
          <Label htmlFor="enroll-school" className="text-sm font-medium text-gray-700">
            School
          </Label>
          <Input
            id="enroll-school"
            placeholder="School name"
            className="bg-white"
            {...register('school')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enroll-address" className="text-sm font-medium text-gray-700">
            Street Address
          </Label>
          <Input
            id="enroll-address"
            placeholder="123 Main St"
            className="bg-white"
            {...register('address')}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-city" className="text-sm font-medium text-gray-700">
              City
            </Label>
            <Input
              id="enroll-city"
              placeholder="Chicago"
              className="bg-white"
              {...register('city')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-state" className="text-sm font-medium text-gray-700">
              State
            </Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger id="enroll-state" className="bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((st) => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-zip" className="text-sm font-medium text-gray-700">
              ZIP Code
            </Label>
            <Input
              id="enroll-zip"
              placeholder="60649"
              className="bg-white"
              {...register('zip')}
            />
          </div>
        </div>
      </fieldset>

      {/* ─── Section 3: Interests ─── */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2.5 text-lg font-black text-gray-900 tracking-tight mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center">
            <Palette className="h-4 w-4 text-white" />
          </div>
          Interests
        </legend>
        <p className="text-sm text-gray-400 -mt-3 ml-[42px]">Select all programs that interest you.</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {INTERESTS.map((interest) => {
            const checked = selectedInterests.includes(interest)
            return (
              <label
                key={interest}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'bg-[#E6EBFF] border-[#0033FF]/30 ring-1 ring-[#0033FF]/20'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleInterest(interest)}
                  className={checked ? 'border-[#0033FF] data-[state=checked]:bg-[#0033FF]' : ''}
                />
                <span className={`text-sm font-medium ${checked ? 'text-[#0033FF]' : 'text-gray-700'}`}>
                  {interest}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* ─── Section 4: Experience ─── */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2.5 text-lg font-black text-gray-900 tracking-tight mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          Experience Level
        </legend>
        <p className="text-sm text-gray-400 -mt-3 ml-[42px]">How much experience do you have with creative media?</p>

        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map((level) => {
            const isSelected = experienceLevel === level.value
            return (
              <label
                key={level.value}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#E6EBFF] border-[#0033FF]/30 ring-1 ring-[#0033FF]/20'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-[#0033FF]' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#0033FF]" />}
                </div>
                <input
                  type="radio"
                  name="experience_level"
                  value={level.value}
                  checked={isSelected}
                  onChange={() => setExperienceLevel(level.value)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${isSelected ? 'text-[#0033FF]' : 'text-gray-700'}`}>
                  {level.label}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* ─── Section 5: Creative Links ─── */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2.5 text-lg font-black text-gray-900 tracking-tight mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center">
            <Link2 className="h-4 w-4 text-white" />
          </div>
          Creative Links
        </legend>
        <p className="text-sm text-gray-400 -mt-3 ml-[42px]">Share your social media or portfolio links (optional).</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-instagram" className="text-sm font-medium text-gray-700">
              Instagram
            </Label>
            <Input
              id="enroll-instagram"
              placeholder="@username or URL"
              className="bg-white"
              {...register('instagram')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-tiktok" className="text-sm font-medium text-gray-700">
              TikTok
            </Label>
            <Input
              id="enroll-tiktok"
              placeholder="@username or URL"
              className="bg-white"
              {...register('tiktok')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-soundcloud" className="text-sm font-medium text-gray-700">
              SoundCloud
            </Label>
            <Input
              id="enroll-soundcloud"
              placeholder="Profile URL"
              className="bg-white"
              {...register('soundcloud')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enroll-youtube" className="text-sm font-medium text-gray-700">
              YouTube
            </Label>
            <Input
              id="enroll-youtube"
              placeholder="Channel URL"
              className="bg-white"
              {...register('youtube')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enroll-music-links" className="text-sm font-medium text-gray-700">
            Portfolio / Music Links
          </Label>
          <Textarea
            id="enroll-music-links"
            placeholder="Share links to your portfolio, music, videos, or any other creative work..."
            rows={3}
            className="bg-white resize-none"
            {...register('music_links')}
          />
        </div>
      </fieldset>

      {/* ─── Section 6: Additional ─── */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2.5 text-lg font-black text-gray-900 tracking-tight mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          Additional Information
        </legend>
        <p className="text-sm text-gray-400 -mt-3 ml-[42px]">Anything else we should know?</p>

        <div className="space-y-1.5">
          <Label htmlFor="enroll-how-heard" className="text-sm font-medium text-gray-700">
            How did you hear about us?
          </Label>
          <Select value={howHeard} onValueChange={setHowHeard}>
            <SelectTrigger id="enroll-how-heard" className="bg-white">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {HOW_HEARD_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="enroll-notes" className="text-sm font-medium text-gray-700">
            Additional Notes
          </Label>
          <Textarea
            id="enroll-notes"
            placeholder="Tell us about your goals, availability, or anything else you'd like us to know..."
            rows={4}
            className="bg-white resize-none"
            {...register('additional_notes')}
          />
        </div>
      </fieldset>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#0033FF] hover:bg-[#001A80] text-white h-14 gap-2 font-bold text-base rounded-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting Application...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Submit Application
          </>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to be contacted about our programs via the email provided.
      </p>
    </form>
  )
}
