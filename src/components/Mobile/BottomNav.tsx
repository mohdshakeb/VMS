import { NavLink } from 'react-router-dom'
import type { Role } from '@/types/user'

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
    { label: 'My Visits', path: '/employee/visits', icon: 'ri-calendar-check-line', activeIcon: 'ri-calendar-check-fill' },
    { label: 'Approvals', path: '/employee/approve', icon: 'ri-checkbox-circle-line', activeIcon: 'ri-checkbox-circle-fill' },
  ],
  'branch-admin': [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'ri-home-2-line', activeIcon: 'ri-home-2-fill' },
    { label: 'Reports', path: '/manager/reports', icon: 'ri-bar-chart-box-line', activeIcon: 'ri-bar-chart-box-fill' },
  ],
}

interface BottomNavProps {
  role: Role
}

export default function BottomNav({ role }: BottomNavProps) {
  const items = navByRole[role]

  return (
    <nav className="bg-chrome-bg shrink-0 px-3 py-2">
      <div className="flex items-center gap-2">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 px-2 py-1.5">
                <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors duration-150 ${isActive ? 'bg-chrome-active-bg' : ''}`}>
                  <i className={`text-xl leading-none ${isActive ? `${item.activeIcon} text-chrome-active-text` : `${item.icon} text-chrome-text-muted`}`} />
                </div>
                <span className={`text-xs font-medium leading-none ${isActive ? 'text-chrome-active-text' : 'text-chrome-text-muted'}`}>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {/* Walk-in CTA — front-desk role only */}
        {role === 'front-desk' && (
          <NavLink
            to="/front-desk/walk-in"
            className="ml-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover rounded-xl px-5 py-3 text-sm font-medium text-white transition-colors duration-150"
          >
            <i className="ri-user-add-line text-base leading-none" />
            Walk-in
          </NavLink>
        )}
      </div>
    </nav>
  )
}
