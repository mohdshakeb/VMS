// ─────────────────────────────────────────────────────────────────────────────
// Location Admin Dashboard — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// No responsive prefixes — every class here describes the mobile layout as-is.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getNotificationsForRole } from '@/store/notificationStore'
import KpiCardV2 from '@/components/KpiCardV2'
import ComplianceCard from '@/components/facility/ComplianceCard'
import EmptyState from '@/components/common/EmptyState'
import { formatRelativeTime } from '@/utils/helpers'
import { PROTOTYPE_NOW } from '@/data/facilityData'
import { scopeToLocationAdmin } from '@/utils/facilityHelpers'

const TYPE_ICONS: Record<string, string> = {
  'walk-in-approval':              'ri-walk-line',
  'visit-confirmed':               'ri-check-double-line',
  'visit-rejected':                'ri-close-circle-line',
  'visitor-arrived':               'ri-map-pin-user-line',
  'visitor-checked-out':           'ri-logout-box-line',
  'new-pending-request':           'ri-file-add-line',
  'compliance-window-open':        'ri-calendar-check-line',
  'compliance-deadline-reminder':  'ri-alarm-warning-line',
  'compliance-submitted':          'ri-shield-check-line',
  'compliance-overdue':            'ri-error-warning-line',
  'compliance-missed':             'ri-close-circle-line',
  'sbu-edited':                    'ri-edit-2-line',
}

const TYPE_COLORS: Record<string, string> = {
  'walk-in-approval':              'text-pending bg-pending-surface',
  'visit-confirmed':               'text-confirmed bg-confirmed-surface',
  'visit-rejected':                'text-rejected bg-rejected-surface',
  'visitor-arrived':               'text-on-premises bg-on-premises-surface',
  'visitor-checked-out':           'text-completed bg-completed-surface',
  'new-pending-request':           'text-active bg-active-surface',
  'compliance-window-open':        'text-active bg-active-surface',
  'compliance-deadline-reminder':  'text-pending bg-pending-surface',
  'compliance-submitted':          'text-confirmed bg-confirmed-surface',
  'compliance-overdue':            'text-rejected bg-rejected-surface',
  'compliance-missed':             'text-rejected bg-rejected-surface',
  'sbu-edited':                    'text-pending bg-pending-surface',
}

const MONTH_LABEL = PROTOTYPE_NOW.toLocaleString('default', { month: 'long', year: 'numeric' })

export default function LocationAdminDashboardMobile() {
  const navigate = useNavigate()
  const allFacilities = useFacilityStore((s) => s.facilities)
  const facilities = useMemo(() => scopeToLocationAdmin(allFacilities), [allFacilities])
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)

  const facilityNotifications = getNotificationsForRole(notifications, currentRole)

  const dueThisMonth = facilities.filter((f) => f.complianceStatus === 'pending' || f.complianceStatus === 'draft').length
  const draftsPending = facilities.filter((f) => f.complianceStatus === 'draft').length
  const overdue = facilities.filter((f) => f.complianceStatus === 'overdue').length

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-4">

          {/* KPI cards — horizontal scroll */}
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
            <div className="flex gap-2.5">
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="My Facilities"
                  info="Assigned to you"
                  value={facilities.length}
                  icon="ri-building-2-line"
                  color="blue"
                  showInfo
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Due this month"
                  info="Pending or draft"
                  value={dueThisMonth}
                  icon="ri-calendar-close-line"
                  color="yellow"
                  showInfo
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Drafts pending"
                  info="In progress"
                  value={draftsPending}
                  icon="ri-edit-2-line"
                  color="yellow"
                  showInfo
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Overdue"
                  info="Past cut-off date"
                  value={overdue}
                  icon="ri-alarm-warning-line"
                  color="red"
                  showInfo
                />
              </div>
              <div className="w-4 shrink-0" />
            </div>
          </div>

          {/* Compliance this month */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <i className="ri-shield-check-line text-text-tertiary text-base shrink-0" />
              <p className="text-sm font-semibold text-text-primary flex-1">Compliance — {MONTH_LABEL}</p>
            </div>
            <div className="p-3 space-y-2">
              {facilities.length === 0 ? (
                <EmptyState icon="ri-building-2-line" title="No facilities assigned" />
              ) : (
                facilities.map((facility) => {
                  const record = [...complianceRecords]
                    .filter((r) => r.facilityId === facility.id)
                    .sort((a, b) => b.year - a.year || b.month - a.month)[0]
                  return (
                    <ComplianceCard
                      key={facility.id}
                      facility={facility}
                      recordId={record?.id}
                      submittedAt={record?.submittedAt}
                      submittedBy={record?.submittedBy}
                      month={record?.month}
                      year={record?.year}
                    />
                  )
                })
              )}
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <i className="ri-notification-3-line text-text-tertiary text-base shrink-0" />
              <p className="text-sm font-semibold text-text-primary flex-1">Notifications</p>
            </div>
            <div>
              {facilityNotifications.length === 0 ? (
                <EmptyState icon="ri-notification-off-line" title="No notifications" />
              ) : (
                [...facilityNotifications]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 4)
                  .map((notification, idx) => {
                    const icon = TYPE_ICONS[notification.type] ?? 'ri-notification-3-line'
                    const colorClass = TYPE_COLORS[notification.type] ?? 'text-text-secondary bg-surface-secondary'
                    return (
                      <div key={notification.id}>
                        {idx > 0 && <div className="h-px bg-surface-secondary mx-4" />}
                        <button
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.type === 'compliance-submitted' || notification.type === 'sbu-edited' || notification.type === 'compliance-overdue' || notification.type === 'compliance-missed') {
                              navigate(notification.recordId ? `/facility/compliance/record/${notification.recordId}` : '/facility/compliance')
                            } else if (notification.type === 'compliance-window-open' || notification.type === 'compliance-deadline-reminder') {
                              navigate('/facility/compliance')
                            }
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors active:bg-surface ${!notification.read ? 'bg-brand-light/20' : ''}`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                            <i className={`${icon} text-base`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs ${!notification.read ? 'font-semibold' : 'font-medium'} text-text-primary leading-tight`}>
                                {notification.title}
                              </p>
                              <span className="text-[10px] text-text-tertiary whitespace-nowrap shrink-0">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                          </div>
                          {!notification.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                          )}
                        </button>
                      </div>
                    )
                  })
              )}
            </div>
            <div className="border-t border-border-light px-4 py-2.5">
              <button
                onClick={openNotificationsModal}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand py-1"
              >
                Show all <i className="ri-arrow-right-s-line text-sm" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
