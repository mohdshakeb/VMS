import type { FacilityComplianceStatus, BuildingStatus } from '@/types/facility'

type FacilityStatus = FacilityComplianceStatus | BuildingStatus

const STATUS_LABELS: Record<FacilityStatus, string> = {
  pending:   'Pending',
  draft:     'Draft',
  submitted: 'Submitted',
  approved:  'Approved',
  rejected:  'Rejected',
  overdue:   'Overdue',
  active:    'Active',
  inactive:  'Inactive',
}

const STATUS_COLORS: Record<FacilityStatus, { bg: string; text: string }> = {
  pending:   { bg: 'bg-yellow-surface', text: 'text-yellow-fg' },
  draft:     { bg: 'bg-surface-secondary', text: 'text-text-secondary' },
  submitted: { bg: 'bg-blue-surface',   text: 'text-blue-fg' },
  approved:  { bg: 'bg-green-surface',  text: 'text-green-fg' },
  rejected:  { bg: 'bg-red-surface',    text: 'text-red-fg' },
  overdue:   { bg: 'bg-red-surface',    text: 'text-red-fg' },
  active:    { bg: 'bg-green-surface',  text: 'text-green-fg' },
  inactive:  { bg: 'bg-surface-secondary', text: 'text-text-secondary' },
}

interface FacilityStatusBadgeProps {
  status: FacilityStatus
}

export default function FacilityStatusBadge({ status }: FacilityStatusBadgeProps) {
  const { bg, text } = STATUS_COLORS[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
