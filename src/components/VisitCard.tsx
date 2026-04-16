import { useState } from 'react'
import type { Visit } from '@/types/visit'
import type { Role } from '@/types/user'
import Button from './Button'
import { employees } from '@/data/employees'
import { formatTime, addMinutesToTime } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'

interface VisitCardProps {
  visit: Visit
  visitorName: string
  visitorPhone?: string
  visitorAvatar?: string
  role: Role
}

export default function VisitCard({ visit, visitorName, visitorPhone, visitorAvatar, role }: VisitCardProps) {
  const navigate = useNavigate()
  const checkOut = useVisitStore((s) => s.checkOut)
  const checkOutDelegate = useVisitStore((s) => s.checkOutDelegate)
  const host = employees.find((e) => e.id === visit.hostEmployeeId)

  // Consolidated time/detail logic
  const checkInDisplay = visit.checkInTime
    ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : formatTime(visit.scheduledTime)

  const expectedOut = (visit.checkInTime && visit.duration)
    ? new Date(new Date(visit.checkInTime).getTime() + visit.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : visit.duration
      ? formatTime(addMinutesToTime(visit.scheduledTime, visit.duration))
      : null

  const checkOutDisplay = visit.checkOutTime
    ? new Date(visit.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : expectedOut

  const terminalStatus: Record<string, { label: string; icon: string; bg: string; text: string }> = {
    'checked-out': { label: 'Checked Out', icon: 'ri-checkbox-circle-line', bg: 'bg-badge-green-light',  text: 'text-badge-green-dark'  },
    'cancelled':   { label: 'Cancelled',   icon: 'ri-close-circle-line',    bg: 'bg-badge-red-light',    text: 'text-badge-red-dark'    },
    'no-show':     { label: 'No Show',     icon: 'ri-error-warning-line',   bg: 'bg-badge-yellow-light', text: 'text-badge-yellow-dark' },
    'rejected':    { label: 'Rejected',    icon: 'ri-forbid-line',          bg: 'bg-badge-red-light',    text: 'text-badge-red-dark'    },
  }
  const terminalBar = terminalStatus[visit.status] ?? null

  const isClickable = role === 'front-desk'
  const hasDelegate = visit.delegates && visit.delegates.length > 0
  const [delegatesOpen, setDelegatesOpen] = useState(false)
  const showCheckOut = visit.status === 'checked-in'

  const delegateRows = hasDelegate
    ? visit.delegates!.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-surface-secondary flex items-center justify-center text-[9px] font-semibold text-text-tertiary shrink-0">
            {d.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')}
          </div>
          <span className="text-xs text-text-primary flex-1 min-w-0 truncate">{d.name}</span>
          {!showCheckOut && <span className="text-[11px] text-text-tertiary whitespace-nowrap shrink-0">{d.mobile}</span>}
          {d.checkOutTime ? (
            <span className="ml-auto text-[10px] text-text-tertiary bg-surface-secondary rounded px-1.5 py-0.5 shrink-0">
              Left {new Date(d.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : showCheckOut ? (
            <Button size="sm" variant="secondary" icon="ri-logout-box-line"
              onClick={(e) => { e.stopPropagation(); checkOutDelegate(visit.id, i) }}>
              Check out
            </Button>
          ) : null}
        </div>
      ))
    : null

  const hasAction =
    (role === 'front-desk' && ['pending-approval', 'confirmed', 'scheduled', 'checked-in'].includes(visit.status)) ||
    (role === 'employee' && visit.status === 'pending-approval')

  const initials = visitorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div
      className={`rounded-xl bg-white border border-border-light shadow-sm transition-all duration-150 ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
      onClick={isClickable ? () => navigate(`/front-desk/check-in/${visit.id}`) : undefined}
    >
      {/* ── Top body ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1.5 flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 self-start">
          {visitorAvatar ? (
            <img
              src={visitorAvatar}
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
            {hasDelegate && (
              <button
                onClick={(e) => { e.stopPropagation(); setDelegatesOpen((v) => !v) }}
                className="hidden md:inline-flex items-center cursor-pointer gap-0.5 text-xs text-brand hover:text-brand-hover transition-colors shrink-0"
              >
                +{visit.delegates!.length} others
                <i className={`ri-arrow-down-s-line transition-transform duration-200 ${delegatesOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          {visitorPhone && (
            <p className="text-xs text-text-secondary truncate mt-0.5">{visitorPhone}</p>
          )}
        </div>
      </div>

      {/* ── Footer: mobile — 2×2 grid + full-width button ── */}
      <div className={`md:hidden pl-[4.25rem] pr-4 pt-1 ${hasAction ? 'pb-2' : 'pb-3'}`}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-time-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary font-medium">{checkInDisplay}</span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-user-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary truncate">{host?.name ?? 'Unknown'}</span>
          </span>
          {checkOutDisplay && visit.status !== 'pending-approval' && (
            <span className="col-start-1 inline-flex items-center gap-1 shrink-0">
              <i className="ri-logout-box-r-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary">{checkOutDisplay}</span>
            </span>
          )}
          {visit.badgeNumber && (
            <span className="col-start-2 inline-flex items-center gap-1 shrink-0">
              <i className="ri-id-card-line shrink-0 text-text-tertiary/80" />
              <span className="text-text-secondary font-medium">{visit.badgeNumber}</span>
            </span>
          )}
        </div>
      </div>
      {/* ── Mobile: group members (after details, before action) ── */}
      {hasDelegate && (
        <div className="md:hidden px-4 pb-2" onClick={(e) => e.stopPropagation()}>
          <div className="h-px bg-border-light mb-3" />
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">Group members</p>
          <div className="space-y-2">{delegateRows}</div>
        </div>
      )}

      {hasAction && (
        <div className="md:hidden px-4 pt-2 pb-3" onClick={(e) => e.stopPropagation()}>
          <VisitActions visit={visit} role={role} navigate={navigate} checkOut={checkOut} checkOutDelegate={checkOutDelegate} fullWidth />
        </div>
      )}

      {/* ── Footer: desktop — unified inline bar ── */}
      <div className="hidden md:flex pl-[4.25rem] pr-4 items-center flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary pt-1 pb-3">
        <span className="inline-flex items-center gap-1 shrink-0">
          <i className="ri-time-line shrink-0 text-text-tertiary/80" />
          <span className="text-text-secondary font-medium">{checkInDisplay}</span>
        </span>

        <span className="inline-flex items-center gap-1 shrink-0">
          <i className="ri-user-line shrink-0 text-text-tertiary/80" />
          <span className="text-text-secondary truncate max-w-[120px]">{host?.name ?? 'Unknown'}</span>
        </span>

        {checkOutDisplay && visit.status !== 'pending-approval' && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-logout-box-r-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary">{checkOutDisplay}</span>
          </span>
        )}

        {visit.badgeNumber && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <i className="ri-id-card-line shrink-0 text-text-tertiary/80" />
            <span className="text-text-secondary font-medium">{visit.badgeNumber}</span>
          </span>
        )}
        {hasAction && (
          <div className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
            <VisitActions visit={visit} role={role} navigate={navigate} checkOut={checkOut} checkOutDelegate={checkOutDelegate} />
          </div>
        )}
      </div>

      {/* ── Desktop: group members (collapsible, after inline bar) ── */}
      {hasDelegate && (
        <div className={`hidden md:grid transition-[grid-template-rows] duration-200 ease-in-out ${delegatesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden min-h-0" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 pl-[4.25rem] pb-3">
              <div className="h-px bg-border-light mb-3" />
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">Group members</p>
              <div className="space-y-2">{delegateRows}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Terminal status bar ── */}
      {terminalBar && (
        <div className={`flex items-center gap-1.5 px-4 py-2 rounded-b-xl text-xs font-medium ${terminalBar.bg} ${terminalBar.text}`}>
          <i className={`${terminalBar.icon} text-sm shrink-0`} />
          {terminalBar.label}
        </div>
      )}
    </div>
  )
}

function VisitActions({
  visit, role, navigate, checkOut, checkOutDelegate, fullWidth,
}: {
  visit: Visit
  role: Role
  navigate: ReturnType<typeof useNavigate>
  checkOut: (id: string) => void
  checkOutDelegate: (id: string, idx: number) => void
  fullWidth?: boolean
}) {
  if (role === 'front-desk') {
    switch (visit.status) {
      case 'pending-approval':
        return (
          <Button size="sm" variant="secondary" icon="ri-login-box-line" fullWidth={fullWidth} onClick={(e) => { e.stopPropagation(); navigate(`/front-desk/check-in/${visit.id}`) }}>
            Manual Check-in
          </Button>
        )
      case 'confirmed':
      case 'scheduled':
        return (
          <Button size="sm" variant="secondary" icon="ri-login-box-line" fullWidth={fullWidth} onClick={() => navigate(`/front-desk/check-in/${visit.id}`)}>
            Check In
          </Button>
        )
      case 'checked-in': {
        const hasDelegate = (visit.delegates?.length ?? 0) > 0
        if (hasDelegate) {
          function handleCheckOutAll(e: React.MouseEvent) {
            e.stopPropagation()
            visit.delegates?.forEach((d, i) => { if (!d.checkOutTime) checkOutDelegate(visit.id, i) })
            checkOut(visit.id)
          }
          return (
            <Button size="sm" variant="primary" icon="ri-logout-box-line" fullWidth={fullWidth} onClick={handleCheckOutAll}>
              Check Out All
            </Button>
          )
        }
        return (
          <Button size="sm" variant="secondary" icon="ri-logout-box-line" fullWidth={fullWidth} onClick={(e) => { e.stopPropagation(); navigate(`/front-desk/check-out/${visit.id}`) }}>
            Check Out
          </Button>
        )
      }
      default:
        return null
    }
  }

  if (role === 'employee') {
    if (visit.status === 'pending-approval') {
      return (
        <Button size="sm" variant="primary" fullWidth={fullWidth} onClick={() => navigate(`/employee/approve/${visit.id}`)}>
          Review
        </Button>
      )
    }
    return null
  }

  return null
}
