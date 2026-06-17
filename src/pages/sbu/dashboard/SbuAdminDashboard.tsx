import SbuAdminDashboardDesktop from './SbuAdminDashboard.desktop'
import SbuAdminDashboardMobile from './Mobile/SbuAdminDashboard'

export default function SbuAdminDashboard() {
  return (
    <>
      <SbuAdminDashboardMobile />
      <SbuAdminDashboardDesktop />
    </>
  )
}
