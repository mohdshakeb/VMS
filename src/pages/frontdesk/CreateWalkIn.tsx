// Thin wrapper — keeps the existing import in App.tsx working unchanged.
// Visual split: Mobile/CreateWalkIn.tsx (Android) / CreateWalkIn.desktop.tsx (web)
import CreateWalkInMobile from './Mobile/CreateWalkIn'
import CreateWalkInDesktop from './CreateWalkIn.desktop'

export default function CreateWalkIn() {
  return (
    <>
      <CreateWalkInMobile />
      <CreateWalkInDesktop />
    </>
  )
}
