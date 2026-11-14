import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  ExternalLink,
  ShieldCheck,
  Mail,
  FileText
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { BrandLogo } from '../components/BrandLogo'

interface NavSection {
  id: string
  label: string
}

const LEGAL_SECTIONS: NavSection[] = [
  { id: 'preamble', label: '1. Preamble & Scope' },
  { id: 'data-categories', label: '2. Information Handled' },
  { id: 'architecture', label: '3. Technical Architecture' },
  { id: 'cookie-storage', label: '4. Cookie & Storage Policy' },
  { id: 'upstream-services', label: '5. Upstream Services & API' },
  { id: 'retention-erasure', label: '6. Retention & Erasure' },
  { id: 'disclaimer', label: '7. Disclaimer & Trademarks' },
  { id: 'contact', label: '8. Legal Notices & Contact' },
]

export const PrivacyPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<string>('preamble')

  // Dynamic scroll spy identical to DocsPage
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 130
      const sectionElements = LEGAL_SECTIONS
        .map(item => ({ id: item.id, el: document.getElementById(item.id) }))
        .filter((s): s is { id: string; el: HTMLElement } => s.el !== null)

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, el } = sectionElements[i]
        if (el.offsetTop <= scrollPosition) {
          setActiveSection(id)
          return
        }
      }
      if (sectionElements.length > 0) {
        setActiveSection(sectionElements[0].id)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -90
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveSection(id)
    }
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
                Privacy Policy & Terms of Storage
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

      {/* Main Document Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 sticky top-20 hidden lg:block space-y-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-3 px-2">
                Table of Contents
              </span>
              <nav aria-label="Table of Contents" className="space-y-0.5">
                {LEGAL_SECTIONS.map((item) => {
                  const isSelected = activeSection === item.id
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => scrollToSection(e, item.id)}
                      className={`block px-3 py-1.5 rounded-lg transition-all truncate border-l-2 ${
                        isSelected
                          ? 'border-brand-500 text-brand-400 font-bold bg-brand-500/10'
                          : 'border-transparent text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-white dark:hover:text-white hover:bg-zinc-800/40'
                      }`}
                    >
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-slate-100 border border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 text-[11px] text-zinc-400 dark:text-zinc-400 light:text-slate-600 space-y-1.5 font-sans">
              <div className="font-mono text-zinc-300 dark:text-zinc-300 light:text-slate-800 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Remote Storage</span>
              </div>
              <p className="leading-relaxed">
                ETBridge does not run user databases, analytics servers, or tracking networks. All data is processed client-side.
              </p>
            </div>
          </aside>

          {/* Legal Document Body */}
          <main className="lg:col-span-8 max-w-3xl space-y-10">
            
            {/* Formal Document Title & Metadata */}
            <div className="border-b border-zinc-800 dark:border-zinc-800 light:border-slate-200 pb-6 space-y-2">
              <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Official Legal Disclosure • Document Ref: ETB-PRIVACY-2026
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white dark:text-white light:text-slate-900 font-sans">
                Privacy Policy & Terms of Storage
              </h1>
              <div className="text-xs font-mono text-zinc-400 dark:text-zinc-400 light:text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span>Effective Date: November 14, 2026</span>
                <span>•</span>
                <span>Scope: <code className="text-zinc-300 dark:text-zinc-300 light:text-slate-800">etbridge.nimd.me</code></span>
              </div>
            </div>

            {/* Section 1: Preamble */}
            <section id="preamble" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                1. Preamble & Scope
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  This Privacy Policy sets forth the terms, architectural standards, and data handling procedures governing the use of <strong>ETBridge</strong> (&quot;the Application&quot;), an open-source web and Progressive Web App client for college student portals using the ETLab academic management platform.
                </p>
                <p>
                  ETBridge is built on a <strong>zero-knowledge, client-side architecture</strong>. The Application is not a hosted software-as-a-service (SaaS) and maintains no centralized user databases, credential harvesting mechanisms, or remote session stores. All operations, rendering routines, attendance algebra, and schedule caching execute strictly inside the user&apos;s browser runtime environment on their physical device.
                </p>
              </div>
            </section>

            {/* Section 2: Information Handled */}
            <section id="data-categories" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                2. Categories of Information Handled
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  To provide attendance metrics, internal marks analysis, bunk projections, and timetable routines, the Application handles the following categories of data in client volatile memory:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-300 dark:text-zinc-300 light:text-slate-700">
                  <li>
                    <strong>Authentication Credentials:</strong> The user&apos;s ETLab username (admission number or institutional identifier), password, and selected college institute code. These inputs are used strictly to negotiate an official JSON Web Token (JWT) directly with the upstream ETLab authentication server.
                  </li>
                  <li>
                    <strong>Academic & Attendance Records:</strong> Subject-wise attendance percentages, attended and total lecture counts, continuous assessment marks, and exam series evaluations returned by ETLab API endpoints.
                  </li>
                  <li>
                    <strong>Timetable & Roster Schedules:</strong> Daily lecture routines, faculty identifiers, subject codes, and substitution period metadata.
                  </li>
                  <li>
                    <strong>Student Profile Metadata:</strong> Name, roll number, admission register, semester, branch, institutional email, and photo URLs as cataloged on the college&apos;s ETLab server.
                  </li>
                  <li>
                    <strong>Self-Reported Duty Leaves:</strong> Period-level duty leave entries claimed by the user for projected attendance estimation.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Technical Architecture */}
            <section id="architecture" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                3. Technical Architecture & Security Standards
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  <strong>3.1 Direct Client-to-API Communication:</strong> Network queries dispatched by the Application communicate directly between the user&apos;s device and the official ETLab production server (<code className="text-xs font-mono text-brand-400">api.students.etlab.app</code>). No intermediate third-party application servers intercept or record user credentials.
                </p>
                <p>
                  <strong>3.2 In-Transit Cryptographic Protection:</strong> All external API requests are encrypted in transit using industry-standard Transport Layer Security (TLS 1.2 / TLS 1.3).
                </p>
                <p>
                  <strong>3.3 Stateless Edge Routing:</strong> Static assets are distributed via Cloudflare Pages. Where browser Cross-Origin Resource Sharing (CORS) constraints require header relaying (e.g. faculty avatar rendering), a serverless edge function performs stateless transit without persisting or logging payload bytes.
                </p>
              </div>
            </section>

            {/* Section 4: Cookie & Storage Policy */}
            <section id="cookie-storage" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                4. Browser Storage & Cookie Policy
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  <strong>4.1 Zero Cookie Policy:</strong> ETBridge does <strong>not</strong> set, read, or distribute tracking cookies, advertising identifiers, analytical telemetry, or behavioral profiling cookies.
                </p>
                <p>
                  <strong>4.2 Local Storage Registry:</strong> Under the European Union ePrivacy Directive (Article 5(3)), GDPR, and India&apos;s Digital Personal Data Protection Act (DPDPA 2023), client storage used strictly for functional operations requested by the user is exempt from prior consent banners. The Application utilizes HTML5 Web Storage (<code className="text-xs font-mono text-zinc-300">localStorage</code>) solely for the following functional keys:
                </p>

                <div className="overflow-x-auto rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-slate-300 my-3">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-slate-200/60 border-b border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-zinc-400 dark:text-zinc-400 light:text-slate-700">
                      <tr>
                        <th className="p-2.5">Key Name</th>
                        <th className="p-2.5">Classification</th>
                        <th className="p-2.5">Purpose</th>
                        <th className="p-2.5">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 dark:divide-zinc-800 light:divide-slate-200 text-zinc-300 dark:text-zinc-300 light:text-slate-800">
                      <tr>
                        <td className="p-2.5 font-bold text-brand-400">etbridge_session</td>
                        <td className="p-2.5">Strictly Necessary</td>
                        <td className="p-2.5">Maintains active JWT bearer token and student identifier.</td>
                        <td className="p-2.5 text-zinc-400">Until Sign Out</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-brand-400">etbridge_cached_*</td>
                        <td className="p-2.5">Functional</td>
                        <td className="p-2.5">Offline caching of timetable schedules and attendance stats.</td>
                        <td className="p-2.5 text-zinc-400">4-Hour Expiry / Sign Out</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-brand-400">etbridge_last_sync_time</td>
                        <td className="p-2.5">Functional</td>
                        <td className="p-2.5">Timestamp recording last API fetch for background auto-resync.</td>
                        <td className="p-2.5 text-zinc-400">Persistent</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-brand-400">etbridge_remembered_inst</td>
                        <td className="p-2.5">Preferences</td>
                        <td className="p-2.5">Remembers selected college code on login interface.</td>
                        <td className="p-2.5 text-zinc-400">Persistent</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-brand-400">etbridge_theme</td>
                        <td className="p-2.5">Preferences</td>
                        <td className="p-2.5">Remembers dark mode or light mode appearance.</td>
                        <td className="p-2.5 text-zinc-400">Persistent</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-brand-400">etbridge_pwa_*</td>
                        <td className="p-2.5">Preferences</td>
                        <td className="p-2.5">Snooze timers preventing repetitive install prompts.</td>
                        <td className="p-2.5 text-zinc-400">7 Days / Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 5: Upstream Services */}
            <section id="upstream-services" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                5. Upstream Services & API Interactions
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  The Application serves purely as an interface to upstream institutional servers:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300 dark:text-zinc-300 light:text-slate-700">
                  <li>
                    <strong>Official ETLab Server:</strong> All data displayed originates directly from ETLab platforms managed by Etuwa Concepts and contracted by the user&apos;s college. Handling of underlying records is subject to institutional agreements between the student and their college.
                  </li>
                  <li>
                    <strong>Cloudflare Pages:</strong> Static web bundles (HTML/JS/CSS) and edge proxy delivery.
                  </li>
                  <li>
                    <strong>Google Fonts:</strong> The typography stylesheet (Inter) is loaded from Google CDN.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6: Retention & Erasure */}
            <section id="retention-erasure" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                6. Data Retention & User Erasure Rights
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  Because all session information is isolated within the user&apos;s client device, users possess unilateral control over their data:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300 dark:text-zinc-300 light:text-slate-700">
                  <li>
                    <strong>Immediate Session Deletion:</strong> Clicking <strong>Sign Out</strong> instantly deletes all active authentication tokens, profile details, and cached academic items from the device.
                  </li>
                  <li>
                    <strong>Manual Clearing:</strong> Users may clear the entire storage footprint at any time through standard browser privacy preferences (<em>Clear Site Data</em>).
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7: Legal Disclaimer & Trademarks */}
            <section id="disclaimer" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                7. Non-Affiliation & Disclaimer of Warranty
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  <strong>7.1 Non-Affiliation Notice:</strong> ETBridge is an independent, community-maintained open-source project. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <strong>ETLab</strong>, <strong>Etuwa Concepts</strong>, <strong>APJ Abdul Kalam Technological University (KTU)</strong>, or any of their member institutions, subsidiaries, or affiliates.
                </p>
                <p>
                  <strong>7.2 Nominative Fair Use:</strong> The name &quot;ETLab&quot; as well as related marks, names, and logos are registered trademarks of their respective holders. Their appearance within this project is solely for descriptive and compatibility identification under fair use doctrine.
                </p>
                <p>
                  <strong>7.3 Disclaimer of Warranty:</strong> The Application is distributed under the MIT License on an &quot;AS IS&quot; basis, without warranty of any kind, express or implied. Projections, calculations (such as 75% bunk margin limits), and timetable schedules are provided for informational convenience; official academic records maintained by institutional faculty govern all academic evaluations.
                </p>
              </div>
            </section>

            {/* Section 8: Legal Notices & Contact */}
            <section id="contact" className="space-y-3 scroll-mt-24 pb-8">
              <h2 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-900 font-mono border-b border-zinc-900 dark:border-zinc-900 light:border-slate-200/80 pb-1.5">
                8. Legal Notices & Contact
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-700 leading-relaxed space-y-3 font-sans">
                <p>
                  For privacy questions, formal legal notices, vulnerability disclosures, or technical audits regarding ETBridge:
                </p>
                <div className="p-4 rounded-xl bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-100 border border-zinc-800 dark:border-zinc-800 light:border-slate-200 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-300 light:text-slate-800">
                    <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Legal & Privacy Contact:</span>
                    <a
                      href="mailto:wise.axe5872@mk.nimdmail.com"
                      className="text-brand-400 font-bold hover:underline"
                    >
                      wise.axe5872@mk.nimdmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-400 light:text-slate-600">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Codebase & Issues:</span>
                    <a
                      href="https://github.com/nimdme/et-bridge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white dark:hover:text-white light:hover:text-slate-900 underline"
                    >
                      github.com/nimdme/et-bridge
                    </a>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}
