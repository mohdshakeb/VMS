export type Role = 'employee' | 'front-desk' | 'central-admin' | 'building-admin'

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  locationId: string
}

export interface Visitor {
  id: string
  name: string
  mobile: string
  email?: string
  company?: string
  avatar?: string
}
