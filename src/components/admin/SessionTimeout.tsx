'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const INACTIVITY_WARNING_MS = 25 * 60 * 1000 // 25 minutes
const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000  // 30 minutes

export function SessionTimeout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
  }, [])

  const handleLogout = useCallback(async () => {
    clearTimers()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }, [clearTimers, router])

  const resetTimers = useCallback(() => {
    clearTimers()
    setShowWarning(false)

    warningTimer.current = setTimeout(() => {
      setShowWarning(true)
    }, INACTIVITY_WARNING_MS)

    logoutTimer.current = setTimeout(() => {
      handleLogout()
    }, INACTIVITY_LOGOUT_MS)
  }, [clearTimers, handleLogout])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'mousedown', 'touchstart']

    const onActivity = () => {
      if (!showWarning) {
        resetTimers()
      }
    }

    events.forEach((event) => window.addEventListener(event, onActivity))
    resetTimers()

    return () => {
      clearTimers()
      events.forEach((event) => window.removeEventListener(event, onActivity))
    }
  }, [resetTimers, clearTimers, showWarning])

  function handleStayLoggedIn() {
    setShowWarning(false)
    resetTimers()
  }

  return (
    <>
      {children}

      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Session Expiring Soon
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your session will expire in 5 minutes due to inactivity. Click below to stay logged in.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="font-semibold"
              >
                Log Out
              </Button>
              <Button
                onClick={handleStayLoggedIn}
                className="bg-[#0033FF] hover:bg-[#001A80] text-white font-semibold"
              >
                Stay Logged In
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
