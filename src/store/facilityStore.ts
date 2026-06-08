import { create } from 'zustand'
import { facilities as initialFacilities, complianceRecords as initialRecords } from '@/data/facilityData'
import type { Facility, ComplianceRecord, OnboardingFormData, OnboardingRequest, ChecklistAnswer } from '@/types/facility'
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

  toggleFacilityStatus: (facilityId: string) => void

  setChecklistAnswer: (recordId: string, itemId: string, answer: ChecklistAnswer) => void
  setChecklistRemarks: (recordId: string, itemId: string, remarks: string) => void
  addChecklistPhoto: (recordId: string, itemId: string, url: string) => void
  removeChecklistPhoto: (recordId: string, itemId: string, index: number) => void

  clearCompliance: (recordId: string) => void
  saveComplianceDraft: (recordId: string) => void
  submitCompliance: (recordId: string) => void

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

  submitOnboarding: (request) =>
    set({ submittedRequest: request, onboardingCurrentStep: 1, onboardingFormData: defaultFormData }),

  toggleFacilityStatus: (facilityId) =>
    set((s) => ({
      facilities: s.facilities.map((f) =>
        f.id === facilityId
          ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' }
          : f
      ),
    })),

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

  setChecklistRemarks: (recordId, itemId, remarks) =>
    set((s) => ({
      complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
        ...r,
        checklist: r.checklist.map((entry) =>
          entry.itemId === itemId ? { ...entry, remarks } : entry
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
      const answered = record.checklist.filter((e) => e.answer !== undefined).length
      const total = record.checklist.length
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
        facilities: s.facilities.map((f) =>
          f.id === record.facilityId
            ? { ...f, complianceStatus: nextStatus, complianceProgress: answered, complianceTotal: total, complianceDraftAge: 0 }
            : f
        ),
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
      const facility = s.facilities.find((f) => f.id === record.facilityId)
      const facilityLabel = facility ? `${facility.name} — ${facility.city}` : record.facilityName
      const monthName = new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long' })
      useNotificationStore.getState().addNotification({
        type: 'compliance-submitted',
        title: 'Compliance submitted',
        message: `${facilityLabel} compliance for ${monthName} ${record.year} was submitted successfully.`,
        facilityId: record.facilityId,
        recordId,
        recipientRole: 'location-admin',
        actionRequired: false,
      })
      return {
        complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
          ...r,
          status: nextStatus,
          submittedAt: new Date().toISOString(),
          submittedBy: 'Ravi Anand',
        })),
        facilities: s.facilities.map((f) =>
          f.id === record.facilityId
            ? { ...f, complianceStatus: nextStatus }
            : f
        ),
      }
    })
    get().showToast('Compliance submitted successfully')
  },

  showToast: (message) => {
    set({ toastMessage: message })
    setTimeout(() => set({ toastMessage: null }), 4000)
  },

  clearToast: () => set({ toastMessage: null }),
}))
