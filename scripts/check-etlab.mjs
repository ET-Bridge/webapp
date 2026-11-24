#!/usr/bin/env node
/**
 * Early warning for ETLab changes that break ETBridge (run by .github/workflows/etlab-watch.yml).
 *
 * Reads ETLab's own web client (students.etlab.app) and compares it with what we expect:
 *  1. the default API origin their client uses  vs  DEFAULT_ETLAB_API_ORIGIN (src/api/endpoints.ts)
 *     and public/etlab-endpoints.json (the Android app's remote config),
 *  2. the request headers their client sets (a new one, e.g. a non-empty X-Secret or an
 *     attestation header, usually means a new requirement),
 *  3. that the API's /health endpoint answers.
 *
 * Exits 1 when something drifted, so the scheduled workflow fails and GitHub notifies you.
 * No credentials are used and no student data is touched.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const WEB = 'https://students.etlab.app'
const UA = 'Mozilla/5.0 (compatible; ETBridge-watch/1.0)'

/** Headers ETLab's client was known to set as of 2026-11-24. */
const KNOWN_HEADERS = ['Authorization', 'X-Etlab-App', 'X-Institute-ID', 'X-Secret']

const problems = []
const notes = []

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.text()
}

function ourDefaultOrigin() {
  const src = readFileSync(join(root, 'src/api/endpoints.ts'), 'utf8')
  return src.match(/DEFAULT_ETLAB_API_ORIGIN\s*=\s*'([^']+)'/)?.[1]
}

function androidConfigOrigin() {
  try {
    return JSON.parse(readFileSync(join(root, 'public/etlab-endpoints.json'), 'utf8')).apiOrigin
  } catch {
    return undefined
  }
}

async function main() {
  const html = await get(`${WEB}/`)
  const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map(m => m[1]))]
  if (assets.length === 0) throw new Error('No script assets found on students.etlab.app')

  const bundles = await Promise.all(assets.map(a => get(`${WEB}${a}`).catch(() => '')))
  const code = bundles.join('\n')

  // 1. Default API origin: `https://host`.replace(/\/+$/,``) is how their client builds it.
  const defaults = [...new Set([...code.matchAll(/`(https:\/\/[a-z0-9.-]+)`\.replace\(\/\\\/\+\$\//g)].map(m => m[1]))]
  const theirs = defaults[0]
  const ours = ourDefaultOrigin()
  const android = androidConfigOrigin()
  notes.push(`ETLab default API origin(s): ${defaults.join(', ') || 'not found'}`)
  notes.push(`ETBridge default: ${ours}; Android remote config: ${android}`)
  if (!theirs) problems.push("Couldn't find ETLab's default API origin in their bundle (their code changed shape).")
  else {
    if (theirs !== ours) problems.push(`ETLab now uses ${theirs} but src/api/endpoints.ts has ${ours}.`)
    if (theirs !== android) problems.push(`public/etlab-endpoints.json points Android at ${android}, ETLab uses ${theirs}.`)
  }

  // 2. Request headers their axios interceptor sets.
  const headers = [...new Set([...code.matchAll(/\.set\(`(X-[A-Za-z-]+|Authorization)`/g)].map(m => m[1]))].sort()
  notes.push(`Headers set by ETLab's client: ${headers.join(', ')}`)
  const added = headers.filter(h => !KNOWN_HEADERS.includes(h))
  if (added.length) problems.push(`ETLab's client sends new header(s): ${added.join(', ')} — check if the API now requires them.`)
  if (/X-Secret/.test(code) && !/=\(\)=>``,/.test(code)) {
    notes.push('X-Secret may no longer be empty — verify manually.')
  }

  // 3. Health of the API we use.
  const target = ours || theirs
  try {
    const res = await fetch(`${target}/health`, { headers: { 'User-Agent': UA } })
    const body = await res.text()
    notes.push(`${target}/health → ${res.status} ${body.slice(0, 80)}`)
    if (!res.ok) problems.push(`${target}/health returned HTTP ${res.status}${res.headers.get('x-render-routing') ? ` (${res.headers.get('x-render-routing')})` : ''}.`)
  } catch (err) {
    problems.push(`${target}/health unreachable: ${err.message}`)
  }

  console.log(notes.map(n => `• ${n}`).join('\n'))
  if (problems.length) {
    console.error(`\n✗ ETLab drift detected:\n${problems.map(p => `  - ${p}`).join('\n')}`)
    if (process.env.GITHUB_STEP_SUMMARY) {
      const { appendFileSync } = await import('node:fs')
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## ETLab drift detected\n\n${problems.map(p => `- ${p}`).join('\n')}\n\n### Details\n\n${notes.map(n => `- ${n}`).join('\n')}\n`)
    }
    process.exit(1)
  }
  console.log('\n✓ ETLab matches what ETBridge expects.')
}

main().catch(err => {
  console.error(`✗ Check failed: ${err.message}`)
  process.exit(1)
})
