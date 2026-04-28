// ─────────────────────────────────────────────────────────────────────────────
// Employee Dashboard — Mobile
// No PageHeader — AppLayout's mobile top bar provides the chrome.
// No responsive prefixes — every class here describes the mobile layout as-is.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore, getPendingApprovals } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { visitors as seedVisitors } from '@/data/visitors'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import EmptyState from '@/components/common/EmptyState'
import { getLocalDateString, formatTime, getVisitTypeLabel } from '@/utils/helpers'

export default function EmployeeDashboardMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn } = useVisitStore()
  const { currentEmployeeId } = useAuthStore()
  const navigate = useNavigate()

  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const today = getLocalDateString()
  const myVisits = visits.filter((v) => v.hostEmployeeId === currentEmployeeId)
  const visitorMap = Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v]))

  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const firstName = currentEmployee?.name.split(' ')[0] ?? 'there'

  const pendingApprovals = getPendingApprovals(visits, currentEmployeeId)
  const onPremises = myVisits.filter((v) => v.status === 'checked-in' && v.scheduledDate === today)
  const todayConfirmed = myVisits.filter((v) => v.status === 'confirmed' && v.scheduledDate === today)
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
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-4">

          {/* Greeting */}
          <div className="pt-1">
            <p className="text-sm font-semibold text-text-primary">Good day, {firstName}</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-2">
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

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="bg-white rounded-xl border border-orange-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-orange-100">
                <p className="text-sm font-semibold text-text-primary flex-1">Needs Your Approval</p>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5">
                  {pendingApprovals.length}
                </span>
              </div>

              <div className="divide-y divide-border-light">
                {pendingApprovals.map((visit) => {
                  const visitor = visitorMap[visit.visitorId]
                  const isRejecting = rejectingId === visit.id
                  return (
                    <div key={visit.id}>
                      <div className="px-4 py-3 flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-surface-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {visitor?.avatar
                            ? <img src={visitor.avatar} alt="" className="h-full w-full object-cover" />
                            : <span className="text-xs font-medium text-text-secondary">
                                {visitor?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? '?'}
                              </span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{visitor?.name ?? 'Unknown'}</p>
                          {visitor?.company && (
                            <p className="text-xs text-text-secondary truncate">{visitor.company}</p>
                          )}
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {getVisitTypeLabel(visit.visitType)} · {formatTime(visit.scheduledTime)}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/employee/approve/${visit.id}`)}
                          className="text-xs text-brand font-medium shrink-0"
                        >
                          Details
                        </button>
                      </div>

                      {visit.notes && (
                        <div className="px-4 pb-2">
                          <p className="text-xs text-text-secondary italic">"{visit.notes}"</p>
                        </div>
                      )}

                      {!isRejecting ? (
                        <div className="flex border-t border-orange-100">
                          <button
                            onClick={() => handleApprove(visit.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-green-700 active:bg-green-50 transition-colors"
                          >
                            <i className="ri-check-line text-base" />
                            Approve
                          </button>
                          <div className="w-px bg-orange-100" />
                          <button
                            onClick={() => { setRejectingId(visit.id); setRejectReason('') }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-red-600 active:bg-red-50 transition-colors"
                          >
                            <i className="ri-close-line text-base" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 pb-3 pt-2 border-t border-orange-100 space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection…"
                            rows={2}
                            autoFocus
                            className="w-full text-sm rounded-lg border border-border-light px-3 py-2 text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(visit.id)}
                              disabled={!rejectReason.trim()}
                              className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 text-white disabled:opacity-40"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason('') }}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Today's Visits */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <p className="text-sm font-semibold text-text-primary flex-1">Today's Visits</p>
              <span className="text-xs text-text-tertiary font-medium">
                {onPremises.length + todayConfirmed.length}
              </span>
            </div>
            <div className="p-3 space-y-2">
              {onPremises.length === 0 && todayConfirmed.length === 0 ? (
                <EmptyState icon="ri-calendar-line" title="No visits today" className="py-8" iconClassName="text-2xl" titleClassName="text-sm" />
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

          {/* Coming Up */}
          {upcoming.length > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary flex-1">Coming Up</p>
                <span className="text-xs text-text-tertiary font-medium">{upcoming.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {upcoming.map((visit) => {
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
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
