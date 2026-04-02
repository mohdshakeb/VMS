import type { Employee } from '@/types/user'

export const employees: Employee[] = [
  // EO — Head Office (8 employees)
  { id: 'emp-1', name: 'Rajesh Kumar', email: 'rajesh.kumar@gmmco.com', department: 'Sales', locationId: 'loc-1' },
  { id: 'emp-2', name: 'Priya Sharma', email: 'priya.sharma@gmmco.com', department: 'HR', locationId: 'loc-1' },
  { id: 'emp-3', name: 'Arun Venkatesh', email: 'arun.v@gmmco.com', department: 'Service', locationId: 'loc-1' },
  { id: 'emp-4', name: 'Deepa Nair', email: 'deepa.nair@gmmco.com', department: 'Finance', locationId: 'loc-1' },
  { id: 'emp-5', name: 'Suresh Rajan', email: 'suresh.rajan@gmmco.com', department: 'IT', locationId: 'loc-1' },
  { id: 'emp-6', name: 'Kavitha Sundaram', email: 'kavitha.s@gmmco.com', department: 'Parts', locationId: 'loc-1' },
  { id: 'emp-7', name: 'Mohan Das', email: 'mohan.das@gmmco.com', department: 'Admin', locationId: 'loc-1' },
  { id: 'emp-8', name: 'Lakshmi Iyer', email: 'lakshmi.iyer@gmmco.com', department: 'Sales', locationId: 'loc-1' },

  // Branch — Sector 21 (5 employees)
  { id: 'emp-9', name: 'Vikram Singh', email: 'vikram.singh@gmmco.com', department: 'Sales', locationId: 'loc-2' },
  { id: 'emp-10', name: 'Neha Gupta', email: 'neha.gupta@gmmco.com', department: 'Service', locationId: 'loc-2' },
  { id: 'emp-11', name: 'Amit Patel', email: 'amit.patel@gmmco.com', department: 'Parts', locationId: 'loc-2' },
  { id: 'emp-12', name: 'Sunita Reddy', email: 'sunita.reddy@gmmco.com', department: 'Admin', locationId: 'loc-2' },
  { id: 'emp-13', name: 'Karthik Menon', email: 'karthik.menon@gmmco.com', department: 'Finance', locationId: 'loc-2' },

  // Branch — MG Road (5 employees)
  { id: 'emp-14', name: 'Ananya Rao', email: 'ananya.rao@gmmco.com', department: 'Sales', locationId: 'loc-3' },
  { id: 'emp-15', name: 'Sanjay Pillai', email: 'sanjay.pillai@gmmco.com', department: 'Service', locationId: 'loc-3' },
  { id: 'emp-16', name: 'Divya Krishnan', email: 'divya.k@gmmco.com', department: 'HR', locationId: 'loc-3' },
  { id: 'emp-17', name: 'Ramesh Babu', email: 'ramesh.babu@gmmco.com', department: 'Parts', locationId: 'loc-3' },
  { id: 'emp-18', name: 'Meera Joshi', email: 'meera.joshi@gmmco.com', department: 'Admin', locationId: 'loc-3' },
]
