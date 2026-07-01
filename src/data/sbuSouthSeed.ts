import type {
  Facility,
  ComplianceRecord,
  FacilityType,
  FacilityComplianceStatus,
  ChecklistAnswer,
} from '@/types/facility'
import { facilityCodeFrom, buildChecklist, CHECKLIST_ITEMS, CURRENT_COMPLIANCE_PERIOD } from './facilityData'

// ─────────────────────────────────────────────────────────────────────────────
// South SBU seed expansion — gives the SBU Admin dashboard enough locations
// (16) and facilities (48) to make the Location/Facility Type filters and the
// compliance score actually demonstrate something. Builds on top of the 3
// hand-authored South facilities (bld-1/2/3) already in facilityData.ts —
// kept in this separate file purely so that large, repetitive seed expansion
// doesn't drown the original hand-authored data in diffs.
//
// Deliberately a one-directional import (this file reads from facilityData.ts,
// facilityData.ts never imports this file) to avoid a circular dependency —
// the merge happens in facilityStore.ts instead.
// ─────────────────────────────────────────────────────────────────────────────

const { month: CURRENT_MONTH, year: CURRENT_YEAR } = CURRENT_COMPLIANCE_PERIOD
const PREV_MONTH = CURRENT_MONTH === 1 ? 12 : CURRENT_MONTH - 1
const PREV_YEAR = CURRENT_MONTH === 1 ? CURRENT_YEAR - 1 : CURRENT_YEAR

type AnswerMap = Record<string, { answer: ChecklistAnswer; remarks?: string }>

// ─── Deterministic answer-map templates ───────────────────────────────────────
// buildChecklist's mandatory-filtering is per-type internally and doesn't gate
// which items can carry an answer, so the same template works across any
// FacilityType — no need for type-specific variants.

function buildAnswerMap(count: number, pattern: 'high' | 'good' | 'mediocre' | 'low'): AnswerMap {
  const map: AnswerMap = {}
  CHECKLIST_ITEMS.slice(0, count).forEach((item, i) => {
    let ans: ChecklistAnswer
    if (pattern === 'high') {
      ans = i % 11 === 0 ? 'partial' : 'yes'                                  // ~94%
    } else if (pattern === 'good') {
      ans = i % 8 === 7 ? 'no' : i % 8 === 6 ? 'partial' : 'yes'             // ~82%
    } else if (pattern === 'mediocre') {
      const m = i % 4
      ans = m === 3 ? 'no' : m === 2 ? 'partial' : 'yes'                     // ~62%
    } else {
      ans = i % 3 === 2 ? 'no' : i % 3 === 1 ? 'partial' : 'yes'             // ~51%
    }
    map[item.id] = { answer: ans }
  })
  return map
}

// Produces an AnswerMap that scores close to targetPct (50–99).
// For T≥50%: fills with 'partial' then 'yes' (no 'no' items).
// For T<50%: fills with 'no' then 'partial' (no 'yes' items).
function buildAnswerMapTargeted(targetPct: number): AnswerMap {
  const N = CHECKLIST_ITEMS.length
  const T = targetPct / 100
  const map: AnswerMap = {}
  let partials: number, nos: number
  if (T >= 0.5) {
    partials = Math.round(2 * (1 - T) * N)
    nos = 0
  } else {
    nos = N - Math.round(2 * T * N)
    partials = N - nos
  }
  CHECKLIST_ITEMS.forEach((item, i) => {
    let ans: ChecklistAnswer
    if (i < nos) ans = 'no'
    else if (i < nos + partials) ans = 'partial'
    else ans = 'yes'
    map[item.id] = { answer: ans }
  })
  return map
}

const FULL_HIGH     = buildAnswerMap(CHECKLIST_ITEMS.length, 'high')      // ~94% — 5 stars
const FULL_MEDIOCRE = buildAnswerMap(CHECKLIST_ITEMS.length, 'mediocre')  // ~62% — 3 stars
const PARTIAL_EARLY = buildAnswerMap(14, 'high')                          // draft, just started
const PARTIAL_LATE = buildAnswerMap(45, 'mediocre')                       // draft, most of the way through

type Template = 'FULL_HIGH' | 'FULL_MEDIOCRE' | 'PARTIAL_EARLY' | 'PARTIAL_LATE' | 'NONE'

const TEMPLATE_MAP: Record<Template, AnswerMap> = {
  FULL_HIGH, FULL_MEDIOCRE, PARTIAL_EARLY, PARTIAL_LATE, NONE: {},
}
const TEMPLATE_PROGRESS: Record<Template, number> = {
  FULL_HIGH: CHECKLIST_ITEMS.length,
  FULL_MEDIOCRE: CHECKLIST_ITEMS.length,
  PARTIAL_EARLY: 14,
  PARTIAL_LATE: 45,
  NONE: 0,
}
const TEMPLATE_DRAFT_AGE: Partial<Record<Template, number>> = {
  PARTIAL_EARLY: 9,
  PARTIAL_LATE: 24,
}

// ─── Builders (same spirit as facilityCodeFrom/buildChecklist) ───────────────

let seq = 5 // bld-1..bld-4 already exist in facilityData.ts

function makeFacility(opts: {
  type: FacilityType
  state: string
  city: string
  location: string
  pinCode: string
  admin: string
  empId: string
  email: string
  phone: string
  status: FacilityComplianceStatus
  template: Template
  facilityStatus?: 'active' | 'inactive'
}): Facility {
  const id = `bld-${seq++}`
  return {
    id,
    facilityId: facilityCodeFrom(opts.type, opts.state, opts.city, opts.location, opts.pinCode),
    name: opts.type,
    type: opts.type,
    sbu: 'South',
    state: opts.state,
    city: opts.city,
    location: opts.location,
    address1: `${opts.location.split(' - ')[0]} Main Road`,
    pinCode: opts.pinCode,
    floors: opts.type === 'Parts Warehouse' ? 1 : 2,
    status: opts.facilityStatus ?? 'active',
    locationAdmin: opts.admin,
    locationAdminEmpId: opts.empId,
    locationAdminEmail: opts.email,
    locationAdminPhone: opts.phone,
    complianceStatus: opts.status,
    complianceProgress: TEMPLATE_PROGRESS[opts.template],
    complianceTotal: CHECKLIST_ITEMS.length,
    ...(TEMPLATE_DRAFT_AGE[opts.template] !== undefined ? { complianceDraftAge: TEMPLATE_DRAFT_AGE[opts.template] } : {}),
  }
}

function makeLocationRecord(opts: {
  locationName: string
  facilityTypes: FacilityType[]
  admin: string
  status: FacilityComplianceStatus
  template: Template
  month: number
  year: number
  idSuffix: string
}): ComplianceRecord {
  const isSubmittedTemplate = opts.template === 'FULL_HIGH' || opts.template === 'FULL_MEDIOCRE'
  return {
    id: `comp-${opts.idSuffix}`,
    locationName: opts.locationName,
    facilityTypes: opts.facilityTypes,
    sbu: 'South',
    month: opts.month,
    year: opts.year,
    status: opts.status,
    checklist: buildChecklist('Branch Office', TEMPLATE_MAP[opts.template]),
    ...(isSubmittedTemplate ? { submittedAt: '2026-06-04T10:00:00', submittedBy: opts.admin } : {}),
  }
}

function makeAprilLocationRecord(opts: {
  locationName: string
  facilityTypes: FacilityType[]
  admin: string
  kind: 'submitted' | 'missed'
  idSuffix: string
}): ComplianceRecord {
  if (opts.kind === 'missed') {
    return {
      id: `comp-${opts.idSuffix}`,
      locationName: opts.locationName,
      facilityTypes: opts.facilityTypes,
      sbu: 'South',
      month: PREV_MONTH,
      year: PREV_YEAR,
      status: 'missed',
      checklist: buildChecklist('Branch Office'),
    }
  }
  return {
    id: `comp-${opts.idSuffix}`,
    locationName: opts.locationName,
    facilityTypes: opts.facilityTypes,
    sbu: 'South',
    month: PREV_MONTH,
    year: PREV_YEAR,
    status: 'submitted',
    checklist: buildChecklist('Branch Office', FULL_HIGH),
    submittedAt: '2026-05-04T09:30:00',
    submittedBy: opts.admin,
    approvedAt: '2026-05-07T12:00:00',
    approvedBy: 'Suresh Nair',
  }
}

// ─── Location roster ───────────────────────────────────────────────────────
// A location is normally named just by its city; "Locality - City" is the rare
// exception for a city with more than one location (capped at 3 — Chennai here).

interface LocationSeedFacility {
  type: FacilityType
  status: FacilityComplianceStatus
  template: Template
  aprilHistory: 'submitted' | 'missed'
  facilityStatus?: 'active' | 'inactive'
}

interface LocationSeed {
  location: string
  state: string
  city: string
  admin: string
  empId: string
  email: string
  phone: string
  pinCode: string
  facilities: LocationSeedFacility[]
}

const LOCATION_SEEDS: LocationSeed[] = [
  // Existing locations — top up to 3 facilities each (bld-1/2/3 already defined in facilityData.ts)
  {
    location: 'Anna Salai - Chennai', state: 'Tamil Nadu', city: 'Chennai', admin: 'Arjun Nair',
    empId: '1042', email: 'arjun.nair@gmmco.in', phone: '+91 98400 12345', pinCode: '600002',
    facilities: [
      { type: 'HQ', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'draft', template: 'PARTIAL_LATE', aprilHistory: 'submitted' },
      { type: 'MRC', status: 'pending', template: 'NONE', aprilHistory: 'missed', facilityStatus: 'inactive' },
    ],
  },
  {
    location: 'Coimbatore', state: 'Tamil Nadu', city: 'Coimbatore', admin: 'Meena Suresh',
    empId: '1087', email: 'meena.suresh@gmmco.in', phone: '+91 99400 23456', pinCode: '641012',
    facilities: [
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Madurai', state: 'Tamil Nadu', city: 'Madurai', admin: 'Ravi Kumar',
    empId: '1015', email: 'ravi.kumar@gmmco.in', phone: '+91 94450 34567', pinCode: '625010',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  // New locations
  {
    location: 'T Nagar - Chennai', state: 'Tamil Nadu', city: 'Chennai', admin: 'Karthik Subramaniam',
    empId: '1063', email: 'karthik.subramaniam@gmmco.in', phone: '+91 97890 45678', pinCode: '600017',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'draft', template: 'PARTIAL_LATE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Nungambakkam - Chennai', state: 'Tamil Nadu', city: 'Chennai', admin: 'Divya Menon',
    empId: '1031', email: 'divya.menon@gmmco.in', phone: '+91 96001 56789', pinCode: '600034',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Trichy', state: 'Tamil Nadu', city: 'Trichy', admin: 'Suresh Pillai',
    empId: '1058', email: 'suresh.pillai@gmmco.in', phone: '+91 98761 67890', pinCode: '620001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Salem', state: 'Tamil Nadu', city: 'Salem', admin: 'Anitha Raj',
    empId: '1074', email: 'anitha.raj@gmmco.in', phone: '+91 95550 78901', pinCode: '636001',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Tiruppur', state: 'Tamil Nadu', city: 'Tiruppur', admin: 'Vivek Krishnan',
    empId: '1049', email: 'vivek.krishnan@gmmco.in', phone: '+91 93300 89012', pinCode: '641601',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
      { type: 'Repair Center', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Vellore', state: 'Tamil Nadu', city: 'Vellore', admin: 'Geetha Nair',
    empId: '1022', email: 'geetha.nair@gmmco.in', phone: '+91 94870 90123', pinCode: '632001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Tirunelveli', state: 'Tamil Nadu', city: 'Tirunelveli', admin: 'Senthil Kumar',
    empId: '1091', email: 'senthil.kumar@gmmco.in', phone: '+91 98220 01234', pinCode: '627001',
    facilities: [
      { type: 'Branch Office', status: 'overdue', template: 'NONE', aprilHistory: 'missed', facilityStatus: 'inactive' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted', facilityStatus: 'inactive' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted', facilityStatus: 'inactive' },
    ],
  },
  {
    location: 'Kochi', state: 'Kerala', city: 'Kochi', admin: 'Sneha Varma',
    empId: '1036', email: 'sneha.varma@gmmco.in', phone: '+91 91760 12345', pinCode: '682001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Trivandrum', state: 'Kerala', city: 'Trivandrum', admin: 'Prakash Iyer',
    empId: '1067', email: 'prakash.iyer@gmmco.in', phone: '+91 99870 23456', pinCode: '695001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Kozhikode', state: 'Kerala', city: 'Kozhikode', admin: 'Deepa Nambiar',
    empId: '1053', email: 'deepa.nambiar@gmmco.in', phone: '+91 94400 34567', pinCode: '673001',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Thrissur', state: 'Kerala', city: 'Thrissur', admin: 'Rajesh Menon',
    empId: '1079', email: 'rajesh.menon@gmmco.in', phone: '+91 97110 45678', pinCode: '680001',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
    ],
  },
  {
    location: 'Bengaluru', state: 'Karnataka', city: 'Bengaluru', admin: 'Lakshmi Hegde',
    empId: '1018', email: 'lakshmi.hegde@gmmco.in', phone: '+91 98450 56789', pinCode: '560001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Mysuru', state: 'Karnataka', city: 'Mysuru', admin: 'Manoj Gowda',
    empId: '1044', email: 'manoj.gowda@gmmco.in', phone: '+91 93210 67890', pinCode: '570001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
]

// Records for the 3 base locations are defined in facilityData.ts.
// This seed creates records only for new locations.
const BASE_LOCATIONS = new Set(['Anna Salai - Chennai', 'Coimbatore', 'Madurai'])

export const southSeedFacilities: Facility[] = []
export const southSeedComplianceRecords: ComplianceRecord[] = []

for (const loc of LOCATION_SEEDS) {
  const locFacilities: Facility[] = []
  for (const f of loc.facilities) {
    const facility = makeFacility({
      type: f.type,
      state: loc.state,
      city: loc.city,
      location: loc.location,
      pinCode: loc.pinCode,
      admin: loc.admin,
      empId: loc.empId,
      email: loc.email,
      phone: loc.phone,
      status: f.status,
      template: f.template,
      facilityStatus: f.facilityStatus,
    })
    southSeedFacilities.push(facility)
    locFacilities.push(facility)
  }

  if (!BASE_LOCATIONS.has(loc.location)) {
    const facilityTypes = [...new Set(locFacilities.map((f) => f.type))] as FacilityType[]
    const representative = loc.facilities[0]
    const idSlug = loc.location.replace(/[\s-]+/g, '_').toLowerCase()
    const someAprilMissed = loc.facilities.some((f) => f.aprilHistory === 'missed')
    southSeedComplianceRecords.push(
      makeLocationRecord({
        locationName: loc.location,
        facilityTypes,
        admin: loc.admin,
        status: representative.status,
        template: representative.template,
        month: CURRENT_MONTH,
        year: CURRENT_YEAR,
        idSuffix: `${idSlug}-cur`,
      })
    )
    southSeedComplianceRecords.push(
      makeAprilLocationRecord({
        locationName: loc.location,
        facilityTypes,
        admin: loc.admin,
        kind: someAprilMissed ? 'missed' : 'submitted',
        idSuffix: `${idSlug}-apr`,
      })
    )
  }
}

// ─── Historical compliance records (Aug 2025 – Mar 2026) ─────────────────────
// Provides 10 months of data for the Compliance Heatmap modal. Deterministic
// patterns give the heatmap visual variety without any randomness.

const HIST_PERIODS = [
  { month: 6, year: 2025 }, { month: 7, year: 2025 },
  { month: 8, year: 2025 }, { month: 9, year: 2025 }, { month: 10, year: 2025 },
  { month: 11, year: 2025 }, { month: 12, year: 2025 },
  { month: 1, year: 2026 }, { month: 2, year: 2026 }, { month: 3, year: 2026 },
]

// Numbers = target score %, 'X' = missed. 10 entries per location: Jun 2025 → Mar 2026.
// Indices 4–9 (Oct–Mar) are the 6M trend-chart window.
// Design rule: 6M segment is monotone-up, monotone-down, or at most one bend (V/∧).
// No consecutive equal values, no flat segments.
type Pat = number | 'X'
const HIST_PATTERNS: Array<Array<Pat>> = [
  [57, 'X', 'X', 60, 65, 68, 73, 78, 84, 90], // 0  Anna Salai    — strong recovery, rising 25 pts in 6M
  [72,  75,  77, 79, 80, 82, 83, 84, 86, 87], // 1  Coimbatore    — gentle steady climb
  [58, 'X', 'X', 'X', 60, 63, 68, 74, 80, 88], // 2  Madurai       — dramatic recovery after misses
  [76,  90,  93, 85, 83, 79, 75, 79, 84, 88], // 3  T Nagar       — dips then recovers (V in 6M)
  [88,  70,  73, 76, 80, 84, 'X', 79, 86, 90], // 4  Nungambakkam  — gap mid-way, then rises
  [82,  84,  86, 87, 88, 89, 91, 92, 93, 94], // 5  Trichy        — benchmark: steady climb to top
  [70,  90,  92, 93, 85, 87, 89, 91, 93, 94], // 6  Salem         — high performer, rising
  ['X', 57,  60, 63, 54, 'X', 56, 61, 70, 78], // 7  Tiruppur      — recovering from two gaps
  [91,  93,  94, 92, 87, 90, 'X', 86, 92, 94], // 8  Vellore       — mostly high, gap in Dec
  [90,  88,  87, 'X', 88, 84, 79, 73, 67, 61], // 9  Tirunelveli   — clear decline, drops 27 pts
  [91,  72,  74, 87, 80, 84, 87, 89, 91, 93], // 10 Kochi         — steady rise in 6M
  [72,  90,  92, 94, 86, 88, 90, 91, 92, 93], // 11 Trivandrum    — stable high, climbing
  [93,  91,  92, 94, 84, 89, 'X', 85, 91, 93], // 12 Kozhikode     — high with a gap
  [70,  90,  92, 73, 76, 78, 84, 87, 90, 93], // 13 Thrissur      — gradual climb in 6M
  [84,  85,  87, 88, 89, 90, 91, 92, 93, 94], // 14 Bengaluru     — consistently excellent
  [74,  90,  92, 93, 85, 87, 88, 90, 91, 92], // 15 Mysuru        — mostly high, rising
]

function histNextMonth(p: { month: number; year: number }) {
  return p.month === 12 ? { month: 1, year: p.year + 1 } : { month: p.month + 1, year: p.year }
}
function histSubmittedAt(p: { month: number; year: number }): string {
  const n = histNextMonth(p)
  return `${n.year}-${String(n.month).padStart(2, '0')}-04T09:30:00`
}
function histApprovedAt(p: { month: number; year: number }): string {
  const n = histNextMonth(p)
  return `${n.year}-${String(n.month).padStart(2, '0')}-07T12:00:00`
}

// Aug 2025 – Mar 2026 for all 16 locations
LOCATION_SEEDS.forEach((loc, locIdx) => {
  const idSlug = loc.location.replace(/[\s-]+/g, '_').toLowerCase()
  const facilityTypes = [...new Set(loc.facilities.map((f) => f.type))] as FacilityType[]
  const patterns = HIST_PATTERNS[locIdx]

  HIST_PERIODS.forEach((period, monthIdx) => {
    const pat = patterns[monthIdx]
    const idSuffix = `${idSlug}-h${period.month}_${period.year}`
    if (pat === 'X') {
      southSeedComplianceRecords.push({
        id: `comp-${idSuffix}`,
        locationName: loc.location,
        facilityTypes,
        sbu: 'South',
        month: period.month,
        year: period.year,
        status: 'missed',
        checklist: buildChecklist('Branch Office'),
      })
    } else {
      const tmpl = buildAnswerMapTargeted(pat as number)
      southSeedComplianceRecords.push({
        id: `comp-${idSuffix}`,
        locationName: loc.location,
        facilityTypes,
        sbu: 'South',
        month: period.month,
        year: period.year,
        status: 'submitted',
        checklist: buildChecklist('Branch Office', tmpl),
        submittedAt: histSubmittedAt(period),
        submittedBy: loc.admin,
        approvedAt: histApprovedAt(period),
        approvedBy: 'Suresh Nair',
      })
    }
  })
})
