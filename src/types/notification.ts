import type { Role } from './user'

export type NotificationType =
  | 'walk-in-approval'
  | 'visit-confirmed'
  | 'visit-rejected'
  | 'visitor-arrived'
  | 'visitor-checked-out'
  | 'new-pending-request'
  | 'compliance-window-open'
  | 'compliance-deadline-reminder'
  | 'compliance-submitted'
  | 'compliance-overdue'
  | 'compliance-missed'
  | 'sbu-edited'
  | 'facility-status-requested'
  | 'facility-status-approved'
  | 'facility-status-rejected'
  | 'facility-change-requested'
  | 'facility-change-approved'
  | 'facility-change-rejected'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  visitId?: string
  facilityId?: string
  changeRequestId?: string
  recordId?: string
  recipientRole: Role
  recipientId?: string
  read: boolean
  createdAt: string
  actionRequired: boolean
}
