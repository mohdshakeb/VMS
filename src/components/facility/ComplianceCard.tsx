import { useNavigate } from 'react-router-dom'
import type { Facility } from '@/types/facility'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import { formatComplianceDueDate } from '@/data/facilityData'

interface ComplianceCardProps {
  facility: Facility
  recordId?: string
  submittedAt?: string
  submittedBy?: string
  month?: number
  year?: number
}

export default function ComplianceCard({ facility: building, recordId, submittedAt, submittedBy, month, year }: ComplianceCardProps) {
  const navigate = useNavigate()

  const isActive = building.status === 'active'
  const isOverdue = building.complianceStatus === 'overdue'
  const isSubmitted = building.complianceStatus === 'submitted'

  function getDestination() {
    if (recordId) return `/facility/compliance/record/${recordId}`
    return '/facility/compliance'
  }

  // Date: submission date if submitted, due date otherwise
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
        <span className="text-text-secondary">{building.complianceProgress}/{building.complianceTotal}</span>
      </span>
    </>
  )

  return (
    <div
      className="rounded-xl bg-white border border-border-light shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(getDestination())}
    >
      {/* Top: avatar + name/city + status pill */}
      <div className="px-4 pt-4 pb-1.5 flex gap-3 items-start">
        {building.photoUrl ? (
          <img
            src={building.photoUrl}
            alt={building.name}
            className="shrink-0 h-10 w-10 rounded-full object-cover border border-border-light"
          />
        ) : (
          <div className="shrink-0 h-10 w-10 rounded-full bg-brand-red-50 flex items-center justify-center border border-brand-red-100">
            <i className="ri-building-2-fill text-brand text-[15px]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-text-primary truncate">{building.name}</p>
            <span className={`inline-flex items-center gap-1 text-xs shrink-0 ${isActive ? 'text-green-600' : 'text-text-tertiary'}`}>
              <i className={`ri-radio-button-line text-[10px] ${isActive ? 'text-green-500' : 'text-text-tertiary/60'}`} />
              <span className="font-medium">{isActive ? 'Active' : 'Inactive'}</span>
            </span>
          </div>
          <p className="text-xs text-text-secondary truncate mt-0.5">{building.city}</p>
        </div>
        <div className="shrink-0">
          <FacilityStatusBadge status={building.complianceStatus} />
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
