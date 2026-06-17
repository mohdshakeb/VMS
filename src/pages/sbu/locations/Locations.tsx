import LocationsDesktop from './Locations.desktop'
import LocationsMobile from './Mobile/Locations'

export default function Locations() {
  return (
    <>
      <LocationsMobile />
      <LocationsDesktop />
    </>
  )
}
