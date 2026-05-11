import ManagerDashboardMobile from './Mobile/Dashboard'
import ManagerDashboardDesktop from './Dashboard.desktop'
import CheckInModal from '@/components/CheckInModal'
import CheckOutModal from '@/components/CheckOutModal'
import CheckInSheet from '@/components/Mobile/CheckInSheet'
import CheckOutSheet from '@/components/Mobile/CheckOutSheet'
import { useUIStore } from '@/store/uiStore'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function ManagerDashboard() {
  const isMobile = useIsMobile()
  const checkInVisitId = useUIStore((s) => s.checkInVisitId)
  const checkOutVisitId = useUIStore((s) => s.checkOutVisitId)
  const closeModals = useUIStore((s) => s.closeModals)

  return (
    <>
      <ManagerDashboardMobile />
      <ManagerDashboardDesktop />

      {checkInVisitId && (
        isMobile
          ? <CheckInSheet visitId={checkInVisitId} onClose={closeModals} />
          : <CheckInModal visitId={checkInVisitId} onClose={closeModals} />
      )}
      {checkOutVisitId && (
        isMobile
          ? <CheckOutSheet visitId={checkOutVisitId} onClose={closeModals} />
          : <CheckOutModal visitId={checkOutVisitId} onClose={closeModals} />
      )}
    </>
  )
}
