// Thin wrapper — keeps the existing import in App.tsx working unchanged.
// Visual split: DashboardV3.mobile.tsx (Android) / DashboardV3.desktop.tsx (web)
import DashboardV3Mobile from './Mobile/DashboardV3'
import DashboardV3Desktop from './DashboardV3.desktop'

export default function FrontDeskDashboardV3() {
  return (
    <>
      <DashboardV3Mobile />
      <DashboardV3Desktop />
    </>
  )
}
