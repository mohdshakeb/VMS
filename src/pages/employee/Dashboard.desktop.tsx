// ─────────────────────────────────────────────────────────────────────────────
// Employee Dashboard — Desktop
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useVisitStore, getPendingApprovals } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS } from '@/data/visits'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import AvatarBadge from '@/components/common/AvatarBadge'
import Collapsible from '@/components/common/Collapsible'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import { getLocalDateString, getVisitTypeLabel, getPurposeLabel, formatTime, formatDate, getBusinessSegmentLabel } from '@/utils/helpers'

export default function EmployeeDashboardDesktop() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn, cancelVisit } = useVisitStore()

  const { currentEmployeeId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const [todayFilter, setTodayFilter] = useState<'all' | 'pending' | 'upcoming'>('all')
  const [expandedEntryKey, setExpandedEntryKey] = useState<string | null>(null)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null)
  const [approveSuccessName, setApproveSuccessName] = useState<string | null>(null)
  const [rejectSuccessName, setRejectSuccessName] = useState<string | null>(null)
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)

  const now = new Date()
  const today = getLocalDateString()
  const myVisits = visits.filter((v) => v.hostEmployeeId === currentEmployeeId)
  const visitorMap = Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v]))
  const unreadCount = getUnreadCount(notifications, currentRole, currentEmployeeId)

  // Today's not-checked-in visits
  const pendingApprovals = getPendingApprovals(visits, currentEmployeeId).filter((v) => v.scheduledDate === today)
  const upcomingToday = myVisits.filter((v) => ['confirmed', 'scheduled'].includes(v.status) && v.scheduledDate === today)
  const allToday = myVisits.filter((v) => ['pending-approval', 'scheduled', 'confirmed'].includes(v.status) && v.scheduledDate === today)
  const cancelledRejected = myVisits.filter((v) => ['cancelled', 'rejected'].includes(v.status))

  // Checked-in visitors (all dates)
  const checkedIn = myVisits.filter((v) => v.status === 'checked-in')

  const activeList = todayFilter === 'all' ? allToday : todayFilter === 'pending' ? pendingApprovals : upcomingToday

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

  function handleApprove(visitId: string) {
    setApproveTargetId(visitId)
  }

  function handleApproveConfirm() {
    if (!approveTargetId) return
    const visitor = visitorMap[visits.find((v) => v.id === approveTargetId)?.visitorId ?? '']
    approveWalkIn(approveTargetId)
    setApproveTargetId(null)
    setApproveSuccessName(visitor?.name ?? 'Visitor')
  }

  function handleRejectConfirm() {
    if (!rejectTargetId || !rejectReason.trim()) return
    const visitor = visitorMap[visits.find((v) => v.id === rejectTargetId)?.visitorId ?? '']
    rejectWalkIn(rejectTargetId, rejectReason.trim())
    setRejectSuccessName(visitor?.name ?? 'Visitor')
    setRejectTargetId(null)
    setRejectReason('')
  }

  function handleCancelConfirm() {
    if (!cancelTargetId) return
    cancelVisit(cancelTargetId)
    setCancelTargetId(null)
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
            <Button size="md" icon="ri-add-large-fill" onClick={() => navigate('/employee/create-visit')} className="ml-1">
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
                  <EmptyState icon="ri-search-2-line" title="No visits match your search" className="py-16" />
                ) : (
                  searchResults.map((visit, idx) => {
                    const visitor = visitorMap[visit.visitorId]
                    return (
                      <div key={visit.id} className="vms-stagger-item" style={{ animationDelay: `${Math.min(idx * 35, 210)}ms` }}>
                        <VisitCard
                          visit={visit}
                          visitorName={visitor?.name ?? 'Unknown'}
                          visitorPhone={visitor?.mobile}
                          visitorAvatar={visitor?.avatar}
                          role="employee"
                          viewerIsHost
                          onApprove={visit.status === 'pending-approval' ? () => handleApprove(visit.id) : undefined}
                          onReject={visit.status === 'pending-approval' ? () => { setRejectTargetId(visit.id); setRejectReason('') } : undefined}
                          onCancel={['confirmed', 'scheduled'].includes(visit.status) ? () => setCancelTargetId(visit.id) : undefined}
                        />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {!searchQuery && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <KpiCardV2
                  label="Today's Visit"
                  info="All visits for today not yet checked in"
                  value={allToday.length}
                  icon="ri-calendar-check-fill"
                  color="blue"
                />
                <KpiCardV2
                  label="Pending Approval"
                  info="Walk-ins awaiting your approval"
                  value={pendingApprovals.length}
                  icon="ri-time-fill"
                  color="yellow"
                  alertCount={pendingApprovals.length}
                  alertLabel="need action"
                  alertColor="orange"
                />
                <KpiCardV2
                  label="Checked In"
                  info="Your visitors currently inside"
                  value={checkedIn.length}
                  icon="ri-user-location-fill"
                  color="green"
                />
                <KpiCardV2
                  label="Declined Visits"
                  info="Visits that were cancelled or rejected"
                  value={cancelledRejected.length}
                  icon="ri-close-circle-fill"
                  color="red"
                />
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-5">

                {/* Left column — Today's Visits */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
                      <p className="text-sm font-semibold text-text-primary">Today's Visits</p>
                      <CountBadge count={activeList.length} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                      <button
                        onClick={() => setTodayFilter('all')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${todayFilter === 'all' ? 'bg-surface-tertiary text-text-primary' : 'bg-surface text-text-secondary hover:bg-surface-secondary'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTodayFilter('pending')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${todayFilter === 'pending' ? 'bg-yellow-surface text-yellow-fg' : 'bg-surface text-text-secondary hover:bg-surface-secondary'}`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setTodayFilter('upcoming')}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${todayFilter === 'upcoming' ? 'bg-blue-surface text-blue-fg' : 'bg-surface text-text-secondary hover:bg-surface-secondary'}`}
                      >
                        Confirmed
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      {activeList.length === 0 ? (
                        <EmptyState
                          icon={todayFilter === 'pending' ? 'ri-time-line' : todayFilter === 'upcoming' ? 'ri-calendar-schedule-line' : 'ri-calendar-line'}
                          title={todayFilter === 'pending' ? 'No pending approvals' : todayFilter === 'upcoming' ? 'No confirmed visits for today' : 'No visits for today'}
                        />
                      ) : (
                        activeList.map((visit, idx) => {
                          const visitor = visitorMap[visit.visitorId]
                          return (
                            <div key={visit.id} className="vms-stagger-item" style={{ animationDelay: `${Math.min(idx * 35, 210)}ms` }}>
                              <VisitCard
                                visit={visit}
                                visitorName={visitor?.name ?? 'Unknown'}
                                visitorPhone={visitor?.mobile}
                                visitorAvatar={visitor?.avatar}
                                role="employee"
                                viewerIsHost
                                onApprove={visit.status === 'pending-approval' ? () => handleApprove(visit.id) : undefined}
                                onReject={visit.status === 'pending-approval' ? () => { setRejectTargetId(visit.id); setRejectReason('') } : undefined}
                                onCancel={['confirmed', 'scheduled'].includes(visit.status) ? () => setCancelTargetId(visit.id) : undefined}
                              />
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right column — Checked-In */}
                <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                      <p className="text-sm font-semibold text-text-primary">Checked-In</p>
                      <CountBadge count={checkedIn.length} />
                    </div>
                    <div>
                      {checkedIn.length === 0 ? (
                        <EmptyState icon="ri-user-location-line" title="No visitors checked in" />
                      ) : (
                        checkedIn
                          .sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
                          .map((visit, idx) => {
                            const visitor = visitorMap[visit.visitorId]
                            const name = visitor?.name ?? 'Unknown Visitor'
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
                                    <p className="text-xs font-medium text-text-primary truncate">{name}</p>
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
                                    <div className="grid grid-cols-3 gap-x-3">
                                      <div>
                                        <p className="text-[10px] text-text-tertiary leading-none">Check-in</p>
                                        <p className="text-xs font-medium text-text-primary mt-1">{checkInDisplay}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-text-tertiary leading-none">Visit type</p>
                                        <p className="text-xs font-medium text-text-primary mt-1">{getVisitTypeLabel(visit.visitType)}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-text-tertiary leading-none">Purpose</p>
                                        <p className="text-xs font-medium text-text-primary mt-1">{getPurposeLabel(visit.purpose)}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="secondary" icon="ri-eye-line" fullWidth
                                      onClick={(e) => { e.stopPropagation(); navigate(`/employee/visit/${visit.id}`) }}>
                                      View Details
                                    </Button>
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

      {/* Approve confirmation modal */}
      {approveTargetId && (() => {
        const v = visits.find((x) => x.id === approveTargetId)
        const visitor = visitorMap[v?.visitorId ?? '']
        const host = employees.find((e) => e.id === v?.hostEmployeeId)
        const location = locations.find((l) => l.id === v?.locationId)
        return (
          <Modal
            open
            title="Approve Walk-in"
            onClose={() => setApproveTargetId(null)}
            size="md"
            footer={
              <div className="flex gap-2">
                <Button variant="primary" fullWidth onClick={handleApproveConfirm}>Approve</Button>
                <Button variant="secondary" fullWidth onClick={() => setApproveTargetId(null)}>Cancel</Button>
              </div>
            }
          >
            <div className="py-2 space-y-4">
              <div className="flex items-start gap-4">
                {visitor?.avatar ? (
                  <img src={visitor.avatar} alt={visitor.name} className="w-40 h-48 rounded-xl object-cover flex-shrink-0 border border-border" />
                ) : (
                  <div className="w-32 h-40 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    <i className="ri-user-line text-4xl text-text-tertiary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{visitor?.name ?? 'Visitor'}</p>
                      {visitor?.company && <p className="text-xs text-text-secondary mt-0.5">{visitor.company}</p>}
                    </div>
                    <button
                      className="text-xs font-medium text-brand hover:underline shrink-0"
                      onClick={() => { setApproveTargetId(null); navigate(`/employee/visit/${v?.id}`) }}
                    >
                      View Details
                    </button>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      ['Mobile', visitor?.mobile ?? '—'],
                      ['Purpose', v ? getPurposeLabel(v.purpose) : '—'],
                      ['Visit Type', v ? getVisitTypeLabel(v.visitType) : '—'],
                      ['Location', location?.name ?? '—'],
                      ['Host', host?.name ?? '—'],
                      ['Time', v ? formatTime(v.scheduledTime) : '—'],
                      ['WiFi Access', v ? (v.guestWifi ? 'Yes' : 'No') : '—'],
                      v?.visitType === 'customer' && v.businessSegment
                        ? ['Business Segment', getBusinessSegmentLabel(v.businessSegment)]
                        : null,
                    ].filter(Boolean) as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[10px] text-text-tertiary">{label}</p>
                        <p className="text-xs font-medium text-text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-secondary pt-1">Allow this visitor to proceed to the front desk for check-in?</p>
            </div>
          </Modal>
        )
      })()}

      {/* Rejection modal */}
      {rejectTargetId && (() => {
        const v = visits.find((x) => x.id === rejectTargetId)
        const visitor = visitorMap[v?.visitorId ?? '']
        const host = employees.find((e) => e.id === v?.hostEmployeeId)
        const location = locations.find((l) => l.id === v?.locationId)
        return (
          <Modal
            open
            title="Reject Visit"
            onClose={() => { setRejectTargetId(null); setRejectReason('') }}
            size="md"
            footer={
              <div className="flex gap-2">
                <Button variant="danger" fullWidth disabled={!rejectReason.trim()} onClick={handleRejectConfirm}>
                  Confirm Rejection
                </Button>
                <Button variant="secondary" fullWidth onClick={() => { setRejectTargetId(null); setRejectReason('') }}>
                  Cancel
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-start gap-4">
                {visitor?.avatar ? (
                  <img src={visitor.avatar} alt={visitor.name} className="w-40 h-48 rounded-xl object-cover flex-shrink-0 border border-border" />
                ) : (
                  <div className="w-32 h-40 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    <i className="ri-user-line text-4xl text-text-tertiary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{visitor?.name ?? 'Visitor'}</p>
                  {visitor?.company && <p className="text-xs text-text-secondary mt-0.5">{visitor.company}</p>}
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      ['Mobile', visitor?.mobile ?? '—'],
                      ['Purpose', v ? getPurposeLabel(v.purpose) : '—'],
                      ['Visit Type', v ? getVisitTypeLabel(v.visitType) : '—'],
                      ['Location', location?.name ?? '—'],
                      ['Host', host?.name ?? '—'],
                      ['Time', v ? formatTime(v.scheduledTime) : '—'],
                      ['WiFi Access', v ? (v.guestWifi ? 'Yes' : 'No') : '—'],
                      v?.visitType === 'customer' && v.businessSegment
                        ? ['Business Segment', getBusinessSegmentLabel(v.businessSegment)]
                        : null,
                    ].filter(Boolean) as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[10px] text-text-tertiary">{label}</p>
                        <p className="text-xs font-medium text-text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-text-secondary">Provide a reason for rejecting this visit.</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection…"
                  rows={3}
                  autoFocus
                  className="w-full text-sm rounded-lg border border-border-light px-3 py-2 text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 bg-white"
                />
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* Approve success modal */}
      {approveSuccessName && (
        <Modal open onClose={() => setApproveSuccessName(null)} size="md">
          <div className="py-4 flex flex-col items-center text-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-confirmed-surface)' }}
            >
              <i className="ri-checkbox-circle-fill text-4xl" style={{ color: 'var(--color-confirmed)' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Walk-in Approved</p>
              <p className="text-sm text-text-secondary mt-1">{approveSuccessName} can now proceed to check in at the front desk.</p>
            </div>
            <Button fullWidth onClick={() => setApproveSuccessName(null)}>Done</Button>
          </div>
        </Modal>
      )}

      {/* Rejection success modal */}
      {rejectSuccessName && (
        <Modal open onClose={() => setRejectSuccessName(null)} size="md">
          <div className="py-4 flex flex-col items-center text-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-rejected-surface)' }}
            >
              <i className="ri-close-circle-fill text-4xl" style={{ color: 'var(--color-rejected)' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Visit Rejected</p>
              <p className="text-sm text-text-secondary mt-1">{rejectSuccessName}'s visit request has been rejected.</p>
            </div>
            <Button fullWidth onClick={() => setRejectSuccessName(null)}>Done</Button>
          </div>
        </Modal>
      )}

      {/* Cancel confirmation modal */}
      {cancelTargetId && (() => {
        const v = visits.find((x) => x.id === cancelTargetId)
        const visitor = visitorMap[v?.visitorId ?? '']
        const host = employees.find((e) => e.id === v?.hostEmployeeId)
        const location = locations.find((l) => l.id === v?.locationId)
        const isToday = v?.scheduledDate === today
        return (
          <Modal
            open
            title="Cancel Visit"
            onClose={() => setCancelTargetId(null)}
            size="md"
            footer={
              <div className="flex gap-2">
                <Button variant="danger" fullWidth onClick={handleCancelConfirm}>Cancel Visit</Button>
                <Button variant="secondary" fullWidth onClick={() => setCancelTargetId(null)}>Keep It</Button>
              </div>
            }
          >
            <div className="py-2 space-y-4">
              <div className="flex items-start gap-4">
                {visitor?.avatar ? (
                  <img src={visitor.avatar} alt={visitor.name} className="w-40 h-48 rounded-xl object-cover flex-shrink-0 border border-border" />
                ) : (
                  <div className="w-32 h-40 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    <i className="ri-user-line text-4xl text-text-tertiary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{visitor?.name ?? 'Visitor'}</p>
                  {visitor?.company && <p className="text-xs text-text-secondary mt-0.5">{visitor.company}</p>}
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      ['Mobile', visitor?.mobile ?? '—'],
                      ['Purpose', v ? getPurposeLabel(v.purpose) : '—'],
                      ['Visit Type', v ? getVisitTypeLabel(v.visitType) : '—'],
                      ['Location', location?.name ?? '—'],
                      ['Host', host?.name ?? '—'],
                      [isToday ? 'Time' : 'Date', v ? (isToday ? formatTime(v.scheduledTime) : `${formatDate(v.scheduledDate)}, ${formatTime(v.scheduledTime)}`) : '—'],
                      ['WiFi Access', v ? (v.guestWifi ? 'Yes' : 'No') : '—'],
                      v?.visitType === 'customer' && v.businessSegment
                        ? ['Business Segment', getBusinessSegmentLabel(v.businessSegment)]
                        : null,
                    ].filter(Boolean) as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[10px] text-text-tertiary">{label}</p>
                        <p className="text-xs font-medium text-text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-secondary pt-1">This cannot be undone.</p>
            </div>
          </Modal>
        )
      })()}

    </div>
  )
}
