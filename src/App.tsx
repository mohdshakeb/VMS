import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import Login from '@/pages/shared/Login'
import FrontDeskDashboardV3 from '@/pages/frontdesk/DashboardV3'
import CreateWalkIn from '@/pages/frontdesk/CreateWalkIn'
import VisitRequests from '@/pages/frontdesk/VisitRequests'
import CheckIn from '@/pages/frontdesk/CheckIn'
import CheckOut from '@/pages/frontdesk/CheckOut'
import MyVisits from '@/pages/employee/MyVisits'
import ApproveWalkIn from '@/pages/employee/ApproveWalkIn'
import Notifications from '@/pages/shared/Notifications'
import VisitHistory from '@/pages/frontdesk/VisitHistory'
import { useAuthStore } from '@/store/authStore'

function PrivateLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — requires auth */}
      <Route element={<PrivateLayout />}>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/front-desk/dashboard" replace />} />

        {/* Front Desk */}
        <Route path="/front-desk/dashboard" element={<FrontDeskDashboardV3 />} />
<Route path="/front-desk/walk-in" element={<CreateWalkIn />} />
        <Route path="/front-desk/visit-requests" element={<VisitRequests />} />
        <Route path="/front-desk/check-in/:visitId" element={<CheckIn />} />
        <Route path="/front-desk/check-out/:visitId" element={<CheckOut />} />
        <Route path="/front-desk/visit-history" element={<VisitHistory />} />

        {/* Employee */}
        <Route path="/employee/visits" element={<MyVisits />} />
        <Route path="/employee/approve/:visitId" element={<ApproveWalkIn />} />

        {/* Shared */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Visitor Manager placeholder */}
        <Route path="/manager/dashboard" element={<PlaceholderPage title="Visitor Manager Dashboard" />} />
      </Route>
    </Routes>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <i className="ri-tools-line text-4xl text-text-tertiary" />
        <p className="mt-3 text-sm text-text-secondary">{title}</p>
        <p className="text-xs text-text-tertiary mt-1">Coming soon</p>
      </div>
    </div>
  )
}
