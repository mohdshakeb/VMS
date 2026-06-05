import { create } from 'zustand'
import { buildings as initialBuildings, complianceRecords as initialRecords } from '@/data/facilityData'
import type { Building, ComplianceRecord, OnboardingFormData, OnboardingRequest, ChecklistAnswer } from '@/types/facility'

interface FacilityState {
  buildings: Building[]
  complianceRecords: ComplianceRecord[]

  onboardingFormData: OnboardingFormData
  onboardingCurrentStep: 1 | 2 | 3
  submittedRequest: OnboardingRequest | null

  toastMessage: string | null

  setOnboardingStep: (step: 1 | 2 | 3) => void
  setOnboardingField: (field: keyof OnboardingFormData, value: string | string[]) => void
  resetOnboardingForm: () => void
  submitOnboarding: (request: OnboardingRequest) => void

  toggleBuildingStatus: (buildingId: string) => void

  setChecklistAnswer: (recordId: string, itemId: string, answer: ChecklistAnswer) => void
  setChecklistRemarks: (recordId: string, itemId: string, remarks: string) => void
  addChecklistPhoto: (recordId: string, itemId: string, url: string) => void
  removeChecklistPhoto: (recordId: string, itemId: string, index: number) => void

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
  buildingType: '',
  storeCode: '',
  buildingName: '',
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
  buildingStatus: 'Active',
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
  buildings: initialBuildings,
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

  toggleBuildingStatus: (buildingId) =>
    set((s) => ({
      buildings: s.buildings.map((b) =>
        b.id === buildingId
          ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
          : b
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

  saveComplianceDraft: (recordId) => {
    set((s) => {
      const record = s.complianceRecords.find((r) => r.id === recordId)
      if (!record) return {}
      const answered = record.checklist.filter((e) => e.answer !== undefined).length
      const total = record.checklist.length
      return {
        complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
          ...r,
          status: 'draft',
          savedAt: new Date().toISOString(),
        })),
        buildings: s.buildings.map((b) =>
          b.id === record.buildingId
            ? { ...b, complianceStatus: 'draft', complianceProgress: answered, complianceTotal: total, complianceDraftAge: 0 }
            : b
        ),
      }
    })
    get().showToast('Draft saved successfully')
  },

  submitCompliance: (recordId) => {
    set((s) => {
      const record = s.complianceRecords.find((r) => r.id === recordId)
      if (!record) return {}
      return {
        complianceRecords: updateRecord(s.complianceRecords, recordId, (r) => ({
          ...r,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          submittedBy: 'Ravi Anand',
        })),
        buildings: s.buildings.map((b) =>
          b.id === record.buildingId
            ? { ...b, complianceStatus: 'submitted' }
            : b
        ),
      }
    })
    get().showToast('Compliance completed successfully')
  },

  showToast: (message) => {
    set({ toastMessage: message })
    setTimeout(() => set({ toastMessage: null }), 4000)
  },

  clearToast: () => set({ toastMessage: null }),
}))
