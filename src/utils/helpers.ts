import type { VisitStatus } from '@/types/visit'

export function getLocalDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

let counter = 100

export function generateId(): string {
  counter++
  return `gen-${Date.now()}-${counter}`
}

let badgeCounter = 40

export function generateBadgeNumber(): string {
  badgeCounter++
  return `B-${String(badgeCounter).padStart(4, '0')}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function formatRelativeTime(isoStr: string): string {
  const now = new Date()
  const then = new Date(isoStr)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function getStatusLabel(status: VisitStatus): string {
  const labels: Record<VisitStatus, string> = {
    'pending-approval': 'Pending Approval',
    'pending-confirmation': 'Pending Confirmation',
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    'checked-in': 'On Premises',
    'checked-out': 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

export function getStatusColor(status: VisitStatus): { bg: string; text: string } {
  const colors: Record<VisitStatus, { bg: string; text: string }> = {
    'pending-approval': { bg: 'bg-pending-light', text: 'text-pending' },
    'pending-confirmation': { bg: 'bg-pending-light', text: 'text-pending' },
    scheduled: { bg: 'bg-confirmed-light', text: 'text-confirmed' },
    confirmed: { bg: 'bg-confirmed-light', text: 'text-confirmed' },
    'checked-in': { bg: 'bg-on-premises-light', text: 'text-on-premises' },
    'checked-out': { bg: 'bg-completed-light', text: 'text-completed' },
    rejected: { bg: 'bg-rejected-light', text: 'text-rejected' },
    cancelled: { bg: 'bg-completed-light', text: 'text-completed' },
  }
  return colors[status]
}

export function getVisitTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    interview: 'Interview',
    contractor: 'Contractor',
    vendor: 'Vendor',
    customer: 'Customer',
    'government-official': 'Government Official',
    'cat-officials': 'CAT Officials',
    'employee-other-branch': 'Employee (Other Branch)',
    'employee-visitor': 'Employee Visitor',
    'general-visitor': 'General Visitor',
    visitor: 'Visitor',
    other: 'Other',
  }
  return labels[type] || type
}

export function getPurposeLabel(purpose: string): string {
  const labels: Record<string, string> = {
    official: 'Official',
    training: 'Training',
    personal: 'Personal',
    customer: 'Customer',
    other: 'Other',
  }
  return labels[purpose] || purpose
}

export function getBusinessSegmentLabel(seg: string): string {
  const labels: Record<string, string> = {
    machines: 'Machines',
    engines: 'Engines',
    'parts-purchased': 'Parts Purchased',
    'service-inquiry': 'Service Inquiry',
    other: 'Other',
  }
  return labels[seg] || seg
}

export function getVisitorPriorityLabel(pri: string): string {
  const labels: Record<string, string> = {
    immediate: 'Immediate',
    'in-a-month': 'In a Month',
    exploring: 'Exploring',
  }
  return labels[pri] || pri
}

export function getDepartmentLabel(dept: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    hr: 'HR',
    it: 'IT',
    accounts: 'Accounts',
  }
  return labels[dept] || dept
}
