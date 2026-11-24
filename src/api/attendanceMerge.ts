import type { DayTimetable, TimetablePeriod } from './types'

/**
 * One marked hour from POST /attendancebyday ({ month, year }) → `days[date][]`.
 * This is what ETLab's official calendar renders.
 */
export interface AttendanceRecord {
  hour: number
  sub?: string
  subject_code?: string
  subject_type?: string
  /** "Present" | "Absent" | "Duty Leave" | "On Duty" */
  status?: string
  counts_as_present?: boolean
  attendance_type?: string
  source?: string
  /** Comma-joined string here (timetablenew uses a string[]). */
  covered_topics?: string | string[] | null
}

/**
 * Maps a record to our attendance_status vocabulary. Mirrors ETLab's frontend: an explicit
 * `counts_as_present` wins; "Duty Leave" / "On Duty" count as present.
 */
export function recordStatus(r: AttendanceRecord): string {
  const status = String(r.status || '').trim().toLowerCase()
  const type = String(r.attendance_type || '').trim().toLowerCase()
  if (status.includes('duty') || status === 'on duty' || type.includes('duty')) return 'duty_leave'
  if (status === 'present' || status === 'p') return 'present'
  if (status === 'absent' || status === 'a') return 'absent'
  if (typeof r.counts_as_present === 'boolean') return r.counts_as_present ? 'present' : 'absent'
  return status || 'not_marked'
}

function topicsOf(v: AttendanceRecord['covered_topics']): string[] {
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean)
  if (typeof v !== 'string') return []
  return v.split(',').map(s => s.trim()).filter(Boolean)
}

const cleanCode = (v?: string) => String(v || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

/**
 * Overlays ETLab's attendance records onto the scheduled timetable.
 *
 * /timetablenew returns the *planned* timetable: "Minor" slots, lab blocks and swapped hours
 * show the scheduled subject, and many marked hours come back as "N/A". The attendance records
 * say which subject was actually taught and how it was marked, so for every marked hour they
 * replace the scheduled period's subject, code, type, status and topics. Unmarked hours keep
 * the timetable entry (with its substitution/suspension info); marked hours that have no
 * timetable slot are added.
 */
export function mergeAttendanceIntoTimetable(
  timetable: DayTimetable[],
  days: Record<string, AttendanceRecord[]> | null | undefined
): DayTimetable[] {
  if (!days || typeof days !== 'object') return timetable
  const byDate = new Map<string, DayTimetable>()
  timetable.forEach(d => { if (d?.date) byDate.set(d.date, d) })

  for (const [date, records] of Object.entries(days)) {
    if (!Array.isArray(records) || records.length === 0) continue
    const existing = byDate.get(date)
    const periods: TimetablePeriod[] = (existing?.sub || []).map(p => ({ ...p }))
    const consumed = new Set<TimetablePeriod>()

    for (const r of records) {
      const hour = Number(r.hour) || 0
      if (!hour) continue
      // Prefer the slot for this hour whose subject code matches, else the first unused one.
      const candidates = periods.filter(p => p.hour === hour && !consumed.has(p))
      const sameCode = candidates.find(p => cleanCode(p.subject_code) && cleanCode(p.subject_code) === cleanCode(r.subject_code))
      const slot = sameCode || candidates[0]
      const status = recordStatus(r)
      const topics = topicsOf(r.covered_topics)
      const subject = String(r.sub || '').trim()

      if (slot) {
        consumed.add(slot)
        const sameName = subject.toLowerCase() === String(slot.subject || '').trim().toLowerCase()
        const changedSubject = !sameCode && !sameName
        Object.assign(slot, {
          subject: subject || slot.subject,
          subject_code: r.subject_code || (changedSubject ? '' : slot.subject_code),
          subject_type: r.subject_type || slot.subject_type,
          attendance_status: status,
          // Same class: keep the timetable's topic array (the record's comma-joined string
          // can't be split reliably when a topic itself contains a comma).
          covered_topics: !changedSubject && slot.covered_topics?.length ? slot.covered_topics : topics,
          suspended: false,
          suspension_reason: undefined
        })
        if (changedSubject) {
          // The timetable's teacher and substitution notes describe the scheduled class.
          slot.teacher_name = ''
          slot.type = r.subject_type?.toLowerCase().includes('practical') ? 'P' : 'T'
          delete slot.change
          delete slot.in_place_of
          delete slot.regular_subject
        }
      } else {
        const added: TimetablePeriod = {
          hour,
          date,
          day: existing?.day,
          type: r.subject_type?.toLowerCase().includes('practical') ? 'P' : 'T',
          subject_type: r.subject_type,
          subject,
          subject_code: r.subject_code || '',
          teacher_name: '',
          attendance_status: status,
          covered_topics: topics
        }
        periods.push(added)
        consumed.add(added)
      }
    }

    periods.sort((a, b) => a.hour - b.hour)
    const dayName = existing?.day || new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
    byDate.set(date, { ...(existing || { date, day: dayName }), sub: periods })
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}
