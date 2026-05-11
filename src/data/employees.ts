import type { Employee } from '@/types/user'

export const employees: Employee[] = [
  // EO — Head Office, Chennai (8 employees)
  { id: 'emp-1',  name: 'Rajesh Kumar',      email: 'rajesh.kumar@gmmco.com',      department: 'Sales',              locationId: 'loc-1' },
  { id: 'emp-2',  name: 'Priya Sharma',      email: 'priya.sharma@gmmco.com',      department: 'HRD',                locationId: 'loc-1' },
  { id: 'emp-3',  name: 'Arun Venkatesh',    email: 'arun.v@gmmco.com',            department: 'Service',            locationId: 'loc-1' },
  { id: 'emp-4',  name: 'Deepa Nair',        email: 'deepa.nair@gmmco.com',        department: 'FIN / ACCTS / LEGAL',locationId: 'loc-1' },
  { id: 'emp-5',  name: 'Suresh Rajan',      email: 'suresh.rajan@gmmco.com',      department: 'SYSTEMS',            locationId: 'loc-1' },
  { id: 'emp-6',  name: 'Kavitha Sundaram',  email: 'kavitha.s@gmmco.com',         department: 'HQ PARTS',           locationId: 'loc-1' },
  { id: 'emp-7',  name: 'Mohan Das',         email: 'mohan.das@gmmco.com',         department: 'Admin',              locationId: 'loc-1' },
  { id: 'emp-8',  name: 'Lakshmi Iyer',      email: 'lakshmi.iyer@gmmco.com',      department: 'C&L',                locationId: 'loc-1' },

  // Branch — Sector 21, Gurugram (5 employees)
  { id: 'emp-9',  name: 'Vikram Singh',      email: 'vikram.singh@gmmco.com',      department: 'Sales',              locationId: 'loc-2' },
  { id: 'emp-10', name: 'Neha Gupta',        email: 'neha.gupta@gmmco.com',        department: 'Service',            locationId: 'loc-2' },
  { id: 'emp-11', name: 'Amit Patel',        email: 'amit.patel@gmmco.com',        department: 'PARTS / WAREHOUSE',  locationId: 'loc-2' },
  { id: 'emp-12', name: 'Sunita Reddy',      email: 'sunita.reddy@gmmco.com',      department: 'Admin',              locationId: 'loc-2' },
  { id: 'emp-13', name: 'Karthik Menon',     email: 'karthik.menon@gmmco.com',     department: 'FIN / ACCTS / LEGAL',locationId: 'loc-2' },

  // Branch — Bandra Kurla, Mumbai (5 employees)
  { id: 'emp-14', name: 'Ananya Rao',        email: 'ananya.rao@gmmco.com',        department: 'Sales',              locationId: 'loc-3' },
  { id: 'emp-15', name: 'Sanjay Pillai',     email: 'sanjay.pillai@gmmco.com',     department: 'Service',            locationId: 'loc-3' },
  { id: 'emp-16', name: 'Divya Krishnan',    email: 'divya.k@gmmco.com',           department: 'HRD',                locationId: 'loc-3' },
  { id: 'emp-17', name: 'Ramesh Babu',       email: 'ramesh.babu@gmmco.com',       department: 'HQ PARTS',           locationId: 'loc-3' },
  { id: 'emp-18', name: 'Meera Joshi',       email: 'meera.joshi@gmmco.com',       department: 'Admin',              locationId: 'loc-3' },

  // Branch — Salt Lake, Kolkata (4 employees)
  { id: 'emp-19', name: 'Debashis Ghosh',    email: 'debashis.g@gmmco.com',        department: 'Sales',              locationId: 'loc-4' },
  { id: 'emp-20', name: 'Tanmoy Sen',        email: 'tanmoy.sen@gmmco.com',        department: 'Service',            locationId: 'loc-4' },
  { id: 'emp-21', name: 'Shreya Banerjee',   email: 'shreya.b@gmmco.com',          department: 'FIN / ACCTS / LEGAL',locationId: 'loc-4' },
  { id: 'emp-22', name: 'Aritra Das',        email: 'aritra.das@gmmco.com',        department: 'PARTS / WAREHOUSE',  locationId: 'loc-4' },

  // Branch — Koramangala, Bengaluru (4 employees)
  { id: 'emp-23', name: 'Kiran Reddy',       email: 'kiran.reddy@gmmco.com',       department: 'PROJECTS',           locationId: 'loc-5' },
  { id: 'emp-24', name: 'Shilpa Gowda',      email: 'shilpa.gowda@gmmco.com',      department: 'HQ SURFACE',         locationId: 'loc-5' },
  { id: 'emp-25', name: 'Prashanth N',       email: 'prashanth.n@gmmco.com',       department: 'SYSTEMS',            locationId: 'loc-5' },
  { id: 'emp-26', name: 'Bhavana Murthy',    email: 'bhavana.m@gmmco.com',         department: 'Admin',              locationId: 'loc-5' },

  // Branch — Banjara Hills, Hyderabad (4 employees)
  { id: 'emp-27', name: 'Satish Rao',        email: 'satish.rao@gmmco.com',        department: 'Sales',              locationId: 'loc-6' },
  { id: 'emp-28', name: 'Padma Lakshmi',     email: 'padma.l@gmmco.com',           department: 'HRD',                locationId: 'loc-6' },
  { id: 'emp-29', name: 'Venkat Naidu',      email: 'venkat.n@gmmco.com',          department: 'Service',            locationId: 'loc-6' },
  { id: 'emp-30', name: 'Asha Reddy',        email: 'asha.reddy@gmmco.com',        department: 'FIN / ACCTS / LEGAL',locationId: 'loc-6' },

  // Branch — C-Scheme, Jaipur (3 employees)
  { id: 'emp-31', name: 'Rajan Sharma',      email: 'rajan.sharma@gmmco.com',      department: 'PROJECTS',           locationId: 'loc-7' },
  { id: 'emp-32', name: 'Sunita Agarwal',    email: 'sunita.agarwal@gmmco.com',    department: 'HQ PARTS',           locationId: 'loc-7' },
  { id: 'emp-33', name: 'Dinesh Choudhary',  email: 'dinesh.c@gmmco.com',          department: 'HQ SURFACE',         locationId: 'loc-7' },

  // Branch — Hazratganj, Lucknow (3 employees)
  { id: 'emp-34', name: 'Ashok Mishra',      email: 'ashok.mishra@gmmco.com',      department: 'C&L',                locationId: 'loc-8' },
  { id: 'emp-35', name: 'Rekha Singh',       email: 'rekha.singh@gmmco.com',       department: 'ERP',                locationId: 'loc-8' },
  { id: 'emp-36', name: 'Manoj Tripathi',    email: 'manoj.t@gmmco.com',           department: 'Service',            locationId: 'loc-8' },

  // Branch — Navrangpura, Ahmedabad (3 employees)
  { id: 'emp-37', name: 'Jayesh Shah',       email: 'jayesh.shah@gmmco.com',       department: 'Sales',              locationId: 'loc-9' },
  { id: 'emp-38', name: 'Hiral Desai',       email: 'hiral.desai@gmmco.com',       department: '6 SIGMA',            locationId: 'loc-9' },
  { id: 'emp-39', name: 'Mitesh Patel',      email: 'mitesh.patel@gmmco.com',      department: 'PARTS / WAREHOUSE',  locationId: 'loc-9' },

  // Branch — Connaught Place, New Delhi (4 employees)
  { id: 'emp-40', name: 'Rahul Verma',       email: 'rahul.verma@gmmco.com',       department: 'RUE',                locationId: 'loc-10' },
  { id: 'emp-41', name: 'Nidhi Kapoor',      email: 'nidhi.kapoor@gmmco.com',      department: '6 SIGMA',            locationId: 'loc-10' },
  { id: 'emp-42', name: 'Sameer Bhatia',     email: 'sameer.b@gmmco.com',          department: 'HQ UG MINING',       locationId: 'loc-10' },
  { id: 'emp-43', name: 'Priyanka Arora',    email: 'priyanka.a@gmmco.com',        department: 'TRAINING',           locationId: 'loc-10' },

  // Branch — Shivaji Nagar, Pune (3 employees)
  { id: 'emp-44', name: 'Sachin Kulkarni',   email: 'sachin.k@gmmco.com',          department: 'Digital',            locationId: 'loc-11' },
  { id: 'emp-45', name: 'Prachi Deshpande',  email: 'prachi.d@gmmco.com',          department: 'HQ UG MINING',       locationId: 'loc-11' },
  { id: 'emp-46', name: 'Amol Patil',        email: 'amol.patil@gmmco.com',        department: 'RUE',                locationId: 'loc-11' },

  // Branch — T Nagar, Chennai (3 employees)
  { id: 'emp-47', name: 'Balaji Krishnan',   email: 'balaji.k@gmmco.com',          department: 'Sales',              locationId: 'loc-12' },
  { id: 'emp-48', name: 'Sudha Raman',       email: 'sudha.raman@gmmco.com',       department: 'HRD',                locationId: 'loc-12' },
  { id: 'emp-49', name: 'Ganesh Subramanian',email: 'ganesh.s@gmmco.com',          department: 'HQ PARTS',           locationId: 'loc-12' },

  // Branch — RS Puram, Coimbatore (3 employees)
  { id: 'emp-50', name: 'Murugan Selvam',    email: 'murugan.s@gmmco.com',         department: 'SUPPORT FUNCTIONS',  locationId: 'loc-13' },
  { id: 'emp-51', name: 'Geetha Ramasamy',   email: 'geetha.r@gmmco.com',          department: 'Service',            locationId: 'loc-13' },
  { id: 'emp-52', name: 'Pandian Kumar',     email: 'pandian.k@gmmco.com',         department: 'Admin',              locationId: 'loc-13' },

  // Branch — Karol Bagh, New Delhi (3 employees)
  { id: 'emp-53', name: 'Anil Khanna',       email: 'anil.khanna@gmmco.com',       department: 'PROJECTS',           locationId: 'loc-14' },
  { id: 'emp-54', name: 'Seema Wadhwa',      email: 'seema.wadhwa@gmmco.com',      department: 'ERP',                locationId: 'loc-14' },
  { id: 'emp-55', name: 'Naresh Taneja',     email: 'naresh.taneja@gmmco.com',     department: 'Digital',            locationId: 'loc-14' },
]
