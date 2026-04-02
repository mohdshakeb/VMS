import { useNavigate } from 'react-router-dom'
import { useNotificationStore, getNotificationsForRole } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import Card from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import { formatRelativeTime } from '@/utils/helpers'

const typeIcons: Record<string, string> = {
  'walk-in-approval': 'ri-walk-line',
  'visit-confirmed': 'ri-check-double-line',
  'visit-rejected': 'ri-close-circle-line',
  'visitor-arrived': 'ri-map-pin-user-line',
  'visitor-checked-out': 'ri-logout-box-line',
  'new-pending-request': 'ri-file-add-line',
}

const typeColors: Record<string, string> = {
  'walk-in-approval': 'text-pending bg-pending-light',
  'visit-confirmed': 'text-confirmed bg-confirmed-light',
  'visit-rejected': 'text-rejected bg-rejected-light',
  'visitor-arrived': 'text-on-premises bg-on-premises-light',
  'visitor-checked-out': 'text-completed bg-completed-light',
  'new-pending-request': 'text-active bg-active-light',
}

export default function Notifications() {
  const navigate = useNavigate()
  const { currentRole, currentEmployeeId } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const filtered = getNotificationsForRole(
    notifications,
    currentRole,
    currentRole === 'employee' ? currentEmployeeId : undefined
  )

  const unreadCount = filtered.filter((n) => !n.read).length

  function handleAction(notification: typeof filtered[0]) {
    markAsRead(notification.id)

    if (notification.type === 'walk-in-approval' && currentRole === 'employee') {
      navigate(`/employee/approve/${notification.visitId}`)
    } else if (notification.type === 'visit-confirmed' && currentRole === 'front-desk') {
      navigate('/front-desk/dashboard')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Notifications"
        actions={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead(currentRole, currentRole === 'employee' ? currentEmployeeId : undefined)}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 max-w-lg mx-auto w-full">

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <i className="ri-notification-off-line text-3xl mb-2" />
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const icon = typeIcons[notification.type] ?? 'ri-notification-3-line'
            const colorClass = typeColors[notification.type] ?? 'text-text-secondary bg-surface-secondary'

            return (
              <Card
                key={notification.id}
                className={`${!notification.read ? 'border-brand/20 bg-brand-light/20' : ''}`}
                onClick={() => handleAction(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <i className={`${icon} text-lg`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-text-primary`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                    {notification.actionRequired && !notification.read && (
                      <p className="text-xs text-brand font-medium mt-1.5">
                        <i className="ri-arrow-right-s-line" /> Action required
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
