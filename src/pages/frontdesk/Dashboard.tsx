import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import SearchBar from '@/components/SearchBar'
import Button from '@/components/Button'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import PageHeader from '@/components/PageHeader'
import { visitors as seedVisitors } from '@/data/visitors'
import { employees } from '@/data/employees'
import type { Visit } from '@/types/visit'
import { getVisitTypeLabel, getLocalDateString } from '@/utils/helpers'

type StatusFilter = 'all' | 'confirmed' | 'scheduled' | 'pending'

const FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All statuses',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  pending: 'Pending',
}

// ── Main dashboard ──────────────────────────────────────────────
export default function FrontDeskDashboard() {
  const visits = useVisitStore((s) => s.visits)
  const checkOut = useVisitStore((s) => s.checkOut)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId, currentEmployeeId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()
  const [checkInSearch, setCheckInSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null)

  const now = new Date()
  const today = getLocalDateString(now)
  const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"

  const todaysVisits = visits.filter(
    (v) => v.scheduledDate === today && v.locationId === currentLocationId,
  )

  const visitorMap = Object.fromEntries(
    [...seedVisitors, ...storeVisitors].map((v) => [v.id, v]),
  )

  // ── KPI counts ──────────────────────────────────────────────
  const kpiExpected = todaysVisits.filter(
    (v) => v.status === 'confirmed' || v.status === 'scheduled',
  )
  const kpiOnPremises = todaysVisits.filter((v) => v.status === 'checked-in')

  // Confirmed: approved OR scheduled-time has arrived
  const confirmedReady = todaysVisits.filter(
    (v) =>
      v.status === 'confirmed' ||
      (v.status === 'scheduled' && v.scheduledTime <= currentTime),
  )

  // Scheduled: pre-registered but their time hasn't arrived yet
  const scheduledUpcoming = todaysVisits.filter(
    (v) => v.status === 'scheduled' && v.scheduledTime > currentTime,
  )

  // Pending: awaiting employee approval
  const pendingApproval = todaysVisits.filter((v) => v.status === 'pending-approval')

  function applySearch(list: Visit[]) {
    if (!checkInSearch.trim()) return list
    const q = checkInSearch.toLowerCase()
    return list.filter((v) => {
      const visitor = visitorMap[v.visitorId]
      return (
        (visitor?.name?.toLowerCase() ?? '').includes(q) ||
        (visitor?.company?.toLowerCase() ?? '').includes(q)
      )
    })
  }

  const filteredConfirmed = applySearch(confirmedReady)
  const filteredScheduled = applySearch(scheduledUpcoming)
  const filteredPending = applySearch(pendingApproval)

  const showConfirmed = statusFilter === 'all' || statusFilter === 'confirmed'
  const showScheduled = statusFilter === 'scheduled'
  const showPending = statusFilter === 'all' || statusFilter === 'pending'

  // ── On Premises (right column) ───────────────────────────────
  const onPremises = todaysVisits.filter((v) => v.status === 'checked-in')

  const unreadCount = getUnreadCount(notifications, currentRole)

  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const firstName = currentEmployee?.name.split(' ')[0] ?? 'there'

  return (
    <div className="flex flex-col h-full bg-zinc-100">
      <PageHeader
        title="Front-Desk Dashboard"
        actions={
          <>
            <NavLink
              to="/notifications"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <i className="ri-notification-3-line text-xl text-zinc-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red-500 px-1 text-[9px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <Button size="md" variant="secondary" onClick={() => navigate('/front-desk/check-out')} className="ml-1">
              Check-out
            </Button>
            <Button size="md" icon="ri-user-add-line" onClick={() => navigate('/front-desk/walk-in')} className="ml-1">
              Walk-in
            </Button>
          </>
        }
      />

      {/* ── Scrollable content ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-10 space-y-5">

          {/* Welcome */}
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Welcome {firstName}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Here's a live overview of today's visitor activity at your location.
            </p>
          </div>

          {/* ── KPI row ─────────────────────────────────────────── */}
          <div className="rounded-xl bg-white border border-zinc-200 grid grid-cols-3 divide-x divide-zinc-200">
            <KpiCardV2
              label="Total Visitors"
              info="All visits scheduled today"
              value={todaysVisits.length}
              icon="ri-group-line"
            />
            <KpiCardV2
              label="Expected"
              info="Confirmed, awaiting arrival"
              value={kpiExpected.length}
              icon="ri-calendar-check-line"
            />
            <KpiCardV2
              label="On Premises"
              info="Currently inside the facility"
              value={kpiOnPremises.length}
              icon="ri-building-2-line"
            />
          </div>

          {/* ── 60 / 40 layout ──────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-5 items-start">

            {/* ── Check-in (left, 60%) ────────────────────────── */}
            <div className="col-span-3 space-y-3">
              {/* Section heading */}
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest shrink-0">
                  Check-in
                </p>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              {/* Search + filter row */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Search visitors…"
                    onChange={(val) => setCheckInSearch(val)}
                    inputClassName="bg-white border border-zinc-200"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-[7px] text-xs text-zinc-600 outline-none focus:ring-2 focus:ring-brand/20 transition-shadow"
                >
                  {(Object.keys(FILTER_LABELS) as StatusFilter[]).map((f) => (
                    <option key={f} value={f}>{FILTER_LABELS[f]}</option>
                  ))}
                </select>
              </div>

              {/* Confirmed visits */}
              {showConfirmed && (
                <div className="space-y-2">
                  {filteredConfirmed.length === 0 ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-zinc-200 text-zinc-300">
                      <i className="ri-inbox-2-line text-base shrink-0" />
                      <p className="text-xs">No confirmed visits</p>
                    </div>
                  ) : (
                    filteredConfirmed.map((visit) => {
                      const visitor = visitorMap[visit.visitorId]
                      return (
                        <VisitCard
                          key={visit.id}
                          visit={visit}
                          visitorName={visitor?.name ?? 'Unknown Visitor'}
                          visitorPhone={visitor?.mobile}
                          visitorAvatar={visitor?.avatar}
                          role="front-desk"
                        />
                      )
                    })
                  )}
                </div>
              )}

              {/* Scheduled (future) visits */}
              {showScheduled && (
                <div className="space-y-2">
                  {filteredScheduled.length === 0 ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-zinc-200 text-zinc-300">
                      <i className="ri-inbox-2-line text-base shrink-0" />
                      <p className="text-xs">No upcoming scheduled visits</p>
                    </div>
                  ) : (
                    filteredScheduled.map((visit) => {
                      const visitor = visitorMap[visit.visitorId]
                      return (
                        <VisitCard
                          key={visit.id}
                          visit={visit}
                          visitorName={visitor?.name ?? 'Unknown Visitor'}
                          visitorPhone={visitor?.mobile}
                          visitorAvatar={visitor?.avatar}
                          role="front-desk"
                        />
                      )
                    })
                  )}
                </div>
              )}

              {/* ── Pending Approval ──────────────────────────── */}
              {showPending && (pendingApproval.length > 0 || statusFilter === 'pending') && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] text-zinc-400 uppercase tracking-wider shrink-0">
                      Pending Approval
                    </p>
                    <div className="flex-1 h-px bg-zinc-200" />
                    {filteredPending.length > 0 && (
                      <span className="text-[11px] text-zinc-400 shrink-0">
                        {filteredPending.length}
                      </span>
                    )}
                  </div>
                  {filteredPending.length === 0 ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-zinc-200 text-zinc-300">
                      <i className="ri-inbox-2-line text-base shrink-0" />
                      <p className="text-xs">No pending visits</p>
                    </div>
                  ) : (
                    filteredPending.map((visit) => {
                      const visitor = visitorMap[visit.visitorId]
                      return (
                        <VisitCard
                          key={visit.id}
                          visit={visit}
                          visitorName={visitor?.name ?? 'Unknown Visitor'}
                          visitorPhone={visitor?.mobile}
                          visitorAvatar={visitor?.avatar}
                          role="front-desk"
                        />
                      )
                    })
                  )}
                </div>
              )}

            </div>

            {/* ── On Premises (right, 40%) ─────────────────────── */}
            <div className="col-span-2 sticky top-4 space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest shrink-0">
                  On Premises
                </p>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
                {onPremises.length === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-4 text-zinc-300">
                    <i className="ri-inbox-2-line text-base shrink-0" />
                    <p className="text-xs">No visitors on premises</p>
                  </div>
                ) : (
                  onPremises.map((visit, idx) => {
                    const visitor = visitorMap[visit.visitorId]
                    const name = visitor?.name ?? 'Unknown Visitor'
                    const initials = name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0].toUpperCase())
                      .join('')
                    const host = employees.find((e) => e.id === visit.hostEmployeeId)
                    const expectedOutTime =
                      visit.checkInTime && visit.duration
                        ? new Date(new Date(visit.checkInTime).getTime() + visit.duration * 60 * 1000)
                        : null
                    const outTimeDisplay = expectedOutTime
                      ? expectedOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'
                    const checkInDisplay = visit.checkInTime
                      ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'
                    const isOverdue = expectedOutTime ? now > expectedOutTime : false
                    const isExpanded = expandedVisitId === visit.id
                    return (
                      <div key={visit.id}>
                        {idx > 0 && <div className="h-px bg-zinc-100 mx-4" />}
                        {/* ── Summary row ── */}
                        <button
                          onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                        >
                          {visitor?.avatar ? (
                            <img
                              src={visitor.avatar}
                              alt={name}
                              className={`shrink-0 h-8 w-8 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${isOverdue ? 'ring-2 ring-red-300' : ''}`}
                            />
                          ) : (
                            <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold leading-none select-none shadow-[0_2px_8px_rgba(0,0,0,0.10)] ${isOverdue ? 'bg-red-50 text-red-500' : 'bg-brand-red-50 text-brand-red-500'}`}>
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-zinc-900 truncate">{name}</p>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {visitor?.company && <span>{visitor.company}</span>}
                              {visitor?.company && outTimeDisplay !== '—' && <span className="mx-1">·</span>}
                              {outTimeDisplay !== '—' && (
                                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                  {outTimeDisplay}
                                  {isOverdue && <span className="ml-1 text-[9px] font-semibold uppercase tracking-wide">overdue</span>}
                                </span>
                              )}
                            </p>
                          </div>
                          <i className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`} />
                        </button>

                        {/* ── Smooth expand/collapse ── */}
                        <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden min-h-0">
                            <div className="px-4 pb-4 pt-1 space-y-3">
                              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                                <div>
                                  <p className="text-[10px] text-zinc-400 leading-none">Check-in</p>
                                  <p className="text-xs font-medium text-zinc-700 mt-1">{checkInDisplay}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-400 leading-none">Meeting</p>
                                  <p className="text-xs font-medium text-zinc-700 mt-1 truncate">{host?.name ?? '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-zinc-400 leading-none">Pass type</p>
                                  <p className="text-xs font-medium text-zinc-700 mt-1">{getVisitTypeLabel(visit.visitType)}</p>
                                </div>
                              </div>
                              {isOverdue ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    icon="ri-logout-box-line"
                                    fullWidth
                                    onClick={() => checkOut(visit.id)}
                                  >
                                    Check out
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    icon="ri-notification-3-line"
                                    fullWidth
                                    onClick={() => {}}
                                  >
                                    Notify
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon="ri-logout-box-line"
                                  fullWidth
                                  onClick={() => checkOut(visit.id)}
                                >
                                  Check out
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}
