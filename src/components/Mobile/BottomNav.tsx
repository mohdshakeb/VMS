import { NavLink } from 'react-router-dom'
import type { Role } from '@/types/user'

const ctaByRole: Partial<Record<Role, { label: string; path: string; icon: string }>> = {
  'front-desk': { label: 'Walk-in', path: '/front-desk/walk-in', icon: 'ri-user-add-line' },
  employee: { label: 'New Visit', path: '/employee/create-visit', icon: 'ri-calendar-add-line' },
  'central-admin': { label: 'New Visit', path: '/employee/create-visit', icon: 'ri-calendar-add-line' },
  // location-admin has no CTA — compliance starts from dashboard
}

interface MobileNavItem {
  label: string
  path: string
  icon: string
  activeIcon: string
}

const navByRole: Record<Role, MobileNavItem[]> = {
  'front-desk': [
    { label: 'Home', path: '/front-desk/dashboard', icon: 'ri-home-2-line', activeIcon: 'ri-home-2-fill' },
    { label: 'History', path: '/front-desk/visit-history', icon: 'ri-calendar-schedule-line', activeIcon: 'ri-calendar-schedule-fill' },
  ],
  employee: [
    { label: 'Home', path: '/employee/dashboard', icon: 'ri-home-2-line', activeIcon: 'ri-home-2-fill' },
    { label: 'My Visits', path: '/employee/visits', icon: 'ri-calendar-check-line', activeIcon: 'ri-calendar-check-fill' },
  ],
  'central-admin': [
    { label: 'Home', path: '/manager/my-visits', icon: 'ri-home-2-line', activeIcon: 'ri-home-2-fill' },
    { label: 'Insights', path: '/manager/dashboard', icon: 'ri-bar-chart-box-line', activeIcon: 'ri-bar-chart-box-fill' },
    { label: 'History', path: '/manager/visit-history', icon: 'ri-calendar-schedule-line', activeIcon: 'ri-calendar-schedule-fill' },
  ],
  'location-admin': [
    { label: 'Home',       path: '/facility/dashboard',   icon: 'ri-home-2-line',     activeIcon: 'ri-home-2-fill' },
    { label: 'Facilities', path: '/facility/facilities',  icon: 'ri-building-2-line', activeIcon: 'ri-building-2-fill' },
    { label: 'History',    path: '/facility/compliance',  icon: 'ri-camera-line',     activeIcon: 'ri-camera-fill' },
  ],
}

interface BottomNavProps {
  role: Role
}

export default function BottomNav({ role }: BottomNavProps) {
  const items = navByRole[role] ?? []
  const hasCTA = Boolean(ctaByRole[role])

  return (
    <nav className="bg-chrome-bg shrink-0 px-3 py-2">
      <div className="flex items-center gap-2">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={hasCTA ? '' : 'flex-1'}>
            {({ isActive }) => (
              <div className={`flex flex-col items-center gap-1 py-1.5 ${hasCTA ? 'px-2' : 'w-full px-1'}`}>
                <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors duration-150 ${isActive ? 'bg-chrome-active-bg' : ''}`}>
                  <i className={`text-xl leading-none ${isActive ? `${item.activeIcon} text-chrome-active-text` : `${item.icon} text-chrome-text-muted`}`} />
                </div>
                <span className={`text-xs font-medium leading-none ${isActive ? 'text-chrome-active-text' : 'text-chrome-text-muted'}`}>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {ctaByRole[role] && (
          <NavLink
            to={ctaByRole[role]!.path}
            className="ml-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover rounded-xl px-5 py-3 text-sm font-medium text-white transition-colors duration-150"
          >
            <i className={`${ctaByRole[role]!.icon} text-base leading-none`} />
            {ctaByRole[role]!.label}
          </NavLink>
        )}
      </div>
    </nav>
  )
}
