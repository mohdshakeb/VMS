// ─────────────────────────────────────────────────────────────────────────────
// Employee Dashboard — Desktop
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useVisitStore, getPendingApprovals } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import { visitors as seedVisitors } from '@/data/visitors'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import AvatarBadge from '@/components/common/AvatarBadge'
import Collapsible from '@/components/common/Collapsible'
import { getLocalDateString, formatTime, getVisitTypeLabel } from '@/utils/helpers'

export default function EmployeeDashboardDesktop() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn } = useVisitStore()
  const { currentEmployeeId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()

  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [expandedEntryKey, setExpandedEntryKey] = useState<string | null>(null)

  const today = getLocalDateString()
  const myVisits = visits.filter((v) => v.hostEmployeeId === currentEmployeeId)
  const visitorMap = Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v]))
  const unreadCount = getUnreadCount(notifications, currentRole, currentEmployeeId)

  const pendingApprovals = getPendingApprovals(visits, currentEmployeeId)
  const onPremises = myVisits.filter((v) => v.status === 'checked-in' && v.scheduledDate === today)
  const todayConfirmed = myVisits.filter((v) => v.status === 'confirmed' && v.scheduledDate === today)

  const searchQuery = searchInput.trim().toLowerCase()
  const searchResults = searchQuery
    ? myVisits.filter((v) => {
        const visitor = visitorMap[v.visitorId]
        return (
          (visitor?.name?.toLowerCase() ?? '').includes(searchQuery) ||
          (visitor?.company?.toLowerCase() ?? '').includes(searchQuery)
        )
      })
    : []
  const upcoming = myVisits.filter(
    (v) => (v.status === 'confirmed' || v.status === 'scheduled') && v.scheduledDate > today,
  )

  function handleApprove(visitId: string) {
    approveWalkIn(visitId)
  }

  function handleReject(visitId: string) {
    if (!rejectReason.trim()) return
    rejectWalkIn(visitId, rejectReason.trim())
    setRejectingId(null)
    setRejectReason('')
  }

  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Dashboard"
        titleNode={
          <div className="w-72 flex items-center gap-2 bg-surface border border-border rounded-lg px-4 h-9 focus-within:ring-2 focus-within:ring-brand-light focus-within:border-brand-light transition-shadow">
            <i className="ri-search-line text-text-tertiary shrink-0 text-base" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search visitors…"
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
            <Button size="md" icon="ri-calendar-check-line" onClick={() => navigate('/employee/create-visit')} className="ml-1">
              Create Visit
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

        {/* Search results */}
        {searchQuery && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <p className="text-sm font-semibold text-text-primary flex-1">Search results</p>
              <span className="text-xs font-medium text-text-tertiary bg-surface-secondary rounded-full px-2 py-0.5">{searchResults.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {searchResults.length === 0 ? (
                <EmptyState icon="ri-search-2-line" title="No visits match your search" className="py-10" />
              ) : (
                searchResults.map((visit) => {
                  const visitor = visitorMap[visit.visitorId]
                  return (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      visitorName={visitor?.name ?? 'Unknown'}
                      visitorPhone={visitor?.mobile}
                      visitorAvatar={visitor?.avatar}
                      role="employee"
                    />
                  )
                })
              )}
            </div>
          </div>
        )}

        {!searchQuery && (
          <>
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCardV2
            label="Pending"
            info="Walk-ins awaiting your approval"
            value={pendingApprovals.length}
            icon="ri-time-fill"
            color="yellow"
            alertCount={pendingApprovals.length}
            alertLabel="need action"
            alertColor="orange"
          />
          <KpiCardV2
            label="On Premises"
            info="Your visitors currently inside"
            value={onPremises.length}
            icon="ri-user-location-line"
            color="green"
          />
          <KpiCardV2
            label="Today"
            info="Confirmed visits for today"
            value={todayConfirmed.length}
            icon="ri-calendar-check-line"
            color="blue"
          />
          <KpiCardV2
            label="Upcoming"
            info="Scheduled for future dates"
            value={upcoming.length}
            icon="ri-calendar-schedule-line"
            color="purple"
          />
        </div>

        {/* Two-column layout below KPIs */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-5">

          {/* Left column — Today's Visits */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary">Today's Visits</p>
                <CountBadge count={onPremises.length + todayConfirmed.length} />
              </div>
              <div className="p-3 space-y-2">
                {todayConfirmed.length === 0 && onPremises.length === 0 ? (
                  <EmptyState icon="ri-calendar-line" title="No visits scheduled for today" />
                ) : (
                  [...onPremises, ...todayConfirmed].map((visit) => {
                    const visitor = visitorMap[visit.visitorId]
                    return (
                      <VisitCard
                        key={visit.id}
                        visit={visit}
                        visitorName={visitor?.name ?? 'Unknown'}
                        visitorPhone={visitor?.mobile}
                        visitorAvatar={visitor?.avatar}
                        role="employee"
                      />
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right column — Pending Approvals */}
          <div className="lg:col-span-1 lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                <p className="text-sm font-semibold text-text-primary">Pending Approval</p>
                <CountBadge count={pendingApprovals.length} />
              </div>
              <div>
                {pendingApprovals.length === 0 ? (
                  <EmptyState icon="ri-time-line" title="No pending approvals" />
                ) : (
                  pendingApprovals.map((visit, idx) => {
                    const visitor = visitorMap[visit.visitorId]
                    const name = visitor?.name ?? 'Unknown Visitor'
                    const isRejecting = rejectingId === visit.id
                    const isRowExpanded = expandedEntryKey === visit.id
                    return (
                      <div key={visit.id}>
                        {idx > 0 && <div className="h-px bg-surface-secondary mx-4" />}
                        <button
                          onClick={() => setExpandedEntryKey(isRowExpanded ? null : visit.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors ${isRowExpanded ? '' : 'hover:bg-surface'}`}
                        >
                          <AvatarBadge name={name} avatar={visitor?.avatar} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-text-tertiary">
                              {visitor?.company && <span className="truncate">{visitor.company}</span>}
                              {visitor?.company && <span className="shrink-0">·</span>}
                              <span className="shrink-0">{formatTime(visit.scheduledTime)}</span>
                            </div>
                          </div>
                          <i className={`shrink-0 text-text-tertiary transition-transform duration-200 ${isRowExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`} />
                        </button>

                        <Collapsible open={isRowExpanded}>
                          <div className="px-4 pb-4 space-y-3">
                            <div className="h-px bg-border-light" />
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                              <div>
                                <p className="text-[10px] text-text-tertiary leading-none">Visit type</p>
                                <p className="text-xs font-medium text-text-primary mt-1">{getVisitTypeLabel(visit.visitType)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-text-tertiary leading-none">Time</p>
                                <p className="text-xs font-medium text-text-primary mt-1">{formatTime(visit.scheduledTime)}</p>
                              </div>
                            </div>
                            {visit.notes && (
                              <p className="text-xs text-text-secondary italic">"{visit.notes}"</p>
                            )}
                            {!isRejecting ? (
                              <div className="flex gap-2">
                                <Button size="sm" variant="primary" icon="ri-check-line" fullWidth
                                  onClick={(e) => { e.stopPropagation(); handleApprove(visit.id) }}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="secondary" icon="ri-close-line" fullWidth
                                  onClick={(e) => { e.stopPropagation(); setRejectingId(visit.id); setRejectReason('') }}>
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <textarea
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="Reason for rejection…"
                                  rows={2}
                                  autoFocus
                                  className="w-full text-sm rounded-lg border border-border-light px-3 py-2 text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 bg-white"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReject(visit.id)}
                                    disabled={!rejectReason.trim()}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 text-white disabled:opacity-40 hover:bg-red-700 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => { setRejectingId(null); setRejectReason('') }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </Collapsible>
                      </div>
                    )
                  })
                )}
              </div>
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
