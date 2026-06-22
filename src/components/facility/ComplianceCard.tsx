import { useNavigate } from 'react-router-dom'
import type { FacilityComplianceStatus, FacilityType } from '@/types/facility'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import { formatComplianceDueDate } from '@/data/facilityData'

interface ComplianceCardProps {
  locationName: string
  facilityTypes: FacilityType[]
  status: FacilityComplianceStatus
  progress: number
  total: number
  recordId?: string
  submittedAt?: string
  submittedBy?: string
  month?: number
  year?: number
}

export default function ComplianceCard({
  locationName,
  facilityTypes,
  status,
  progress,
  total,
  recordId,
  submittedAt,
  submittedBy,
  month,
  year,
}: ComplianceCardProps) {
  const navigate = useNavigate()

  const isOverdue = status === 'overdue'
  const isSubmitted = status === 'submitted'

  function getDestination() {
    if (recordId) return `/facility/compliance/record/${recordId}`
    return '/facility/compliance'
  }

  let dateIcon = isOverdue ? 'ri-calendar-close-line' : 'ri-calendar-line'
  let dateLabel: string | null = null
  if (isSubmitted && submittedAt) {
    dateIcon = 'ri-calendar-check-line'
    dateLabel = new Date(submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } else if (month && year) {
    dateLabel = `Due ${formatComplianceDueDate(month, year)}`
  }

  const MetaItems = () => (
    <>
      {dateLabel && (
        <span className="inline-flex items-center gap-1 shrink-0">
          <i className={`${dateIcon} shrink-0 text-text-tertiary/80`} />
          <span className="text-text-secondary">{dateLabel}</span>
        </span>
      )}
      {isSubmitted && submittedBy && (
        <span className="inline-flex items-center gap-1 shrink-0">
          <i className="ri-user-line shrink-0 text-text-tertiary/80" />
          <span className="text-text-secondary">{submittedBy}</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1 shrink-0">
        <i className="ri-list-check shrink-0 text-text-tertiary/80" />
        <span className="text-text-secondary">{progress}/{total}</span>
      </span>
    </>
  )

  return (
    <div
      className="rounded-xl bg-white border border-border-light shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(getDestination())}
    >
      {/* Top: icon + location name + status pill */}
      <div className="px-4 pt-4 pb-1.5 flex gap-3 items-start">
        <div className="shrink-0 h-10 w-10 rounded-full bg-brand-red-50 flex items-center justify-center border border-brand-red-100">
          <i className="ri-map-pin-2-fill text-brand text-[15px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{locationName}</p>
          <p className="text-xs text-text-secondary truncate mt-0.5">{facilityTypes.join(' · ')}</p>
        </div>
        <div className="shrink-0">
          <FacilityStatusBadge status={status} />
        </div>
      </div>

      {/* Footer meta */}
      <div className="pl-[4.25rem] pr-4 pt-0.5 pb-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
          <MetaItems />
        </div>
      </div>
    </div>
  )
}
