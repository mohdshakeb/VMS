import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import { useVisitStore } from '@/store/visitStore'
import type { Role } from '@/types/user'
import logoBlackUrl from '@/assets/logoBlack.svg'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'

interface MobileNavItem {
  label: string
  path: string
  icon: string
  activeIcon: string
}

// Mirrors the desktop sidebar nav exactly
const mobileNavByRole: Record<Role, MobileNavItem[]> = {
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

const roleHomeRoutes: Record<Role, string> = {
  'front-desk': '/front-desk/dashboard',
  employee: '/employee/visits',
  'branch-admin': '/manager/dashboard',
}

// Routes that take over the full screen (no sidebar, no nav bars)
const FULL_SCREEN_ROUTES = ['/front-desk/walk-in']

export default function AppLayout() {
  const { currentRole, currentEmployeeId, currentLocationId, setCurrentLocation } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location.pathname)
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole, currentRole === 'employee' ? currentEmployeeId : undefined)
  const { toastMessage, clearToast } = useVisitStore()

  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const currentLocation = locations.find((l) => l.id === currentLocationId)
  const initials = currentEmployee?.name.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? '??'

  const [locationSheetMounted, setLocationSheetMounted] = useState(false)
  const [locationSheetVisible, setLocationSheetVisible] = useState(false)

  function openLocationSheet() {
    setLocationSheetMounted(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setLocationSheetVisible(true))
    })
  }

  function closeLocationSheet() {
    setLocationSheetVisible(false)
    setTimeout(() => setLocationSheetMounted(false), 260)
  }

  // Navigate to role home only when the role actually changes (not on mount)
  const prevRole = useRef<Role>(currentRole)
  useEffect(() => {
    if (prevRole.current !== currentRole) {
      prevRole.current = currentRole
      navigate(roleHomeRoutes[currentRole])
    }
  }, [currentRole, navigate])

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(clearToast, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, clearToast])

  const mobileItems = mobileNavByRole[currentRole]

  return (
    <div className="flex h-dvh bg-chrome-bg">
      {/* Desktop sidebar — hidden on full-screen routes */}
      {!isFullScreen && (
        <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0">
          <Sidebar />
        </aside>
      )}

      {/* Desktop: padded + rounded content panel (full padding on all sides when no sidebar) */}
      <div className={`hidden md:flex md:flex-1 overflow-hidden ${isFullScreen ? 'md:p-2' : 'md:pt-2 md:pr-2 md:pb-2'}`}>
        <div className="flex flex-col flex-1 bg-white overflow-hidden rounded-xl">
          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>

          {/* Toast */}
          {toastMessage && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]">
              <div className="rounded-xl bg-chrome-toast px-4 py-3 text-sm text-white shadow-lg">
                {toastMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout — dark chrome shell with inset content area */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden bg-chrome-bg">

        {/* Main content area — 8px inset from top and sides, sits above bottom nav */}
        <div className={`flex flex-col flex-1 overflow-hidden ${isFullScreen ? '' : 'mt-2 mx-2 rounded-xl'}`}>

          {/* Mobile top bar — inside content area with white background */}
          {!isFullScreen && (
            <header className="flex items-center gap-2 px-4 py-2 bg-white border-b border-border shrink-0">
              {/* Left: logo + location selector */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-9 w-auto shrink-0" />

                {/* Location pill — opens bottom sheet on tap */}
                <button
                  onClick={openLocationSheet}
                  className="flex items-center gap-1 bg-surface-secondary hover:bg-surface-tertiary active:bg-surface-tertiary rounded-lg px-2.5 h-8 transition-colors duration-150 min-w-0"
                >
                  <i className="ri-map-pin-2-fill text-[11px] text-text-tertiary shrink-0" />
                  <span className="text-xs font-medium text-text-primary truncate max-w-24">
                    {currentLocation ? (currentLocation.name.split(' — ')[0]) : '—'}
                  </span>
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
                <div className="h-8 w-8 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-text-primary">{initials}</span>
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>

        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] bottom-16">
            <div className="rounded-xl bg-chrome-toast px-4 py-3 text-sm text-white shadow-lg">
              {toastMessage}
            </div>
          </div>
        )}

        {/* Mobile bottom nav — below the main content area, in the dark chrome zone */}
        {!isFullScreen && (
          <nav className="bg-chrome-bg shrink-0 px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Tab items — same tokens as desktop sidebar active/inactive states */}
              {mobileItems.map((item) => (
                <NavLink key={item.path} to={item.path}>
                  {({ isActive }) => (
                    <div className="flex flex-col items-center gap-1 px-2 py-1.5">
                      {/* Background pill wraps only the icon */}
                      <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors duration-150 ${isActive ? 'bg-chrome-active-bg' : ''}`}>
                        <i className={`text-xl leading-none ${isActive ? `${item.activeIcon} text-chrome-active-text` : `${item.icon} text-chrome-text-muted`}`} />
                      </div>
                      <span className={`text-xs font-medium leading-none ${isActive ? 'text-chrome-active-text' : 'text-chrome-text-muted'}`}>{item.label}</span>
                    </div>
                  )}
                </NavLink>
              ))}

              {/* Walk-in CTA — front-desk role only */}
              {currentRole === 'front-desk' && (
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
        )}
      </div>

      {/* Location bottom sheet — mobile only */}
      {locationSheetMounted && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeLocationSheet}
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            style={{
              opacity: locationSheetVisible ? 1 : 0,
              transition: locationSheetVisible
                ? 'opacity 240ms ease-out'
                : 'opacity 220ms ease-in',
            }}
          />

          {/* Sheet */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl"
            style={{
              transform: locationSheetVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: locationSheetVisible
                ? 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)'
                : 'transform 240ms cubic-bezier(0.4, 0, 1, 1)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-3 border-b border-border-light">
              <p className="text-sm font-semibold text-text-primary">Select Location</p>
            </div>

            {/* Location list */}
            <div className="px-3 pt-2 pb-8">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => { setCurrentLocation(loc.id); closeLocationSheet() }}
                  className="w-full flex items-center gap-3 px-3 py-3.5 text-left rounded-xl transition-colors active:bg-surface-secondary hover:bg-surface-secondary"
                >
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${loc.id === currentLocationId ? 'bg-brand/10' : 'bg-surface-secondary'}`}>
                    <i className={`ri-map-pin-2-fill text-sm ${loc.id === currentLocationId ? 'text-brand' : 'text-text-tertiary'}`} />
                  </div>
                  <span className={`flex-1 text-sm min-w-0 truncate ${loc.id === currentLocationId ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                    {loc.name}
                  </span>
                  {loc.id === currentLocationId && (
                    <i className="ri-check-line text-brand text-base shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
