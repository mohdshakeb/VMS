import { create } from 'zustand'
import type { Notification, NotificationType } from '@/types/notification'
import type { Role } from '@/types/user'
import { generateId } from '@/utils/helpers'

interface NotificationState {
  notifications: Notification[]
  modalOpen: boolean
  addNotification: (data: {
    type: NotificationType
    title: string
    message: string
    visitId?: string
    facilityId?: string
    recordId?: string
    recipientRole: Role
    recipientId?: string
    actionRequired?: boolean
  }) => void
  markAsRead: (id: string) => void
  markAllRead: (role: Role, employeeId?: string) => void
  openNotificationsModal: () => void
  closeNotificationsModal: () => void
}

const SEED_COMPLIANCE_NOTIFICATIONS: Notification[] = [
  {
    id: 'cn-2',
    type: 'compliance-window-open',
    title: 'May compliance is now active',
    message: 'The May 2026 compliance window is open for 9 facilities. Submit before 7 Jun 2026.',
    recipientRole: 'location-admin',
    read: true,
    createdAt: '2026-06-01T08:00:00.000Z',
    actionRequired: false,
  },
  {
    id: 'cn-3',
    type: 'compliance-submitted',
    title: 'Compliance submitted',
    message: 'Repair Center — Madurai compliance for May 2026 was submitted successfully.',
    facilityId: 'bld-3',
    recordId: 'comp-3',
    recipientRole: 'location-admin',
    read: true,
    createdAt: '2026-06-03T11:15:00.000Z',
    actionRequired: false,
  },
  {
    id: 'cn-4',
    type: 'sbu-edited',
    title: 'SBU made edits',
    message: 'SBU Admin updated the Repair Center — Madurai submission for May 2026. Review the changes.',
    facilityId: 'bld-3',
    recordId: 'comp-3',
    recipientRole: 'location-admin',
    read: false,
    createdAt: '2026-06-04T14:30:00.000Z',
    actionRequired: false,
  },
  {
    id: 'cn-5',
    type: 'compliance-deadline-reminder',
    title: 'Deadline in 2 days',
    message: '6 facilities are still unsubmitted across Anna Salai - Chennai, Coimbatore, and Madurai. Cut-off is 7 Jun 2026.',
    recipientRole: 'location-admin',
    read: false,
    createdAt: '2026-06-05T08:00:00.000Z',
    actionRequired: true,
  },
]

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: SEED_COMPLIANCE_NOTIFICATIONS,
  modalOpen: false,
  openNotificationsModal: () => set({ modalOpen: true }),
  closeNotificationsModal: () => set({ modalOpen: false }),

  addNotification: (data) =>
    set((state) => ({
      notifications: [
        {
          id: generateId(),
          visitId: undefined,
          facilityId: undefined,
          recordId: undefined,
          ...data,
          actionRequired: data.actionRequired ?? false,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: (role, employeeId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.recipientRole === role && (!employeeId || n.recipientId === employeeId)
          ? { ...n, read: true }
          : n
      ),
    })),
}))

// Standalone selectors
export function getUnreadCount(notifications: Notification[], role: Role, employeeId?: string): number {
  return notifications.filter(
    (n) => !n.read && n.recipientRole === role && (!employeeId || !n.recipientId || n.recipientId === employeeId)
  ).length
}

export function getNotificationsForRole(notifications: Notification[], role: Role, employeeId?: string): Notification[] {
  return notifications.filter(
    (n) => n.recipientRole === role && (!employeeId || !n.recipientId || n.recipientId === employeeId)
  )
}
