import { NavLink } from 'react-router-dom'
import logoBlackUrl from '@/assets/logoBlack.svg'

interface MobileTopBarProps {
  locationLabel: string
  initials: string
  unreadCount: number
  onLocationPress: () => void
  onProfilePress: () => void
}

export default function MobileTopBar({
  locationLabel,
  initials,
  unreadCount,
  onLocationPress,
  onProfilePress,
}: MobileTopBarProps) {
  return (
    <header className="flex items-center gap-2 px-4 py-2 bg-white border-b border-border shrink-0">
      {/* Left: logo + location selector */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-9 w-auto shrink-0" />

        <button
          onClick={onLocationPress}
          className="flex items-center gap-1 bg-surface-secondary hover:bg-surface-tertiary active:bg-surface-tertiary rounded-lg px-2.5 h-8 transition-colors duration-150 min-w-0"
        >
          <i className="ri-map-pin-2-fill text-[11px] text-text-tertiary shrink-0" />
          <span className="text-xs font-medium text-text-primary truncate max-w-24">{locationLabel}</span>
          <i className="ri-arrow-down-s-line text-xs text-text-tertiary shrink-0" />
        </button>
      </div>

      {/* Right: notification + avatar */}
      <div className="flex items-center gap-1 shrink-0">
        <NavLink to="/notifications" className="relative p-2">
          <i className="ri-notification-3-line text-xl text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </NavLink>
        <button
          onClick={onProfilePress}
          className="h-8 w-8 rounded-full bg-surface-secondary flex items-center justify-center shrink-0 active:bg-surface-tertiary transition-colors duration-150"
        >
          <span className="text-xs font-medium text-text-primary">{initials}</span>
        </button>
      </div>
    </header>
  )
}
