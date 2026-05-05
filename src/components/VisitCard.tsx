import type { Visit, VisitStatus } from '@/types/visit'
import type { Role } from '@/types/user'
import Button from './Button'
import { employees } from '@/data/employees'
import { OVERDUE_VISIT_IDS } from '@/data/visits'
import { formatTime, addMinutesToTime, formatDate, getStatusColor, getVisitTypeLabel, getPurposeLabel } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'

interface VisitCardProps {
  visit: Visit
  visitorName: string
  visitorPhone?: string
  visitorAvatar?: string
  role: Role
  viewerIsHost?: boolean
  onApprove?: () => void
  onReject?: () => void
  onCancel?: () => void
}

export default function VisitCard({ visit, visitorName, visitorPhone, visitorAvatar, role, viewerIsHost, onApprove, onReject, onCancel }: VisitCardProps) {
  const navigate = useNavigate()
  const openCheckIn = useUIStore((s) => s.openCheckIn)
  const openCheckOut = useUIStore((s) => s.openCheckOut)
  const host = employees.find((e) => e.id === visit.hostEmployeeId)

  const isEmployeeInvited = visit.entryPath === 'employee-request' || visit.entryPath === 'pre-scheduled'

  // Checked-in → actual check-in time; employee-invited → scheduled time; walk-in → creation time
  const timeDisplay = visit.checkInTime
    ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : isEmployeeInvited
      ? formatTime(visit.scheduledTime)
      : new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const timeIcon = visit.status === 'checked-in'
    ? 'ri-login-box-line'
    : isEmployeeInvited
      ? 'ri-calendar-schedule-line'
      : 'ri-time-line'

  const expectedOutDate = (visit.checkInTime && visit.duration)
    ? new Date(new Date(visit.checkInTime).getTime() + visit.duration * 60000)
    : null

  const expectedOut = expectedOutDate
    ? expectedOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : visit.duration
      ? formatTime(addMinutesToTime(visit.scheduledTime, visit.duration))
      : null

  const isOvertime = visit.status === 'checked-in' && OVERDUE_VISIT_IDS.has(visit.id)
  const overtimeMinutes = isOvertime && expectedOutDate
    ? Math.min(Math.floor((Date.now() - expectedOutDate.getTime()) / 60000), 180)
    : 0
  const overtimeLabel = overtimeMinutes >= 60
    ? `+${Math.floor(overtimeMinutes / 60)}h${overtimeMinutes % 60 > 0 ? ` ${overtimeMinutes % 60}m` : ''}`
    : `+${overtimeMinutes}m`

  const checkOutDisplay = visit.checkOutTime
    ? new Date(visit.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : expectedOut

  const terminalMeta: Record<string, { label: string; icon: string }> = {
    'checked-out': { label: 'Checked Out', icon: 'ri-checkbox-circle-line' },
    'cancelled':   { label: 'Cancelled',   icon: 'ri-close-circle-line'    },
    'no-show':     { label: 'No Show',     icon: 'ri-error-warning-line'   },
    'rejected':    { label: 'Rejected',    icon: 'ri-forbid-line'          },
  }
  const terminalBar = terminalMeta[visit.status] ?? null
  const terminalColors = terminalBar ? getStatusColor(visit.status as VisitStatus) : null

  const hasAction =
    (role === 'front-desk' && ['pending-approval', 'confirmed', 'scheduled', 'checked-in'].includes(visit.status)) ||
    (role === 'employee' && visit.status === 'pending-approval')

  const isTerminal = ['checked-out', 'cancelled', 'no-show', 'rejected'].includes(visit.status)

  const initials = visitorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  // Checked-in visits: prefer id-photo captured at check-in, fall back to form avatar.
  // Walk-ins (not yet checked in): show avatar from the walk-in form.
  const photoSrc = visit.status === 'checked-in'
    ? (visit.idPhotoCapture ?? visitorAvatar ?? null)
    : visit.entryPath === 'walk-in'
      ? (visitorAvatar ?? null)
      : null
  const showPhoto = !!photoSrc

  const entryBadge =
    visit.entryPath === 'self-register'
      ? { label: 'Self' }
      : (visit.entryPath === 'employee-request' || visit.entryPath === 'pre-scheduled')
        ? viewerIsHost
          ? { label: 'By You' }
          : { label: 'By Host' }
        : null

  function handleCardClick() {
    navigate(`/front-desk/visit/${visit.id}`)
  }

  return (
    <div
      className="rounded-xl bg-white border border-border-light shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      onClick={handleCardClick}
    >
      {/* ── Top body ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1.5 flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 self-start">
          {showPhoto ? (
            <img
              src={photoSrc!}
              alt={visitorName}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-brand-red-50 flex items-center justify-center text-[11px] font-medium text-brand-red-500 border border-brand-red-100">
              {initials}
            </div>
          )}
        </div>

        {/* Name + phone */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-text-primary truncate">{visitorName}</p>
            {entryBadge && (
              <span className="inline-flex items-center rounded-full bg-violet-surface border border-violet-border px-1.5 py-0.5 text-[10px] font-medium text-violet-fg shrink-0">
                {entryBadge.label}
              </span>
            )}
            {visit.isMultiDay && (
              <span className="inline-flex items-center rounded-full bg-blue-surface border border-blue-border px-1.5 py-0.5 text-[10px] font-medium text-blue-fg shrink-0">
                Multi-day
              </span>
            )}
          </div>
          {visitorPhone && (
            <p className="text-xs text-text-secondary truncate mt-0.5">{visitorPhone}</p>
          )}
        </div>
      </div>

      {/* ── Footer: mobile ── */}
      <div className={`md:hidden pl-[4.25rem] pr-4 pt-1 ${hasAction || isTerminal ? 'pb-2' : 'pb-3'}`}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {timeDisplay && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <i className={`${timeIcon} shrink-0 text-text-tertiary/80`} />
              <span className="text-text-secondary font-medium">{timeDisplay}</span>
            </span>
          )}
          {!viewerIsHost && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <i className="ri-user-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary truncate">{host?.name ?? 'Unknown'}</span>
            </span>
          )}
          {checkOutDisplay && !!visit.checkInTime && (
            <span className="col-start-1 inline-flex items-baseline gap-1 shrink-0">
              <i className={`ri-logout-box-r-line shrink-0 ${isOvertime ? 'text-red-500' : 'text-text-tertiary/80'} self-center`} />
              <span className={isOvertime ? 'text-red-500 font-medium' : 'text-text-secondary'}>{checkOutDisplay}</span>
              {isOvertime && (
                <span className="text-red-500 font-medium text-[10px]">{overtimeLabel}</span>
              )}
            </span>
          )}
          {visit.badgeNumber && (
            <span className="col-start-2 inline-flex items-center gap-1 shrink-0">
              <i className="ri-id-card-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary font-medium">{visit.badgeNumber}</span>
            </span>
          )}
          {visit.isMultiDay && visit.endDate && (
            <span className="col-span-2 inline-flex items-center gap-1 shrink-0">
              <i className="ri-calendar-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary">Until {formatDate(visit.endDate)}</span>
            </span>
          )}
          {role !== 'front-desk' && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <i className="ri-user-3-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary">{getVisitTypeLabel(visit.visitType)}</span>
            </span>
          )}
          {role !== 'front-desk' && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <i className="ri-briefcase-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary">{getPurposeLabel(visit.purpose)}</span>
            </span>
          )}
        </div>
      </div>
      <div className="md:hidden px-4 pt-1.5 pb-3" onClick={(e) => e.stopPropagation()}>
        <VisitActions visit={visit} role={role} openCheckIn={openCheckIn} openCheckOut={openCheckOut} fullWidth onApprove={onApprove} onReject={onReject} onCancel={onCancel} />
      </div>

      {/* ── Footer: desktop ── */}
      <div className="hidden md:flex pl-[4.25rem] pr-4 items-center flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary pt-1 pb-3">
        {timeDisplay && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className={`${timeIcon} shrink-0 text-text-tertiary/80`} />
            <span className="text-text-secondary font-medium">{timeDisplay}</span>
          </span>
        )}
        {!viewerIsHost && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-user-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary truncate max-w-[120px]">{host?.name ?? 'Unknown'}</span>
          </span>
        )}
        {checkOutDisplay && !!visit.checkInTime && (
          <span className="inline-flex items-baseline gap-1 shrink-0">
            <i className={`ri-logout-box-r-line shrink-0 ${isOvertime ? 'text-red-500' : 'text-text-tertiary/80'} self-center`} />
            <span className={isOvertime ? 'text-red-500 font-medium' : 'text-text-secondary'}>{checkOutDisplay}</span>
            {isOvertime && (
              <span className="text-red-500 font-medium text-[10px]">{overtimeLabel}</span>
            )}
          </span>
        )}
        {visit.badgeNumber && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-id-card-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary font-medium">{visit.badgeNumber}</span>
          </span>
        )}
        {visit.isMultiDay && visit.endDate && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-calendar-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary">Until {formatDate(visit.endDate)}</span>
          </span>
        )}
        {role !== 'front-desk' && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-user-3-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary">{getVisitTypeLabel(visit.visitType)}</span>
          </span>
        )}
        {role !== 'front-desk' && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-briefcase-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary">{getPurposeLabel(visit.purpose)}</span>
          </span>
        )}
        <div className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
          <VisitActions visit={visit} role={role} openCheckIn={openCheckIn} openCheckOut={openCheckOut} onApprove={onApprove} onReject={onReject} onCancel={onCancel} />
        </div>
      </div>

      {/* ── Terminal status bar ── */}
      {terminalBar && (() => {
        const showReason = visit.status === 'rejected' && !!visit.rejectionReason
        return (
          <div className={`flex ${showReason ? 'items-start' : 'items-center'} gap-1.5 px-4 py-2 rounded-b-xl text-xs font-medium ${terminalColors!.bg} ${terminalColors!.text}`}>
            <i className={`${terminalBar.icon} text-sm leading-none shrink-0`} />
            <div>
              {terminalBar.label}
              {showReason && (
                <p className="font-normal opacity-75 mt-0.5">{visit.rejectionReason}</p>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function VisitActions({
  visit, role, openCheckIn, openCheckOut, fullWidth, onApprove, onReject, onCancel,
}: {
  visit: Visit
  role: Role
  openCheckIn: (id: string) => void
  openCheckOut: (id: string) => void
  fullWidth?: boolean
  onApprove?: () => void
  onReject?: () => void
  onCancel?: () => void
}) {
  if (role === 'front-desk') {
    switch (visit.status) {
      case 'pending-approval':
        return (
          <Button
            size="sm" variant="secondary" icon="ri-login-box-line" fullWidth={fullWidth}
            onClick={() => openCheckIn(visit.id)}
          >
            Manual Check-in
          </Button>
        )
      case 'confirmed':
      case 'scheduled':
        return (
          <Button
            size="sm" variant="secondary" icon="ri-login-box-line" fullWidth={fullWidth}
            onClick={() => openCheckIn(visit.id)}
          >
            Check In
          </Button>
        )
      case 'checked-in':
        return (
          <Button
            size="sm" variant="secondary" icon="ri-logout-box-line" fullWidth={fullWidth}
            onClick={() => openCheckOut(visit.id)}
          >
            Check Out
          </Button>
        )
      default:
        return null
    }
  }

  if (role === 'employee') {
    if (visit.status === 'pending-approval' && onApprove && onReject) {
      return (
        <div className="flex items-center gap-1.5 w-full">
          <Button size="sm" variant="primary" icon="ri-check-line" fullWidth={fullWidth} onClick={onApprove}>Approve</Button>
          <Button size="sm" variant="secondary" icon="ri-close-line" fullWidth={fullWidth} onClick={onReject}>Reject</Button>
        </div>
      )
    }
    if (['confirmed', 'scheduled'].includes(visit.status) && onCancel) {
      return (
        <Button size="sm" variant="secondary" icon="ri-close-circle-line" fullWidth={fullWidth} onClick={onCancel}>
          Cancel Visit
        </Button>
      )
    }
    return null
  }

  return null
}
