import type { ComplianceChecklistEntry, ComplianceRecord, Facility, FacilityComplianceStatus } from '@/types/facility'
import { getComplianceDueDate, CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'

export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const COMPLIANCE_LABEL: Record<FacilityComplianceStatus, string> = {
  pending: 'Pending', draft: 'Draft', submitted: 'Submitted',
  updated: 'Updated', overdue: 'Overdue', missed: 'Missed',
}

export const COMPLIANCE_STYLE: Record<FacilityComplianceStatus, string> = {
  pending: 'bg-yellow-surface text-yellow-fg',
  draft: 'bg-surface-secondary text-text-secondary',
  submitted: 'bg-blue-surface text-blue-fg',
  updated: 'bg-purple-surface text-purple-fg',
  overdue: 'bg-red-surface text-red-fg',
  missed: 'bg-surface-secondary text-text-tertiary',
}

const SUBMITTED_STATUSES = ['submitted', 'updated', 'approved']

const { month: PERIOD_MONTH, year: PERIOD_YEAR } = CURRENT_COMPLIANCE_PERIOD

export const DUE_DEADLINE = getComplianceDueDate(PERIOD_MONTH, PERIOD_YEAR)
const NEXT_PERIOD_MONTH = PERIOD_MONTH === 12 ? 1 : PERIOD_MONTH + 1
const NEXT_PERIOD_YEAR = PERIOD_MONTH === 12 ? PERIOD_YEAR + 1 : PERIOD_YEAR
export const NEXT_DEADLINE = getComplianceDueDate(NEXT_PERIOD_MONTH, NEXT_PERIOD_YEAR)

export function isSubmitted(status: FacilityComplianceStatus) {
  return status === 'submitted' || status === 'updated'
}

export function getLastCompliance(records: ComplianceRecord[], locationName: string) {
  return [...records]
    .filter((r) => r.locationName === locationName && SUBMITTED_STATUSES.includes(r.status))
    .sort((a, b) => b.year - a.year || b.month - a.month)[0] ?? null
}

export function getCurrentRecord(records: ComplianceRecord[], locationName: string) {
  return records.find((r) => r.locationName === locationName && r.month === PERIOD_MONTH && r.year === PERIOD_YEAR) ?? null
}

// ─── Location Admin scope ─────────────────────────────────────────────────
// The prototype's single Location Admin login is scoped to 3 locations
// within the South SBU, rather than every South facility.
export const LOCATION_ADMIN_LOCATIONS = ['Anna Salai - Chennai', 'Coimbatore', 'Madurai']

export function scopeToLocationAdmin(facilities: Facility[]): Facility[] {
  return facilities.filter((f) => LOCATION_ADMIN_LOCATIONS.includes(f.location))
}

// ─── Location grouping (SBU Admin "Locations" tab) ───────────────────────────
// There's no separate Location entity — a Location is derived by grouping
// facilities on the existing `location` string field.

export interface LocationGroup {
  location: string
  state: string
  admins: string[]
  facilities: Facility[]
  statusCounts: Partial<Record<FacilityComplianceStatus, number>>
}

export function groupFacilitiesByLocation(facilities: Facility[]): LocationGroup[] {
  const keys = [...new Set(facilities.map((f) => f.location))]
  return keys.map((location) => {
    const facs = facilities.filter((f) => f.location === location)
    const admins = [...new Set(facs.map((f) => f.locationAdmin).filter((n): n is string => Boolean(n)))]
    const statusCounts = facs.reduce<Partial<Record<FacilityComplianceStatus, number>>>((acc, f) => {
      acc[f.complianceStatus] = (acc[f.complianceStatus] ?? 0) + 1
      return acc
    }, {})
    return { location, state: facs[0]?.state ?? '', admins, facilities: facs, statusCounts }
  })
}

// ─── Compliance scoring (SBU Admin report card) ──────────────────────────────

const ANSWER_POINTS: Record<string, number> = { yes: 1, partial: 0.5, no: 0 }

export interface SectionScore {
  section: string
  max: number
  score: number
  pct: number
}

export interface ComplianceScore {
  sections: SectionScore[]
  maxScore: number
  facilityScore: number
  percentage: number
  stars: number
}

function starsFromPct(pct: number): number {
  if (pct >= 90) return 5
  if (pct >= 75) return 4
  if (pct >= 60) return 3
  if (pct >= 40) return 2
  return 1
}

/** Yes = 1pt, Partial = 0.5pt, No = 0pt. N/A items are excluded from both max and score. Unanswered items count toward the max with 0 points. */
export function scoreChecklist(checklist: ComplianceChecklistEntry[]): ComplianceScore {
  const sectionNames = [...new Set(checklist.map((e) => e.section))]

  const sections = sectionNames.map((section) => {
    const applicable = checklist.filter((e) => e.section === section && e.answer !== 'na')
    const max = applicable.length
    const score = applicable.reduce((sum, e) => sum + (e.answer ? ANSWER_POINTS[e.answer] ?? 0 : 0), 0)
    const pct = max > 0 ? Math.round((score / max) * 100) : 0
    return { section, max, score, pct }
  })

  const maxScore = sections.reduce((sum, s) => sum + s.max, 0)
  const facilityScore = sections.reduce((sum, s) => sum + s.score, 0)
  const percentage = maxScore > 0 ? Math.round((facilityScore / maxScore) * 100) : 0

  return { sections, maxScore, facilityScore, percentage, stars: starsFromPct(percentage) }
}
