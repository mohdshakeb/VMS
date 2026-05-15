import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import Login from '@/pages/shared/Login'
import FrontDeskDashboardV3 from '@/pages/frontdesk/DashboardV3'
import CreateWalkIn from '@/pages/frontdesk/CreateWalkIn'
import VisitRequests from '@/pages/frontdesk/VisitRequests'
import VisitDetail from '@/pages/frontdesk/VisitDetail'
import EmployeeDashboard from '@/pages/employee/Dashboard'
import CreateVisit from '@/pages/employee/CreateVisit'
import MyVisits from '@/pages/employee/MyVisits'
import ApproveWalkIn from '@/pages/employee/ApproveWalkIn'
import Notifications from '@/pages/shared/Notifications'
import VisitHistory from '@/pages/frontdesk/VisitHistory'
import QRCodePage from '@/pages/frontdesk/QRCodePage'
import ManagerDashboard from '@/pages/manager/Dashboard'
import ManagerVisitHistory from '@/pages/manager/VisitHistory'
import ManagerMyVisits from '@/pages/manager/MyVisits'
import BuildingAdminDashboard from '@/pages/facility/dashboard/BuildingAdminDashboard'
import MyBuildings from '@/pages/facility/buildings/MyBuildings'
import BuildingDetail from '@/pages/facility/buildings/BuildingDetail'
import OnboardingForm from '@/pages/facility/onboarding/OnboardingForm'
import OnboardingStatus from '@/pages/facility/onboarding/OnboardingStatus'
import ComplianceHome from '@/pages/facility/compliance/ComplianceHome'
import ComplianceUpload from '@/pages/facility/compliance/ComplianceUpload'
import ComplianceHistory from '@/pages/facility/compliance/ComplianceHistory'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/user'

const roleHomeRoutes: Record<Role, string> = {
  'front-desk': '/front-desk/dashboard',
  employee: '/employee/dashboard',
  'central-admin': '/manager/dashboard',
  'building-admin': '/facility/dashboard',
}

function PrivateLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout />
}

function RoleHome() {
  const currentRole = useAuthStore((s) => s.currentRole)
  return <Navigate to={roleHomeRoutes[currentRole]} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — requires auth */}
      <Route element={<PrivateLayout />}>
        {/* Default redirect — role-aware */}
        <Route path="/" element={<RoleHome />} />

        {/* Front Desk */}
        <Route path="/front-desk/dashboard" element={<FrontDeskDashboardV3 />} />
        <Route path="/front-desk/walk-in" element={<CreateWalkIn />} />
        <Route path="/front-desk/visit-requests" element={<VisitRequests />} />
        <Route path="/front-desk/visit/:visitId" element={<VisitDetail />} />
        <Route path="/front-desk/visit-history" element={<VisitHistory />} />
        <Route path="/front-desk/qr-code" element={<QRCodePage />} />

        {/* Employee */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/create-visit" element={<CreateVisit />} />
        <Route path="/employee/visits" element={<MyVisits />} />
        <Route path="/employee/visit/:visitId" element={<VisitDetail />} />
        <Route path="/employee/approve/:visitId" element={<ApproveWalkIn />} />

        {/* Shared */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Central Admin */}
        <Route path="/manager/dashboard"     element={<ManagerDashboard />} />
        <Route path="/manager/visit-history" element={<ManagerVisitHistory />} />
        <Route path="/manager/my-visits"     element={<ManagerMyVisits />} />

        {/* Facility — Building Admin */}
        <Route path="/facility/dashboard"              element={<BuildingAdminDashboard />} />
        <Route path="/facility/buildings"              element={<MyBuildings />} />
        <Route path="/facility/buildings/:buildingId"  element={<BuildingDetail />} />
        <Route path="/facility/onboarding/new"         element={<OnboardingForm />} />
        <Route path="/facility/onboarding/submitted"   element={<OnboardingStatus />} />
        <Route path="/facility/onboarding/:requestId"  element={<OnboardingStatus />} />
        <Route path="/facility/compliance/history"     element={<ComplianceHistory />} />
        <Route path="/facility/compliance/:buildingId" element={<ComplianceUpload />} />
        <Route path="/facility/compliance"             element={<ComplianceHome />} />
      </Route>
    </Routes>
  )
}

