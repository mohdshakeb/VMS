// ─────────────────────────────────────────────────────────────────────────────
// Employee Dashboard — Mobile
// No PageHeader — AppLayout's mobile top bar provides the chrome.
// No responsive prefixes — every class here describes the mobile layout as-is.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore, getPendingApprovals } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS } from '@/data/visits'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import AvatarBadge from '@/components/common/AvatarBadge'
import Collapsible from '@/components/common/Collapsible'
import Button from '@/components/Button'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
import BottomSheet from '@/components/Mobile/BottomSheet'
import { getLocalDateString, getVisitTypeLabel } from '@/utils/helpers'

type ActiveTab = 'today' | 'checkedin'
type TodayFilter = 'all' | 'pending' | 'upcoming'

export default function EmployeeDashboardMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn } = useVisitStore()
  const { currentEmployeeId } = useAuthStore()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<ActiveTab>('today')
  const [todayFilter, setTodayFilter] = useState<TodayFilter>('all')
  const [expandedEntryKey, setExpandedEntryKey] = useState<string | null>(null)
  const [finishedIds, setFinishedIds] = useState<Set<string>>(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null)
  const [approveConfirmSheetVisible, setApproveConfirmSheetVisible] = useState(false)
  const [approveSuccessName, setApproveSuccessName] = useState<string | null>(null)
  const [approveSheetVisible, setApproveSheetVisible] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectSheetVisible, setRejectSheetVisible] = useState(false)
  const [rejectSuccessName, setRejectSuccessName] = useState<string | null>(null)
  const [rejectSuccessSheetVisible, setRejectSuccessSheetVisible] = useState(false)
  const [finishTargetId, setFinishTargetId] = useState<string | null>(null)
  const [finishConfirmSheetVisible, setFinishConfirmSheetVisible] = useState(false)
  const [successVisitorName, setSuccessVisitorName] = useState<string | null>(null)
  const [successSheetVisible, setSuccessSheetVisible] = useState(false)

  useEffect(() => {
    if (approveTargetId) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setApproveConfirmSheetVisible(true)) })
    } else {
      setApproveConfirmSheetVisible(false)
    }
  }, [approveTargetId])

  useEffect(() => {
    if (approveSuccessName) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setApproveSheetVisible(true)) })
    } else {
      setApproveSheetVisible(false)
    }
  }, [approveSuccessName])

  useEffect(() => {
    if (rejectTargetId) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setRejectSheetVisible(true)) })
    } else {
      setRejectSheetVisible(false)
    }
  }, [rejectTargetId])

  useEffect(() => {
    if (rejectSuccessName) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setRejectSuccessSheetVisible(true)) })
    } else {
      setRejectSuccessSheetVisible(false)
    }
  }, [rejectSuccessName])

  useEffect(() => {
    if (finishTargetId) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setFinishConfirmSheetVisible(true)) })
    } else {
      setFinishConfirmSheetVisible(false)
    }
  }, [finishTargetId])

  useEffect(() => {
    if (successVisitorName) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setSuccessSheetVisible(true)) })
    } else {
      setSuccessSheetVisible(false)
    }
  }, [successVisitorName])

  const now = new Date()
  const today = getLocalDateString()
  const myVisits = visits.filter((v) => v.hostEmployeeId === currentEmployeeId)
  const visitorMap = Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v]))

  // Data aligned to desktop — pendingApprovals filtered to today
  const pendingApprovals = getPendingApprovals(visits, currentEmployeeId).filter((v) => v.scheduledDate === today)
  const allToday = myVisits.filter((v) =>
    ['pending-approval', 'scheduled', 'confirmed'].includes(v.status) && v.scheduledDate === today,
  )
  const upcomingToday = myVisits.filter((v) =>
    ['confirmed', 'scheduled'].includes(v.status) && v.scheduledDate === today,
  )
  const checkedIn = myVisits.filter((v) => v.status === 'checked-in' && !finishedIds.has(v.id))

  const baseList =
    todayFilter === 'all' ? allToday
    : todayFilter === 'pending' ? pendingApprovals
    : upcomingToday

  const activeList = searchInput.trim()
    ? baseList.filter((v) => {
        const visitor = visitorMap[v.visitorId]
        return (visitor?.name?.toLowerCase() ?? '').includes(searchInput.trim().toLowerCase())
      })
    : baseList

  function handleApprove(visitId: string) {
    setApproveTargetId(visitId)
  }

  function handleApproveConfirmSheetClose() {
    setApproveConfirmSheetVisible(false)
    setTimeout(() => setApproveTargetId(null), 260)
  }

  function handleApproveConfirm() {
    if (!approveTargetId) return
    const visitor = visitorMap[visits.find((v) => v.id === approveTargetId)?.visitorId ?? '']
    approveWalkIn(approveTargetId)
    handleApproveConfirmSheetClose()
    setTimeout(() => setApproveSuccessName(visitor?.name ?? 'Visitor'), 260)
  }

  function handleApproveSheetClose() {
    setApproveSheetVisible(false)
    setTimeout(() => setApproveSuccessName(null), 260)
  }

  function handleRejectSheetClose() {
    setRejectSheetVisible(false)
    setTimeout(() => { setRejectTargetId(null); setRejectReason('') }, 260)
  }

  function handleRejectConfirm() {
    if (!rejectTargetId || !rejectReason.trim()) return
    const visitor = visitorMap[visits.find((v) => v.id === rejectTargetId)?.visitorId ?? '']
    rejectWalkIn(rejectTargetId, rejectReason.trim())
    const name = visitor?.name ?? 'Visitor'
    handleRejectSheetClose()
    setTimeout(() => setRejectSuccessName(name), 260)
  }

  function handleRejectSuccessSheetClose() {
    setRejectSuccessSheetVisible(false)
    setTimeout(() => setRejectSuccessName(null), 260)
  }

  function handleFinish(visitId: string) {
    setExpandedEntryKey(null)
    setFinishTargetId(visitId)
  }

  function handleFinishConfirmSheetClose() {
    setFinishConfirmSheetVisible(false)
    setTimeout(() => setFinishTargetId(null), 260)
  }

  function handleFinishConfirm() {
    if (!finishTargetId) return
    const visitor = visitorMap[visits.find((v) => v.id === finishTargetId)?.visitorId ?? '']
    setFinishedIds((prev) => new Set([...prev, finishTargetId]))
    const name = visitor?.name ?? 'Visitor'
    handleFinishConfirmSheetClose()
    setTimeout(() => setSuccessVisitorName(name), 260)
  }

  function handleSuccessSheetClose() {
    setSuccessSheetVisible(false)
    setTimeout(() => setSuccessVisitorName(null), 260)
  }

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          {/* Search bar */}
          <MobileSearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search visitor name..."
          />

          {/* KPI cards — horizontal scroll, 3rd card always partially visible */}
          <div className="-mx-4 px-4 flex items-stretch gap-2.5 overflow-x-auto scrollbar-none">
            <div className="w-[40vw] shrink-0">
              <KpiCardV2
                label="Today's Visit"
                info="All visits for today not yet checked in"
                value={allToday.length}
                icon="ri-calendar-check-fill"
                color="blue"
              />
            </div>
            <div className="w-[40vw] shrink-0">
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
            </div>
            <div className="w-[40vw] shrink-0">
              <KpiCardV2
                label="Checked In"
                info="Your visitors currently inside"
                value={checkedIn.length}
                icon="ri-user-location-fill"
                color="green"
              />
            </div>
            <div className="w-[40vw] shrink-0">
              <KpiCardV2
                label="Upcoming Today"
                info="Confirmed for today, not yet arrived"
                value={upcomingToday.length}
                icon="ri-calendar-schedule-fill"
                color="purple"
              />
            </div>
            <div className="w-4 shrink-0" />
          </div>

          {/* Segmented control */}
          <div className="flex p-1 bg-white rounded-full mt-4">
            {(['today', 'checkedin'] as const).map((tab) => {
              const isActive = activeTab === tab
              const count = tab === 'today' ? allToday.length : checkedIn.length
              const label = tab === 'today' ? "Today's Visits" : 'Checked In'
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium rounded-full ${isActive ? 'text-brand' : 'text-text-tertiary'}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-brand-red-50)' : 'transparent',
                    boxShadow: isActive ? '0 1px 4px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.08)' : 'none',
                    transition: 'background-color 150ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 150ms cubic-bezier(0.23, 1, 0.32, 1), color 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  {label}
                  <CountBadge
                    count={count}
                    className={isActive ? 'text-brand' : undefined}
                    style={{
                      backgroundColor: isActive ? 'var(--color-brand-red-100)' : undefined,
                      transition: 'background-color 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                  />
                </button>
              )
            })}
          </div>

          {/* Today's Visits tab */}
          {activeTab === 'today' && (
            <>
              {/* Filter pills — matches desktop */}
              <div className="flex items-center gap-2 py-1">
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
                  Upcoming
                </button>
              </div>

              <div className="space-y-2">
                {activeList.length === 0 ? (
                  <EmptyState
                    icon={todayFilter === 'pending' ? 'ri-time-line' : todayFilter === 'upcoming' ? 'ri-calendar-schedule-line' : 'ri-calendar-line'}
                    title={todayFilter === 'pending' ? 'No pending approvals' : todayFilter === 'upcoming' ? 'No confirmed visits for today' : 'No visits for today'}
                    className="py-8" iconClassName="text-2xl" titleClassName="text-sm"
                  />
                ) : (
                  activeList.map((visit) => {
                    const visitor = visitorMap[visit.visitorId]
                    return (
                      <VisitCard
                        key={visit.id}
                        visit={visit}
                        visitorName={visitor?.name ?? 'Unknown'}
                        visitorPhone={visitor?.mobile}
                        visitorAvatar={visitor?.avatar}
                        role="employee"
                        viewerIsHost
                        onApprove={visit.status === 'pending-approval' ? () => handleApprove(visit.id) : undefined}
                        onReject={visit.status === 'pending-approval' ? () => { setRejectTargetId(visit.id); setRejectReason('') } : undefined}
                      />
                    )
                  })
                )}
              </div>
            </>
          )}

          {/* Checked In tab — matches desktop right panel */}
          {activeTab === 'checkedin' && (
            <div className="bg-white rounded-xl border border-border overflow-hidden mt-1">
              {checkedIn.length === 0 ? (
                <EmptyState icon="ri-user-location-line" title="No visitors checked in" className="py-10" iconClassName="text-2xl" titleClassName="text-sm" />
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
                            <p className="text-sm font-medium text-text-primary truncate">{name}</p>
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
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                              <div>
                                <p className="text-[10px] text-text-tertiary leading-none">Check-in</p>
                                <p className="text-xs font-medium text-text-primary mt-1">{checkInDisplay}</p>
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
                              <Button size="sm" variant="primary" icon="ri-checkbox-circle-line" fullWidth
                                onClick={(e) => { e.stopPropagation(); handleFinish(visit.id) }}>
                                Finish
                              </Button>
                            </div>
                          </div>
                        </Collapsible>
                      </div>
                    )
                  })
              )}
            </div>
          )}

        </div>
      </div>

      {/* Approve confirmation bottom sheet */}
      {approveTargetId && (() => {
        const v = visits.find((x) => x.id === approveTargetId)
        const name = visitorMap[v?.visitorId ?? '']?.name ?? 'Visitor'
        return (
          <BottomSheet
            mounted={!!approveTargetId}
            visible={approveConfirmSheetVisible}
            onClose={handleApproveConfirmSheetClose}
            title="Approve Walk-in"
            footer={
              <div className="flex gap-2">
                <Button variant="primary" fullWidth onClick={handleApproveConfirm}>Approve</Button>
                <Button variant="secondary" fullWidth onClick={handleApproveConfirmSheetClose}>Cancel</Button>
              </div>
            }
          >
            <div className="px-5 py-4">
              <p className="text-sm text-text-secondary">Allow <span className="font-medium text-text-primary">{name}</span> to proceed to the front desk for check-in?</p>
            </div>
          </BottomSheet>
        )
      })()}

      {/* Approve success bottom sheet */}
      {approveSuccessName && (
        <BottomSheet
          mounted={!!approveSuccessName}
          visible={approveSheetVisible}
          onClose={handleApproveSheetClose}
          footer={<Button fullWidth onClick={handleApproveSheetClose}>Done</Button>}
        >
          <div className="px-5 py-6 flex flex-col items-center text-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-confirmed-surface)' }}
            >
              <i className="ri-checkbox-circle-fill text-5xl" style={{ color: 'var(--color-confirmed)' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Walk-in Approved</p>
              <p className="text-sm text-text-secondary mt-1">{approveSuccessName} can now proceed to check in at the front desk.</p>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Rejection bottom sheet */}
      {rejectTargetId && (
        <BottomSheet
          mounted={!!rejectTargetId}
          visible={rejectSheetVisible}
          onClose={handleRejectSheetClose}
          title="Reject Visit"
          footer={
            <div className="flex gap-2">
              <Button variant="danger" fullWidth disabled={!rejectReason.trim()} onClick={handleRejectConfirm}>
                Confirm Rejection
              </Button>
              <Button variant="secondary" fullWidth onClick={handleRejectSheetClose}>
                Cancel
              </Button>
            </div>
          }
        >
          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-xs text-text-secondary">Please provide a reason for rejecting this visit.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
              rows={3}
              autoFocus
              className="w-full text-sm rounded-lg border border-border-light px-3 py-2 text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 bg-white"
            />
          </div>
        </BottomSheet>
      )}

      {/* Rejection success bottom sheet */}
      {rejectSuccessName && (
        <BottomSheet
          mounted={!!rejectSuccessName}
          visible={rejectSuccessSheetVisible}
          onClose={handleRejectSuccessSheetClose}
          footer={<Button fullWidth onClick={handleRejectSuccessSheetClose}>Done</Button>}
        >
          <div className="px-5 py-6 flex flex-col items-center text-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-rejected-surface)' }}
            >
              <i className="ri-close-circle-fill text-5xl" style={{ color: 'var(--color-rejected)' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Visit Rejected</p>
              <p className="text-sm text-text-secondary mt-1">{rejectSuccessName}'s visit request has been rejected.</p>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Finish confirmation bottom sheet */}
      {finishTargetId && (() => {
        const v = visits.find((x) => x.id === finishTargetId)
        const name = visitorMap[v?.visitorId ?? '']?.name ?? 'Visitor'
        return (
          <BottomSheet
            mounted={!!finishTargetId}
            visible={finishConfirmSheetVisible}
            onClose={handleFinishConfirmSheetClose}
            title="Finish Visit"
            footer={
              <div className="flex gap-2">
                <Button variant="primary" fullWidth onClick={handleFinishConfirm}>Yes, Finish</Button>
                <Button variant="secondary" fullWidth onClick={handleFinishConfirmSheetClose}>Cancel</Button>
              </div>
            }
          >
            <div className="px-5 py-4">
              <p className="text-sm text-text-secondary">Mark <span className="font-medium text-text-primary">{name}</span>'s visit as complete?</p>
            </div>
          </BottomSheet>
        )
      })()}

      {/* Finish success bottom sheet */}
      {successVisitorName && (
        <BottomSheet
          mounted={!!successVisitorName}
          visible={successSheetVisible}
          onClose={handleSuccessSheetClose}
          footer={<Button fullWidth onClick={handleSuccessSheetClose}>Done</Button>}
        >
          <div className="px-5 py-6 flex flex-col items-center text-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-confirmed-surface)' }}
            >
              <i className="ri-checkbox-circle-fill text-5xl" style={{ color: 'var(--color-confirmed)' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Visit Completed</p>
              <p className="text-sm text-text-secondary mt-1">{successVisitorName}'s visit has been marked as complete.</p>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
