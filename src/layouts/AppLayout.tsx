import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import { useVisitStore } from '@/store/visitStore'
import type { Role } from '@/types/user'
import logoUrl from '@/assets/Logo.svg'

interface MobileNavItem {
  label: string
  path: string
  icon: string
  activeIcon: string
}

const mobileNavByRole: Record<Role, MobileNavItem[]> = {
  'front-desk': [
    { label: 'Dashboard', path: '/front-desk/dashboard', icon: 'ri-dashboard-line', activeIcon: 'ri-dashboard-fill' },
    { label: 'Requests', path: '/front-desk/visit-requests', icon: 'ri-file-list-3-line', activeIcon: 'ri-file-list-3-fill' },
    { label: 'Alerts', path: '/notifications', icon: 'ri-notification-3-line', activeIcon: 'ri-notification-3-fill' },
  ],
  employee: [
    { label: 'Visits', path: '/employee/visits', icon: 'ri-calendar-check-line', activeIcon: 'ri-calendar-check-fill' },
    { label: 'Alerts', path: '/notifications', icon: 'ri-notification-3-line', activeIcon: 'ri-notification-3-fill' },
  ],
  'visitor-manager': [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'ri-bar-chart-box-line', activeIcon: 'ri-bar-chart-box-fill' },
    { label: 'Alerts', path: '/notifications', icon: 'ri-notification-3-line', activeIcon: 'ri-notification-3-fill' },
  ],
}

const roleHomeRoutes: Record<Role, string> = {
  'front-desk': '/front-desk/dashboard',
  employee: '/employee/visits',
  'visitor-manager': '/manager/dashboard',
}

// Routes that take over the full screen (no sidebar, no nav bars)
const FULL_SCREEN_ROUTES = ['/front-desk/walk-in']

export default function AppLayout() {
  const { currentRole, currentEmployeeId } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location.pathname)
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole, currentRole === 'employee' ? currentEmployeeId : undefined)
  const { toastMessage, clearToast } = useVisitStore()


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
    <div className="flex h-dvh bg-zinc-950">
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
              <div className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg">
                {toastMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout — full bleed, no rounding */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {/* Mobile top bar — hidden on full-screen routes */}
        {!isFullScreen && (
          <header className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 shrink-0">
            <img src={logoUrl} alt="GMMCO — CKA Birla Group" className="h-8 w-auto" />
            <NavLink to="/notifications" className="relative p-2">
              <i className="ri-notification-3-line text-xl text-zinc-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </header>
        )}

        <main className={`flex-1 overflow-y-auto ${isFullScreen ? '' : 'pb-20'}`}>
          <Outlet />
        </main>

        {/* Toast */}
        {toastMessage && (
          <div className={`fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] ${isFullScreen ? 'bottom-20' : 'bottom-20'}`}>
            <div className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg">
              {toastMessage}
            </div>
          </div>
        )}

        {/* Mobile bottom bar — hidden on full-screen routes */}
        {!isFullScreen && (
          <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-200">
            <div className="flex items-center justify-around px-2 py-1">
              {mobileItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors duration-150 ${isActive ? 'text-brand-red-500' : 'text-zinc-400'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative">
                        <i className={`${isActive ? item.activeIcon : item.icon} text-xl`} />
                        {item.label === 'Alerts' && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-red-500 px-1 text-[9px] font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
