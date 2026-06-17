import SbuComplianceHistoryDesktop from './SbuComplianceHistory.desktop'
import SbuComplianceHistoryMobile from './Mobile/SbuComplianceHistory'

export default function SbuComplianceHistory() {
  return (
    <>
      <SbuComplianceHistoryMobile />
      <SbuComplianceHistoryDesktop />
    </>
  )
}
