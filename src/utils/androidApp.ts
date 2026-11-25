import { useEffect, useState } from 'react'

/** Native Android app (ET-Bridge/android). The APK is distributed through GitHub Releases. */
export const ANDROID_RELEASES_URL = 'https://github.com/ET-Bridge/android/releases/latest'

export interface AndroidRelease {
  versionName: string
  apkUrl: string
  sizeBytes?: number
}

export function isAndroidDevice(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}

export function formatApkSize(bytes?: number): string | null {
  return bytes && bytes > 0 ? `${(bytes / 1_048_576).toFixed(1)} MB` : null
}

let pending: Promise<AndroidRelease | null> | null = null

/**
 * Latest release from /android-update.json (the same file the app's self-updater reads, written
 * by android/scripts/release.sh), so the download button always points at the current APK.
 */
export function fetchAndroidRelease(): Promise<AndroidRelease | null> {
  pending ??= fetch('/android-update.json', { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : null))
    .then((m) => {
      if (!m || typeof m.apkUrl !== 'string' || !m.apkUrl.startsWith('https://github.com/')) return null
      return {
        versionName: String(m.versionName ?? ''),
        apkUrl: m.apkUrl,
        sizeBytes: typeof m.sizeBytes === 'number' ? m.sizeBytes : undefined,
      }
    })
    .catch(() => {
      pending = null // allow a retry later
      return null
    })
  return pending
}

/** Latest release, or null until loaded / if unavailable (fall back to [ANDROID_RELEASES_URL]). */
export function useAndroidRelease(enabled = true): AndroidRelease | null {
  const [release, setRelease] = useState<AndroidRelease | null>(null)
  useEffect(() => {
    if (!enabled) return
    let active = true
    fetchAndroidRelease().then((r) => {
      if (active) setRelease(r)
    })
    return () => {
      active = false
    }
  }, [enabled])
  return release
}
