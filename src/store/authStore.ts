import { create } from 'zustand'
import type { Role } from '@/types/user'

// Dummy credential map for prototype — email → role and employeeId
const CREDENTIAL_MAP: Record<string, { role: Role; employeeId: string }> = {
  'employee@gmmco.com': { role: 'employee', employeeId: 'emp-1' },
  'frontdesk@gmmco.com': { role: 'front-desk', employeeId: 'emp-7' },
  'manager@gmmco.com': { role: 'branch-admin', employeeId: 'emp-5' },
}

interface AuthState {
  isAuthenticated: boolean
  currentRole: Role
  currentEmployeeId: string
  currentLocationId: string
  setRole: (role: Role) => void
  setCurrentEmployee: (id: string) => void
  setCurrentLocation: (id: string) => void
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentRole: 'front-desk',
  currentEmployeeId: 'emp-1',
  currentLocationId: 'loc-1',

  setRole: (role) => set({ currentRole: role }),
  setCurrentEmployee: (id) => set({ currentEmployeeId: id }),
  setCurrentLocation: (id) => set({ currentLocationId: id }),

  login: (email, password) => {
    if (!email.trim() || !password.trim()) return false
    const creds = CREDENTIAL_MAP[email.toLowerCase().trim()]
    if (creds) {
      set({ isAuthenticated: true, currentRole: creds.role, currentEmployeeId: creds.employeeId })
    } else {
      // Allow any non-empty email+password for easy demo access (defaults to front-desk)
      set({ isAuthenticated: true })
    }
    return true
  },

  logout: () => set({ isAuthenticated: false }),
}))
