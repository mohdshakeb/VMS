import type { LocationType } from './visit'

export interface Location {
  id: string
  name: string
  type: LocationType
  address?: string
  state?: string
  coordinates?: [number, number]  // [longitude, latitude] — GeoJSON order
}
