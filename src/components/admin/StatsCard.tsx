import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  change?: string
  changePositive?: boolean
  accent?: string
  className?: string
}

export function StatsCard({
  label, value, icon: Icon, change, changePositive, accent, className,
}: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1.5', changePositive ? 'text-green-600' : 'text-red-500')}>
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            accent ?? 'bg-[#E6EBFF]'
          )}
        >
          <Icon className="h-5 w-5 text-[#0033FF]" />
        </div>
      </div>
    </div>
  )
}
