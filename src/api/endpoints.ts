/**
 * Single source of truth for where ETLab's API lives.
 *
 * ETLab moved its API from api.students.etlab.app (Render, now suspended) to
 * api2.students.etlab.app in Nov 2026. Their own frontend keeps a list of legacy hosts and a
 * per-institute `apiBaseUrl` override (empty for every college today). We mirror that logic so
 * a future move only needs DEFAULT_ETLAB_API_ORIGIN changed (or ETLab to publish an override).
 *
 * The same allowlist is duplicated in functions/api/[[path]].js and vite.config.ts — keep the
 * three in sync.
 */

export const DEFAULT_ETLAB_API_ORIGIN = 'https://api2.students.etlab.app'

/** Hosts ETLab's frontend treats as retired; an `apiBaseUrl` pointing at one is ignored. */
export const LEGACY_ETLAB_API_ORIGINS = [
  'https://api.students.etlab.app',
  'https://studentsappgo.onrender.com'
]

/** Request header that tells our proxy which ETLab origin to forward to (non-default only). */
export const UPSTREAM_HEADER = 'X-ETBridge-Upstream'

const isEtlabHost = (host: string) => host === 'etlab.app' || host.endsWith('.etlab.app')

/**
 * Validates an `apiBaseUrl` the way ETLab's frontend does and reduces it to an origin.
 * Returns null for empty, legacy, non-https or non-etlab.app values.
 */
export function normalizeApiOrigin(raw?: string | null): string | null {
  const value = String(raw || '').trim()
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !isEtlabHost(url.hostname)) return null
    if (LEGACY_ETLAB_API_ORIGINS.includes(url.origin)) return null
    return url.origin
  } catch {
    return null
  }
}

let activeOrigin = DEFAULT_ETLAB_API_ORIGIN

/** Origin used for API calls and absolute ETLab file/image URLs for the current session. */
export function getApiOrigin(): string {
  return activeOrigin
}

export function setApiOrigin(origin?: string | null): void {
  activeOrigin = normalizeApiOrigin(origin) || DEFAULT_ETLAB_API_ORIGIN
}

/** Turns a relative ETLab path ("/uploads/x.pdf", "uploads/x.pdf") into an absolute URL. */
export function etlabUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${getApiOrigin()}${path.startsWith('/') ? '' : '/'}${path}`
}

// --- Session-token rotation -----------------------------------------------------------------

interface TokenClaims {
  id: number
  issued: number
  expires: number
}

function decodeClaims(token: string): TokenClaims | null {
  try {
    const part = (token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')))
    const id = Number(json.id)
    const issued = Number(json.iat)
    const expires = Number(json.exp)
    if (![id, issued, expires].every(Number.isFinite)) return null
    return { id, issued, expires }
  } catch {
    return null
  }
}

/**
 * ETLab issues 3-day JWTs and sends a fresher one in the `X-Session-Token` response header.
 * Accept it only if it's for the same student, newer than the current token and unexpired —
 * the same checks ETLab's own client makes.
 */
export function shouldAcceptRotatedToken(candidate: string, current: string, now = Date.now()): boolean {
  if (!candidate || !current || candidate === current) return false
  const next = decodeClaims(candidate)
  if (!next || next.expires * 1000 <= now) return false
  const prev = decodeClaims(current)
  return !prev || (next.id === prev.id && next.issued > prev.issued)
}

/** Seconds-since-epoch expiry of a token, or null if it isn't a readable JWT. */
export function tokenExpiry(token: string): number | null {
  return decodeClaims(token)?.expires ?? null
}

// --- ETLab availability -------------------------------------------------------------------

export type EtlabStatus = 'ok' | 'unavailable' | 'session_expired'

export class EtlabUnavailableError extends Error {
  constructor(public status: number, message?: string) {
    super(
      message ||
        `ETLab's servers aren't responding right now (HTTP ${status}). This is a problem on ETLab's side — your saved data is still shown. Please try again later.`
    )
    this.name = 'EtlabUnavailableError'
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Your ETLab session has expired. Please sign in again.')
    this.name = 'SessionExpiredError'
  }
}

/** True for gateway/outage responses (Render/Cloudflare HTML pages, 502–504, 52x). */
export function isOutageResponse(res: Response): boolean {
  if (res.status === 502 || res.status === 503 || res.status === 504) return true
  if (res.status >= 520 && res.status <= 530) return true
  const type = res.headers.get('content-type') || ''
  return res.status >= 500 && type.includes('text/html')
}

export const ETLAB_STATUS_EVENT = 'etbridge:etlab-status'

export function emitEtlabStatus(status: EtlabStatus): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<EtlabStatus>(ETLAB_STATUS_EVENT, { detail: status }))
}
