// Thin wrapper — keeps the existing import in App.tsx working unchanged.
// Visual split: VisitHistory.mobile.tsx (Android) / VisitHistory.desktop.tsx (web)
import VisitHistoryMobile from './Mobile/VisitHistory'
import VisitHistoryDesktop from './VisitHistory.desktop'

export default function VisitHistory() {
  return (
    <>
      <VisitHistoryMobile />
      <VisitHistoryDesktop />
    </>
  )
}
