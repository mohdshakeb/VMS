import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore, getNotificationsForRole } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import type { Notification } from '@/types/notification'

const TYPE_ICONS: Record<string, string> = {
  'walk-in-approval':             'ri-walk-line',
  'visit-confirmed':              'ri-check-double-line',
  'visit-rejected':               'ri-close-circle-line',
  'visitor-arrived':              'ri-map-pin-user-line',
  'visitor-checked-out':          'ri-logout-box-line',
  'new-pending-request':          'ri-file-add-line',
  'compliance-window-open':       'ri-calendar-check-line',
  'compliance-deadline-reminder': 'ri-alarm-warning-line',
  'compliance-submitted':         'ri-shield-check-line',
  'compliance-overdue':           'ri-error-warning-line',
  'compliance-missed':            'ri-close-circle-line',
  'sbu-edited':                   'ri-edit-2-line',
}

const TYPE_COLORS: Record<string, string> = {
  'walk-in-approval':             'text-pending bg-pending-surface',
  'visit-confirmed':              'text-confirmed bg-confirmed-surface',
  'visit-rejected':               'text-rejected bg-rejected-surface',
  'visitor-arrived':              'text-on-premises bg-on-premises-surface',
  'visitor-checked-out':          'text-completed bg-completed-surface',
  'new-pending-request':          'text-active bg-active-surface',
  'compliance-window-open':       'text-active bg-active-surface',
  'compliance-deadline-reminder': 'text-pending bg-pending-surface',
  'compliance-submitted':         'text-confirmed bg-confirmed-surface',
  'compliance-overdue':           'text-rejected bg-rejected-surface',
  'compliance-missed':            'text-rejected bg-rejected-surface',
  'sbu-edited':                   'text-pending bg-pending-surface',
}

export default function NotificationsModal() {
  const navigate = useNavigate()
  const { currentRole } = useAuthStore()
  const modalOpen = useNotificationStore((s) => s.modalOpen)
  const closeNotificationsModal = useNotificationStore((s) => s.closeNotificationsModal)
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const filtered = [...getNotificationsForRole(notifications, currentRole)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const unreadCount = filtered.filter((n) => !n.read).length

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [modalOpen])

  useEffect(() => {
    if (!modalOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeNotificationsModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, closeNotificationsModal])

  function handleClick(n: Notification) {
    markAsRead(n.id)
    closeNotificationsModal()
    if (n.type === 'compliance-submitted' || n.type === 'sbu-edited' || n.type === 'compliance-overdue' || n.type === 'compliance-missed') {
      navigate(n.recordId ? `/facility/compliance/record/${n.recordId}` : '/facility/compliance')
    } else if (n.type === 'compliance-window-open' || n.type === 'compliance-deadline-reminder') {
      navigate('/facility/compliance')
    } else if (n.type === 'walk-in-approval') {
      navigate(`/employee/approve/${n.visitId}`)
    }
  }

  if (!modalOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={closeNotificationsModal}
      />

      {/* Sheet: bottom on mobile, centered on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-2xl shadow-xl max-h-[88dvh] md:inset-0 md:m-auto md:w-full md:max-w-sm md:max-h-[600px] md:rounded-2xl md:h-fit">

        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3.5 border-b border-border-light shrink-0 md:pt-3 md:pb-3">
          <p className="text-sm font-semibold text-text-primary flex-1">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead(currentRole)}
              className="text-xs text-brand font-medium hover:text-brand-hover transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={closeNotificationsModal}
            className="rounded-lg p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors -mr-1"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState icon="ri-notification-off-line" title="No notifications" className="py-16" iconClassName="text-3xl" titleClassName="text-sm" />
          ) : (
            filtered.map((n, idx) => {
              const icon = TYPE_ICONS[n.type] ?? 'ri-notification-3-line'
              const colorClass = TYPE_COLORS[n.type] ?? 'text-text-secondary bg-surface-secondary'
              return (
                <div key={n.id}>
                  {idx > 0 && <div className="h-px bg-surface-secondary mx-5" />}
                  <button
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface ${!n.read ? 'bg-brand-light/20' : ''}`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                      <i className={`${icon} text-base`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-text-primary leading-tight`}>
                          {n.title}
                        </p>
                        <span className="text-[11px] text-text-tertiary whitespace-nowrap shrink-0 mt-px">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                      {n.actionRequired && !n.read && (
                        <p className="text-xs text-brand font-medium mt-1.5">
                          <i className="ri-arrow-right-s-line" /> Action required
                        </p>
                      )}
                    </div>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-2" />
                    )}
                  </button>
                </div>
              )
            })
          )}
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </div>
      </div>
    </>
  )
}
