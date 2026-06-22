export type FacilityComplianceStatus = 'pending' | 'draft' | 'submitted' | 'updated' | 'overdue' | 'missed'
export type FacilityStatus = 'active' | 'inactive'
export type FacilityType = 'Branch Office' | 'Parts Warehouse' | 'CRC' | 'MRC' | 'Repair Center' | 'Executive Office' | 'HQ'
export type InfraApplicability = 'mandatory' | 'optional' | 'not-applicable'
export type ChecklistAnswer = 'yes' | 'partial' | 'no' | 'na'

export interface ChecklistItem {
  id: string
  section: string
  subsection?: string
  label: string
  mandatoryFor: FacilityType[]
}

export interface ComplianceChecklistEntry {
  itemId: string
  section: string
  subsection?: string
  label: string
  isMandatory: boolean
  answer?: ChecklistAnswer
  remarks?: string
  photos: string[]
  sbuComment?: string
}

export interface Facility {
  id: string
  facilityId: string
  name: string
  type: FacilityType
  sbu: string
  state: string
  city: string
  location: string
  address1: string
  address2?: string
  pinCode: string
  floors: number
  area?: number
  yearOfConstruction?: number
  latitude?: number
  longitude?: number
  storeCode?: string
  description?: string
  status: FacilityStatus
  remarks?: string
  photoUrl?: string
  layoutPlanName?: string
  complianceDocName?: string
  locationAdmin?: string
  complianceStatus: FacilityComplianceStatus
  complianceProgress: number
  complianceTotal: number
  complianceDraftAge?: number
  pendingStatusRequest?: {
    requestedStatus: FacilityStatus
    requestedBy: string
    requestedAt: string
    reason?: string
  }
}

export interface InfraCategory {
  id: string
  name: string
  group: string
  applicability: Record<FacilityType, InfraApplicability>
}

export interface ComplianceRecord {
  id: string
  locationName: string
  facilityTypes: FacilityType[]
  sbu: string
  month: number
  year: number
  status: FacilityComplianceStatus
  checklist: ComplianceChecklistEntry[]
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  savedAt?: string
}

export interface FacilityChangeRequest {
  id: string
  locationName: string
  requestedBy: string
  requestedAt: string
  toAdd: { name: string; type: FacilityType }[]
  toRemove: string[]
  status: 'pending' | 'approved' | 'rejected'
  resolvedAt?: string
  resolvedBy?: string
}

export type OnboardingRequestStatus = 'submitted' | 'sbu-review' | 'activated' | 'rejected'

export interface OnboardingTimelineEvent {
  stage: number
  label: string
  sublabel?: string
  status: 'done' | 'active' | 'pending' | 'rejected'
  timestamp?: string
}

export interface OnboardingRequest {
  id: string
  facilityName: string
  facilityType: FacilityType
  sbu: string
  state: string
  city: string
  location: string
  address1: string
  pinCode: string
  floors: number
  categoryCount: number
  status: OnboardingRequestStatus
  submittedAt: string
  submittedBy: string
  submittedById: string
  timeline: OnboardingTimelineEvent[]
  rejectionReason?: string
}

export interface OnboardingFormData {
  sbu: string
  state: string
  city: string
  location: string
  facilityType: string
  storeCode: string
  facilityName: string
  description: string
  address1: string
  address2: string
  pinCode: string
  floors: string
  area: string
  yearOfConstruction: string
  latitude: string
  longitude: string
  selectedCategories: string[]
  customCategories: string[]
  facilityStatus: string
  remarks: string
  layoutPlanName?: string
  complianceDocName?: string
}
