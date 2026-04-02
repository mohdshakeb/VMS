import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import type { Role } from '@/types/user'
import logoUrl from '@/assets/Logo.svg'

// Maps child route prefixes to their parent nav path so the correct item stays highlighted
const childToParentNav: Record<string, string> = {
  '/front-desk/check-in': '/front-desk/dashboard',
  '/front-desk/check-out': '/front-desk/dashboard',
}

function getActiveNavPath(pathname: string): string {
  for (const [prefix, parent] of Object.entries(childToParentNav)) {
    if (pathname.startsWith(prefix)) return parent
  }
  return pathname
}

interface NavItem {
  label: string
  path: string
  icon: string
}

const navByRole: Record<Role, NavItem[]> = {
  'front-desk': [
    { label: 'Dashboard', path: '/front-desk/dashboard', icon: 'ri-home-2-line' },
    { label: 'Visit Requests', path: '/front-desk/visit-requests', icon: 'ri-file-list-3-line' },
    { label: 'Visit History', path: '/front-desk/visit-history', icon: 'ri-calendar-schedule-line' },
  ],
  employee: [
    { label: 'My Visits', path: '/employee/visits', icon: 'ri-calendar-check-line' },
    { label: 'Approvals', path: '/employee/approve', icon: 'ri-checkbox-circle-line' },
  ],
  'visitor-manager': [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'ri-home-2-line' },
    { label: 'Reports', path: '/manager/reports', icon: 'ri-bar-chart-box-line' },
  ],
}

const roleLabels: Record<Role, string> = {
  'front-desk': 'Front Desk',
  employee: 'Employee',
  'visitor-manager': 'Visitor Manager',
}

export default function Sidebar() {
  const { currentRole, currentEmployeeId } = useAuthStore()
  const location = useLocation()
  const activePath = getActiveNavPath(location.pathname)

  const items = navByRole[currentRole]
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const initials = currentEmployee?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2) ?? '??'

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Logo */}
      <div className="px-5 pt-4 pb-8 shrink-0">
        <img src={logoUrl} alt="GMMCO — CKA Birla Group" className="h-10 w-auto" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((item) => {
          const isActive = activePath === item.path
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150 ${isActive
                  ? 'bg-brand-red-900'
                  : 'hover:bg-white/5'
                  }`}
              >
                <i
                  className={`${item.icon} text-[20px] leading-none shrink-0 ${isActive ? 'text-brand-red-400' : 'text-zinc-400'
                    }`}
                />
                <span className={isActive ? 'text-white' : 'text-zinc-300'}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-zinc-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/5">
          {/* Avatar */}
          <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
            <span className="text-xs font-bold text-zinc-200">{initials}</span>
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {currentEmployee?.name ?? 'Unknown User'}
            </p>
            <p className="text-xs text-zinc-500 leading-tight mt-0.5">
              {roleLabels[currentRole]}
            </p>
          </div>

          {/* Chevron */}
          <i className="ri-arrow-right-s-line text-xl text-zinc-500 shrink-0" />
        </button>
      </div>
    </div>
  )
}
