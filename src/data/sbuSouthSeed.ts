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

function buildAnswerMap(count: number, pattern: 'high' | 'mediocre'): AnswerMap {
  const map: AnswerMap = {}
  CHECKLIST_ITEMS.slice(0, count).forEach((item, i) => {
    if (pattern === 'high') {
      map[item.id] = { answer: i % 11 === 0 ? 'partial' : 'yes' }
    } else {
      const m = i % 4
      map[item.id] = { answer: m === 3 ? 'no' : m === 2 ? 'partial' : 'yes' }
    }
  })
  return map
}

const FULL_HIGH = buildAnswerMap(CHECKLIST_ITEMS.length, 'high')          // ~94% — submitted, good score
const FULL_MEDIOCRE = buildAnswerMap(CHECKLIST_ITEMS.length, 'mediocre')  // ~62% — submitted, so-so score
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
  status: FacilityComplianceStatus
  template: Template
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
    status: 'active',
    locationAdmin: opts.admin,
    complianceStatus: opts.status,
    complianceProgress: TEMPLATE_PROGRESS[opts.template],
    complianceTotal: CHECKLIST_ITEMS.length,
    ...(TEMPLATE_DRAFT_AGE[opts.template] !== undefined ? { complianceDraftAge: TEMPLATE_DRAFT_AGE[opts.template] } : {}),
  }
}

function makeCurrentRecord(facility: Facility, template: Template): ComplianceRecord {
  const isSubmittedTemplate = template === 'FULL_HIGH' || template === 'FULL_MEDIOCRE'
  return {
    id: `comp-${facility.id}-cur`,
    facilityId: facility.id,
    facilityName: facility.name,
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
    status: facility.complianceStatus,
    checklist: buildChecklist(facility.type, TEMPLATE_MAP[template]),
    ...(isSubmittedTemplate ? { submittedAt: '2026-06-04T10:00:00', submittedBy: facility.locationAdmin } : {}),
  }
}

function makeAprilHistory(facility: Facility, kind: 'submitted' | 'missed'): ComplianceRecord {
  if (kind === 'missed') {
    return {
      id: `comp-${facility.id}-apr`,
      facilityId: facility.id,
      facilityName: facility.name,
      month: PREV_MONTH,
      year: PREV_YEAR,
      status: 'missed',
      checklist: buildChecklist(facility.type),
    }
  }
  return {
    id: `comp-${facility.id}-apr`,
    facilityId: facility.id,
    facilityName: facility.name,
    month: PREV_MONTH,
    year: PREV_YEAR,
    status: 'submitted',
    checklist: buildChecklist(facility.type, FULL_HIGH),
    submittedAt: '2026-05-04T09:30:00',
    submittedBy: facility.locationAdmin,
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
}

interface LocationSeed {
  location: string
  state: string
  city: string
  admin: string
  pinCode: string
  facilities: LocationSeedFacility[]
}

const LOCATION_SEEDS: LocationSeed[] = [
  // Existing locations — top up to 3 facilities each (bld-1/2/3 already defined in facilityData.ts)
  {
    location: 'Anna Salai - Chennai', state: 'Tamil Nadu', city: 'Chennai', admin: 'Arjun Nair', pinCode: '600002',
    facilities: [
      { type: 'HQ', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'draft', template: 'PARTIAL_LATE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Coimbatore', state: 'Tamil Nadu', city: 'Coimbatore', admin: 'Meena Suresh', pinCode: '641012',
    facilities: [
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Madurai', state: 'Tamil Nadu', city: 'Madurai', admin: 'Ravi Kumar', pinCode: '625010',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  // New locations
  {
    location: 'T Nagar - Chennai', state: 'Tamil Nadu', city: 'Chennai', admin: 'Karthik Subramaniam', pinCode: '600017',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'draft', template: 'PARTIAL_LATE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Nungambakkam - Chennai', state: 'Tamil Nadu', city: 'Chennai', admin: 'Divya Menon', pinCode: '600034',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Trichy', state: 'Tamil Nadu', city: 'Trichy', admin: 'Suresh Pillai', pinCode: '620001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Salem', state: 'Tamil Nadu', city: 'Salem', admin: 'Anitha Raj', pinCode: '636001',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Tiruppur', state: 'Tamil Nadu', city: 'Tiruppur', admin: 'Vivek Krishnan', pinCode: '641601',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
      { type: 'Repair Center', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Vellore', state: 'Tamil Nadu', city: 'Vellore', admin: 'Geetha Nair', pinCode: '632001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Tirunelveli', state: 'Tamil Nadu', city: 'Tirunelveli', admin: 'Senthil Kumar', pinCode: '627001',
    facilities: [
      { type: 'Branch Office', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Kochi', state: 'Kerala', city: 'Kochi', admin: 'Sneha Varma', pinCode: '682001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Trivandrum', state: 'Kerala', city: 'Trivandrum', admin: 'Prakash Iyer', pinCode: '695001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Kozhikode', state: 'Kerala', city: 'Kozhikode', admin: 'Deepa Nambiar', pinCode: '673001',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Thrissur', state: 'Kerala', city: 'Thrissur', admin: 'Rajesh Menon', pinCode: '680001',
    facilities: [
      { type: 'Branch Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'submitted', template: 'FULL_MEDIOCRE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'missed' },
    ],
  },
  {
    location: 'Bengaluru', state: 'Karnataka', city: 'Bengaluru', admin: 'Lakshmi Hegde', pinCode: '560001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Executive Office', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
  {
    location: 'Mysuru', state: 'Karnataka', city: 'Mysuru', admin: 'Manoj Gowda', pinCode: '570001',
    facilities: [
      { type: 'Branch Office', status: 'submitted', template: 'FULL_HIGH', aprilHistory: 'submitted' },
      { type: 'Parts Warehouse', status: 'pending', template: 'NONE', aprilHistory: 'submitted' },
      { type: 'Repair Center', status: 'overdue', template: 'NONE', aprilHistory: 'submitted' },
    ],
  },
]

export const southSeedFacilities: Facility[] = []
export const southSeedComplianceRecords: ComplianceRecord[] = []

for (const loc of LOCATION_SEEDS) {
  for (const f of loc.facilities) {
    const facility = makeFacility({
      type: f.type,
      state: loc.state,
      city: loc.city,
      location: loc.location,
      pinCode: loc.pinCode,
      admin: loc.admin,
      status: f.status,
      template: f.template,
    })
    southSeedFacilities.push(facility)
    southSeedComplianceRecords.push(makeCurrentRecord(facility, f.template))
    southSeedComplianceRecords.push(makeAprilHistory(facility, f.aprilHistory))
  }
}
