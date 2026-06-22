import { create } from 'zustand'
import {
  facilities as baseFacilities,
  complianceRecords as baseRecords,
  buildChecklist,
  facilityCodeFrom,
  CURRENT_COMPLIANCE_PERIOD,
} from '@/data/facilityData'
import { southSeedFacilities, southSeedComplianceRecords } from '@/data/sbuSouthSeed'

const initialFacilities = [...baseFacilities, ...southSeedFacilities]
const initialRecords = [...baseRecords, ...southSeedComplianceRecords]
import type { Facility, FacilityStatus, ComplianceRecord, OnboardingFormData, OnboardingRequest, ChecklistAnswer } from '@/types/facility'
import { useNotificationStore } from '@/store/notificationStore'

interface FacilityState {
  facilities: Facility[]
  complianceRecords: ComplianceRecord[]

  onboardingFormData: OnboardingFormData
  onboardingCurrentStep: 1 | 2 | 3
  submittedRequest: OnboardingRequest | null

  toastMessage: string | null

  setOnboardingStep: (step: 1 | 2 | 3) => void
  setOnboardingField: (field: keyof OnboardingFormData, value: string | string[]) => void
  resetOnboardingForm: () => void
  submitOnboarding: (request: OnboardingRequest) => void

  addLocationWithFacilities: (data: {
    locationName: string
    sbu: string
    state: string
    city: string
    address: string
    pinCode: string
    adminNames: string[]
    facilities: Array<{ type: string; name: string; assignedAdmin: string }>
  }) => void

  toggleFacilityStatus: (facilityId: string) => void
  toggleLocationStatus: (locationName: string) => void
  addFacilityToLocation: (locationName: string, type: import('@/types/facility').FacilityType, name: string) => void
  removeFacilityFromLocation: (facilityId: string) => void
  requestStatusChange: (facilityId: string, requestedStatus: FacilityStatus, requestedBy: string, reason?: string) => void
  resolveStatusChange: (facilityId: string, decision: 'approved' | 'rejected') => void

  setChecklistAnswer: (recordId: string, itemId: string, answer: ChecklistAnswer) => void
  setSbuChecklistAnswer: (recordId: string, itemId: string, answer: ChecklistAnswer) => void
  setChecklistRemarks: (recordId: string, itemId: string, remarks: string) => void
  setSbuComment: (recordId: string, itemId: string, comment: string) => void
  addChecklistPhoto: (recordId: string, itemId: string, url: string) => void
  removeChecklistPhoto: (recordId: string, itemId: string, index: number) => void

  clearCompliance: (recordId: string) => void
  saveComplianceDraft: (recordId: string) => void
  submitCompliance: (recordId: string) => void
  sendComplianceFeedback: (recordId: string) => void

  showToast: (message: string) => void
  clearToast: () => void
}

const defaultFormData: OnboardingFormData = {
  sbu: '',
  state: '',
  city: '',
  location: '',
  facilityType: '',
  storeCode: '',
  facilityName: '',
  description: '',
  address1: '',
  address2: '',
  pinCode: '',
  floors: '',
  area: '',
  yearOfConstruction: '',
  latitude: '',
  longitude: '',
  selectedCategories: [],
  customCategories: [],
  facilityStatus: 'Active',
  remarks: '',
  layoutPlanName: undefined,
  complianceDocName: undefined,
}

function updateRecord(
  records: ComplianceRecord[],
  recordId: string,
  fn: (r: ComplianceRecord) => ComplianceRecord
): ComplianceRecord[] {
  return records.map((r) => (r.id === recordId ? fn(r) : r))
}

export const useFacilityStore = create<FacilityState>((set, get) => ({
  facilities: initialFacilities,
  complianceRecords: initialRecords,

  onboardingFormData: defaultFormData,
  onboardingCurrentStep: 1,
  submittedRequest: null,
  toastMessage: null,

  setOnboardingStep: (step) => set({ onboardingCurrentStep: step }),

  setOnboardingField: (field, value) =>
    set((s) => ({
      onboardingFormData: { ...s.onboardingFormData, [field]: value },
    })),

  resetOnboardingForm: () =>
    set({ onboardingFormData: defaultFormData, onboardingCurrentStep: 1 }),

  submitOnboarding: (request) => {
    const checklist = buildChecklist(request.facilityType)
    const facilityId = `bld-${Date.now()}`
    const newFacility: Facility = {
      id: facilityId,
      facilityId: facilityCodeFrom(request.facilityType, request.state, request.city, request.location, request.pinCode),
      name: request.facilityName,
      type: request.facilityType,
      sbu: request.sbu,
      state: request.state,
      city: request.city,
      location: request.location,
      address1: request.address1,
      pinCode: request.pinCode,
      floors: request.floors,
      status: 'active',
      complianceStatus: 'pending',
      complianceProgress: 0,
      complianceTotal: checklist.length,
    }
    const newRecord: ComplianceRecord = {
      id: `comp-${Date.now()}`,
      locationName: request.location,
      facilityTypes: [request.facilityType as import('@/types/facility').FacilityType],
      sbu: request.sbu,
      month: CURRENT_COMPLIANCE_PERIOD.month,
      year: CURRENT_COMPLIANCE_PERIOD.year,
      status: 'pending',
      checklist,
    }
    set((s) => ({
      submittedRequest: request,
      onboardingCurrentStep: 1,
      onboardingFormData: defaultFormData,
      facilities: [...s.facilities, newFacility],
      complianceRecords: [...s.complianceRecords, newRecord],
    }))
  },

  addLocationWithFacilities: (data) => {
    const newFacilities: Facility[] = data.facilities.map((f, i) => {
      const id = `bld-new-${Date.now()}-${i}`
      const checklist = buildChecklist(f.type as Facility['type'])
      return {
        id,
        facilityId: facilityCodeFrom(f.type, data.state, data.city, data.locationName, data.pinCode),
        name: f.name,
        type: f.type as Facility['type'],
        sbu: data.sbu,
        state: data.state,
        city: data.city,
        location: data.locationName,
        address1: data.address,
        pinCode: data.pinCode,
        floors: 0,
        status: 'active' as const,
        locationAdmin: f.assignedAdmin,
        complianceStatus: 'pending' as const,
        complianceProgress: 0,
        complianceTotal: checklist.length,
      }
    })
    const newRecords: ComplianceRecord[] = newFacilities.map((f) => ({
      id: `comp-new-${Date.now()}-${f.id}`,
      locationName: f.location,
      facilityTypes: [f.type],
      sbu: f.sbu,
      month: CURRENT_COMPLIANCE_PERIOD.month,
      year: CURRENT_COMPLIANCE_PERIOD.year,
      status: 'pending' as const,
      checklist: buildChecklist(f.type),
    }))
    set((s) => ({
      facilities: [...s.facilities, ...newFacilities],
      complianceRecords: [...s.complianceRecords, ...newRecords],
    }))
  },

  toggleFacilityStatus: (facilityId) =>
    set((s) => ({
      facilities: s.facilities.map((f) =>
        f.id === facilityId
          ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' }
          : f
      ),
    })),

  toggleLocationStatus: (locationName) =>
    set((s) => {
      const locationFacilities = s.facilities.filter((f) => f.location === locationName)
      const allActive = locationFacilities.every((f) => f.status === 'active')
      const nextStatus: FacilityStatus = allActive ? 'inactive' : 'active'
      return {
        facilities: s.facilities.map((f) =>
          f.location === locationName ? { ...f, status: nextStatus } : f
        ),
      }
    }),

  addFacilityToLocation: (locationName, type, name) =>
    set((s) => {
      const existing = s.facilities.find((f) => f.location === locationName)
      if (!existing) return {}
      const id = `bld-loc-${Date.now()}`
      const checklist = buildChecklist(type)
      const newFacility: Facility = {
        id,
        facilityId: facilityCodeFrom(type, existing.state, existing.city, locationName, existing.pinCode),
        name,
        type,
        sbu: existing.sbu,
        state: existing.state,
        city: existing.city,
        location: locationName,
        address1: existing.address1,
        pinCode: existing.pinCode,
        floors: 0,
        locationAdmin: existing.locationAdmin,
        status: 'active',
        complianceStatus: 'pending',
        complianceProgress: 0,
        complianceTotal: checklist.length,
      }
      const updatedRecords = s.complianceRecords.map((r) => {
        if (r.locationName !== locationName || r.month !== CURRENT_COMPLIANCE_PERIOD.month || r.year !== CURRENT_COMPLIANCE_PERIOD.year) return r
        if (r.facilityTypes.includes(type)) return r
        return { ...r, facilityTypes: [...r.facilityTypes, type] }
      })
      return { facilities: [...s.facilities, newFacility], complianceRecords: updatedRecords }
    }),

  removeFacilityFromLocation: (facilityId) =>
    set((s) => {
      const target = s.facilities.find((f) => f.id === facilityId)
      if (!target) return {}
      const remaining = s.facilities.filter((f) => f.id !== facilityId)
      const stillHasType = remaining.some((f) => f.location === target.location && f.type === target.type)
      const updatedRecords = stillHasType ? s.complianceRecords : s.complianceRecords.map((r) => {
        if (r.locationName !== target.location) return r
        return { ...r, facilityTypes: r.facilityTypes.filter((t) => t !== target.type) }
      })
      return { facilities: remaining, complianceRecords: updatedRecords }
    }),

  requestStatusChange: (facilityId, requestedStatus, requestedBy, reason) => {
    const facility = get().facilities.find((f) => f.id === facilityId)
    if (!facility) return
    set((s) => ({
      facilities: s.facilities.map((f) =>
        f.id === facilityId
          ? { ...f, pendingStatusRequest: { requestedStatus, requestedBy, requestedAt: new Date().toISOString(), reason } }
          : f
      ),
    }))
    useNotificationStore.getState().addNotification({
      type: 'facility-status-requested',
      title: 'Status change requested',
      message: `${requestedBy} requested to mark ${facility.name} — ${facility.city} as ${requestedStatus === 'active' ? 'Active' : 'Inactive'}.${reason ? ` "${reason}"` : ''}`,
      facilityId,
      recipientRole: 'sbu-admin',
      actionRequired: true,
    })
    get().showToast('Status change request sent for SBU approval')
  },

  resolveStatusChange: (facilityId, decision) => {
    const facility = get().facilities.find((f) => f.id === facilityId)
    if (!facility || !facility.pendingStatusRequest) return
    const { requestedStatus } = facility.pendingStatusRequest
    set((s) => ({
      facilities: s.facilities.map((f) =>
        f.id === facilityId
          ? { ...f, status: decision === 'approved' ? requestedStatus : f.status, pendingStatusRequest: undefined }
          : f
      ),
    }))
    useNotificationStore.getState().addNotification({
      type: decision === 'approved' ? 'facility-status-approved' : 'facility-status-rejected',
      title: decision === 'approved' ? 'Status change approved' : 'Status change rejected',
      message: `Your request to mark ${facility.name} — ${facility.city} as ${requestedStatus === 'active' ? 'Active' : 'Inactive'} was ${decision}.`,
      facilityId,
      recipientRole: 'location-admin',
      actionRequired: false,
    })
    get().showToast(`Status change ${decision}`)
  },

  setChecklistAnswer: (recordId, itemId, answer) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) => {
          if (entry.itemId !== itemId) return entry
          const clearPhotos = answer === 'no' || answer === 'na'
          return {
            ...entry,
            answer,
            photos: clearPhotos ? [] : entry.photos,
            remarks: answer !== 'partial' ? undefined : entry.remarks,
          }
        }),
      })),
    })),

  setSbuChecklistAnswer: (recordId, itemId, answer) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) =>
          entry.itemId === itemId ? { ...entry, answer } : entry
        ),
      })),
    })),

  setChecklistRemarks: (recordId, itemId, remarks) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) =>
          entry.itemId === itemId ? { ...entry, remarks } : entry
        ),
      })),
    })),

  setSbuComment: (recordId, itemId, comment) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) =>
          entry.itemId === itemId ? { ...entry, sbuComment: comment } : entry
        ),
      })),
    })),

  addChecklistPhoto: (recordId, itemId, url) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) => {
          if (entry.itemId !== itemId || entry.photos.length >= 4) return entry
          return { ...entry, photos: [...entry.photos, url] }
        }),
      })),
    })),

  removeChecklistPhoto: (recordId, itemId, index) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) => {
          if (entry.itemId !== itemId) return entry
          return { ...entry, photos: entry.photos.filter((_, i) => i !== index) }
        }),
      })),
    })),

  clearCompliance: (recordId) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        status: 'pending',
        savedAt: undefined,
        checklist: r.checklist.map((entry) => ({
          ...entry,
          answer: undefined,
          remarks: undefined,
          photos: [],
        })),
      })),
    })),

  saveComplianceDraft: (recordId) => {
    set((s) => {
      const record = s.complianceRecords.find((r) => r.id === recordId)
      if (!record || record.status === 'missed') return {}
      const wasSubmitted = record.status === 'submitted' || record.status === 'updated'
      const isOverdue = record.status === 'overdue'
      // Overdue records keep their status when saved — urgency should stay visible
      const nextStatus: typeof record.status = wasSubmitted ? 'updated' : isOverdue ? 'overdue' : 'draft'
      return {
        complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
          ...r,
          status: nextStatus,
          savedAt: new Date().toISOString(),
        })),
      }
    })
    get().showToast('Draft saved successfully')
  },

  submitCompliance: (recordId) => {
    set((s) => {
      const record = s.complianceRecords.find((r) => r.id === recordId)
      if (!record || record.status === 'missed') return {}
      const wasSubmitted = record.status === 'submitted' || record.status === 'updated'
      const nextStatus: typeof record.status = wasSubmitted ? 'updated' : 'submitted'
      const monthName = new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long' })
      useNotificationStore.getState().addNotification({
        type: 'compliance-submitted',
        title: 'Compliance submitted',
        message: `${record.locationName} compliance for ${monthName} ${record.year} was submitted successfully.`,
        recordId,
        recipientRole: 'location-admin',
        actionRequired: false,
      })
      useNotificationStore.getState().addNotification({
        type: 'compliance-submitted',
        title: 'Compliance submitted',
        message: `${record.locationName} compliance for ${monthName} ${record.year} was submitted by the Location Admin.`,
        recordId,
        recipientRole: 'sbu-admin',
        actionRequired: false,
      })
      return {
        complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
          ...r,
          status: nextStatus,
          submittedAt: new Date().toISOString(),
          submittedBy: 'Ravi Anand',
        })),
      }
    })
    get().showToast('Compliance submitted successfully')
  },

  sendComplianceFeedback: (recordId) => {
    const record = get().complianceRecords.find((r) => r.id === recordId)
    if (!record) return
    const monthName = new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long' })
    set((s) => ({
      complianceRecords: s.complianceRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'updated', approvedAt: new Date().toISOString(), approvedBy: 'Suresh Nair' }
          : r
      ),
    }))
    useNotificationStore.getState().addNotification({
      type: 'sbu-edited',
      title: 'SBU made edits',
      message: `SBU Admin added feedback on the ${record.locationName} submission for ${monthName} ${record.year}. Review the changes.`,
      recordId,
      recipientRole: 'location-admin',
      actionRequired: false,
    })
    get().showToast('Changes saved')
  },

  showToast: (message) => {
    set({ toastMessage: message })
    setTimeout(() => set({ toastMessage: null }), 4000)
  },

  clearToast: () => set({ toastMessage: null }),
}))
