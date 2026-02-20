'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Search, ChevronDown, ChevronUp, Trash2, Loader2,
  User, MapPin, Palette, BarChart3, Link2, MessageSquare, Clock,
  ExternalLink,
} from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'
import type { Enrollment, EnrollmentStatus } from '@/types'

interface EnrollmentsManagerProps {
  initialEnrollments: Enrollment[]
}

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  enrolled: { label: 'Enrolled', color: 'bg-green-50 text-green-700 border-green-200' },
  waitlisted: { label: 'Waitlisted', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  declined: { label: 'Declined', color: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_OPTIONS: EnrollmentStatus[] = ['pending', 'approved', 'enrolled', 'waitlisted', 'declined']

const EXPERIENCE_LABELS: Record<string, string> = {
  none: 'None',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function EnrollmentsManager({ initialEnrollments }: EnrollmentsManagerProps) {
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Filter enrollments
  const filtered = enrollments.filter((e) => {
    // Status filter
    if (statusFilter !== 'all' && e.status !== statusFilter) return false

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const name = `${e.first_name} ${e.last_name}`.toLowerCase()
      const email = e.email.toLowerCase()
      return name.includes(q) || email.includes(q)
    }

    return true
  })

  // Count by status
  const statusCounts = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1
    return acc
  }, {})

  async function updateStatus(id: string, newStatus: EnrollmentStatus) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const { data } = await res.json()

      setEnrollments(enrollments.map((e) => (e.id === id ? { ...e, ...data } : e)))
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteEnrollment(id: string) {
    if (!confirm('Delete this enrollment application? This cannot be undone.')) return

    setLoadingId(id)
    try {
      const res = await fetch(`/api/enrollments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setEnrollments(enrollments.filter((e) => e.id !== id))
      setExpandedId(null)
      toast.success('Enrollment deleted')
    } catch {
      toast.error('Failed to delete enrollment')
    } finally {
      setLoadingId(null)
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 h-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-10">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Statuses ({enrollments.length})
            </SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_CONFIG[s].label} ({statusCounts[s] ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status count badges */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => {
          const count = statusCounts[s] ?? 0
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all',
                statusFilter === s
                  ? STATUS_CONFIG[s].color + ' ring-1 ring-current/20'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
              )}
            >
              {STATUS_CONFIG[s].label}
              <span className="font-bold">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {enrollments.length} application{enrollments.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
          <p className="text-sm text-gray-400">No enrollment applications found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Enrollments table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Age</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">School</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((enrollment) => {
                  const isExpanded = expandedId === enrollment.id
                  const isLoading = loadingId === enrollment.id
                  const config = STATUS_CONFIG[enrollment.status]

                  return (
                    <tr key={enrollment.id} className="group">
                      {/* Main row */}
                      <td colSpan={7} className="p-0">
                        <div
                          className={cn(
                            'border-b transition-colors',
                            isExpanded ? 'border-[#0033FF]/10' : 'border-gray-50 hover:bg-gray-50/70',
                          )}
                        >
                          {/* Summary row - clickable */}
                          <div
                            className="grid items-center cursor-pointer px-4 py-3"
                            style={{ gridTemplateColumns: '1fr 1fr auto auto auto auto auto' }}
                            onClick={() => toggleExpand(enrollment.id)}
                          >
                            {/* Name */}
                            <div className="flex items-center gap-2 min-w-0 pr-3">
                              <span className="font-medium text-gray-900 truncate">
                                {enrollment.first_name} {enrollment.last_name}
                              </span>
                            </div>

                            {/* Email */}
                            <div className="text-gray-500 truncate pr-3">
                              {enrollment.email}
                            </div>

                            {/* Age */}
                            <div className="text-gray-500 pr-3 hidden sm:block min-w-[50px]">
                              {enrollment.age ?? '—'}
                            </div>

                            {/* School */}
                            <div className="text-gray-500 truncate pr-3 hidden md:block min-w-[120px] max-w-[200px]">
                              {enrollment.school ?? '—'}
                            </div>

                            {/* Status badge */}
                            <div className="pr-3">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                config.color,
                              )}>
                                {config.label}
                              </span>
                            </div>

                            {/* Date */}
                            <div className="text-gray-400 text-xs whitespace-nowrap pr-3 hidden lg:block min-w-[90px]">
                              {formatDateShort(enrollment.created_at)}
                            </div>

                            {/* Expand toggle */}
                            <div className="flex items-center">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded detail panel */}
                          {isExpanded && (
                            <div className="px-4 pb-5 pt-2 bg-[#FAFBFF] border-t border-[#0033FF]/5">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Left column */}
                                <div className="space-y-5">
                                  {/* Personal Info */}
                                  <DetailSection icon={User} title="Personal Information">
                                    <DetailRow label="Full Name" value={`${enrollment.first_name} ${enrollment.last_name}`} />
                                    <DetailRow label="Email" value={enrollment.email} />
                                    <DetailRow label="Phone" value={enrollment.phone} />
                                    <DetailRow label="Age" value={enrollment.age?.toString()} />
                                  </DetailSection>

                                  {/* Location */}
                                  <DetailSection icon={MapPin} title="School & Location">
                                    <DetailRow label="School" value={enrollment.school} />
                                    <DetailRow label="Address" value={enrollment.address} />
                                    <DetailRow
                                      label="City / State / ZIP"
                                      value={
                                        [enrollment.city, enrollment.state, enrollment.zip]
                                          .filter(Boolean)
                                          .join(', ') || null
                                      }
                                    />
                                  </DetailSection>

                                  {/* Interests */}
                                  <DetailSection icon={Palette} title="Interests">
                                    {enrollment.interests && enrollment.interests.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {enrollment.interests.map((interest) => (
                                          <Badge
                                            key={interest}
                                            variant="secondary"
                                            className="bg-[#E6EBFF] text-[#0033FF] border-0 text-xs"
                                          >
                                            {interest}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-400">None selected</p>
                                    )}
                                  </DetailSection>

                                  {/* Experience */}
                                  <DetailSection icon={BarChart3} title="Experience Level">
                                    <p className="text-sm text-gray-700">
                                      {enrollment.experience_level
                                        ? EXPERIENCE_LABELS[enrollment.experience_level] ?? enrollment.experience_level
                                        : 'Not specified'}
                                    </p>
                                  </DetailSection>
                                </div>

                                {/* Right column */}
                                <div className="space-y-5">
                                  {/* Social / Creative Links */}
                                  <DetailSection icon={Link2} title="Creative Links">
                                    {enrollment.social_links && Object.keys(enrollment.social_links).length > 0 ? (
                                      <div className="space-y-1.5">
                                        {Object.entries(enrollment.social_links).map(([platform, link]) => {
                                          if (!link) return null
                                          return (
                                            <div key={platform} className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-gray-400 uppercase w-24 shrink-0">
                                                {platform}
                                              </span>
                                              {(link as string).startsWith('http') ? (
                                                <a
                                                  href={link as string}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-[#0033FF] hover:underline flex items-center gap-1 truncate"
                                                >
                                                  {link as string}
                                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                                </a>
                                              ) : (
                                                <span className="text-sm text-gray-700 truncate">{link as string}</span>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-400">No links provided</p>
                                    )}

                                    {enrollment.music_links && (
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Portfolio / Music</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{enrollment.music_links}</p>
                                      </div>
                                    )}
                                  </DetailSection>

                                  {/* How Heard */}
                                  <DetailSection icon={MessageSquare} title="Additional Info">
                                    <DetailRow label="How Heard" value={enrollment.how_heard} />
                                    {enrollment.additional_notes && (
                                      <div className="mt-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Notes</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-100">
                                          {enrollment.additional_notes}
                                        </p>
                                      </div>
                                    )}
                                  </DetailSection>

                                  {/* Review Info */}
                                  <DetailSection icon={Clock} title="Review Status">
                                    <DetailRow label="Current Status" value={config.label} />
                                    <DetailRow label="Applied" value={formatDateShort(enrollment.created_at)} />
                                    {enrollment.reviewed_at && (
                                      <DetailRow label="Reviewed" value={formatDateShort(enrollment.reviewed_at)} />
                                    )}
                                  </DetailSection>
                                </div>
                              </div>

                              {/* Actions bar */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6 pt-5 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-400 uppercase whitespace-nowrap">
                                    Change Status:
                                  </span>
                                  <Select
                                    value={enrollment.status}
                                    onValueChange={(val) => updateStatus(enrollment.id, val as EnrollmentStatus)}
                                    disabled={isLoading}
                                  >
                                    <SelectTrigger className="w-[160px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map((s) => (
                                        <SelectItem key={s} value={s}>
                                          {STATUS_CONFIG[s].label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                                </div>

                                <div className="sm:ml-auto">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteEnrollment(enrollment.id)}
                                    disabled={isLoading}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete Application
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Helper Components ─── */

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-md bg-[#0033FF]/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-[#0033FF]" />
        </div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="ml-8">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline gap-2 text-sm py-0.5">
      <span className="text-gray-400 shrink-0 min-w-[90px]">{label}:</span>
      <span className="text-gray-700">{value ?? <span className="text-gray-300 italic">Not provided</span>}</span>
    </div>
  )
}
