import { useNavigate, NavLink } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getNotificationsForRole, getUnreadCount } from '@/store/notificationStore'
import KpiCardV2 from '@/components/KpiCardV2'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import ComplianceCard from '@/components/facility/ComplianceCard'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import { formatRelativeTime } from '@/utils/helpers'

const TYPE_ICONS: Record<string, string> = {
  'walk-in-approval':    'ri-walk-line',
  'visit-confirmed':     'ri-check-double-line',
  'visit-rejected':      'ri-close-circle-line',
  'visitor-arrived':     'ri-map-pin-user-line',
  'visitor-checked-out': 'ri-logout-box-line',
  'new-pending-request': 'ri-file-add-line',
}

const TYPE_COLORS: Record<string, string> = {
  'walk-in-approval':    'text-pending bg-pending-surface',
  'visit-confirmed':     'text-confirmed bg-confirmed-surface',
  'visit-rejected':      'text-rejected bg-rejected-surface',
  'visitor-arrived':     'text-on-premises bg-on-premises-surface',
  'visitor-checked-out': 'text-completed bg-completed-surface',
  'new-pending-request': 'text-active bg-active-surface',
}

const now = new Date()
const MONTH_LABEL = now.toLocaleString('default', { month: 'long', year: 'numeric' })

export default function BuildingAdminDashboard() {
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const facilityNotifications = getNotificationsForRole(notifications, currentRole)
  const unreadCount = getUnreadCount(notifications, currentRole)

  const dueThisMonth = buildings.filter((b) => b.complianceStatus === 'pending' || b.complianceStatus === 'draft').length
  const draftsPending = buildings.filter((b) => b.complianceStatus === 'draft').length
  const submitted = buildings.filter((b) => b.complianceStatus === 'submitted').length

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Dashboard"
        actions={
          <div className="flex items-center gap-2">
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
            <Button
              size="md"
              icon="ri-add-large-fill"
              onClick={() => navigate('/facility/onboarding/new')}
              className="ml-1"
            >
              New Building
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-10 md:px-6 md:pt-6 flex flex-col gap-4 md:gap-5 min-h-full">

          {/* Mobile quick actions */}
          <div className="flex gap-2 md:hidden">
            <Button
              size="md"
              icon="ri-add-large-fill"
              fullWidth
              onClick={() => navigate('/facility/onboarding/new')}
            >
              New Building
            </Button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCardV2
              label="My Buildings"
              info="Assigned to you"
              value={buildings.length}
              icon="ri-building-2-line"
              color="blue"
            />
            <KpiCardV2
              label="Due this month"
              info="Pending or draft"
              value={dueThisMonth}
              icon="ri-calendar-close-line"
              color="yellow"
            />
            <KpiCardV2
              label="Drafts pending"
              info="In progress"
              value={draftsPending}
              icon="ri-edit-2-line"
              color="yellow"
            />
            <KpiCardV2
              label="Submitted"
              info="This month"
              value={submitted}
              icon="ri-checkbox-circle-line"
              color="green"
            />
          </div>

          {/* Two-column layout: Compliance (3) + Notifications (2) */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-5">

            {/* Compliance this month — left column */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                  <i className="ri-shield-check-line text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Compliance — {MONTH_LABEL}</p>
                  <CountBadge count={buildings.length} />
                </div>
                <div className="p-3 space-y-2">
                  {buildings.map((building) => {
                    const record = complianceRecords.find(
                      (r) => r.buildingId === building.id && r.month === now.getMonth() + 1 && r.year === now.getFullYear()
                    )
                    return (
                      <ComplianceCard
                        key={building.id}
                        building={building}
                        recordId={record?.id}
                        submittedAt={record?.submittedAt}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Notifications — right column, sticky */}
            <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                  <i className="ri-notification-3-line text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Notifications</p>
                  {unreadCount > 0 && <CountBadge count={unreadCount} />}
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead(currentRole)}
                      className="text-xs text-brand font-medium hover:text-brand-hover transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div>
                  {facilityNotifications.length === 0 ? (
                    <EmptyState icon="ri-notification-off-line" title="No notifications" />
                  ) : (
                    facilityNotifications.slice(0, 8).map((notification, idx) => {
                      const icon = TYPE_ICONS[notification.type] ?? 'ri-notification-3-line'
                      const colorClass = TYPE_COLORS[notification.type] ?? 'text-text-secondary bg-surface-secondary'
                      return (
                        <div key={notification.id}>
                          {idx > 0 && <div className="h-px bg-surface-secondary mx-4" />}
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface ${!notification.read ? 'bg-brand-light/20' : ''}`}
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
                              {notification.actionRequired && !notification.read && (
                                <p className="text-[11px] text-brand font-medium mt-1">
                                  <i className="ri-arrow-right-s-line" /> Action required
                                </p>
                              )}
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

                {facilityNotifications.length > 8 && (
                  <div className="border-t border-border-light px-4 py-2.5">
                    <NavLink
                      to="/notifications"
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors py-1"
                    >
                      View all <i className="ri-arrow-down-s-line text-sm" />
                    </NavLink>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
