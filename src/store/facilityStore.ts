import { create } from 'zustand'
import { buildings as initialBuildings, complianceRecords as initialRecords } from '@/data/facilityData'
import type { Building, ComplianceRecord, OnboardingFormData, OnboardingRequest } from '@/types/facility'

interface ComplianceUploadState {
  photos: Record<string, string>
  savedAt?: string
}

interface FacilityState {
  buildings: Building[]
  complianceRecords: ComplianceRecord[]
  complianceUploads: Record<string, ComplianceUploadState>

  onboardingFormData: OnboardingFormData
  onboardingCurrentStep: 1 | 2 | 3
  submittedRequest: OnboardingRequest | null

  toastMessage: string | null

  setOnboardingStep: (step: 1 | 2 | 3) => void
  setOnboardingField: (field: keyof OnboardingFormData, value: string | string[]) => void
  resetOnboardingForm: () => void
  submitOnboarding: (request: OnboardingRequest) => void

  toggleBuildingStatus: (buildingId: string) => void

  setPhoto: (buildingId: string, categoryId: string, url: string) => void
  removePhoto: (buildingId: string, categoryId: string) => void
  saveComplianceDraft: (buildingId: string) => void
  discardDraft: (buildingId: string) => void
  submitCompliance: (buildingId: string) => void

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

export const useFacilityStore = create<FacilityState>((set, get) => ({
  buildings: initialBuildings,
  complianceRecords: initialRecords,
  complianceUploads: {
    // Pre-populate Chennai draft uploads from dummy data
    'bld-1': {
      photos: {
        'cat-ext-1': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-ext-2': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-ext-3': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-ext-4': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-ext-5': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-off-1': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-off-2': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
        'cat-off-3': 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo',
      },
      savedAt: new Date('2026-05-07T09:30:00').toISOString(),
    },
    'bld-3': {
      photos: Object.fromEntries(
        ['cat-wks-1','cat-wks-2','cat-wks-3','cat-wks-4','cat-ext-1','cat-ext-2','cat-ext-3','cat-ext-4','cat-ext-5','cat-ext-6',
         'cat-off-3','cat-off-4','cat-elc-1','cat-elc-2','cat-elc-3','cat-elc-4','cat-elc-5','cat-elc-6',
         'cat-frs-1','cat-frs-2','cat-frs-3','cat-frs-4','cat-frs-5','cat-frs-6','cat-frs-7','cat-frs-8','cat-frs-9',
         'cat-env-1','cat-env-2','cat-env-3','cat-sec-1','cat-sec-2','cat-utl-1','cat-utl-2','cat-utl-3']
          .map((id, i) => [id, `https://placehold.co/200x150/e2e8f0/64748b?text=Photo+${i + 1}`])
      ),
      savedAt: new Date('2026-05-11T11:00:00').toISOString(),
    },
  },

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

  setPhoto: (buildingId, categoryId, url) =>
    set((s) => {
      const existing = s.complianceUploads[buildingId] ?? { photos: {} }
      return {
        complianceUploads: {
          ...s.complianceUploads,
          [buildingId]: { ...existing, photos: { ...existing.photos, [categoryId]: url } },
        },
      }
    }),

  removePhoto: (buildingId, categoryId) =>
    set((s) => {
      const existing = s.complianceUploads[buildingId]
      if (!existing) return {}
      const { [categoryId]: _removed, ...rest } = existing.photos
      return {
        complianceUploads: {
          ...s.complianceUploads,
          [buildingId]: { ...existing, photos: rest },
        },
      }
    }),

  saveComplianceDraft: (buildingId) => {
    set((s) => {
      const existing = s.complianceUploads[buildingId] ?? { photos: {} }
      const updatedBuildings = s.buildings.map((b) =>
        b.id === buildingId ? { ...b, complianceStatus: 'draft' as const } : b
      )
      return {
        complianceUploads: {
          ...s.complianceUploads,
          [buildingId]: { ...existing, savedAt: new Date().toISOString() },
        },
        buildings: updatedBuildings,
      }
    })
    get().showToast('Draft saved successfully')
  },

  discardDraft: (buildingId) => {
    set((s) => {
      const { [buildingId]: _removed, ...remainingUploads } = s.complianceUploads
      const updatedBuildings = s.buildings.map((b) =>
        b.id === buildingId ? { ...b, complianceStatus: 'pending' as const, complianceProgress: 0, complianceDraftAge: undefined } : b
      )
      return { complianceUploads: remainingUploads, buildings: updatedBuildings }
    })
    get().showToast('Draft discarded')
  },

  submitCompliance: (buildingId) => {
    set((s) => {
      const updatedBuildings = s.buildings.map((b) =>
        b.id === buildingId ? { ...b, complianceStatus: 'submitted' as const } : b
      )
      return { buildings: updatedBuildings }
    })
    get().showToast('Compliance submitted successfully')
  },

  showToast: (message) => {
    set({ toastMessage: message })
    setTimeout(() => set({ toastMessage: null }), 4000)
  },

  clearToast: () => set({ toastMessage: null }),
}))
