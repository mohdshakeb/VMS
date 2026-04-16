import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
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
    { label: 'Visit History', path: '/front-desk/visit-history', icon: 'ri-calendar-schedule-line' },
  ],
  employee: [
    { label: 'My Visits', path: '/employee/visits', icon: 'ri-calendar-check-line' },
    { label: 'Approvals', path: '/employee/approve', icon: 'ri-checkbox-circle-line' },
  ],
  'branch-admin': [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'ri-home-2-line' },
    { label: 'Reports', path: '/manager/reports', icon: 'ri-bar-chart-box-line' },
  ],
}

const roleLabels: Record<Role, string> = {
  'front-desk': 'Front Desk',
  employee: 'Employee',
  'branch-admin': 'Branch Admin',
}

export default function Sidebar() {
  const { currentRole, currentEmployeeId, currentLocationId, setCurrentLocation, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const activePath = getActiveNavPath(location.pathname)

  const items = navByRole[currentRole]
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const currentLocation = locations.find((l) => l.id === currentLocationId)
  const initials = currentEmployee?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2) ?? '??'

  const [locationOpen, setLocationOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex h-full flex-col bg-chrome-bg">
      {/* Logo */}
      <div className="px-5 pt-4 pb-6 shrink-0">
        <img src={logoUrl} alt="GMMCO — CKA Birla Group" className="h-10 w-auto" />
      </div>

      {/* Location card */}
      <div ref={locationRef} className="shrink-0 px-3 pb-3 relative">
        <button
          onClick={() => setLocationOpen((o) => !o)}
          className="w-full flex items-center gap-2.5 bg-chrome-surface border border-chrome-border-subtle rounded-lg px-2 py-2 hover:border-chrome-border transition-colors text-left"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chrome-surface-hover">
            <i className="ri-map-pin-2-fill text-chrome-text text-md" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate leading-none">{currentLocation?.name ?? 'Select location'}</p>
            <p className="text-[11px] text-chrome-text-muted truncate mt-0.5">{currentLocation?.address ?? ''}</p>
          </div>
          <i className={`ri-arrow-down-s-line text-chrome-text-muted text-base shrink-0 transition-transform duration-150 ${locationOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown — opens downward */}
        {locationOpen && (
          <div className="absolute top-full left-3 right-3 -mt-1 bg-chrome-surface border border-chrome-border rounded-xl shadow-xl overflow-hidden z-30">
            {locations.map((loc, idx) => (
              <button
                key={loc.id}
                onClick={() => { setCurrentLocation(loc.id); setLocationOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-chrome-surface-hover ${idx > 0 ? 'border-t border-chrome-border' : ''}`}
              >
                <div className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg ${loc.id === currentLocationId ? 'bg-chrome-active-bg' : 'bg-chrome-surface-hover'}`}>
                  <i className={`ri-building-2-line text-sm ${loc.id === currentLocationId ? 'text-chrome-active-text' : 'text-chrome-text-muted'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate ${loc.id === currentLocationId ? 'text-chrome-active-text' : 'text-chrome-text'}`}>{loc.name}</p>
                  <p className="text-[11px] text-chrome-text-faint truncate mt-0.5">{loc.address}</p>
                </div>
                {loc.id === currentLocationId && (
                  <i className="ri-check-line text-chrome-active-text text-sm shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 mt-3 flex flex-col gap-1">
        {items.map((item) => {
          const isActive = activePath === item.path
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-150 ${isActive
                  ? 'bg-chrome-active-bg'
                  : 'hover:bg-white/5'
                  }`}
              >
                <i
                  className={`${item.icon} text-[20px] leading-none shrink-0 ${isActive ? 'text-chrome-active-text' : 'text-chrome-text-muted'}`}
                />
                <span className={isActive ? 'text-white' : 'text-chrome-text'}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-chrome-border-subtle p-4">
        <div className="flex items-center gap-3 rounded-lg p-1">
          {/* Avatar */}
          <div className="h-9 w-9 shrink-0 rounded-full bg-chrome-surface-hover flex items-center justify-center overflow-hidden">
            <span className="text-xs font-medium text-chrome-text">{initials}</span>
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white leading-tight truncate">
              {currentEmployee?.name ?? 'Unknown User'}
            </p>
            <p className="text-xs text-chrome-text-faint leading-tight mt-0.5">
              {roleLabels[currentRole]}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/login') }}
            title="Sign out"
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-150 shrink-0"
          >
            <i className="ri-logout-box-r-line text-base text-chrome-text-muted hover:text-chrome-text" />
          </button>
        </div>
      </div>
    </div>
  )
}
