'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-[#E6EBFF] mb-4 select-none">Error</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-6 text-sm">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-[#0033FF] text-white hover:bg-[#001A80] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
