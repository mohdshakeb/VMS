// ─────────────────────────────────────────────────────────────────────────────
// Front-Desk Dashboard — Desktop (web dashboard)
// lg: classes handle the 2-column layout at 1024px+.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import Button from '@/components/Button'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import PageHeader from '@/components/PageHeader'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS, DELAYED_VISIT_IDS } from '@/data/visits'
import { employees } from '@/data/employees'
import type { Visit } from '@/types/visit'
import { getVisitTypeLabel, getLocalDateString } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import AvatarBadge from '@/components/common/AvatarBadge'
import Collapsible from '@/components/common/Collapsible'

type ActiveFilter = 'all' | 'ready' | 'pending'
type KpiFilter = 'all' | 'ready' | 'pending' | 'on-premises'

const KPI_LABELS: Record<KpiFilter, string> = {
  all: 'Total Visitors',
  ready: 'Expected Today',
  pending: 'Pending Approval',
  'on-premises': 'On Premises',
}

export default function DashboardV3Desktop() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const openCheckOut = useUIStore((s) => s.openCheckOut)
  const { currentLocationId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()
  const location = useLocation()

  const incomingVisitId = (location.state as { newVisitId?: string } | null)?.newVisitId ?? null

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(incomingVisitId ? 'pending' : 'ready')
  const [highlightedVisitId, setHighlightedVisitId] = useState<string | null>(incomingVisitId)
  const [expandedEntryKey, setExpandedEntryKey] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [showAllOnPremises, setShowAllOnPremises] = useState(false)
  const [kpiFilter, setKpiFilter] = useState<KpiFilter | null>(null)

  function handleKpiClick(filter: KpiFilter) {
    setKpiFilter((prev) => (prev === filter ? null : filter))
    setSearchInput('')
  }

  useEffect(() => {
    if (incomingVisitId) {
      navigate('/front-desk/dashboard', { replace: true, state: {} })
    }
  }, [])

  function handleFilterChange(filter: ActiveFilter) {
    setActiveFilter(filter)
    if (filter !== 'pending') setHighlightedVisitId(null)
  }

  const now = new Date()
  const today = getLocalDateString(now)

  const todaysVisits = visits.filter(
    (v) => v.scheduledDate === today && v.locationId === currentLocationId,
  )
  const visitorMap = Object.fromEntries(
    [...seedVisitors, ...storeVisitors].map((v) => [v.id, v]),
  )

  const kpiExpected = todaysVisits.filter((v) => v.status === 'confirmed' || v.status === 'scheduled')
  const kpiExpectedByEmployee = kpiExpected.filter(
    (v) => v.entryPath === 'employee-request' || v.entryPath === 'pre-scheduled',
  )
  const kpiOnPremises = todaysVisits.filter((v) => v.status === 'checked-in')
  const kpiTotalVisited = todaysVisits.filter((v) => v.status === 'checked-in' || v.status === 'checked-out')
  const pendingApproval = todaysVisits.filter((v) => v.status === 'pending-approval')

  const overdueCount = kpiOnPremises.filter((v) => OVERDUE_VISIT_IDS.has(v.id)).length
  const delayedCount = pendingApproval.filter((v) => DELAYED_VISIT_IDS.has(v.id)).length
  const MOCK_TREND_TOTAL = 3
  const MOCK_TREND_EXPECTED = -1

  const unreadCount = getUnreadCount(notifications, currentRole)

  function getResultList(): Visit[] {
    const q = searchInput.trim().toLowerCase()
    if (q) {
      return todaysVisits.filter((v) => {
        const visitor = visitorMap[v.visitorId]
        return (
          (visitor?.name?.toLowerCase() ?? '').includes(q) ||
          (visitor?.company?.toLowerCase() ?? '').includes(q)
        )
      })
    }
    const sortReady = (arr: Visit[]) =>
      [...arr].sort((a, b) => {
        const aWalkIn = a.entryPath === 'walk-in'
        const bWalkIn = b.entryPath === 'walk-in'
        if (aWalkIn !== bWalkIn) return aWalkIn ? -1 : 1
        if (aWalkIn && bWalkIn) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        return a.scheduledTime.localeCompare(b.scheduledTime)
      })
    const sortPending = (arr: Visit[]) =>
      [...arr].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (kpiFilter === 'all') return [...kpiTotalVisited].sort((a, b) => (b.checkInTime ?? '').localeCompare(a.checkInTime ?? ''))
    if (kpiFilter === 'ready') return sortReady(kpiExpectedByEmployee)
    if (kpiFilter === 'pending') return sortPending(pendingApproval)
    if (kpiFilter === 'on-premises') return [...kpiOnPremises].sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
    if (activeFilter === 'all') return todaysVisits
    if (activeFilter === 'ready') return sortReady(kpiExpected)
    if (activeFilter === 'pending') return sortPending(pendingApproval)
    return []
  }

  const resultList = getResultList()

  return (
    <div className="hidden md:flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Front-Desk Dashboard"
        titleNode={
          <div className="w-72 flex items-center gap-2 bg-surface border border-border rounded-lg px-4 h-9 focus-within:ring-2 focus-within:ring-brand-light focus-within:border-brand-light transition-shadow">
            <i className="ri-search-line text-text-tertiary shrink-0 text-base" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setKpiFilter(null) }}
              placeholder="Try Name, Mobile or Badge No"
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors">
                <i className="ri-close-line text-base" />
              </button>
            )}
          </div>
        }
        actions={
          <>
            <NavLink
              to="/front-desk/qr-code"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-secondary transition-colors"
              title="Visitor QR Code"
            >
              <i className="ri-qr-code-line text-xl text-text-secondary" />
            </NavLink>
            <NavLink
              to="/notifications"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              <i className="ri-notification-3-line text-xl text-text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <Button size="md" icon="ri-user-add-line" onClick={() => navigate('/front-desk/walk-in')} className="ml-1">
              Walk-in
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

          {(searchInput.trim() || kpiFilter !== null) ? (
            /* ── Search / KPI results ── */
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary flex-1">
                  {kpiFilter && !searchInput.trim() ? KPI_LABELS[kpiFilter] : 'Search results'}
                </p>
                <CountBadge count={resultList.length} />
                {kpiFilter && !searchInput.trim() && (
                  <button
                    onClick={() => setKpiFilter(null)}
                    className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors ml-1"
                  >
                    <i className="ri-close-line text-base" />
                  </button>
                )}
              </div>
              <div className="p-3 space-y-2">
                {resultList.length === 0 ? (
                  <EmptyState icon="ri-search-2-line" title="No visits match your search" className="py-16" />
                ) : (
                  resultList.map((visit, idx) => {
                    const visitor = visitorMap[visit.visitorId]
                    return (
                      <div key={visit.id} className="vms-stagger-item" style={{ animationDelay: `${Math.min(idx * 35, 210)}ms` }}>
                        <VisitCard
                          visit={visit}
                          visitorName={visitor?.name ?? 'Unknown Visitor'}
                          visitorPhone={visitor?.mobile}
                          visitorAvatar={visitor?.avatar}
                          role="front-desk"
                        />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ── KPI row — 2 cols on md, 4 cols on lg ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <KpiCardV2
                  label="Total Visitors"
                  info="Checked-in and checked-out"
                  value={kpiTotalVisited.length}
                  icon="ri-group-fill"
                  color="blue"
                  trend={MOCK_TREND_TOTAL}
                  active={kpiFilter === 'all'}
                  onClick={() => handleKpiClick('all')}
                />
                <KpiCardV2
                  label="Pending Approval"
                  info="Awaiting employee response"
                  value={pendingApproval.length}
                  icon="ri-time-fill"
                  color="yellow"
                  alertCount={delayedCount}
                  alertLabel="need follow-up"
                  alertColor="orange"
                  active={kpiFilter === 'pending'}
                  onClick={() => handleKpiClick('pending')}
                />
                <KpiCardV2
                  label="On Premises"
                  info="Currently inside the facility"
                  value={kpiOnPremises.length}
                  icon="ri-building-2-fill"
                  color="green"
                  alertCount={overdueCount}
                  alertLabel="overdue"
                  alertColor="red"
                  active={kpiFilter === 'on-premises'}
                  onClick={() => handleKpiClick('on-premises')}
                />
                <KpiCardV2
                  label="Expected Today"
                  info="By employee, awaiting arrival"
                  value={kpiExpectedByEmployee.length}
                  icon="ri-calendar-check-fill"
                  color="purple"
                  trend={MOCK_TREND_EXPECTED}
                  active={kpiFilter === 'ready'}
                  onClick={() => handleKpiClick('ready')}
                />
              </div>

              {/* ── Stacked on md, 60/40 side-by-side on lg ── */}
              <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-5">

                {/* Today's Visits — left column */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
                      <p className="text-sm font-semibold text-text-primary">Today's Visits</p>
                      <p className="text-sm font-medium text-text-tertiary">Check-In</p>
                      <CountBadge count={resultList.length} />
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2.5 transition-opacity ${searchInput ? 'opacity-40 pointer-events-none' : ''}`}>
                      <button
                        onClick={() => handleFilterChange('all')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'all' ? 'bg-surface-tertiary text-text-primary' : 'bg-surface text-text-secondary hover:bg-surface-secondary'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleFilterChange('ready')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'ready' ? 'bg-badge-blue-light text-badge-blue-dark' : 'bg-surface text-text-secondary hover:bg-surface-secondary'}`}
                      >
                        Pending Check-In
                      </button>
                      <button
                        onClick={() => handleFilterChange('pending')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'pending' ? 'bg-badge-yellow-light text-badge-yellow-dark' : 'bg-surface text-text-secondary hover:bg-surface-secondary'}`}
                      >
                        Pending Approval
                      </button>
                    </div>

                    <div className="p-3 space-y-2">
                      {resultList.length === 0 ? (
                        <EmptyState icon="ri-inbox-2-line" title="No visits found" />
                      ) : (
                        resultList.map((visit, idx) => {
                          const visitor = visitorMap[visit.visitorId]
                          const isHighlighted = visit.id === highlightedVisitId
                          return (
                            <div
                              key={visit.id}
                              className={`vms-stagger-item rounded-xl transition-shadow duration-300 ${isHighlighted ? 'ring-2 ring-brand/50 ring-offset-1 shadow-sm' : ''}`}
                              style={{ animationDelay: `${Math.min(idx * 35, 210)}ms` }}
                            >
                              <VisitCard
                                visit={visit}
                                visitorName={visitor?.name ?? 'Unknown Visitor'}
                                visitorPhone={visitor?.mobile}
                                visitorAvatar={visitor?.avatar}
                                role="front-desk"
                              />
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* On Premises — right column, sticky */}
                <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                      <p className="text-sm font-semibold text-text-primary">On Premises</p>
                      <p className="text-sm font-medium text-text-tertiary">Check-Out</p>
                      <CountBadge count={kpiOnPremises.length} />
                    </div>

                    <div>
                      {kpiOnPremises.length === 0 ? (
                        <EmptyState icon="ri-building-2-line" title="No visitors on premises" />
                      ) : (
                        [...kpiOnPremises]
                          .sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
                          .slice(0, showAllOnPremises ? undefined : 5)
                          .map((visit, idx) => {
                            const visitor = visitorMap[visit.visitorId]
                            const name = visitor?.name ?? 'Unknown Visitor'
                            const host = employees.find((e) => e.id === visit.hostEmployeeId)
                            const expectedOutTime =
                              visit.checkInTime && visit.duration
                                ? new Date(new Date(visit.checkInTime).getTime() + visit.duration * 60 * 1000)
                                : null
                            const checkInDisplay = visit.checkInTime
                              ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '—'
                            const outTimeDisplay = expectedOutTime
                              ? expectedOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : null
                            const isOverdue = OVERDUE_VISIT_IDS.has(visit.id)
                            const overdueDisplay = (() => {
                              if (!isOverdue || !expectedOutTime) return null
                              const diffMs = now.getTime() - expectedOutTime.getTime()
                              if (diffMs <= 0) return null
                              const totalMin = Math.min(Math.floor(diffMs / 60000), 180)
                              const h = Math.floor(totalMin / 60)
                              const m = totalMin % 60
                              return `+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                            })()
                            const isRowExpanded = expandedEntryKey === visit.id
                            return (
                              <div key={visit.id}>
                                {idx > 0 && <div className="h-px bg-surface-secondary mx-4" />}
                                <button
                                  onClick={() => setExpandedEntryKey(isRowExpanded ? null : visit.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors ${isRowExpanded ? '' : 'hover:bg-surface'}`}
                                >
                                  <div className={`relative shrink-0 rounded-full${isOverdue ? ' ring-[3px] ring-offset-0 ring-red-400/40' : ''}`}>
                                    {isOverdue && <span className="animate-sonar absolute inset-0 rounded-full border-2 pointer-events-none" />}
                                    <AvatarBadge name={name} avatar={visitor?.avatar} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-text-tertiary">
                                      {visit.badgeNumber && <span className="shrink-0">{visit.badgeNumber}</span>}
                                      {visit.badgeNumber && visitor?.mobile && <span className="shrink-0">·</span>}
                                      {visitor?.mobile && <span className="truncate">{visitor.mobile}</span>}
                                      {(overdueDisplay || outTimeDisplay) && (visitor?.mobile || visit.badgeNumber) && <span className="shrink-0 mx-0.5">·</span>}
                                      {overdueDisplay
                                        ? <span className="shrink-0 font-semibold text-red-500">{overdueDisplay}</span>
                                        : outTimeDisplay
                                          ? <span className="shrink-0">Out {outTimeDisplay}</span>
                                          : null}
                                    </div>
                                  </div>
                                  <i className={`shrink-0 text-text-tertiary transition-transform duration-200 ${isRowExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`} />
                                </button>

                                <Collapsible open={isRowExpanded}>
                                    <div className="px-4 pb-4 space-y-3">
                                      <div className="h-px bg-border-light" />
                                      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                                        <div>
                                          <p className="text-[10px] text-text-tertiary leading-none">Check-in</p>
                                          <p className="text-xs font-medium text-text-primary mt-1">{checkInDisplay}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-text-tertiary leading-none">Meeting</p>
                                          <p className="text-xs font-medium text-text-primary mt-1 truncate">{host?.name ?? '—'}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-text-tertiary leading-none">Pass type</p>
                                          <p className="text-xs font-medium text-text-primary mt-1">{getVisitTypeLabel(visit.visitType)}</p>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" icon="ri-eye-line" fullWidth
                                          onClick={(e) => { e.stopPropagation(); navigate(`/front-desk/visit/${visit.id}`) }}>
                                          View Details
                                        </Button>
                                        <Button size="sm" variant="primary" icon="ri-logout-box-line" fullWidth
                                          onClick={(e) => { e.stopPropagation(); openCheckOut(visit.id) }}>
                                          Check out
                                        </Button>
                                      </div>
                                    </div>
                                </Collapsible>
                              </div>
                            )
                          })
                      )}
                    </div>

                    {kpiOnPremises.length >= 6 && (
                      <div className="shrink-0 border-t border-border-light px-4 py-2.5">
                        <button
                          onClick={() => setShowAllOnPremises((v) => !v)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors py-1"
                        >
                          {showAllOnPremises ? <>Show less <i className="ri-arrow-up-s-line text-sm" /></> : <>View all <i className="ri-arrow-down-s-line text-sm" /></>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
