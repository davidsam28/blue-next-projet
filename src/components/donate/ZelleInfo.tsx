import { Info, Copy } from 'lucide-react'

interface ZelleInfoProps {
  recipient: string
  instructions: string
}

export function ZelleInfo({ recipient, instructions }: ZelleInfoProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[#E6EBFF] rounded-xl p-5 border border-[#0033FF]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0033FF] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white font-bold text-xs">Z</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#001A80] uppercase tracking-wider mb-2">Send Zelle to</p>
            <div className="flex items-center gap-2">
              <code className="text-[#0033FF] font-bold text-lg break-all">{recipient}</code>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800 mb-1">Instructions</p>
          <p className="text-sm text-amber-700 leading-relaxed">{instructions}</p>
        </div>
      </div>

      <div className="text-xs text-gray-400 leading-relaxed">
        <strong>Note:</strong> Zelle donations are processed manually. Please allow 1–2 business days for your donation to be recorded. You will receive a receipt via email once confirmed.
      </div>
    </div>
  )
}
