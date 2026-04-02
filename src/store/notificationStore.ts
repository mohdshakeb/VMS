import { create } from 'zustand'
import type { Notification, NotificationType } from '@/types/notification'
import type { Role } from '@/types/user'
import { generateId } from '@/utils/helpers'

interface NotificationState {
  notifications: Notification[]
  addNotification: (data: {
    type: NotificationType
    title: string
    message: string
    visitId: string
    recipientRole: Role
    recipientId?: string
    actionRequired?: boolean
  }) => void
  markAsRead: (id: string) => void
  markAllRead: (role: Role, employeeId?: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (data) =>
    set((state) => ({
      notifications: [
        {
          id: generateId(),
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
