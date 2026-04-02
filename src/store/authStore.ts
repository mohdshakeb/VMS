import { create } from 'zustand'
import type { Role } from '@/types/user'

interface AuthState {
  currentRole: Role
  currentEmployeeId: string
  currentLocationId: string
  setRole: (role: Role) => void
  setCurrentEmployee: (id: string) => void
  setCurrentLocation: (id: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  currentRole: 'front-desk',
  currentEmployeeId: 'emp-1',
  currentLocationId: 'loc-1',

  setRole: (role) => set({ currentRole: role }),
  setCurrentEmployee: (id) => set({ currentEmployeeId: id }),
  setCurrentLocation: (id) => set({ currentLocationId: id }),
}))
