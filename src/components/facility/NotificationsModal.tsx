import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore, getNotificationsForRole } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatRelativeTime } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import BottomSheet from '@/components/Mobile/BottomSheet'
import Modal from '@/components/Modal'
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
  const isMobile = useIsMobile()
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

  const markAllReadButton = unreadCount > 0 ? (
    <button
      onClick={() => markAllRead(currentRole)}
      className="text-xs text-brand font-medium hover:text-brand-hover transition-colors"
    >
      Mark all read
    </button>
  ) : undefined

  const list = (
    <>
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
    </>
  )

  if (isMobile) {
    return (
      <BottomSheet
        mounted={modalOpen}
        visible={modalOpen}
        onClose={closeNotificationsModal}
        title="Notifications"
        headerAction={markAllReadButton}
      >
        {list}
      </BottomSheet>
    )
  }

  return (
    <Modal open={modalOpen} onClose={closeNotificationsModal} title="Notifications" size="md">
      {unreadCount > 0 && (
        <div className="flex justify-end -mt-1 mb-3">
          {markAllReadButton}
        </div>
      )}
      <div className="-mx-5 -mb-3 max-h-[440px] overflow-y-auto">
        {list}
      </div>
    </Modal>
  )
}
