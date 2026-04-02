import type { Role } from './user'

export type NotificationType =
  | 'walk-in-approval'
  | 'visit-confirmed'
  | 'visit-rejected'
  | 'visitor-arrived'
  | 'visitor-checked-out'
  | 'new-pending-request'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  visitId: string
  recipientRole: Role
  recipientId?: string
  read: boolean
  createdAt: string
  actionRequired: boolean
}
