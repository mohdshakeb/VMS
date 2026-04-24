import { create } from 'zustand'

interface UIState {
  checkInVisitId: string | null
  checkOutVisitId: string | null
  openCheckIn: (visitId: string) => void
  openCheckOut: (visitId: string) => void
  closeModals: () => void
}

export const useUIStore = create<UIState>((set) => ({
  checkInVisitId: null,
  checkOutVisitId: null,
  openCheckIn: (visitId) => set({ checkInVisitId: visitId, checkOutVisitId: null }),
  openCheckOut: (visitId) => set({ checkOutVisitId: visitId, checkInVisitId: null }),
  closeModals: () => set({ checkInVisitId: null, checkOutVisitId: null }),
}))
