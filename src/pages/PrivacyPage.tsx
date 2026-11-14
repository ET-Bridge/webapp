import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Lock, 
  Cookie, 
  Database, 
  ServerOff, 
  Trash2, 
  ExternalLink, 
  ArrowLeft, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  KeyRound, 
  Info,
  Check,
  HardDrive
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { BrandLogo } from '../components/BrandLogo'
import { etlabClient } from '../api/client'

interface StorageItemInfo {
  key: string
  label: string
  purpose: string
  category: 'Session' | 'Academic Cache' | 'Preferences'
  exists: boolean
  sizeBytes: number
}

const TOC_ITEMS = [
  { id: 'privacy-summary', label: '1. Privacy at a Glance', icon: ShieldCheck },
  { id: 'data-collected', label: '2. Information Handled', icon: KeyRound },
  { id: 'zero-backend', label: '3. Zero-Backend Architecture', icon: ServerOff },
  { id: 'storage-retention', label: '4. Storage & Retention', icon: Database },
  { id: 'cookie-policy', label: '5. Cookie & Storage Policy', icon: Cookie },
  { id: 'storage-inspector', label: '6. Storage Inspector & Purge', icon: HardDrive },
  { id: 'third-parties', label: '7. Third-Party Interactions', icon: ExternalLink },
  { id: 'user-rights', label: '8. Student Rights & Control', icon: CheckCircle2 },
  { id: 'disclaimer', label: '9. Legal Disclaimer & Trademarks', icon: AlertTriangle },
  { id: 'contact', label: '10. Contact Information', icon: Info },
]

export const PrivacyPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<string>('privacy-summary')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [storageItems, setStorageItems] = useState<StorageItemInfo[]>([])
  const [purgeSuccess, setPurgeSuccess] = useState<boolean>(false)

  const scanLocalStorage = () => {
    if (typeof window === 'undefined') return

    const definitions: Array<{ key: string; label: string; purpose: string; category: 'Session' | 'Academic Cache' | 'Preferences' }> = [
      {
        key: 'etbridge_session',
        label: 'Active Authentication Session',
        purpose: 'Stores JWT bearer token, admission ID, student name, and institute subdomain.',
        category: 'Session'
      },
      {
        key: 'etbridge_cached_profile',
        label: 'Cached Student Profile',
        purpose: 'Basic profile fields (name, roll no, department, email) for instant cold starts.',
        category: 'Academic Cache'
      },
      {
        key: 'etbridge_cached_attendance',
        label: 'Cached Attendance Records',
        purpose: 'Subject-wise class counts, safe bunk allowances, and overall percentages.',
        category: 'Academic Cache'
      },
      {
        key: 'etbridge_cached_semester_timetable',
        label: 'Cached Semester Timetable',
        purpose: 'Full semester schedule and recurring lecture slots for offline access.',
        category: 'Academic Cache'
      },
      {
        key: 'etbridge_last_sync_time',
        label: '4-Hour Sync Timestamp',
        purpose: 'Tracks when data was last fetched to trigger automatic background refreshes.',
        category: 'Session'
      },
      {
        key: 'etbridge_remembered_inst',
        label: 'Remembered College Code',
        purpose: 'Pre-selects your college code on the sign-in screen for convenience.',
        category: 'Preferences'
      },
      {
        key: 'etbridge_theme',
        label: 'Color Theme Preference',
        purpose: 'Remembers whether you selected dark mode or light mode.',
        category: 'Preferences'
      },
      {
        key: 'etbridge_pwa_installed',
        label: 'PWA Installation Status',
        purpose: 'Prevents redundant installation popups if the app is already installed.',
        category: 'Preferences'
      },
      {
        key: 'etbridge_pwa_dismissed_until',
        label: 'PWA Banner Snooze',
        purpose: 'Suppresses the mobile install banner for 7 days if dismissed by the user.',
        category: 'Preferences'
      }
    ]

    const inspected: StorageItemInfo[] = definitions.map(def => {
      const raw = localStorage.getItem(def.key)
      return {
        ...def,
        exists: raw !== null,
        sizeBytes: raw ? new Blob([raw]).size : 0
      }
    })

    setStorageItems(inspected)
  }

  useEffect(() => {
    scanLocalStorage()
  }, [])

  const handlePurgeAll = () => {
    if (window.confirm('Are you sure you want to completely erase all ETBridge data from this device? You will be signed out.')) {
      etlabClient.clearAllData()
      try {
        localStorage.removeItem('etbridge_remembered_inst')
        localStorage.removeItem('etbridge_pwa_dismissed_until')
        localStorage.removeItem('etbridge_pwa_installed')
      } catch {}
      scanLocalStorage()
      setPurgeSuccess(true)
      setTimeout(() => setPurgeSuccess(false), 4000)
    }
  }

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 light:bg-slate-50 light:text-slate-900 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 dark:bg-zinc-950/90 light:bg-white/90 backdrop-blur-md border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-xl border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-zinc-400 hover:text-white dark:hover:text-white light:text-slate-700 light:hover:text-slate-900 transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <BrandLogo className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white dark:text-white light:text-slate-900 font-mono">
                ETBridge / Legal
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-zinc-500 font-mono">
                Privacy Policy & Cookie Policy
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <Link
            to="/docs"
            className="hidden sm:inline-block text-zinc-400 hover:text-white dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
          >
            Docs
          </Link>

          <a
            href="https://github.com/nimdme/et-bridge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-1.5 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-zinc-400 hover:text-white dark:hover:text-white light:text-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <Link
            to="/login"
            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
          >
            Open App
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table of Contents (Sticky Sidebar) */}
          <aside className="lg:col-span-4 sticky top-20 hidden lg:block space-y-2 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2 px-2">
                Sections & Governance
              </span>
              {TOC_ITEMS.map((item) => {
                const Icon = item.icon
                const isSelected = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-brand-500/15 text-brand-400 font-bold'
                        : 'text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-white dark:hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Quick Policy Card */}
            <div className="p-4 rounded-2xl bg-brand-950/20 dark:bg-brand-950/20 light:bg-brand-50 border border-brand-800/30 text-xs text-zinc-300 dark:text-zinc-300 light:text-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 text-brand-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Knowledge Promise</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                ETBridge does not run any database, analytics server, or user tracking infrastructure. Your credentials are sent directly to ETLab's official server.
              </p>
            </div>
          </aside>

          {/* Document Body */}
          <main className="lg:col-span-8 space-y-12 max-w-4xl">
            
            {/* Header / Intro */}
            <section className="space-y-4 pb-6 border-b border-zinc-800 dark:border-zinc-800 light:border-slate-200">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand-950/70 dark:bg-brand-950/70 light:bg-brand-50 border border-brand-800/50 text-[11px] font-mono text-brand-400 font-bold">
                <span>Privacy, Security & Storage Governance</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 font-mono">
                ETBridge Privacy Policy & Cookie Policy
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-slate-600 font-mono">
                Effective Date: November 2026 • Last Revised: November 2026 • Applicable to <span className="text-zinc-200 dark:text-zinc-200 light:text-slate-800 font-semibold">etbridge.nimd.me</span> and PWA installations.
              </p>
              <p className="text-sm sm:text-base text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed font-sans">
                This document describes in clear, transparent terms how ETBridge handles student credentials, academic records, and browser storage. ETBridge was specifically architected with a <strong>privacy-first, zero-backend approach</strong> so that students maintain 100% control over their university information.
              </p>
            </section>

            {/* Section 1: Privacy at a Glance */}
            <section id="privacy-summary" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  1. Privacy at a Glance
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Zero Server Storage
                  </span>
                  <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600 leading-relaxed">
                    We operate zero user databases, log collectors, or tracking proxies. Your password and academic metrics never touch any developer server.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Zero Tracking Cookies
                  </span>
                  <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600 leading-relaxed">
                    ETBridge uses zero advertising cookies, third-party trackers, or marketing pixels. No cookie consent banners are needed because no profiling occurs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Direct Official API
                  </span>
                  <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600 leading-relaxed">
                    When you authenticate, your browser communicates directly with ETLab’s official student endpoint (<code className="text-brand-300">api.students.etlab.app</code>) using industry-standard TLS encryption.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Total Local Control
                  </span>
                  <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600 leading-relaxed">
                    Tokens and offline timetables are kept strictly in your own browser's local sandbox. Clicking "Log Out" immediately purges all active session keys.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Information Handled */}
            <section id="data-collected" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  2. Information Handled
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed">
                <p>
                  To provide attendance calculation, bunk margins, timetable routines, and internal evaluations, ETBridge handles the following categories of student information in your browser memory:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Authentication Credentials:</strong> Your ETLab username (admission number or email), password, and chosen college institute code. These are collected solely on the sign-in form to obtain an official Bearer JWT from ETLab.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Academic & Attendance Records:</strong> Subject attendance counts, total conducted periods, university internal marks, and exam series scores returned by ETLab API endpoints.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Timetable & Schedule:</strong> Daily and monthly class periods, faculty names, subject codes, and substitution records.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Student Profile Metadata:</strong> Your name, roll number, semester ID, branch, official email, and student profile picture URL as cataloged in your university's ETLab database.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Self-Reported Duty Leaves:</strong> Any duty leave hours or events you manually claim locally for projected bunk calculation.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Zero-Backend Architecture */}
            <section id="zero-backend" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <ServerOff className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  3. Zero-Backend Architecture
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed">
                <p>
                  Unlike standard web portals that route all student logins through their own intermediary web servers or cloud databases, ETBridge operates on a <strong>zero-backend architecture</strong>:
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 font-mono text-xs overflow-x-auto">
                  <pre className="text-zinc-300 dark:text-zinc-300 light:text-slate-800 leading-relaxed">
{`+-------------------------------------------------------------+
|               Student Device (Browser / PWA)                |
|                                                             |
|  [ETBridge Web UI] <---Direct HTTPS/CORS Gateway---> [ETLab] |
|         |                                                   |
|         v (Only saved on your phone/laptop)                 |
|  [Local Device Storage] (localStorage & CacheStorage)       |
+-------------------------------------------------------------+
               * NO THIRD-PARTY APPLICATION DATABASE *
               * NO REMOTE ACCESS TO USER PASSWORDS  *`}
                  </pre>
                </div>
                <p>
                  Our static hosting infrastructure (Cloudflare Pages) serves only the compiled HTML, JavaScript, CSS, and image assets. Cloudflare Pages Functions acts solely as a stateless, pass-through reverse proxy for media and CORS compliance where browser origin headers require relaying. No payload data or student tokens are ever written to disk or recorded by our edge proxy.
                </p>
              </div>
            </section>

            {/* Section 4: Storage & Retention */}
            <section id="storage-retention" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  4. Storage & Retention
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed">
                <p>
                  All academic records, timetable routines, and active session tokens are retained <strong>strictly on your local device</strong> within your browser's isolated <code className="text-brand-300">localStorage</code> sandbox:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Session Lifespan:</strong> Your session token remains valid on your device until ETLab’s upstream server invalidates it or until you explicitly tap <strong>Sign Out</strong>.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">4-Hour Cache Expiry:</strong> Cached timetables and attendance records older than 4 hours are automatically refreshed silently in the background when connected to the internet.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Immediate Local Purge:</strong> Logging out clears the authentication session and academic caches immediately. You can also purge all data at any time via the Storage Inspector below.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: Cookie & Storage Policy */}
            <section id="cookie-policy" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  5. Cookie & Storage Policy
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-brand-950/20 dark:bg-brand-950/20 light:bg-brand-50 border border-brand-800/40 text-brand-300 dark:text-brand-300 light:text-brand-900 font-mono text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Declaration: ETBridge does NOT use tracking, advertising, or third-party profiling cookies.</span>
                </div>
                
                <p>
                  Instead of HTTP cookies, ETBridge uses standard <strong>HTML5 Web Storage (localStorage)</strong> exclusively for functional, strictly necessary purposes to provide the application:
                </p>

                <div className="overflow-x-auto rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-slate-200">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-zinc-900 dark:bg-zinc-900 light:bg-slate-100 border-b border-zinc-800 dark:border-zinc-800 light:border-slate-200 text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                      <tr>
                        <th className="p-3">Storage Key</th>
                        <th className="p-3">Classification</th>
                        <th className="p-3">Purpose & Description</th>
                        <th className="p-3">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 dark:divide-zinc-800 light:divide-slate-200 text-zinc-300 dark:text-zinc-300 light:text-slate-700">
                      <tr>
                        <td className="p-3 text-brand-400 font-bold">etbridge_session</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-sky-950/70 border border-sky-800/40 text-sky-300">Strictly Necessary</span></td>
                        <td className="p-3">Stores Bearer JWT token & identity to maintain active login session.</td>
                        <td className="p-3 text-zinc-400">Until Sign Out</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-brand-400 font-bold">etbridge_cached_*</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-sky-950/70 border border-sky-800/40 text-sky-300">Functional</span></td>
                        <td className="p-3">Offline cached attendance percentages, timetables, and evaluation grades.</td>
                        <td className="p-3 text-zinc-400">4-Hour SWR / Sign Out</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-brand-400 font-bold">etbridge_last_sync_time</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-sky-950/70 border border-sky-800/40 text-sky-300">Functional</span></td>
                        <td className="p-3">Unix timestamp used by the 4-hour watchdog timer to fetch updated records.</td>
                        <td className="p-3 text-zinc-400">Persistent</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-brand-400 font-bold">etbridge_theme</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">Preferences</span></td>
                        <td className="p-3">Remembers your user interface color scheme (Dark / Light mode).</td>
                        <td className="p-3 text-zinc-400">Persistent</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-brand-400 font-bold">etbridge_remembered_inst</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">Preferences</span></td>
                        <td className="p-3">Saves your college institute code on the login form for fast access.</td>
                        <td className="p-3 text-zinc-400">Persistent</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-brand-400 font-bold">etbridge_pwa_*</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">Preferences</span></td>
                        <td className="p-3">Tracks installation state and 7-day snooze timeout for mobile install banners.</td>
                        <td className="p-3 text-zinc-400">7 Days / Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                  <strong>Strictly Necessary Functional Exemption:</strong> Under the European Union ePrivacy Directive (Article 5(3)), the General Data Protection Regulation (GDPR), and India's Digital Personal Data Protection Act (DPDPA 2023), client-side functional storage utilized solely for providing an explicitly requested service (such as maintaining a user's active session or rendering offline class timetables) is exempt from requiring cookie consent banners.
                </p>
              </div>
            </section>

            {/* Section 6: Live Storage Inspector */}
            <section id="storage-inspector" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                    6. Live Device Storage Inspector
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={scanLocalStorage}
                  className="px-2.5 py-1 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  Refresh Scan
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 space-y-4">
                <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-slate-700">
                  Below is an audit of what ETBridge is storing on <em>this specific device and browser right now</em>:
                </p>

                <div className="space-y-2">
                  {storageItems.map((item) => (
                    <div 
                      key={item.key} 
                      className="p-3 rounded-xl bg-zinc-950/60 dark:bg-zinc-950/60 light:bg-slate-50 border border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <code className="text-brand-400 font-bold font-mono">{item.key}</code>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                            item.exists 
                              ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}>
                            {item.exists ? `Active (${item.sizeBytes} B)` : 'Not Stored'}
                          </span>
                        </div>
                        <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600 text-[11px]">
                          {item.purpose}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.key, item.key)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="Copy Key Name"
                        >
                          {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {purgeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-xs text-emerald-300 font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All local ETBridge storage items have been wiped from this device.</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 dark:border-zinc-800 light:border-slate-200">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Want to reset your browser footprint completely?
                  </span>
                  <button
                    type="button"
                    onClick={handlePurgeAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-mono text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge All Local Data Now</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Section 7: Third-Party Interactions */}
            <section id="third-parties" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  7. Third-Party Interactions
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed">
                <p>
                  To fulfill its functionality, ETBridge interfaces only with the following essential services:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Official ETLab API (<code className="text-brand-300">api.students.etlab.app</code>):</strong> All academic queries, authentication, timetable requests, and syllabus downloads communicate directly with ETLab’s production servers governed by your university’s subscription and ETLab’s primary privacy terms.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Cloudflare Pages Edge:</strong> Static asset delivery (HTML, CSS, JS, manifest) and stateless CORS proxying for image viewing. Cloudflare may process transient IP addresses strictly for DDoS mitigation and edge security.
                  </li>
                  <li>
                    <strong className="text-zinc-200 dark:text-zinc-200 light:text-slate-800">Google Fonts (Inter):</strong> Font stylesheets are fetched from Google Fonts CDN with privacy-preserving requests.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 8: Student Rights & Control */}
            <section id="user-rights" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  8. Student Rights & Control
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed">
                <p>
                  Because ETBridge stores zero data on remote servers, your legal privacy rights are inherently honored by design:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200">
                    <span className="font-bold text-white dark:text-white light:text-slate-900 block mb-1">Right to Erasure</span>
                    <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                      Tapping "Sign Out" or utilizing the Storage Inspector above immediately deletes all local tokens, attendance caches, and schedules from your device.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200">
                    <span className="font-bold text-white dark:text-white light:text-slate-900 block mb-1">Right to Inspection</span>
                    <p className="text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                      You can open your browser developer tools (F12 $\rightarrow$ Application $\rightarrow$ Local Storage) to view, verify, or manually edit any key at any time.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Legal Disclaimer & Trademarks */}
            <section id="disclaimer" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  9. Legal Disclaimer & Trademarks
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-amber-50/50 border border-zinc-800 dark:border-zinc-800 light:border-amber-200 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3">
                <p>
                  <strong>Independent Open-Source Client:</strong> ETBridge is an independent, community-built, open-source presentation client developed by <a href="https://nimd.me" target="_blank" rel="noopener noreferrer" className="text-brand-400 font-bold hover:underline">NiMD</a>. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <strong>ETLab</strong>, <strong>Etuwa Concepts</strong>, <strong>APJ Abdul Kalam Technological University (KTU)</strong>, or any of their subsidiaries, colleges, or affiliates.
                </p>
                <p>
                  <strong>Trademarks:</strong> The name "ETLab" as well as related names, marks, emblems, and images are registered trademarks of their respective owners. Their use on this website and documentation is strictly for identification, interoperability, and descriptive purposes under fair use doctrine.
                </p>
                <p>
                  <strong>Software Warranty:</strong> This software is provided under the <a href="https://github.com/nimdme/et-bridge/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-brand-400 font-bold hover:underline">MIT License</a> on an "AS IS" basis, without warranty of any kind, express or implied.
                </p>
              </div>
            </section>

            {/* Section 10: Contact Information */}
            <section id="contact" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 font-mono">
                  10. Contact Information
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-2">
                <p>
                  For security inquiries, vulnerability disclosures, code contributions, or privacy questions regarding ETBridge:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                  <li>Author & Maintainer: <strong>NiMD (Niranjan M D)</strong></li>
                  <li>Developer Website: <a href="https://nimd.me" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">https://nimd.me</a></li>
                  <li>GitHub Issues & Audits: <a href="https://github.com/nimdme/et-bridge/issues" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">github.com/nimdme/et-bridge/issues</a></li>
                </ul>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}
