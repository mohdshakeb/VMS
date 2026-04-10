import { create } from 'zustand'
import type { Visit, VisitStatus, Purpose, VisitType, EntryPath, BusinessSegment, VisitorPriority, Delegate } from '@/types/visit'
import { visits as seedVisits } from '@/data/visits'
import { useNotificationStore } from './notificationStore'
import { generateId, getLocalDateString } from '@/utils/helpers'
import { employees } from '@/data/employees'
import { visitors as seedVisitors } from '@/data/visitors'
import type { Visitor } from '@/types/user'

interface VisitState {
  visits: Visit[]
  visitors: Visitor[]
  toastMessage: string | null
  clearToast: () => void

  createWalkIn: (data: {
    visitorName: string
    visitorMobile: string
    visitorEmail?: string
    visitorCompany?: string
    hostEmployeeId: string
    locationId: string
    purpose: Purpose
    visitType: VisitType
    department?: string
    scheduledDate?: string
    scheduledTime?: string
    duration?: number
    delegates?: Delegate[]
    badgeId?: string
    idProofType?: string
    idProofNumber?: string
    laptopDetails?: string
    otherDeviceDetails?: string
    hasVehicle?: boolean
    vehicleRegistration?: string
    visitorInTemperature?: string
    businessSegment?: BusinessSegment
    priority?: VisitorPriority
    model?: string
    businessSegmentRemarks?: string
    notes?: string
  }) => Visit

  checkOutDelegate: (visitId: string, delegateIndex: number) => void
  approveWalkIn: (visitId: string) => void
  rejectWalkIn: (visitId: string, reason: string) => void
  checkIn: (visitId: string, badgeNumber: string) => void
  checkOut: (visitId: string, outTemperature?: string) => void
  confirmVisit: (visitId: string) => void
  rejectVisit: (visitId: string, reason: string) => void
  cancelVisit: (visitId: string) => void
}

function updateVisitStatus(visits: Visit[], visitId: string, updates: Partial<Visit>): Visit[] {
  return visits.map((v) => (v.id === visitId ? { ...v, ...updates } : v))
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: seedVisits,
  visitors: seedVisitors,
  toastMessage: null,

  clearToast: () => set({ toastMessage: null }),

  createWalkIn: (data) => {
    // Find or create visitor
    let visitor = get().visitors.find((v) => v.mobile === data.visitorMobile)
    if (!visitor) {
      visitor = {
        id: generateId(),
        name: data.visitorName,
        mobile: data.visitorMobile,
        email: data.visitorEmail,
        company: data.visitorCompany,
      }
      set((state) => ({ visitors: [...state.visitors, visitor!] }))
    }

    const now = new Date()

    const visit: Visit = {
      id: generateId(),
      visitorId: visitor.id,
      hostEmployeeId: data.hostEmployeeId,
      locationId: data.locationId,
      status: 'pending-approval',
      entryPath: 'walk-in' as EntryPath,
      purpose: data.purpose,
      visitType: data.visitType,
      scheduledDate: data.scheduledDate ?? getLocalDateString(now),
      scheduledTime: data.scheduledTime ?? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      duration: data.duration,
      createdAt: now.toISOString(),
      createdBy: 'front-desk',
      notes: data.notes,
      department: data.department,
      delegates: data.delegates && data.delegates.length > 0 ? data.delegates : undefined,
      badgeId: data.badgeId,
      idProofType: data.idProofType,
      idProofNumber: data.idProofNumber,
      laptopDetails: data.laptopDetails,
      otherDeviceDetails: data.otherDeviceDetails,
      hasVehicle: data.hasVehicle,
      vehicleRegistration: data.vehicleRegistration,
      visitorInTemperature: data.visitorInTemperature,
      businessSegment: data.businessSegment,
      priority: data.priority,
      model: data.model,
      businessSegmentRemarks: data.businessSegmentRemarks,
    }

    const hostEmployee = employees.find((e) => e.id === data.hostEmployeeId)

    set((state) => ({
      visits: [visit, ...state.visits],
      toastMessage: `Walk-in submitted — switch to Employee role to approve as ${hostEmployee?.name ?? 'host'}`,
    }))

    // Cross-store: notify the host employee
    useNotificationStore.getState().addNotification({
      type: 'walk-in-approval',
      title: 'Walk-in Approval Request',
      message: `${data.visitorName} from ${data.visitorCompany || 'unknown company'} is at the front desk asking for you.`,
      visitId: visit.id,
      recipientRole: 'employee',
      recipientId: data.hostEmployeeId,
      actionRequired: true,
    })

    return visit
  },

  checkOutDelegate: (visitId, delegateIndex) => {
    set((state) => ({
      visits: state.visits.map((v) => {
        if (v.id !== visitId || !v.delegates) return v
        const delegates = v.delegates.map((d, i) =>
          i === delegateIndex ? { ...d, checkOutTime: new Date().toISOString() } : d
        )
        return { ...v, delegates }
      }),
      toastMessage: 'Companion checked out',
    }))
  },

  approveWalkIn: (visitId) => {
    const visit = get().visits.find((v) => v.id === visitId)
    if (!visit) return

    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, { status: 'confirmed' }),
      toastMessage: 'Walk-in approved — visitor can now be checked in',
    }))

    const visitor = get().visitors.find((v) => v.id === visit.visitorId)

    useNotificationStore.getState().addNotification({
      type: 'visit-confirmed',
      title: 'Walk-in Approved',
      message: `${visitor?.name ?? 'Visitor'} has been approved. Ready for check-in.`,
      visitId,
      recipientRole: 'front-desk',
    })
  },

  rejectWalkIn: (visitId, reason) => {
    const visit = get().visits.find((v) => v.id === visitId)
    if (!visit) return

    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, { status: 'rejected', rejectionReason: reason }),
      toastMessage: 'Walk-in rejected',
    }))

    const visitor = get().visitors.find((v) => v.id === visit.visitorId)

    useNotificationStore.getState().addNotification({
      type: 'visit-rejected',
      title: 'Walk-in Rejected',
      message: `${visitor?.name ?? 'Visitor'} walk-in was rejected: ${reason}`,
      visitId,
      recipientRole: 'front-desk',
    })
  },

  checkIn: (visitId, badgeNumber) => {
    const visit = get().visits.find((v) => v.id === visitId)
    if (!visit) return

    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, {
        status: 'checked-in',
        checkInTime: new Date().toISOString(),
        badgeNumber,
      }),
      toastMessage: `Visitor checked in — Badge ${badgeNumber}`,
    }))

    const visitor = get().visitors.find((v) => v.id === visit.visitorId)

    useNotificationStore.getState().addNotification({
      type: 'visitor-arrived',
      title: 'Visitor Arrived',
      message: `${visitor?.name ?? 'Your visitor'} has checked in at the front desk.`,
      visitId,
      recipientRole: 'employee',
      recipientId: visit.hostEmployeeId,
    })
  },

  checkOut: (visitId, outTemperature) => {
    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, {
        status: 'checked-out',
        checkOutTime: new Date().toISOString(),
        visitorOutTemperature: outTemperature,
      }),
      toastMessage: 'Visitor checked out',
    }))
  },

  confirmVisit: (visitId) => {
    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, { status: 'confirmed' }),
      toastMessage: 'Visit confirmed',
    }))
  },

  rejectVisit: (visitId, reason) => {
    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, { status: 'rejected', rejectionReason: reason }),
      toastMessage: 'Visit rejected',
    }))
  },

  cancelVisit: (visitId) => {
    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, { status: 'cancelled' }),
      toastMessage: 'Visit cancelled',
    }))
  },
}))

// Standalone selectors
export function getTodaysVisits(visits: Visit[], locationId: string): Visit[] {
  const today = getLocalDateString()
  return visits.filter((v) => v.scheduledDate === today && v.locationId === locationId)
}

export function getVisitsByStatus(visits: Visit[], status: VisitStatus, locationId: string): Visit[] {
  const today = getLocalDateString()
  return visits.filter((v) => v.status === status && v.scheduledDate === today && v.locationId === locationId)
}

export function getPendingApprovals(visits: Visit[], employeeId: string): Visit[] {
  return visits.filter((v) => v.status === 'pending-approval' && v.hostEmployeeId === employeeId)
}
