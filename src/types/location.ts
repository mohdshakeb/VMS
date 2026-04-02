import type { LocationType } from './visit'

export interface Location {
  id: string
  name: string
  type: LocationType
  address?: string
}
