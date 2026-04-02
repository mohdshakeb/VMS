export type VisitStatus =
  | 'pending-approval'
  | 'pending-confirmation'
  | 'scheduled'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'rejected'
  | 'cancelled'

export type EntryPath = 'employee-request' | 'walk-in' | 'self-register' | 'pre-scheduled'

export type LocationType = 'enterprise-office' | 'branch-office'

export type Purpose = 'official' | 'training' | 'personal' | 'customer' | 'other'

export type VisitType =
  | 'interview'
  | 'contractor'
  | 'vendor'
  | 'customer'
  | 'government-official'
  | 'cat-officials'
  | 'employee-other-branch'
  | 'employee-visitor'
  | 'general-visitor'
  | 'visitor'
  | 'other'

export type BusinessSegment =
  | 'machines'
  | 'engines'
  | 'parts-purchased'
  | 'service-inquiry'
  | 'other'

export type VisitorPriority = 'immediate' | 'in-a-month' | 'exploring'

export type Department = 'admin' | 'hr' | 'it' | 'accounts'

export interface Delegate {
  name: string
  mobile: string
}

export interface Visit {
  id: string
  visitorId: string
  hostEmployeeId: string
  locationId: string
  status: VisitStatus
  entryPath: EntryPath
  purpose: Purpose
  visitType: VisitType
  scheduledDate: string
  scheduledTime: string
  duration?: number        // expected duration in minutes
  checkInTime?: string
  checkOutTime?: string
  badgeNumber?: string
  rejectionReason?: string
  createdAt: string
  createdBy: string
  notes?: string
  // Extended fields
  department?: string
  delegates?: Delegate[]
  laptopDetails?: string
  otherDeviceDetails?: string
  idProofNumber?: string
  businessSegment?: BusinessSegment
  priority?: VisitorPriority
  model?: string
  businessSegmentRemarks?: string
}

/** Purpose options available per location type */
export const PURPOSE_BY_LOCATION: Record<LocationType, Purpose[]> = {
  'enterprise-office': ['official', 'training', 'personal'],
  'branch-office': ['customer', 'other'],
}

/** Visit type options available per purpose */
export const VISIT_TYPE_BY_PURPOSE: Record<Purpose, VisitType[]> = {
  official: ['interview', 'contractor', 'vendor', 'customer', 'government-official', 'cat-officials', 'employee-other-branch'],
  training: ['interview', 'contractor', 'vendor'],
  personal: ['employee-visitor', 'general-visitor', 'visitor'],
  customer: ['customer'],
  other: ['other', 'visitor'],
}
