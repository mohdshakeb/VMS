// ─────────────────────────────────────────────────────────────────────────────
// My Visits — Mobile (Branch Admin)
// Employee view: today's visits + checked-in tab, scoped to currentEmployeeId.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore, getPendingApprovals } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS } from '@/data/visits'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import VisitCard from '@/components/VisitCard'
import Button from '@/components/Button'
import BottomSheet from '@/components/Mobile/BottomSheet'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import AvatarBadge from '@/components/common/AvatarBadge'
import Collapsible from '@/components/common/Collapsible'
import { getPurposeLabel, getVisitTypeLabel, formatTime, formatDate, getLocalDateString, getBusinessSegmentLabel } from '@/utils/helpers'

type ActiveTab = 'today' | 'checkedin'
type TodayFilter = 'all' | 'pending' | 'upcoming'

export default function ManagerMyVisitsMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn, cancelVisit } = useVisitStore()
  const employeeId = useAuthStore((s) => s.currentEmployeeId)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<ActiveTab>('today')
  const [todayFilter, setTodayFilter] = useState<TodayFilter>('all')
  const [expandedEntryKey, setExpandedEntryKey] = useState<string | null>(null)
  const [showAllCheckedIn, setShowAllCheckedIn] = useState(false)
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
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)
  const [cancelSheetVisible, setCancelSheetVisible] = useState(false)

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
    if (cancelTargetId) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setCancelSheetVisible(true)) })
    } else {
      setCancelSheetVisible(false)
    }
  }, [cancelTargetId])

  const now = new Date()
  const today = getLocalDateString()
  const myVisits = visits.filter((v) => v.hostEmployeeId === employeeId)
  const visitorMap = Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v]))

  const pendingApprovals = getPendingApprovals(visits, employeeId).filter((v) => v.scheduledDate === today)
  const allToday = myVisits.filter((v) =>
    ['pending-approval', 'scheduled', 'confirmed'].includes(v.status) && v.scheduledDate === today,
  )
  const upcomingToday = myVisits.filter((v) =>
    ['confirmed', 'scheduled'].includes(v.status) && v.scheduledDate === today,
  )
  const checkedIn = myVisits.filter((v) => v.status === 'checked-in')

  const baseList =
    todayFilter === 'all' ? allToday
    : todayFilter === 'pending' ? pendingApprovals
    : upcomingToday

  const searchQuery = searchInput.trim().toLowerCase()
  const searchResults = searchQuery
    ? myVisits.filter((v) => {
        const visitor = visitorMap[v.visitorId]
        return (visitor?.name?.toLowerCase() ?? '').includes(searchQuery)
          || (visitor?.company?.toLowerCase() ?? '').includes(searchQuery)
      })
    : []

  const activeList = baseList

  function handleApprove(visitId: string) { setApproveTargetId(visitId) }

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

  function handleCancelSheetClose() {
    setCancelSheetVisible(false)
    setTimeout(() => setCancelTargetId(null), 260)
  }

  function handleCancelConfirm() {
    if (!cancelTargetId) return
    cancelVisit(cancelTargetId)
    handleCancelSheetClose()
  }

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          <MobileSearchInput
            value={searchInput}
            onChange={(v) => setSearchInput(v)}
            placeholder="Search visitor name..."
          />

          {searchQuery ? (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary flex-1">Search results</p>
                <CountBadge count={searchResults.length} />
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
                          visitorName={visitor?.name ?? 'Unknown Visitor'}
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
          ) : (
            <>
              {/* Segmented control */}
              <div className="flex p-1 bg-white rounded-full mt-1">
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
                      Confirmed
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
                </>
              )}

              {/* Checked-In tab */}
              {activeTab === 'checkedin' && (
                <div className="bg-white rounded-xl border border-border overflow-hidden mt-1">
                  {checkedIn.length === 0 ? (
                    <div className="p-3">
                      <EmptyState icon="ri-user-location-line" title="No visitors checked in" className="py-8" iconClassName="text-2xl" titleClassName="text-sm" />
                    </div>
                  ) : (
                    <>
                      {checkedIn
                        .sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
                        .slice(0, showAllCheckedIn ? undefined : 5)
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
                        })}
                      {checkedIn.length >= 6 && (
                        <div className="border-t border-border-light px-4 py-2.5">
                          <button
                            onClick={() => setShowAllCheckedIn((v) => !v)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors py-1"
                          >
                            {showAllCheckedIn ? <>Show less <i className="ri-arrow-up-s-line text-sm" /></> : <>View all <i className="ri-arrow-down-s-line text-sm" /></>}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Approve confirmation bottom sheet */}
      {approveTargetId && (() => {
        const v = visits.find((x) => x.id === approveTargetId)
        const visitor = visitorMap[v?.visitorId ?? '']
        const host = employees.find((e) => e.id === v?.hostEmployeeId)
        const location = locations.find((l) => l.id === v?.locationId)
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
            <div className="px-5 py-4 space-y-4">
              <div className="flex flex-col gap-4">
                {visitor?.avatar ? (
                  <img src={visitor.avatar} alt={visitor?.name} className="w-full h-52 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="w-full h-52 rounded-xl bg-surface-secondary flex items-center justify-center border border-border">
                    <i className="ri-user-line text-5xl text-text-tertiary" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{visitor?.name ?? 'Visitor'}</p>
                      {visitor?.company && <p className="text-xs text-text-secondary mt-0.5">{visitor.company}</p>}
                    </div>
                    <button
                      className="text-xs font-medium text-brand hover:underline shrink-0"
                      onClick={() => { handleApproveConfirmSheetClose(); navigate(`/employee/visit/${v?.id}`) }}
                    >
                      View Details
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
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
              <p className="text-xs text-text-secondary">Allow this visitor to proceed to the front desk for check-in?</p>
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
      {rejectTargetId && (() => {
        const v = visits.find((x) => x.id === rejectTargetId)
        const visitor = visitorMap[v?.visitorId ?? '']
        const host = employees.find((e) => e.id === v?.hostEmployeeId)
        const location = locations.find((l) => l.id === v?.locationId)
        return (
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
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {visitor?.avatar ? (
                  <img src={visitor.avatar} alt={visitor?.name} className="w-full h-52 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="w-full h-52 rounded-xl bg-surface-secondary flex items-center justify-center border border-border">
                    <i className="ri-user-line text-5xl text-text-tertiary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{visitor?.name ?? 'Visitor'}</p>
                  {visitor?.company && <p className="text-xs text-text-secondary mt-0.5">{visitor.company}</p>}
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
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
          </BottomSheet>
        )
      })()}

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

      {/* Cancel confirmation bottom sheet */}
      {cancelTargetId && (() => {
        const v = visits.find((x) => x.id === cancelTargetId)
        const visitor = visitorMap[v?.visitorId ?? '']
        const host = employees.find((e) => e.id === v?.hostEmployeeId)
        const location = locations.find((l) => l.id === v?.locationId)
        const isToday = v?.scheduledDate === today
        return (
          <BottomSheet
            mounted={!!cancelTargetId}
            visible={cancelSheetVisible}
            onClose={handleCancelSheetClose}
            title="Cancel Visit"
            footer={
              <div className="flex gap-2">
                <Button variant="danger" fullWidth onClick={handleCancelConfirm}>Cancel Visit</Button>
                <Button variant="secondary" fullWidth onClick={handleCancelSheetClose}>Keep It</Button>
              </div>
            }
          >
            <div className="px-5 py-4 space-y-4">
              <div className="flex flex-col gap-4">
                {visitor?.avatar ? (
                  <img src={visitor.avatar} alt={visitor?.name} className="w-full h-52 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="w-full h-52 rounded-xl bg-surface-secondary flex items-center justify-center border border-border">
                    <i className="ri-user-line text-5xl text-text-tertiary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{visitor?.name ?? 'Visitor'}</p>
                  {visitor?.company && <p className="text-xs text-text-secondary mt-0.5">{visitor.company}</p>}
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
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
              <p className="text-xs text-text-secondary">This cannot be undone.</p>
            </div>
          </BottomSheet>
        )
      })()}

    </div>
  )
}
