import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
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

type ActiveFilter = null | 'ready' | 'pending' | 'scheduled'

// ── Main dashboard (V2) ─────────────────────────────────────────
export default function FrontDeskDashboardV2() {
  const visits = useVisitStore((s) => s.visits)
  const checkOut = useVisitStore((s) => s.checkOut)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId, currentEmployeeId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null)
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null)

  const now = new Date()
  const today = getLocalDateString(now)
  const currentTime = now.toTimeString().slice(0, 5)

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
  const pendingApproval = todaysVisits.filter((v) => v.status === 'pending-approval')
  const confirmedReady = todaysVisits.filter(
    (v) =>
      v.status === 'confirmed' ||
      (v.status === 'scheduled' && v.scheduledTime <= currentTime),
  )

  // ── Mock KPI supplementary data (prototype — static, time-independent) ──
  const overdueCount = kpiOnPremises.filter((v) => OVERDUE_VISIT_IDS.has(v.id)).length
  const delayedCount = pendingApproval.filter((v) => DELAYED_VISIT_IDS.has(v.id)).length
  // Mock trends: hardcoded deltas vs yesterday for the prototype
  const MOCK_TREND_TOTAL = 3
  const MOCK_TREND_EXPECTED = -1

  const unreadCount = getUnreadCount(notifications, currentRole)
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const firstName = currentEmployee?.name.split(' ')[0] ?? 'there'

  const isExpanded = activeFilter !== null || committedSearch !== ''

  // ── Find Visits logic ────────────────────────────────────────
  function handleSearch() {
    const q = searchInput.trim()
    if (!q) return
    setCommittedSearch(q)
    setActiveFilter(null)
  }

  function handleFilterCard(filter: ActiveFilter) {
    setActiveFilter((prev) => (prev === filter ? null : filter))
    setCommittedSearch('')
    setSearchInput('')
  }

  function handleClearAll() {
    setActiveFilter(null)
    setCommittedSearch('')
    setSearchInput('')
  }

  function getResultList(): Visit[] {
    if (activeFilter === 'ready') return confirmedReady
    if (activeFilter === 'pending') return pendingApproval
    if (activeFilter === 'scheduled') return kpiExpected
    if (committedSearch) {
      const q = committedSearch.toLowerCase()
      return todaysVisits.filter((v) => {
        const visitor = visitorMap[v.visitorId]
        return (
          (visitor?.name?.toLowerCase() ?? '').includes(q) ||
          (visitor?.company?.toLowerCase() ?? '').includes(q)
        )
      })
    }
    return []
  }

  const resultList = getResultList()

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
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

          {/* Welcome */}
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Welcome {firstName}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Here's a live overview of today's visitor activity at your location.
            </p>
          </div>

          {/* ── KPI row — 4 individual cards with gap ────────── */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
              <KpiCardV2
                label="Total Visitors"
                info="Visitors checked-in"
                value={todaysVisits.length}
                icon="ri-group-fill"
                color="blue"
                trend={MOCK_TREND_TOTAL}
              />
            </div>
            <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
              <KpiCardV2
                label="Expected"
                info="Confirmed, awaiting arrival"
                value={kpiExpected.length}
                icon="ri-calendar-check-fill"
                color="purple"
                trend={MOCK_TREND_EXPECTED}
              />
            </div>
            <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
              <KpiCardV2
                label="On Premises"
                info="Currently inside the facility"
                value={kpiOnPremises.length}
                icon="ri-building-2-fill"
                color="green"
                alertCount={overdueCount}
                alertLabel="overdue"
                alertColor="red"
              />
            </div>
            <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
              <KpiCardV2
                label="Pending"
                info="Awaiting employee approval"
                value={pendingApproval.length}
                icon="ri-time-fill"
                color="yellow"
                alertCount={delayedCount}
                alertLabel="need follow-up"
                alertColor="orange"
              />
            </div>
          </div>

          {/* ── 60 / 40 layout ──────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-5">

            {/* ── Find Visits (left, 60%) ──────────────────────── */}
            <div className="col-span-3">

              {/* Panel — idle layer is absolute (overlay); expanded layer is in normal flow (drives height) */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden relative min-h-[540px]">

                {/* ── IDLE LAYER — absolutely overlays expanded content ── */}
                <div
                  className="absolute inset-0 flex flex-col"
                  style={{
                    transition: 'opacity 200ms, transform 200ms',
                    transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                    opacity: isExpanded ? 0 : 1,
                    transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
                    pointerEvents: isExpanded ? 'none' : 'auto',
                  }}
                >
                  <div className="m-auto w-full max-w-md px-6 py-10 flex flex-col items-center">

                    <h2 className="text-xl font-bold text-zinc-900">Find Visits</h2>
                    <p className="text-sm text-zinc-400 mt-2 text-center max-w-[260px] leading-snug">
                      Enter a detail to find the visit and check-in or check-out a visitor.
                    </p>

                    {/* Search row */}
                    <div className="flex items-center gap-2 w-full mt-6">
                      <div className="flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-4 h-10 focus-within:ring-2 focus-within:ring-brand-red-100 transition-shadow">
                        <i className="ri-search-line text-zinc-400 shrink-0 text-base" />
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="badge ID, name or phone"
                          className="flex-1 bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 outline-none min-w-0"
                        />
                        {searchInput && (
                          <button
                            onClick={() => { setSearchInput(''); setCommittedSearch('') }}
                            className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            <i className="ri-close-line text-base" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleSearch}
                        className="shrink-0 bg-brand-red-50 hover:bg-brand-red-100 text-brand-red-500 font-semibold text-sm px-5 h-10 rounded-lg transition-colors whitespace-nowrap border border-transparent"
                      >
                        Search
                      </button>
                    </div>

                    {/* Filter shortcut cards */}
                    <div className="w-full mt-10">
                      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-lg">
                        <button
                          onClick={() => handleFilterCard('ready')}
                          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-badge-blue-light)] flex items-center justify-center">
                            <i className="ri-user-follow-line text-[var(--color-badge-blue-dark)] text-lg" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-zinc-800">Ready to Check-In</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {confirmedReady.length} visitor{confirmedReady.length !== 1 ? 's' : ''} ready
                            </p>
                          </div>
                          <i className="ri-arrow-right-s-line text-zinc-400 text-lg shrink-0" />
                        </button>

                        <div className="h-px bg-zinc-100 mx-4" />

                        <button
                          onClick={() => handleFilterCard('pending')}
                          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-badge-yellow-light)] flex items-center justify-center">
                            <i className="ri-time-line text-[var(--color-badge-yellow-dark)] text-lg" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-zinc-800">Awaiting Approval</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {pendingApproval.length} pending
                            </p>
                          </div>
                          <i className="ri-arrow-right-s-line text-zinc-400 text-lg shrink-0" />
                        </button>

                        <div className="h-px bg-zinc-100 mx-4" />

                        <button
                          onClick={() => handleFilterCard('scheduled')}
                          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-badge-green-light)] flex items-center justify-center">
                            <i className="ri-calendar-check-line text-[var(--color-badge-green-dark)] text-lg" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-zinc-800">Scheduled Visits</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {kpiExpected.length} expected
                            </p>
                          </div>
                          <i className="ri-arrow-right-s-line text-zinc-400 text-lg shrink-0" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── EXPANDED LAYER — in normal flow, drives panel height ── */}
                <div
                  className="flex flex-col"
                  style={{
                    transition: 'opacity 200ms, transform 200ms',
                    transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? 'translateY(0)' : 'translateY(4px)',
                    pointerEvents: isExpanded ? 'auto' : 'none',
                  }}
                >
                  {/* Header */}
                  <div className="shrink-0 flex items-center gap-2 px-4 pt-3.5 pb-1">
                    <p className="text-sm font-semibold text-zinc-900 flex-1">Find Visits</p>
                    <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
                      {resultList.length}
                    </span>
                    <button
                      onClick={handleClearAll}
                      className="ml-1 flex items-center justify-center w-6 h-6 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                    >
                      <i className="ri-close-line text-base" />
                    </button>
                  </div>

                  {/* Filter pills */}
                  <div className="shrink-0 flex items-center gap-2 px-4 py-2.5">
                    <button
                      onClick={() => handleFilterCard('ready')}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'ready'
                          ? 'bg-[var(--color-badge-blue-light)] text-[var(--color-badge-blue-dark)]'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                    >
                      Confirmed
                      {activeFilter === 'ready' && (
                        <i className="ri-close-line text-[11px]" />
                      )}
                    </button>
                    <button
                      onClick={() => handleFilterCard('pending')}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'pending'
                          ? 'bg-[var(--color-badge-yellow-light)] text-[var(--color-badge-yellow-dark)]'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                    >
                      Pending
                      {activeFilter === 'pending' && (
                        <i className="ri-close-line text-[11px]" />
                      )}
                    </button>
                    <button
                      onClick={() => handleFilterCard('scheduled')}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${activeFilter === 'scheduled'
                          ? 'bg-[var(--color-badge-green-light)] text-[var(--color-badge-green-dark)]'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                    >
                      Scheduled
                      {activeFilter === 'scheduled' && (
                        <i className="ri-close-line text-[11px]" />
                      )}
                    </button>
                  </div>

                  {/* Results list */}
                  <div className="p-3 space-y-2">
                    {isExpanded && (
                      resultList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-zinc-300">
                          <i className="ri-inbox-2-line text-2xl" />
                          <p className="text-xs">No visits found</p>
                        </div>
                      ) : (
                        resultList.map((visit, idx) => {
                          const visitor = visitorMap[visit.visitorId]
                          return (
                            <div
                              key={visit.id}
                              className="vms-stagger-item"
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
                      )
                    )}
                  </div>

                </div>

              </div>
            </div>

            {/* ── On Premises (right, 40%) ─────────────────────── */}
            <div className="col-span-2 sticky top-4 self-start">
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-zinc-100 shrink-0">
                  <p className="text-sm font-semibold text-zinc-900 flex-1">On Premises</p>
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
                    {kpiOnPremises.length}
                  </span>
                </div>

                {/* Expandable list — capped at 5, use View all for the rest */}
                <div>
                  {kpiOnPremises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-zinc-300">
                      <i className="ri-building-2-line text-2xl" />
                      <p className="text-xs">No visitors on premises</p>
                    </div>
                  ) : (
                    [...kpiOnPremises]
                      .sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
                      .slice(0, 5)
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
                        const outTimeDisplay = expectedOutTime
                          ? expectedOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'
                        const checkInDisplay = visit.checkInTime
                          ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'
                        const isOverdue = OVERDUE_VISIT_IDS.has(visit.id)
                        const isRowExpanded = expandedVisitId === visit.id
                        return (
                          <div key={visit.id}>
                            {idx > 0 && <div className="h-px bg-zinc-100 mx-4" />}
                            {/* ── Summary row ── */}
                            <button
                              onClick={() => setExpandedVisitId(isRowExpanded ? null : visit.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                            >
                              {visitor?.avatar ? (
                                <img
                                  src={visitor.avatar}
                                  alt={name}
                                  className="shrink-0 h-8 w-8 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                                />
                              ) : (
                                <div className="shrink-0 h-8 w-8 rounded-full bg-brand-red-50 text-brand-red-500 flex items-center justify-center text-[11px] font-semibold leading-none select-none shadow-[0_2px_8px_rgba(0,0,0,0.10)]">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-medium text-zinc-900 truncate">{name}</p>
                                  {isOverdue && (
                                    <span className="shrink-0 relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                  {visitor?.company && <span>{visitor.company}</span>}
                                  {visitor?.company && outTimeDisplay !== '—' && <span className="mx-1">·</span>}
                                  {outTimeDisplay !== '—' && (
                                    <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                      {outTimeDisplay}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <i className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isRowExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`} />
                            </button>

                            {/* ── Smooth expand/collapse ── */}
                            <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isRowExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
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

                {/* Footer */}
                <div className="shrink-0 border-t border-zinc-100 px-4 py-2.5">
                  <button
                    onClick={() => navigate('/front-desk/visits')}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-red-500 hover:text-brand-red-600 transition-colors py-1"
                  >
                    View all
                    <i className="ri-arrow-right-s-line text-sm" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}
