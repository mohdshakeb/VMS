import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import BottomNav from '@/components/Mobile/BottomNav'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import { useVisitStore } from '@/store/visitStore'
import type { Role } from '@/types/user'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import BottomSheet from '@/components/Mobile/BottomSheet'
import MobileTopBar from '@/components/Mobile/MobileTopBar'

const roleHomeRoutes: Record<Role, string> = {
  'front-desk': '/front-desk/dashboard',
  employee: '/employee/visits',
  'branch-admin': '/manager/dashboard',
}

const roleLabels: Record<Role, string> = {
  'front-desk': 'Front Desk',
  employee: 'Employee',
  'branch-admin': 'Branch Admin',
}

// Routes that take over the full screen (no sidebar, no nav bars)
const FULL_SCREEN_ROUTES = ['/front-desk/walk-in']

export default function AppLayout() {
  const { currentRole, currentEmployeeId, currentLocationId, setCurrentLocation, logout } = useAuthStore()
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

  const [profileSheetMounted, setProfileSheetMounted] = useState(false)
  const [profileSheetVisible, setProfileSheetVisible] = useState(false)

  function openProfileSheet() {
    setProfileSheetMounted(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProfileSheetVisible(true))
    })
  }

  function closeProfileSheet() {
    setProfileSheetVisible(false)
    setTimeout(() => setProfileSheetMounted(false), 260)
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
            <MobileTopBar
              locationLabel={currentLocation ? currentLocation.name.split(' — ')[0] : '—'}
              initials={initials}
              unreadCount={unreadCount}
              onLocationPress={openLocationSheet}
              onProfilePress={openProfileSheet}
            />
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
        {!isFullScreen && <BottomNav role={currentRole} />}
      </div>

      {/* Location bottom sheet — mobile only */}
      <BottomSheet
        mounted={locationSheetMounted}
        visible={locationSheetVisible}
        onClose={closeLocationSheet}
        title="Select Location"
      >
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
      </BottomSheet>

      {/* Profile bottom sheet — mobile only */}
      <BottomSheet
        mounted={profileSheetMounted}
        visible={profileSheetVisible}
        onClose={closeProfileSheet}
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-4 border-b border-border-light">
          <div className="h-10 w-10 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-text-primary">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {currentEmployee?.name ?? 'Unknown User'}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {roleLabels[currentRole]}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pt-2 pb-8">
          <button
            onClick={() => { closeProfileSheet(); setTimeout(() => { logout(); navigate('/login') }, 260) }}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-left rounded-xl transition-colors active:bg-surface-secondary hover:bg-surface-secondary"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand/10 shrink-0">
              <i className="ri-logout-box-r-line text-sm text-brand" />
            </div>
            <span className="text-sm text-brand font-medium">Sign out</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
