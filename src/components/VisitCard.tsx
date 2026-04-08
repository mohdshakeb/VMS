import type { Visit } from '@/types/visit'
import type { Role } from '@/types/user'
import Button from './Button'
import { employees } from '@/data/employees'
import { useVisitStore } from '@/store/visitStore'
import { formatTime, addMinutesToTime } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'

interface VisitCardProps {
  visit: Visit
  visitorName: string
  visitorPhone?: string
  visitorAvatar?: string
  role: Role
}

export default function VisitCard({ visit, visitorName, visitorPhone, visitorAvatar, role }: VisitCardProps) {
  const navigate = useNavigate()
  const host = employees.find((e) => e.id === visit.hostEmployeeId)
  const expectedOut = visit.duration
    ? formatTime(addMinutesToTime(visit.scheduledTime, visit.duration))
    : null

  const isClickable = role === 'front-desk'

  const initials = visitorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div
      className={`rounded-xl bg-white border border-border-light p-4 flex gap-3 shadow-sm transition-all duration-150 ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
      onClick={isClickable ? () => navigate(`/front-desk/check-in/${visit.id}`) : undefined}
    >
      {/* Avatar */}
      <div className="shrink-0">
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

      {/* Left: header + details */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{visitorName}</p>
            {visitorPhone && (
              <p className="text-xs text-text-secondary truncate">{visitorPhone}</p>
            )}
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <i className="ri-time-line" />
            {formatTime(visit.scheduledTime)}
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="ri-user-line" />
            {host?.name ?? 'Unknown'}
          </span>
          {visit.badgeNumber && (
            <span className="inline-flex items-center gap-1">
              <i className="ri-id-card-line" />
              {visit.badgeNumber}
            </span>
          )}
        </div>
      </div>

      {/* Right: expected out (top) + action (bottom) */}
      <div className="shrink-0 flex flex-col items-end justify-between">
        {expectedOut && visit.status !== 'pending-approval' ? (
          <p className="text-[10px] text-text-tertiary whitespace-nowrap">Out {expectedOut}</p>
        ) : (
          <span />
        )}
        <VisitActions visit={visit} role={role} navigate={navigate} />
      </div>
    </div>
  )
}

function VisitActions({ visit, role, navigate }: { visit: Visit; role: Role; navigate: ReturnType<typeof useNavigate> }) {
  const { checkOut } = useVisitStore()

  if (role === 'front-desk') {
    switch (visit.status) {
      case 'pending-approval':
        return (
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-xs text-pending font-medium whitespace-nowrap">
              <i className="ri-time-line mr-1" />Waiting for approval
            </p>
            <Button size="sm" variant="secondary" icon="ri-login-box-line" onClick={(e) => { e.stopPropagation(); navigate(`/front-desk/check-in/${visit.id}`) }}>
              Manual Check-in
            </Button>
          </div>
        )
      case 'confirmed':
      case 'scheduled':
        return (
          <Button size="sm" variant="secondary" icon="ri-login-box-line" onClick={() => navigate(`/front-desk/check-in/${visit.id}`)}>
            Check In
          </Button>
        )
      case 'checked-in':
        return (
          <Button size="sm" variant="secondary" icon="ri-logout-box-line" onClick={() => checkOut(visit.id)}>
            Check Out
          </Button>
        )
      default:
        return null
    }
  }

  if (role === 'employee') {
    if (visit.status === 'pending-approval') {
      return (
        <Button size="sm" variant="primary" onClick={() => navigate(`/employee/approve/${visit.id}`)}>
          Review
        </Button>
      )
    }
    return null
  }

  return null
}
