import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudOff, LogIn, X } from 'lucide-react'
import { ETLAB_STATUS_EVENT, EtlabStatus } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

/**
 * Explains failures that aren't ETBridge's fault: ETLab outages (5xx/suspended) and expired
 * sessions (ETLab tokens last 3 days unless refreshed by regular use).
 */
export const EtlabStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<EtlabStatus>('ok')
  const [dismissed, setDismissed] = useState(false)
  const { logout, isDemo } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onStatus = (e: Event) => {
      const next = (e as CustomEvent<EtlabStatus>).detail
      setStatus(prev => {
        if (prev !== next) setDismissed(false)
        // An expired session stays expired until the user signs in again.
        return prev === 'session_expired' && next === 'ok' ? prev : next
      })
    }
    window.addEventListener(ETLAB_STATUS_EVENT, onStatus)
    return () => window.removeEventListener(ETLAB_STATUS_EVENT, onStatus)
  }, [])

  if (isDemo || status === 'ok' || dismissed) return null

  const expired = status === 'session_expired'
  return (
    <div
      role="status"
      className={`mx-3.5 sm:mx-6 lg:mx-8 mt-3 p-3 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm ${
        expired
          ? 'bg-amber-950/40 border-amber-800/60 text-amber-200 light:bg-amber-50 light:border-amber-300 light:text-amber-900'
          : 'bg-rose-950/40 border-rose-800/60 text-rose-200 light:bg-rose-50 light:border-rose-300 light:text-rose-900'
      }`}
    >
      {expired ? <LogIn className="w-4 h-4 mt-0.5 shrink-0" /> : <CloudOff className="w-4 h-4 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="font-bold">{expired ? 'Your ETLab session has expired' : "ETLab isn't responding"}</p>
        <p className="opacity-80 mt-0.5">
          {expired
            ? 'Sign in again to load fresh data. Until then you’re seeing your last saved data.'
            : 'ETLab’s servers are down or unreachable — this isn’t a problem with ETBridge. Your last saved data is shown and will refresh automatically once ETLab is back.'}
        </p>
        {expired && (
          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="mt-2 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 font-bold hover:bg-amber-500/30"
          >
            Sign in again
          </button>
        )}
      </div>
      <button type="button" aria-label="Dismiss" onClick={() => setDismissed(true)} className="p-1 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
