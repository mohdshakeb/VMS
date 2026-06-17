import { NavLink } from 'react-router-dom'

interface NotificationBellProps {
  unreadCount: number
  onClick?: () => void
  to?: string
  className?: string
}

export default function NotificationBell({ unreadCount, onClick, to, className }: NotificationBellProps) {
  const classes = `relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-secondary transition-colors ${className ?? ''}`

  const badge = unreadCount > 0 && (
    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white leading-none">
      {unreadCount}
    </span>
  )

  if (to) {
    return (
      <NavLink to={to} className={classes}>
        <i className="ri-notification-3-line text-xl text-text-secondary" />
        {badge}
      </NavLink>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      <i className="ri-notification-3-line text-xl text-text-secondary" />
      {badge}
    </button>
  )
}
