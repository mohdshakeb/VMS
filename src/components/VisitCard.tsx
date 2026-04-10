import { useState } from 'react'
import type { Visit } from '@/types/visit'
import type { Role } from '@/types/user'
import Button from './Button'
import { employees } from '@/data/employees'
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
  const hasDelegate = visit.delegates && visit.delegates.length > 0
  const [delegatesOpen, setDelegatesOpen] = useState(false)

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
      <div className={`px-4 pt-4 flex gap-3 ${delegatesOpen ? 'pb-3' : 'pb-1.5'}`}>
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

        {/* Name + phone + delegate list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-text-primary truncate">{visitorName}</p>
            {hasDelegate && (
              <button
                onClick={(e) => { e.stopPropagation(); setDelegatesOpen((v) => !v) }}
                className="inline-flex items-center cursor-pointer gap-0.5 text-xs text-brand hover:text-brand-hover transition-colors shrink-0"
              >
                +{visit.delegates!.length} others
                <i className={`ri-arrow-down-s-line transition-transform duration-200 ${delegatesOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          {visitorPhone && (
            <p className="text-xs text-text-secondary truncate mt-0.5">{visitorPhone}</p>
          )}

          {/* Inline delegate list */}
          {hasDelegate && (
            <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${delegatesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden min-h-0">
                <div className="pt-2.5 space-y-1.5">
                  {visit.delegates!.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-surface-secondary flex items-center justify-center text-[9px] font-semibold text-text-tertiary shrink-0">
                        {d.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')}
                      </div>
                      <span className="text-xs text-text-primary">{d.name}</span>
                      <span className="text-[11px] text-text-tertiary">{d.mobile}</span>
                      {d.checkOutTime && (
                        <span className="ml-auto text-[10px] text-text-tertiary bg-surface-secondary rounded px-1.5 py-0.5 shrink-0">
                          Left {new Date(d.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Out time — top right */}
        {expectedOut && visit.status !== 'pending-approval' && (
          <p className="shrink-0 text-[10px] text-text-tertiary whitespace-nowrap self-start">Out {expectedOut}</p>
        )}
      </div>

      {/* ── Divider — only when delegates are expanded ───── */}
      {hasDelegate && delegatesOpen && <div className="ml-[4.25rem] mr-4 h-px bg-border-light" />}

      {/* ── Footer: time · host · badge + action ────────── */}
      <div className={`pl-[4.25rem] pr-4 flex items-center gap-x-4 text-xs text-text-secondary ${delegatesOpen ? 'py-2.5' : 'pb-2.5 pt-1.5'}`}>
        <span className="inline-flex items-center gap-1">
          <i className="ri-time-line" />
          {formatTime(visit.scheduledTime)}
        </span>
        <span className="inline-flex items-center gap-1 min-w-0">
          <i className="ri-user-line shrink-0" />
          <span className="truncate">{host?.name ?? 'Unknown'}</span>
        </span>
        {visit.badgeNumber && (
          <span className="inline-flex items-center gap-1">
            <i className="ri-id-card-line" />
            {visit.badgeNumber}
          </span>
        )}
        <div className="ml-auto shrink-0">
          <VisitActions visit={visit} role={role} navigate={navigate} />
        </div>
      </div>
    </div>
  )
}

function VisitActions({ visit, role, navigate }: { visit: Visit; role: Role; navigate: ReturnType<typeof useNavigate> }) {
  if (role === 'front-desk') {
    switch (visit.status) {
      case 'pending-approval':
        return (
          <Button size="sm" variant="secondary" icon="ri-login-box-line" onClick={(e) => { e.stopPropagation(); navigate(`/front-desk/check-in/${visit.id}`) }}>
            Manual Check-in
          </Button>
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
          <Button size="sm" variant="secondary" icon="ri-logout-box-line" onClick={(e) => { e.stopPropagation(); navigate(`/front-desk/check-out/${visit.id}`) }}>
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
