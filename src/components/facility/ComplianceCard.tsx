import { useNavigate } from 'react-router-dom'
import type { Building } from '@/types/facility'
import Button from '@/components/Button'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'

interface ComplianceCardProps {
  building: Building
  submittedAt?: string
  onDiscard?: (e: React.MouseEvent) => void
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

export default function ComplianceCard({ building, submittedAt, onDiscard }: ComplianceCardProps) {
  const navigate = useNavigate()

  const isActive = building.status === 'active'
  const isDraft = building.complianceStatus === 'draft'
  const isPending = building.complianceStatus === 'pending'
  const showActions = isDraft || isPending
  const showProgress = isDraft || isPending

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


  function handleCardClick() {
    navigate(`/facility/compliance/${building.id}`)
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation()
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
      {showProgress && (
        <span className="inline-flex items-center gap-1 shrink-0">
          <i className="ri-image-line shrink-0 text-text-tertiary/80" />
          <span className="text-text-secondary">{building.complianceProgress}/{building.complianceTotal}</span>
        </span>
      )}
    </>
  )

  const ActionButtons = ({ fullWidth }: { fullWidth?: boolean }) => {
    if (isDraft) {
      return (
        <div className={`flex items-center gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
          <Button size="sm" variant="secondary" fullWidth={fullWidth} onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" variant="primary" fullWidth={fullWidth}
            onClick={(e) => { e.stopPropagation(); navigate(`/facility/compliance/${building.id}`) }}
          >
            Resume
          </Button>
        </div>
      )
    }
    if (isPending) {
      return (
        <Button size="sm" variant="primary" fullWidth={fullWidth}
          onClick={(e) => { e.stopPropagation(); navigate(`/facility/compliance/${building.id}`) }}
        >
          Start
        </Button>
      )
    }
    return null
  }

  return (
    <div
      className="rounded-xl bg-white border border-border-light shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      onClick={handleCardClick}
    >
      {/* Top: avatar + name/location + status pill at top-right */}
      <div className="px-4 pt-4 pb-1.5 flex gap-3 items-start">
        <div className="shrink-0 h-10 w-10 rounded-full bg-brand-red-50 flex items-center justify-center border border-brand-red-100">
          <i className="ri-building-2-fill text-brand text-[15px]" />
        </div>
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
        {/* Status pill at top-right */}
        <div className="shrink-0">
          <FacilityStatusBadge status={building.complianceStatus} />
        </div>
      </div>


      {/* Mobile footer */}
      <div className={`md:hidden pl-[4.25rem] pr-4 pt-0.5 ${showActions ? 'pb-2' : 'pb-3'}`}>
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
      {showActions && (
        <div className="md:hidden px-4 pb-3" onClick={stopProp}>
          <ActionButtons fullWidth />
        </div>
      )}

      {/* Desktop footer */}
      <div className="hidden md:flex pl-[4.25rem] pr-4 items-center flex-wrap gap-x-3 gap-y-1 text-xs pt-0.5 pb-3">
        <MetaItems />
        {building.complianceDraftAge !== undefined && building.complianceDraftAge >= 7 && (
          <span className="text-xs text-pending font-medium">
            <i className="ri-alarm-warning-line mr-1" />
            Draft is {building.complianceDraftAge} days old
          </span>
        )}
        {showActions && (
          <div className="ml-auto shrink-0" onClick={stopProp}>
            <ActionButtons />
          </div>
        )}
      </div>
    </div>
  )
}
