export type VisitStatus =
  | 'pending-approval'
  | 'scheduled'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'rejected'
  | 'cancelled'

export type EntryPath = 'employee-request' | 'walk-in' | 'self-register' | 'pre-scheduled'

export type LocationType = 'enterprise-office' | 'branch-office'

export type Purpose = 'official' | 'personal' | 'training' | 'interview' | 'delivery'

export type VisitType =
  | 'contractor'
  | 'vendor'
  | 'customer'
  | 'government-official'
  | 'cat-officials'
  | 'employee-other-branch'
  | 'general-visitor'
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
  duration?: number          // expected duration in minutes
  checkInTime?: string
  checkOutTime?: string
  badgeNumber?: string
  badgeId?: string           // pre-assigned badge (captured at registration)
  rejectionReason?: string
  createdAt: string
  createdBy: string
  notes?: string
  // Extended fields
  department?: string
  delegates?: Delegate[]
  laptopDetails?: string
  otherDeviceDetails?: string
  idProofType?: string
  idProofNumber?: string
  idPhotoCapture?: string
  businessSegment?: BusinessSegment
  priority?: VisitorPriority
  model?: string
  businessSegmentRemarks?: string
  hasVehicle?: boolean
  vehicleRegistration?: string
  visitorInTemperature?: string
  visitorOutTemperature?: string
}

/** Visit type options available per purpose (universal — applies to all locations) */
export const VISIT_TYPE_BY_PURPOSE: Record<Purpose, VisitType[]> = {
  official:  ['cat-officials', 'vendor', 'contractor', 'customer', 'government-official', 'employee-other-branch', 'general-visitor', 'other'],
  personal:  ['cat-officials', 'vendor', 'contractor', 'customer', 'government-official', 'employee-other-branch', 'general-visitor', 'other'],
  training:  ['contractor', 'customer', 'employee-other-branch', 'general-visitor', 'other'],
  interview: ['vendor', 'employee-other-branch', 'general-visitor', 'other'],
  delivery:  ['general-visitor', 'other'],
}
