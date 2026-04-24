import { create } from 'zustand'
import type { Visit, VisitStatus, Purpose, VisitType, EntryPath, BusinessSegment, VisitorPriority } from '@/types/visit'
import { visits as seedVisits } from '@/data/visits'
import { useNotificationStore } from './notificationStore'
import { generateId, getLocalDateString } from '@/utils/helpers'
import { employees } from '@/data/employees'
import { visitors as seedVisitors } from '@/data/visitors'
import type { Visitor } from '@/types/user'

const AVATAR_POOL = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
]
function pickAvatar() {
  return AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)]
}

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
    isMultiDay?: boolean
    endDate?: string
    guestWifi?: boolean
    badgeId?: string
    businessSegment?: BusinessSegment
    priority?: VisitorPriority
    model?: string
    businessSegmentRemarks?: string
    notes?: string
  }) => Visit

  approveWalkIn: (visitId: string) => void
  rejectWalkIn: (visitId: string, reason: string) => void
  checkIn: (visitId: string, badgeNumber: string, data?: {
    idProofType?: string
    idProofNumber?: string
    laptopDetails?: string
    otherDeviceDetails?: string
    hasVehicle?: boolean
    vehicleRegistration?: string
    visitorInTemperature?: string
    issueAssets?: boolean
    assetsIssued?: string
  }) => void
  checkOut: (visitId: string, outTemperature?: string, assetsReturned?: boolean) => void
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
        avatar: pickAvatar(),
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
      isMultiDay: data.isMultiDay,
      endDate: data.endDate,
      guestWifi: data.guestWifi,
      createdAt: now.toISOString(),
      createdBy: 'front-desk',
      notes: data.notes,
      department: data.department,
      badgeId: data.badgeId,
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

  checkIn: (visitId, badgeNumber, data) => {
    const visit = get().visits.find((v) => v.id === visitId)
    if (!visit) return

    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, {
        status: 'checked-in',
        checkInTime: new Date().toISOString(),
        badgeNumber,
        ...(data?.idProofType !== undefined && { idProofType: data.idProofType }),
        ...(data?.idProofNumber !== undefined && { idProofNumber: data.idProofNumber }),
        ...(data?.laptopDetails !== undefined && { laptopDetails: data.laptopDetails }),
        ...(data?.otherDeviceDetails !== undefined && { otherDeviceDetails: data.otherDeviceDetails }),
        ...(data?.hasVehicle !== undefined && { hasVehicle: data.hasVehicle }),
        ...(data?.vehicleRegistration !== undefined && { vehicleRegistration: data.vehicleRegistration }),
        ...(data?.visitorInTemperature !== undefined && { visitorInTemperature: data.visitorInTemperature }),
        ...(data?.issueAssets !== undefined && { issueAssets: data.issueAssets }),
        ...(data?.assetsIssued !== undefined && { assetsIssued: data.assetsIssued }),
      }),
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

  checkOut: (visitId, outTemperature, assetsReturned) => {
    set((state) => ({
      visits: updateVisitStatus(state.visits, visitId, {
        status: 'checked-out',
        checkOutTime: new Date().toISOString(),
        visitorOutTemperature: outTemperature,
        ...(assetsReturned !== undefined && { assetsReturned }),
      }),
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
