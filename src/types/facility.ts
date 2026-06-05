export type FacilityComplianceStatus = 'pending' | 'draft' | 'submitted' | 'approved' | 'overdue'
export type BuildingStatus = 'active' | 'inactive'
export type BuildingType = 'Branch Office' | 'Parts Warehouse' | 'CRC' | 'MRC' | 'Repair Center' | 'Executive Office' | 'HQ'
export type InfraApplicability = 'mandatory' | 'optional' | 'not-applicable'
export type ChecklistAnswer = 'yes' | 'partial' | 'no' | 'na'

export interface ChecklistItem {
  id: string
  section: string
  label: string
  mandatoryFor: BuildingType[]
}

export interface ComplianceChecklistEntry {
  itemId: string
  section: string
  label: string
  isMandatory: boolean
  answer?: ChecklistAnswer
  remarks?: string
  photos: string[]
}

export interface Building {
  id: string
  buildingId: string
  name: string
  type: BuildingType
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
  status: BuildingStatus
  remarks?: string
  photoUrl?: string
  layoutPlanName?: string
  complianceDocName?: string
  complianceStatus: FacilityComplianceStatus
  complianceProgress: number
  complianceTotal: number
  complianceDraftAge?: number
}

export interface InfraCategory {
  id: string
  name: string
  group: string
  applicability: Record<BuildingType, InfraApplicability>
}

export interface ComplianceRecord {
  id: string
  buildingId: string
  buildingName: string
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
  buildingName: string
  buildingType: BuildingType
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
  buildingType: string
  storeCode: string
  buildingName: string
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
  buildingStatus: string
  remarks: string
  layoutPlanName?: string
  complianceDocName?: string
}

export interface FacilityNotification {
  id: string
  message: string
  timestamp: string
  type: 'warning' | 'success' | 'info'
}
