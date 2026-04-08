import type { VisitStatus } from '@/types/visit'
import { getStatusLabel, getStatusColor } from '@/utils/helpers'

interface StatusBadgeProps {
  status: VisitStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text } = getStatusColor(status)
  const label = getStatusLabel(status)

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
