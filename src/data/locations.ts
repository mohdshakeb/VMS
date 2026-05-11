import type { Location } from '@/types/location'

export const locations: Location[] = [
  // Tamil Nadu — 3 locations
  {
    id: 'loc-1',
    name: 'EO — Head Office',
    type: 'enterprise-office',
    address: 'Alwarpet, Chennai',
    state: 'Tamil Nadu',
    coordinates: [80.2545, 13.0344],
  },
  {
    id: 'loc-12',
    name: 'Branch — T Nagar',
    type: 'branch-office',
    address: 'T Nagar, Chennai',
    state: 'Tamil Nadu',
    coordinates: [80.2329, 13.0418],
  },
  {
    id: 'loc-13',
    name: 'Branch — RS Puram',
    type: 'branch-office',
    address: 'RS Puram, Coimbatore',
    state: 'Tamil Nadu',
    coordinates: [76.9558, 11.0168],
  },

  // Haryana — 1 location
  {
    id: 'loc-2',
    name: 'Branch — Sector 21',
    type: 'branch-office',
    address: 'Sector 21, Gurugram',
    state: 'Haryana',
    coordinates: [77.0499, 28.4947],
  },

  // Maharashtra — 2 locations
  {
    id: 'loc-3',
    name: 'Branch — Bandra Kurla',
    type: 'branch-office',
    address: 'BKC, Mumbai',
    state: 'Maharashtra',
    coordinates: [72.8656, 19.0760],
  },
  {
    id: 'loc-11',
    name: 'Branch — Shivaji Nagar',
    type: 'branch-office',
    address: 'Shivaji Nagar, Pune',
    state: 'Maharashtra',
    coordinates: [73.8567, 18.5204],
  },

  // West Bengal — 1 location
  {
    id: 'loc-4',
    name: 'Branch — Salt Lake',
    type: 'branch-office',
    address: 'Sector V, Kolkata',
    state: 'West Bengal',
    coordinates: [88.4312, 22.5726],
  },

  // Karnataka — 1 location
  {
    id: 'loc-5',
    name: 'Branch — Koramangala',
    type: 'branch-office',
    address: 'Koramangala, Bengaluru',
    state: 'Karnataka',
    coordinates: [77.6245, 12.9352],
  },

  // Telangana — 1 location
  {
    id: 'loc-6',
    name: 'Branch — Banjara Hills',
    type: 'branch-office',
    address: 'Banjara Hills, Hyderabad',
    state: 'Telangana',
    coordinates: [78.4483, 17.4151],
  },

  // Rajasthan — 1 location
  {
    id: 'loc-7',
    name: 'Branch — C-Scheme',
    type: 'branch-office',
    address: 'C-Scheme, Jaipur',
    state: 'Rajasthan',
    coordinates: [75.7869, 26.9124],
  },

  // Uttar Pradesh — 1 location
  {
    id: 'loc-8',
    name: 'Branch — Hazratganj',
    type: 'branch-office',
    address: 'Hazratganj, Lucknow',
    state: 'Uttar Pradesh',
    coordinates: [80.9462, 26.8467],
  },

  // Gujarat — 1 location
  {
    id: 'loc-9',
    name: 'Branch — Navrangpura',
    type: 'branch-office',
    address: 'Navrangpura, Ahmedabad',
    state: 'Gujarat',
    coordinates: [72.5714, 23.0395],
  },

  // Delhi — 2 locations
  {
    id: 'loc-10',
    name: 'Branch — Connaught Place',
    type: 'branch-office',
    address: 'Connaught Place, New Delhi',
    state: 'Delhi',
    coordinates: [77.2090, 28.6315],
  },
  {
    id: 'loc-14',
    name: 'Branch — Karol Bagh',
    type: 'branch-office',
    address: 'Karol Bagh, New Delhi',
    state: 'Delhi',
    coordinates: [77.1906, 28.6519],
  },
]
