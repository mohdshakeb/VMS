import { useNavigate } from 'react-router-dom'
import type { Building } from '@/types/facility'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'

interface ComplianceCardProps {
  building: Building
  recordId?: string
  submittedAt?: string
}

const BUILDING_TYPE_ICON: Record<string, string> = {
  'Branch Office':    'ri-building-2-line',
  'Parts Warehouse':  'ri-store-2-line',
  'CRC':              'ri-tools-line',
  'MRC':              'ri-tools-line',
  'Repair Center':    'ri-hammer-line',
  'Executive Office': 'ri-building-line',
  'HQ':               'ri-government-line',
}

export default function ComplianceCard({ building, recordId, submittedAt }: ComplianceCardProps) {
  const navigate = useNavigate()

  const isActive = building.status === 'active'
  const isDraft = building.complianceStatus === 'draft'
  const isPending = building.complianceStatus === 'pending'
  const isEditable = isDraft || isPending

  function getDestination() {
    if (recordId) return `/facility/compliance/record/${recordId}`
    return '/facility/compliance'
  }

  // Time meta
  let timeIcon = 'ri-time-line'
  let timeLabel: string | null = null
  if (isDraft && building.complianceDraftAge !== undefined) {
    timeIcon = 'ri-calendar-line'
    timeLabel = building.complianceDraftAge === 0 ? 'Started today' : `Started ${building.complianceDraftAge}d ago`
  } else if (building.complianceStatus === 'submitted' && submittedAt) {
    timeIcon = 'ri-calendar-check-line'
    timeLabel = `Submitted ${new Date(submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
  } else if (isPending) {
    timeIcon = 'ri-calendar-line'
    timeLabel = 'May 2026 cycle'
  }

  const buildingTypeIcon = BUILDING_TYPE_ICON[building.type] ?? 'ri-building-2-line'

  const MetaItems = () => (
    <>
      {timeLabel && (
        <span className="inline-flex items-center gap-1 shrink-0">
          <i className={`${timeIcon} shrink-0 text-text-tertiary/80`} />
          <span className="text-text-secondary">{timeLabel}</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1 shrink-0">
        <i className={`${buildingTypeIcon} shrink-0 text-text-tertiary/80`} />
        <span className="text-text-secondary">{building.type}</span>
      </span>
      {isEditable && (
        <span className="inline-flex items-center gap-1 shrink-0">
          <i className="ri-image-line shrink-0 text-text-tertiary/80" />
          <span className="text-text-secondary">{building.complianceProgress}/{building.complianceTotal}</span>
        </span>
      )}
    </>
  )

  return (
    <div
      className="rounded-xl bg-white border border-border-light shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(getDestination())}
    >
      {/* Top: avatar + name/location + status pill at top-right */}
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
          <p className="text-xs text-text-secondary truncate mt-0.5">{building.location}, {building.city}</p>
        </div>
        <div className="shrink-0">
          <FacilityStatusBadge status={building.complianceStatus} />
        </div>
      </div>

      {/* Mobile footer */}
      <div className="md:hidden pl-[4.25rem] pr-4 pt-0.5 pb-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <MetaItems />
        </div>
        {building.complianceDraftAge !== undefined && building.complianceDraftAge >= 7 && (
          <p className="text-xs text-pending font-medium mt-1.5">
            <i className="ri-alarm-warning-line mr-1" />
            Draft is {building.complianceDraftAge} days old
          </p>
        )}
      </div>

      {/* Desktop footer */}
      <div className="hidden md:flex pl-[4.25rem] pr-4 items-center flex-wrap gap-x-3 gap-y-1 text-xs pt-0.5 pb-3">
        <MetaItems />
        {building.complianceDraftAge !== undefined && building.complianceDraftAge >= 7 && (
          <span className="text-xs text-pending font-medium">
            <i className="ri-alarm-warning-line mr-1" />
            Draft is {building.complianceDraftAge} days old
          </span>
        )}
      </div>
    </div>
  )
}
