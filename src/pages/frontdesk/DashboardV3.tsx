import { useState, useEffect } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
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

type ActiveFilter = 'all' | 'ready' | 'pending'

// ── Main dashboard (V3) — Find Visits always in results state ────
export default function FrontDeskDashboardV3() {
  const visits = useVisitStore((s) => s.visits)
  const checkOut = useVisitStore((s) => s.checkOut)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()
  const location = useLocation()

  const incomingVisitId = (location.state as { newVisitId?: string } | null)?.newVisitId ?? null

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(incomingVisitId ? 'pending' : 'ready')
  const [highlightedVisitId, setHighlightedVisitId] = useState<string | null>(incomingVisitId)

  // Clear the history state after consuming it so back-navigation and
  // subsequent dashboard visits don't re-trigger the pending tab.
  useEffect(() => {
    if (incomingVisitId) {
      navigate('/front-desk/dashboard', { replace: true, state: {} })
    }
  }, [])
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [showAllOnPremises, setShowAllOnPremises] = useState(false)

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

  // ── KPI counts ──────────────────────────────────────────────
  // confirmed + scheduled merged — used for both KPI "Expected" card and the Confirmed filter
  const kpiExpected = todaysVisits.filter(
    (v) => v.status === 'confirmed' || v.status === 'scheduled',
  )
  const kpiOnPremises = todaysVisits.filter((v) => v.status === 'checked-in')
  const pendingApproval = todaysVisits.filter((v) => v.status === 'pending-approval')

  // ── Mock KPI supplementary data (prototype — static, time-independent) ──
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
    if (activeFilter === 'all') return todaysVisits
    if (activeFilter === 'ready') return kpiExpected
    if (activeFilter === 'pending') return pendingApproval
    return []
  }

  const resultList = getResultList()

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Front-Desk Dashboard"
        titleNode={
          <div className="w-72 flex items-center gap-2 bg-surface border border-border rounded-lg px-4 h-9 focus-within:ring-2 focus-within:ring-brand-light focus-within:border-brand-light transition-shadow">
            <i className="ri-search-line text-text-tertiary shrink-0 text-base" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

          {searchInput.trim() ? (
            /* ── Search results ──────────────────────────────── */
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary flex-1">Search results</p>
                <span className="text-[11px] font-semibold text-text-tertiary bg-surface-secondary rounded-full px-2 py-0.5">
                  {resultList.length}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {resultList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-text-tertiary">
                    <i className="ri-search-2-line text-2xl" />
                    <p className="text-xs">No visits match your search</p>
                  </div>
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
              {/* ── KPI row ─────────────────────────────────────────── */}
              <div className="grid grid-cols-4 gap-2">
                <KpiCardV2
                  label="Total Visitors"
                  info="Visitors checked-in"
                  value={todaysVisits.length}
                  icon="ri-group-fill"
                  color="blue"
                  trend={MOCK_TREND_TOTAL}
                  onClick={() => handleFilterChange('all')}
                />
                <KpiCardV2
                  label="Expected"
                  info="Awaiting arrival"
                  value={kpiExpected.length}
                  icon="ri-calendar-check-fill"
                  color="purple"
                  trend={MOCK_TREND_EXPECTED}
                  onClick={() => handleFilterChange('ready')}
                />
                <KpiCardV2
                  label="On Premises"
                  info="Inside the facility"
                  value={kpiOnPremises.length}
                  icon="ri-building-2-fill"
                  color="green"
                  alertCount={overdueCount}
                  alertLabel="overdue"
                  alertColor="red"
                  onClick={() => navigate('/front-desk/check-out')}
                />
                <KpiCardV2
                  label="Pending"
                  info="Awaiting approval"
                  value={pendingApproval.length}
                  icon="ri-time-fill"
                  color="yellow"
                  alertCount={delayedCount}
                  alertLabel="need follow-up"
                  alertColor="orange"
                  onClick={() => handleFilterChange('pending')}
                />
              </div>

              {/* ── 60 / 40 layout ──────────────────────────────────── */}
              <div className="grid grid-cols-5 gap-5">

                {/* ── Find Visits (left, 60%) ──────────────────────── */}
                <div className="col-span-3">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
                      <p className="text-sm font-semibold text-text-primary">Today's Visits</p>
                      <span className="text-[11px] font-semibold text-text-tertiary bg-surface-secondary rounded-full px-2 py-0.5">
                        {resultList.length}
                      </span>
                    </div>

                    {/* Filter pills */}
                    <div className={`flex items-center gap-2 px-4 py-2.5 transition-opacity ${searchInput ? 'opacity-40 pointer-events-none' : ''}`}>
                      <button
                        onClick={() => handleFilterChange('all')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'all'
                          ? 'bg-surface-tertiary text-text-primary'
                          : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                          }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleFilterChange('ready')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'ready'
                          ? 'bg-badge-blue-light text-badge-blue-dark'
                          : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                          }`}
                      >
                        Confirmed
                      </button>
                      <button
                        onClick={() => handleFilterChange('pending')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'pending'
                          ? 'bg-badge-yellow-light text-badge-yellow-dark'
                          : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                          }`}
                      >
                        Pending
                      </button>
                    </div>

                    {/* Results list */}
                    <div className="p-3 space-y-2">
                      {resultList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-text-tertiary">
                          <i className="ri-inbox-2-line text-2xl" />
                          <p className="text-xs">No visits found</p>
                        </div>
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

                {/* ── On Premises (right, 40%) ─────────────────────── */}
                <div className="col-span-2 sticky top-4 self-start">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                      <p className="text-sm font-semibold text-text-primary">On Premises</p>
                      <span className="text-[11px] font-semibold text-text-tertiary bg-surface-secondary rounded-full px-2 py-0.5">
                        {kpiOnPremises.length}
                      </span>
                    </div>

                    {/* List — capped at 5, expandable rows */}
                    <div>
                      {kpiOnPremises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-text-tertiary">
                          <i className="ri-building-2-line text-2xl" />
                          <p className="text-xs">No visitors on premises</p>
                        </div>
                      ) : (
                        [...kpiOnPremises]
                          .sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
                          .slice(0, showAllOnPremises ? undefined : 5)
                          .map((visit, idx) => {
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
                              const totalMin = Math.floor(diffMs / 60000)
                              const h = Math.floor(totalMin / 60)
                              const m = totalMin % 60
                              return `+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                            })()
                            const isRowExpanded = expandedVisitId === visit.id
                            return (
                              <div key={visit.id}>
                                {idx > 0 && <div className="h-px bg-surface-secondary mx-4" />}
                                <button
                                  onClick={() => setExpandedVisitId(isRowExpanded ? null : visit.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                                >
                                  {visitor?.avatar ? (
                                    <img
                                      src={visitor.avatar}
                                      alt={name}
                                      className="shrink-0 h-8 w-8 rounded-full object-cover border border-border"
                                    />
                                  ) : (
                                    <div className="shrink-0 h-8 w-8 rounded-full bg-brand-red-50 text-brand-red-500 flex items-center justify-center text-[11px] font-semibold leading-none select-none border border-brand-red-100">
                                      {initials}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                                      {isOverdue && (
                                        <span className="shrink-0 relative flex h-1.5 w-1.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-text-tertiary">
                                      {visit.badgeNumber && (
                                        <span className="shrink-0">{visit.badgeNumber}</span>
                                      )}
                                      {visit.badgeNumber && visitor?.mobile && (
                                        <span className="shrink-0">·</span>
                                      )}
                                      {visitor?.mobile && (
                                        <span className="truncate">{visitor.mobile}</span>
                                      )}
                                      {(overdueDisplay || outTimeDisplay) && (visitor?.mobile || visit.badgeNumber) && (
                                        <span className="shrink-0 mx-0.5">·</span>
                                      )}
                                      {overdueDisplay ? (
                                        <span className="shrink-0 font-semibold text-red-500">{overdueDisplay}</span>
                                      ) : outTimeDisplay ? (
                                        <span className="shrink-0">Out {outTimeDisplay}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                  <i className={`shrink-0 text-text-tertiary transition-transform duration-200 ${isRowExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`} />
                                </button>

                                <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isRowExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                  <div className="overflow-hidden min-h-0">
                                    <div className="px-4 pb-4 pt-1 space-y-3">
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
                                      {isOverdue ? (
                                        <div className="flex gap-2">
                                          <Button size="sm" variant="primary" icon="ri-logout-box-line" fullWidth onClick={() => checkOut(visit.id)}>
                                            Check out
                                          </Button>
                                          <Button size="sm" variant="secondary" icon="ri-notification-3-line" fullWidth onClick={() => { }}>
                                            Notify
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button size="sm" variant="primary" icon="ri-logout-box-line" fullWidth onClick={() => checkOut(visit.id)}>
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

                    {/* Footer — only shown when there are more than 5 visitors */}
                    {kpiOnPremises.length >= 6 && (
                      <div className="shrink-0 border-t border-border-light px-4 py-2.5">
                        <button
                          onClick={() => setShowAllOnPremises((v) => !v)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors py-1"
                        >
                          {showAllOnPremises ? (
                            <>Show less <i className="ri-arrow-up-s-line text-sm" /></>
                          ) : (
                            <>View all <i className="ri-arrow-down-s-line text-sm" /></>
                          )}
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

      {/* ── Mobile FAB ────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/front-desk/walk-in')}
        className="md:hidden fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg active:scale-[0.97] transition-transform duration-150"
      >
        <i className="ri-user-add-line text-2xl" />
      </button>
    </div>
  )
}
