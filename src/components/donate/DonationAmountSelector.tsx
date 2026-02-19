'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500]

interface DonationAmountSelectorProps {
  value: number
  onChange: (amount: number) => void
}

export function DonationAmountSelector({ value, onChange }: DonationAmountSelectorProps) {
  const [customValue, setCustomValue] = useState('')
  const isCustom = !PRESET_AMOUNTS.includes(value)

  function handlePreset(amount: number) {
    setCustomValue('')
    onChange(amount)
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setCustomValue(raw)
    const parsed = parseFloat(raw)
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed)
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-gray-700">
        Select Donation Amount <span className="text-red-500" aria-hidden="true">*</span>
      </Label>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-3" role="group" aria-label="Preset donation amounts">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePreset(amount)}
            aria-pressed={value === amount && !isCustom}
            className={cn(
              'h-12 rounded-lg border-2 font-semibold text-sm transition-all duration-150',
              value === amount && !isCustom
                ? 'border-[#0033FF] bg-[#0033FF] text-white shadow-md shadow-[#0033FF]/20'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#0033FF]/40 hover:bg-[#E6EBFF]/50'
            )}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="space-y-1.5">
        <Label htmlFor="custom-amount" className="text-xs text-gray-500">
          Or enter a custom amount
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
          <Input
            id="custom-amount"
            type="number"
            min="1"
            step="1"
            placeholder="Other amount"
            value={customValue}
            onChange={handleCustomChange}
            className={cn(
              'pl-7 bg-white',
              isCustom && customValue ? 'border-[#0033FF] ring-2 ring-[#0033FF]/20' : ''
            )}
            aria-label="Custom donation amount in dollars"
          />
        </div>
      </div>

      {/* Display selected */}
      {value > 0 && (
        <p className="text-sm text-[#001A80] font-medium bg-[#E6EBFF] rounded-lg px-4 py-2.5">
          You are donating <span className="text-[#0033FF] font-bold">${value.toFixed(2)}</span>
        </p>
      )}
    </div>
  )
}
