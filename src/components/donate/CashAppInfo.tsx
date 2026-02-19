import { Info } from 'lucide-react'
import Image from 'next/image'

interface CashAppInfoProps {
  cashtag: string
  qrUrl?: string
}

export function CashAppInfo({ cashtag, qrUrl }: CashAppInfoProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[#E6EBFF] rounded-xl p-5 border border-[#0033FF]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00D632] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">$</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#001A80] uppercase tracking-wider mb-2">Cash App $Cashtag</p>
            <code className="text-[#0033FF] font-bold text-xl">{cashtag}</code>
          </div>
        </div>

        {qrUrl && (
          <div className="mt-4 flex justify-center">
            <div className="p-3 bg-white rounded-xl border border-gray-200 inline-block">
              <Image
                src={qrUrl}
                alt={`Cash App QR code for ${cashtag}`}
                width={140}
                height={140}
                className="rounded-lg"
              />
              <p className="text-xs text-center text-gray-400 mt-2">Scan with Cash App</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800 mb-1">After Sending</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Please include your name and email in the Cash App note so we can send you a receipt.
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-400 leading-relaxed">
        <strong>Note:</strong> Cash App donations are processed manually. Please allow 1–2 business days for your donation to be recorded. You will receive a receipt via email once confirmed.
      </div>
    </div>
  )
}
