export type VisitStatus =
  | 'pending-approval'
  | 'scheduled'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'rejected'
  | 'cancelled'
  | 'no-show'

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
  | 'hospitality'
  | 'other'

export type BusinessSegment =
  | 'machines'
  | 'engines'
  | 'parts-purchased'
  | 'service-inquiry'
  | 'other'

export type VisitorPriority = 'immediate' | 'in-a-month' | 'exploring'

export type Department = 'admin' | 'hr' | 'it' | 'accounts'

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
  isMultiDay?: boolean
  endDate?: string
  duration?: number          // expected duration in minutes
  guestWifi?: boolean
  checkInTime?: string
  checkOutTime?: string
  badgeNumber?: string
  badgeId?: string           // pre-assigned badge (captured at registration)
  rejectionReason?: string
  createdAt: string
  createdBy: string
  notes?: string
  // Extended fields (walk-in)
  department?: string
  businessSegment?: BusinessSegment
  priority?: VisitorPriority
  model?: string
  businessSegmentRemarks?: string
  // Check-in captured fields
  laptopDetails?: string
  otherDeviceDetails?: string
  idProofType?: string
  idProofNumber?: string
  idPhotoCapture?: string
  hasVehicle?: boolean
  vehicleRegistration?: string
  visitorInTemperature?: string
  issueAssets?: boolean
  assetsIssued?: string
  // Check-out fields
  assetsReturned?: boolean
  visitorOutTemperature?: string
}

/** Visit type options available per purpose (universal — applies to all locations) */
export const VISIT_TYPE_BY_PURPOSE: Record<Purpose, VisitType[]> = {
  official:  ['cat-officials', 'vendor', 'contractor', 'customer', 'government-official', 'employee-other-branch', 'general-visitor', 'hospitality', 'other'],
  personal:  ['cat-officials', 'vendor', 'contractor', 'customer', 'government-official', 'employee-other-branch', 'general-visitor', 'hospitality', 'other'],
  training:  ['contractor', 'customer', 'employee-other-branch', 'general-visitor', 'other'],
  interview: ['vendor', 'employee-other-branch', 'general-visitor', 'other'],
  delivery:  ['general-visitor', 'other'],
}
