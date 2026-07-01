import type {
  Facility,
  FacilityType,
  InfraCategory,
  ChecklistItem,
  ComplianceChecklistEntry,
  ChecklistAnswer,
  ComplianceRecord,
} from '@/types/facility'

// ─── Prototype-frozen clock ───────────────────────────────────────────────────
// All "today" references in the facility module use this so the demo looks
// correct regardless of when it is actually run.
export const PROTOTYPE_NOW = new Date(2026, 5, 7) // June 7, 2026

// ─── Current compliance period (prototype-frozen) ─────────────────────────────
// Fixed so the prototype shows all states consistently regardless of real date.
export const CURRENT_COMPLIANCE_PERIOD = { month: 5, year: 2026 }

export function isCurrentPeriod(month: number, year: number): boolean {
  return month === CURRENT_COMPLIANCE_PERIOD.month && year === CURRENT_COMPLIANCE_PERIOD.year
}

// ─── Due date helpers ─────────────────────────────────────────────────────────

/** Returns the 7th of the month following the given compliance month/year. */
export function getComplianceDueDate(month: number, year: number): Date {
  // JS Date months are 0-indexed; passing `month` (1-based) directly gives next month
  return new Date(year, month, 7)
}

export function formatComplianceDueDate(month: number, year: number): string {
  return getComplianceDueDate(month, year).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function isComplianceOverdue(month: number, year: number): boolean {
  return PROTOTYPE_NOW > getComplianceDueDate(month, year)
}

// ─── Facility ID generation (used by onboarding) ──────────────────────────────

const FACILITY_TYPE_CODES: Record<string, string> = {
  'Branch Office':    'BO',
  'Parts Warehouse':  'PW',
  'CRC':              'CRC',
  'MRC':              'MRC',
  'Repair Center':    'RC',
  'Executive Office': 'EO',
  'HQ':               'HQ',
}

const STATE_CODES: Record<string, string> = {
  'Tamil Nadu':    'TN',
  'Kerala':        'KL',
  'Karnataka':     'KA',
  'Delhi NCR':     'DL',
  'Uttar Pradesh': 'UP',
  'Rajasthan':     'RJ',
  'Maharashtra':   'MH',
  'Gujarat':       'GJ',
  'West Bengal':   'WB',
  'Odisha':        'OD',
}

/** Generates the human-readable facility code, e.g. BO_TN_CHN_ANNASALAI_600002 */
export function facilityCodeFrom(type: string, state: string, city: string, location: string, pinCode: string) {
  const typeCode = FACILITY_TYPE_CODES[type] ?? type.slice(0, 3).toUpperCase()
  const stateCode = STATE_CODES[state] ?? state.slice(0, 2).toUpperCase()
  const cityCode = city.slice(0, 3).toUpperCase()
  const locCode = location.replace(/\s+/g, '').toUpperCase().slice(0, 12)
  return [typeCode, stateCode, cityCode, locCode, pinCode].filter(Boolean).join('_')
}

// ─── Buildings ───────────────────────────────────────────────────────────────

export const facilities: Facility[] = [
  {
    id: 'bld-1',
    facilityId: 'BO_TN_CHN_ANNASALAI_600002',
    name: 'Branch Office',
    type: 'Branch Office',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Chennai',
    location: 'Anna Salai - Chennai',
    address1: '12 Anna Salai',
    address2: '',
    pinCode: '600002',
    floors: 3,
    area: 6200,
    yearOfConstruction: 2008,
    latitude: 13.0524,
    longitude: 80.2583,
    storeCode: 'CHN-001',
    description: 'Main Chennai branch office handling South SBU operations.',
    status: 'active',
    locationAdmin: 'Arjun Nair',
    locationAdminEmpId: '1042',
    locationAdminEmail: 'arjun.nair@gmmco.in',
    locationAdminPhone: '+91 98400 12345',
    remarks: 'Main operations hub for South SBU. Priority building for monthly compliance.',
    layoutPlanName: 'FloorPlan_Chennai_Branch_v2.pdf',
    complianceDocName: 'ComplianceGuidelines_Chennai.pdf',
    complianceStatus: 'draft',
    complianceProgress: 10,
    complianceTotal: 70,
    complianceDraftAge: 31,
  },
  {
    id: 'bld-2',
    facilityId: 'BO_TN_CBE_GANHIPURAM_641012',
    name: 'Branch Office',
    type: 'Branch Office',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    location: 'Coimbatore',
    address1: '45 Gandhipuram Main Road',
    address2: '',
    pinCode: '641012',
    floors: 2,
    area: 3800,
    yearOfConstruction: 2014,
    latitude: 11.0168,
    longitude: 76.9558,
    storeCode: 'CBE-002',
    description: 'Coimbatore branch office serving west Tamil Nadu region.',
    status: 'active',
    locationAdmin: 'Meena Suresh',
    locationAdminEmpId: '1087',
    locationAdminEmail: 'meena.suresh@gmmco.in',
    locationAdminPhone: '+91 99400 23456',
    remarks: '',
    layoutPlanName: 'FloorPlan_Coimbatore_Office.pdf',
    complianceDocName: 'ComplianceDoc_Coimbatore.pdf',
    complianceStatus: 'pending',
    complianceProgress: 0,
    complianceTotal: 70,
  },
  {
    id: 'bld-3',
    facilityId: 'RC_TN_MDU_MATTUTHAVANI_625010',
    name: 'Repair Center',
    type: 'Repair Center',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Madurai',
    location: 'Madurai',
    address1: '7 Mattuthavani Industrial Estate',
    address2: '',
    pinCode: '625010',
    floors: 1,
    area: 12500,
    yearOfConstruction: 2001,
    latitude: 9.9252,
    longitude: 78.1198,
    storeCode: 'MDU-003',
    description: 'Heavy machinery repair center with workshop facilities.',
    status: 'active',
    locationAdmin: 'Ravi Kumar',
    locationAdminEmpId: '1015',
    locationAdminEmail: 'ravi.kumar@gmmco.in',
    locationAdminPhone: '+91 94450 34567',
    remarks: '',
    layoutPlanName: 'WorkshopFloorPlan_Madurai.pdf',
    complianceDocName: 'Safety_Compliance_Madurai.pdf',
    complianceStatus: 'submitted',
    complianceProgress: 70,
    complianceTotal: 70,
  },
]

// ─── Infrastructure Categories (used by onboarding) ──────────────────────────

export const infraCategories: InfraCategory[] = [
  // External
  { id: 'cat-ext-1', name: 'Building Front',                         group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-2', name: 'Building Signage',                       group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-3', name: 'Entry Gate',                             group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-4', name: 'Security Cabin',                         group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-5', name: 'Parking Area',                           group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-6', name: 'Yard / Open Area',                       group: 'External',      applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  // Office
  { id: 'cat-off-1', name: 'Reception Area',                         group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-2', name: 'Meeting Room',                           group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-3', name: 'Pantry',                                 group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',       'CRC': 'optional',       'MRC': 'optional',       'Repair Center': 'optional',       'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-4', name: 'Washroom',                               group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory',      'CRC': 'mandatory',      'MRC': 'mandatory',      'Repair Center': 'mandatory',      'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-5', name: 'Training Room',                          group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-off-6', name: 'Office Workspace',                       group: 'Office',        applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  // Workshop
  { id: 'cat-wks-1', name: 'Workshop Floor',                         group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-wks-2', name: 'Tool Storage',                           group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-wks-3', name: 'Inspection Bay',                         group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'mandatory', 'MRC': 'optional',  'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-wks-4', name: 'Wash Bay',                               group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  // Warehouse
  { id: 'cat-whs-1', name: 'Warehouse Storage Area',                 group: 'Warehouse',     applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'mandatory', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-whs-2', name: 'Loading / Unloading Dock',               group: 'Warehouse',     applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'mandatory', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-whs-3', name: 'Rack Storage',                           group: 'Warehouse',     applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'mandatory', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  // Electrical
  { id: 'cat-elc-1', name: 'Electrical Panel',                       group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-elc-2', name: 'Transformer',                            group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-elc-3', name: 'UPS Room',                               group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-elc-4', name: 'Earthing Pit',                           group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-elc-5', name: 'Internal Lighting',                      group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-elc-6', name: 'DG Room',                                group: 'Electrical',    applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'optional',  'HQ': 'mandatory' } },
  // Fire & Safety
  { id: 'cat-frs-1', name: 'Fire Extinguishers',                     group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-2', name: 'Emergency Assembly Point',               group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-3', name: 'Smoke Detector / Sprinkler System',      group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-4', name: 'Fire Alarm',                             group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-5', name: 'Emergency Exit',                         group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-6', name: 'First Aid Kit',                          group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-7', name: 'PPE Station',                            group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'optional'  } },
  { id: 'cat-frs-8', name: 'Fire Hydrant',                           group: 'Fire & Safety', applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-frs-9', name: 'Fire Pump Room / Fire Control Room',     group: 'Fire & Safety', applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  // Environment
  { id: 'cat-env-1', name: 'Drainage System',                        group: 'Environment',   applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-env-2', name: 'Green Area',                             group: 'Environment',   applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-env-3', name: 'Waste Disposal',                         group: 'Environment',   applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  // Security
  { id: 'cat-sec-1', name: 'CCTV Surveillance',                      group: 'Security',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-sec-2', name: 'Access Control System',                  group: 'Security',      applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  // Utilities
  { id: 'cat-utl-1', name: 'Water Tank',                             group: 'Utilities',     applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-utl-2', name: 'Pump Room',                              group: 'Utilities',     applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-utl-3', name: 'Generator Room',                         group: 'Utilities',     applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
]

// ─── Helper: get categories for a building type (used by onboarding) ─────────

export function getCategoriesForFacilityType(buildingType: string) {
  return infraCategories.filter(
    (c) => c.applicability[buildingType as keyof typeof c.applicability] !== undefined
  )
}

// ─── Compliance checklist ─────────────────────────────────────────────────────

const ALL_TYPES: FacilityType[] = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // ── Exterior ────────────────────────────────────────────────────────────────
  // 1. Visibility
  { id: 'chk-1-1',  section: 'Exterior', subsection: '1. Visibility', label: '1.1 Retail Customer machines (retail priority models) are visible to drive-by customers by staging machines near front entrance and along main roads', mandatoryFor: ALL_TYPES },
  { id: 'chk-1-2',  section: 'Exterior', subsection: '1. Visibility', label: '1.2 Visible pricing on retail priority models displayed (i.e. financing monthly payment, cash payment, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-1-3',  section: 'Exterior', subsection: '1. Visibility', label: '1.3 Current sales promotions are visible to drive-by customers', mandatoryFor: ALL_TYPES },
  { id: 'chk-1-4',  section: 'Exterior', subsection: '1. Visibility', label: '1.4 Dealer sign is in good condition, prominently located, and clearly visible down the road', mandatoryFor: ALL_TYPES },
  { id: 'chk-1-5',  section: 'Exterior', subsection: '1. Visibility', label: '1.5 Dealer building is in good condition and professional looking', mandatoryFor: ALL_TYPES },
  // 2. Information Signs
  { id: 'chk-2-1',  section: 'Exterior', subsection: '2. Information Signs', label: '2.1 Exterior directional signs exist upon arrival to direct visitors to appropriate departments (i.e. Sales, Service, Rental, Parts, Rental Return, Service Drop Off, Supplier Deliveries)', mandatoryFor: ALL_TYPES },
  { id: 'chk-2-2',  section: 'Exterior', subsection: '2. Information Signs', label: "2.2 Where a Dealer's campus has separate buildings for sales and rental offerings, clear signage exists at campus intersections and in buildings to direct customers appropriately", mandatoryFor: ALL_TYPES },
  { id: 'chk-2-3',  section: 'Exterior', subsection: '2. Information Signs', label: '2.3 Accurate branch operating hours and contact information are professionally & clearly posted, and visible to customers after hours', mandatoryFor: ALL_TYPES },
  // 3. Customer Parking
  { id: 'chk-3-1',  section: 'Exterior', subsection: '3. Customer Parking', label: '3.1 Clearly designated customer parking with a policy enforced to ensure parking is reserved for customers only', mandatoryFor: ALL_TYPES },
  { id: 'chk-3-2',  section: 'Exterior', subsection: '3. Customer Parking', label: '3.2 Parking locations provide safe pedestrian access to building without crossing main vehicle traffic (i.e. zebra crossings, speed limit signs, etc.)', mandatoryFor: ALL_TYPES },
  // 4. Machine Inventory Awareness
  { id: 'chk-4-1',  section: 'Exterior', subsection: '4. Machine Inventory Awareness', label: '4.1 New and used Retail Customer machine inventory is on site and easily accessible for customers to walk around', mandatoryFor: ALL_TYPES },
  { id: 'chk-4-2',  section: 'Exterior', subsection: '4. Machine Inventory Awareness', label: '4.2 All machine inventory has specific staging areas by type of machine (new, used, rental) and they are clearly marked as such', mandatoryFor: ALL_TYPES },
  // 5. Attachment Inventory Awareness
  { id: 'chk-5-1',  section: 'Exterior', subsection: '5. Attachment Inventory Awareness', label: '5.1 Retail Customer attachment inventory is on site, easily accessible, and organized for customers to walk around', mandatoryFor: ALL_TYPES },
  { id: 'chk-5-2',  section: 'Exterior', subsection: '5. Attachment Inventory Awareness', label: '5.2 At least 3 different types of attachments are displayed with retail pricing (not only GP buckets, but hammers, MP buckets, augers, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-5-3',  section: 'Exterior', subsection: '5. Attachment Inventory Awareness', label: '5.3 All attachment inventory has specific staging areas by type of attachment (new, used, rental) and they are clearly marked as such', mandatoryFor: ALL_TYPES },
  // 6. Service Staging
  { id: 'chk-6-1',  section: 'Exterior', subsection: '6. Service Staging', label: '6.1 Signs are clearly visible indicating where a customer should drop off machines for service', mandatoryFor: ALL_TYPES },
  { id: 'chk-6-2',  section: 'Exterior', subsection: '6. Service Staging', label: '6.2 All machines waiting to be serviced should be staged in an organized manner', mandatoryFor: ALL_TYPES },
  { id: 'chk-6-3',  section: 'Exterior', subsection: '6. Service Staging', label: '6.3 Trailers have pull through access or ample room to safely maneuver for machine drop off & pick up, reducing the need for a 3-point turn', mandatoryFor: ALL_TYPES },
  // 7. Yard Organization and Cleanliness
  { id: 'chk-7-1',  section: 'Exterior', subsection: '7. Yard Organization and Cleanliness', label: '7.1 Appropriate yard space is available for storing machines, attachments, parts and supplies. Yard is organized and clean.', mandatoryFor: ALL_TYPES },

  // ── Interior ────────────────────────────────────────────────────────────────
  // 8. Entrance
  { id: 'chk-8-1',  section: 'Interior', subsection: '8. Entrance', label: '8.1 Customers are greeted within 30 seconds of entering the dealership and there is a policy to enforce this culture', mandatoryFor: ALL_TYPES },
  { id: 'chk-8-2',  section: 'Interior', subsection: '8. Entrance', label: "8.2 Where a Dealer's campus has separate buildings for sales and rental offerings, personnel exists in every customer-facing building to initiate a basic sales and rental consultation", mandatoryFor: ALL_TYPES },
  { id: 'chk-8-3',  section: 'Interior', subsection: '8. Entrance', label: '8.3 Entrance has comfortable feel and allows customers to browse various products while waiting for further assistance', mandatoryFor: ALL_TYPES },
  { id: 'chk-8-4',  section: 'Interior', subsection: '8. Entrance', label: '8.4 Informational signs are clearly displayed to direct customers to appropriate departments (i.e. Sales, Service, Rental, Parts)', mandatoryFor: ALL_TYPES },
  // 9. Showroom
  { id: 'chk-9-1',  section: 'Interior', subsection: '9. Showroom', label: '9.1 Showroom space is available and used to promote retail products to walk-in customers (i.e. machines, attachments, merchandise, parts, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-9-2',  section: 'Interior', subsection: '9. Showroom', label: '9.2 Showroom is clean and organized', mandatoryFor: ALL_TYPES },
  { id: 'chk-9-3',  section: 'Interior', subsection: '9. Showroom', label: '9.3 Retail Customer machines are staged with retail pricing displayed (i.e. financing monthly payment, cash payment, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-9-4',  section: 'Interior', subsection: '9. Showroom', label: '9.4 Retail Customer attachments are staged with retail pricing displayed (i.e. financing monthly payment, cash payment, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-9-5',  section: 'Interior', subsection: '9. Showroom', label: '9.5 Retail Customer machine and attachment full product lines are promoted via printed literature and/or interactive digital displays in the showroom', mandatoryFor: ALL_TYPES },
  // 10. Product Sales Promotions
  { id: 'chk-10-1', section: 'Interior', subsection: '10. Product Sales Promotions', label: '10.1 New machine sales promotions targeted to the retail customer are advertised, current, professionally displayed, and clearly visible to customers (e.g. financing offer, % discount, association offers, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-10-2', section: 'Interior', subsection: '10. Product Sales Promotions', label: '10.2 Attachments sales promotions targeted to the retail customer are advertised, current, professionally displayed, and clearly visible to customers (e.g. financing offer, % discount, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-10-3', section: 'Interior', subsection: '10. Product Sales Promotions', label: '10.3 Product support sales promotions targeted to the retail customer are advertised, current, professionally displayed, and clearly visible to customers (e.g. x% off filters, batteries, etc.)', mandatoryFor: ALL_TYPES },
  { id: 'chk-10-4', section: 'Interior', subsection: '10. Product Sales Promotions', label: '10.4 CSAs and EPPs are advertised and promoted at point of sale (at minimum for retail priority model new machine sales)', mandatoryFor: ALL_TYPES },
  { id: 'chk-10-5', section: 'Interior', subsection: '10. Product Sales Promotions', label: '10.5 Promotions are professionally displayed using digital displays, properly mounted posters or banners, or stands to organize printed materials', mandatoryFor: ALL_TYPES },
  { id: 'chk-10-6', section: 'Interior', subsection: '10. Product Sales Promotions', label: '10.6 Retail customer facing employees are knowledgeable of current promotions (machines, attachments, product support)', mandatoryFor: ALL_TYPES },
  // 11. Retail Sales of Parts, Supplies, and Cat Merchandise
  { id: 'chk-11-1', section: 'Interior', subsection: '11. Retail Sales of Parts, Supplies, and Cat Merchandise', label: '11.1 Cat consumable parts are stocked and sold in the showroom and easily accessible to the customer (i.e. filters, fluids, grease, batteries, wear items, shop towels, fuses)', mandatoryFor: ALL_TYPES },
  { id: 'chk-11-2', section: 'Interior', subsection: '11. Retail Sales of Parts, Supplies, and Cat Merchandise', label: '11.2 Cat merchandise is stocked and sold in the showroom and easily accessible to the customer (i.e. shirts, jackets, hats, gloves, models, flashlights, pens, coffee mugs)', mandatoryFor: ALL_TYPES },
  { id: 'chk-11-3', section: 'Interior', subsection: '11. Retail Sales of Parts, Supplies, and Cat Merchandise', label: '11.3 Retail supplies and materials are stocked and sold in the showroom and easily accessible to the customer (i.e. shop towels, shovels, hand tools, concrete saws, generators, pumps, safety fencing)', mandatoryFor: ALL_TYPES },
  { id: 'chk-11-4', section: 'Interior', subsection: '11. Retail Sales of Parts, Supplies, and Cat Merchandise', label: '11.4 All showroom items are individually priced for retail sale', mandatoryFor: ALL_TYPES },
  { id: 'chk-11-5', section: 'Interior', subsection: '11. Retail Sales of Parts, Supplies, and Cat Merchandise', label: '11.5 Customers can purchase showroom items via traditional forms of payment (i.e. credit card or cash) with the option to create a dealer account', mandatoryFor: ALL_TYPES },
  { id: 'chk-11-6', section: 'Interior', subsection: '11. Retail Sales of Parts, Supplies, and Cat Merchandise', label: '11.6 Retail shelving is clean, full of stock, and well organized', mandatoryFor: ALL_TYPES },
  // 12. Service Sales
  { id: 'chk-12-1', section: 'Interior', subsection: '12. Service Sales', label: '12.1 Service menu board promoting flat rate services is prominently displayed (e.g. ₹XX for 226–500 hour maintenance)', mandatoryFor: ALL_TYPES },
  // 13. Workshop
  { id: 'chk-13-1', section: 'Interior', subsection: '13. Workshop', label: '13.1 Workshop is professionally maintained, clean, and organized', mandatoryFor: ALL_TYPES },
  { id: 'chk-13-2', section: 'Interior', subsection: '13. Workshop', label: '13.2 Workshop is well lit and promotes a premium service', mandatoryFor: ALL_TYPES },

  // ── Safety Observations ──────────────────────────────────────────────────────
  { id: 'chk-14-1', section: 'Safety Observations', label: '14.1 A policy exists requiring personal protective gear in designated areas, including posted signs, and is effectively enforced', mandatoryFor: ALL_TYPES },
  { id: 'chk-14-2', section: 'Safety Observations', label: '14.2 A process is in place and executed to make safety glasses available for all guests and visitors', mandatoryFor: ALL_TYPES },
  { id: 'chk-14-3', section: 'Safety Observations', label: '14.3 A policy exists requiring that all non-employees are escorted through the yard and shop areas', mandatoryFor: ALL_TYPES },
  { id: 'chk-14-4', section: 'Safety Observations', label: '14.4 Daily "Toolbox Talks" are held with yard and shop employees to reinforce the safety policies in place and address other safety concerns', mandatoryFor: ALL_TYPES },
  { id: 'chk-14-5', section: 'Safety Observations', label: '14.5 Clear demarcated areas exist to safely identify pedestrian walkways', mandatoryFor: ALL_TYPES },

  // ── Retail Customer ──────────────────────────────────────────────────────────
  // 15. New Machine Sales Processes
  { id: 'chk-15-1',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: "15.1 The 3 following Retail Presence standards are rated '10': 1.1 Machine visible to drive-by customers, 8.1 Customers greeted within 30 seconds, and 9.2 Showroom is clean and organized", mandatoryFor: ALL_TYPES },
  { id: 'chk-15-2',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.2 An in-store employee (non outside sales role) can provide a basic Retail Customer new machine sales initial price in less than 10 minutes', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-3',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.3 The dealer branch has a retail accountable employee assigned and trained to handle walk-in customers', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-4',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.4 The retail accountable employee is empowered to manage the exterior and interior retail presence of the store', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-5',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.5 The retail accountable employee can direct walk-in traffic and customer inquiries for machines, parts, and rental equipment sales', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-6',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.6 The retail accountable employee can provide walk-in customers a basic sales consultation', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-7',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.7 The retail accountable employee can provide recommendations for parts, service, supplies, merchandise, and equipment solutions', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-8',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.8 The retail accountable employee can route qualified leads and opportunities to the appropriate sales personnel for closure', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-9',  section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.9 The dealer can provide credit decisions in less than 1 hour', mandatoryFor: ALL_TYPES },
  { id: 'chk-15-10', section: 'Retail Customer', subsection: '15. New Machine Sales Processes', label: '15.10 The dealer can deliver a retail priority machine within 1 hour and provide a complete 2-hour sales process (from machine quote to delivery)', mandatoryFor: ALL_TYPES },

  // ── Online ───────────────────────────────────────────────────────────────────
  // 16. Online Search Content
  { id: 'chk-16-1',  section: 'Online', subsection: '16. Online Search Content', label: '16.1 Within region specific search engines (i.e. Google, Yahoo!, Bing, etc.), all dealer search engine content is accurate and kept up to date (i.e. hours of operation, phone number, address, dealership photos)', mandatoryFor: ALL_TYPES },
  // 17. Dealer Website
  { id: 'chk-17-1',  section: 'Online', subsection: '17. Dealer Website', label: '17.1 Overall look of the website is well organized, easy to read, and professional looking, in both desktop and mobile formats', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-2',  section: 'Online', subsection: '17. Dealer Website', label: '17.2 It is simple to navigate and find information on products and services offered (i.e. machines, parts, finance, warranty, dealer locator)', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-3',  section: 'Online', subsection: '17. Dealer Website', label: '17.3 Dealer locator is easy to find on the home page and includes products and services offered at each location', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-4',  section: 'Online', subsection: '17. Dealer Website', label: '17.4 A live chat option is available for customer inquiries, visible from all dealer web pages, and actively staffed during business hours', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-5',  section: 'Online', subsection: '17. Dealer Website', label: '17.5 Retail Customer machine sales promotions are advertised, current, and prominently displayed on the home page', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-6',  section: 'Online', subsection: '17. Dealer Website', label: '17.6 Retail Customer attachment sales promotions are advertised, current, and prominently displayed on the home page', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-7',  section: 'Online', subsection: '17. Dealer Website', label: '17.7 Retail Customer product support sales promotions are advertised, current, and prominently displayed on the home page', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-8',  section: 'Online', subsection: '17. Dealer Website', label: '17.8 A request to quote option is available or pricing is shown for products', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-9',  section: 'Online', subsection: '17. Dealer Website', label: '17.9 Information is available on the home page promoting used equipment sales and rental services', mandatoryFor: ALL_TYPES },
  { id: 'chk-17-10', section: 'Online', subsection: '17. Dealer Website', label: '17.10 No broken links were found during website navigation', mandatoryFor: ALL_TYPES },
  // 18. Social Media
  { id: 'chk-18-1',  section: 'Online', subsection: '18. Social Media', label: '18.1 Dealer regularly utilizes social media to engage with customers through a mix of content (e.g. products, services, and/or customer events) at least once per week', mandatoryFor: ALL_TYPES },
]

// ─── Checklist builder helpers ────────────────────────────────────────────────

type AnswerMap = Record<string, { answer: ChecklistAnswer; remarks?: string; photos?: string[] }>

const P = 'https://placehold.co/400x300/e2e8f0/64748b?text=Photo'

export function buildChecklist(buildingType: FacilityType, answers: AnswerMap = {}): ComplianceChecklistEntry[] {
  return CHECKLIST_ITEMS.map((item) => {
    const isMandatory = item.mandatoryFor.includes(buildingType)
    const a = answers[item.id]
    return {
      itemId: item.id,
      section: item.section,
      subsection: item.subsection,
      label: item.label,
      isMandatory,
      answer: a?.answer,
      remarks: a?.remarks,
      photos: a?.photos ?? [],
    }
  })
}

// Full approved-record answer sets
const BRANCH_FULL: AnswerMap = {
  'chk-1-1':  { answer: 'yes', photos: [P, P] }, 'chk-1-2':  { answer: 'yes', photos: [P] },
  'chk-1-3':  { answer: 'yes', photos: [P] },    'chk-1-4':  { answer: 'yes', photos: [P] },
  'chk-1-5':  { answer: 'yes', photos: [P] },    'chk-2-1':  { answer: 'yes', photos: [P] },
  'chk-2-2':  { answer: 'na' },                  'chk-2-3':  { answer: 'yes', photos: [P] },
  'chk-3-1':  { answer: 'yes', photos: [P] },    'chk-3-2':  { answer: 'yes', photos: [P] },
  'chk-4-1':  { answer: 'yes', photos: [P, P] }, 'chk-4-2':  { answer: 'yes', photos: [P] },
  'chk-5-1':  { answer: 'yes', photos: [P] },    'chk-5-2':  { answer: 'yes', photos: [P] },
  'chk-5-3':  { answer: 'yes', photos: [P] },    'chk-6-1':  { answer: 'yes', photos: [P] },
  'chk-6-2':  { answer: 'yes', photos: [P] },    'chk-6-3':  { answer: 'yes', photos: [P] },
  'chk-7-1':  { answer: 'yes', photos: [P] },
  'chk-8-1':  { answer: 'yes', photos: [P, P] }, 'chk-8-2':  { answer: 'na' },
  'chk-8-3':  { answer: 'yes', photos: [P] },    'chk-8-4':  { answer: 'yes', photos: [P] },
  'chk-9-1':  { answer: 'yes', photos: [P] },    'chk-9-2':  { answer: 'yes', photos: [P] },
  'chk-9-3':  { answer: 'yes', photos: [P] },    'chk-9-4':  { answer: 'yes', photos: [P] },
  'chk-9-5':  { answer: 'yes', photos: [P] },    'chk-10-1': { answer: 'yes', photos: [P] },
  'chk-10-2': { answer: 'yes', photos: [P] },    'chk-10-3': { answer: 'yes', photos: [P] },
  'chk-10-4': { answer: 'yes', photos: [P] },    'chk-10-5': { answer: 'yes', photos: [P] },
  'chk-10-6': { answer: 'yes', photos: [P] },    'chk-11-1': { answer: 'yes', photos: [P] },
  'chk-11-2': { answer: 'yes', photos: [P] },    'chk-11-3': { answer: 'yes', photos: [P] },
  'chk-11-4': { answer: 'yes', photos: [P] },    'chk-11-5': { answer: 'yes', photos: [P] },
  'chk-11-6': { answer: 'yes', photos: [P] },    'chk-12-1': { answer: 'yes', photos: [P] },
  'chk-13-1': { answer: 'yes', photos: [P] },    'chk-13-2': { answer: 'yes', photos: [P] },
  'chk-14-1': { answer: 'yes', photos: [P] },    'chk-14-2': { answer: 'yes', photos: [P] },
  'chk-14-3': { answer: 'yes', photos: [P] },    'chk-14-4': { answer: 'yes', photos: [P] },
  'chk-14-5': { answer: 'yes', photos: [P] },
  'chk-15-1': { answer: 'yes', photos: [P] },    'chk-15-2': { answer: 'yes', photos: [P] },
  'chk-15-3': { answer: 'yes', photos: [P] },    'chk-15-4': { answer: 'yes', photos: [P] },
  'chk-15-5': { answer: 'yes', photos: [P] },    'chk-15-6': { answer: 'yes', photos: [P] },
  'chk-15-7': { answer: 'yes', photos: [P] },    'chk-15-8': { answer: 'yes', photos: [P] },
  'chk-15-9': { answer: 'yes', photos: [P] },    'chk-15-10': { answer: 'yes', photos: [P] },
  'chk-16-1': { answer: 'yes', photos: [P] },
  'chk-17-1': { answer: 'yes', photos: [P] },    'chk-17-2': { answer: 'yes', photos: [P] },
  'chk-17-3': { answer: 'yes', photos: [P] },    'chk-17-4': { answer: 'yes', photos: [P] },
  'chk-17-5': { answer: 'yes', photos: [P] },    'chk-17-6': { answer: 'yes', photos: [P] },
  'chk-17-7': { answer: 'yes', photos: [P] },    'chk-17-8': { answer: 'yes', photos: [P] },
  'chk-17-9': { answer: 'yes', photos: [P] },    'chk-17-10': { answer: 'yes', photos: [P] },
  'chk-18-1': { answer: 'yes', photos: [P] },
}

const REPAIR_FULL: AnswerMap = {
  'chk-1-1':  { answer: 'yes', photos: [P, P] }, 'chk-1-2':  { answer: 'yes', photos: [P] },
  'chk-1-3':  { answer: 'yes', photos: [P] },    'chk-1-4':  { answer: 'yes', photos: [P] },
  'chk-1-5':  { answer: 'yes', photos: [P] },    'chk-2-1':  { answer: 'yes', photos: [P] },
  'chk-2-2':  { answer: 'na' },                  'chk-2-3':  { answer: 'yes', photos: [P] },
  'chk-3-1':  { answer: 'yes', photos: [P] },    'chk-3-2':  { answer: 'yes', photos: [P] },
  'chk-4-1':  { answer: 'yes', photos: [P, P] }, 'chk-4-2':  { answer: 'yes', photos: [P] },
  'chk-5-1':  { answer: 'yes', photos: [P] },    'chk-5-2':  { answer: 'yes', photos: [P] },
  'chk-5-3':  { answer: 'yes', photos: [P] },    'chk-6-1':  { answer: 'yes', photos: [P] },
  'chk-6-2':  { answer: 'yes', photos: [P] },    'chk-6-3':  { answer: 'yes', photos: [P] },
  'chk-7-1':  { answer: 'yes', photos: [P] },
  'chk-8-1':  { answer: 'yes', photos: [P, P] }, 'chk-8-2':  { answer: 'na' },
  'chk-8-3':  { answer: 'yes', photos: [P] },    'chk-8-4':  { answer: 'yes', photos: [P] },
  'chk-9-1':  { answer: 'yes', photos: [P] },    'chk-9-2':  { answer: 'yes', photos: [P] },
  'chk-9-3':  { answer: 'yes', photos: [P] },    'chk-9-4':  { answer: 'yes', photos: [P] },
  'chk-9-5':  { answer: 'yes', photos: [P] },    'chk-10-1': { answer: 'yes', photos: [P] },
  'chk-10-2': { answer: 'yes', photos: [P] },    'chk-10-3': { answer: 'yes', photos: [P] },
  'chk-10-4': { answer: 'yes', photos: [P] },    'chk-10-5': { answer: 'yes', photos: [P] },
  'chk-10-6': { answer: 'yes', photos: [P] },    'chk-11-1': { answer: 'yes', photos: [P] },
  'chk-11-2': { answer: 'yes', photos: [P] },    'chk-11-3': { answer: 'yes', photos: [P] },
  'chk-11-4': { answer: 'yes', photos: [P] },    'chk-11-5': { answer: 'yes', photos: [P] },
  'chk-11-6': { answer: 'yes', photos: [P] },    'chk-12-1': { answer: 'yes', photos: [P] },
  'chk-13-1': { answer: 'yes', photos: [P, P] }, 'chk-13-2': { answer: 'yes', photos: [P] },
  'chk-14-1': { answer: 'yes', photos: [P] },    'chk-14-2': { answer: 'yes', photos: [P] },
  'chk-14-3': { answer: 'yes', photos: [P] },    'chk-14-4': { answer: 'yes', photos: [P] },
  'chk-14-5': { answer: 'yes', photos: [P] },
  'chk-15-1': { answer: 'yes', photos: [P] },    'chk-15-2': { answer: 'yes', photos: [P] },
  'chk-15-3': { answer: 'yes', photos: [P] },    'chk-15-4': { answer: 'yes', photos: [P] },
  'chk-15-5': { answer: 'yes', photos: [P] },    'chk-15-6': { answer: 'yes', photos: [P] },
  'chk-15-7': { answer: 'yes', photos: [P] },    'chk-15-8': { answer: 'yes', photos: [P] },
  'chk-15-9': { answer: 'yes', photos: [P] },    'chk-15-10': { answer: 'yes', photos: [P] },
  'chk-16-1': { answer: 'yes', photos: [P] },
  'chk-17-1': { answer: 'yes', photos: [P] },    'chk-17-2': { answer: 'yes', photos: [P] },
  'chk-17-3': { answer: 'yes', photos: [P] },    'chk-17-4': { answer: 'yes', photos: [P] },
  'chk-17-5': { answer: 'yes', photos: [P] },    'chk-17-6': { answer: 'yes', photos: [P] },
  'chk-17-7': { answer: 'yes', photos: [P] },    'chk-17-8': { answer: 'yes', photos: [P] },
  'chk-17-9': { answer: 'yes', photos: [P] },    'chk-17-10': { answer: 'yes', photos: [P] },
  'chk-18-1': { answer: 'yes', photos: [P] },
}

// Draft partial answers for Chennai (Exterior subsections 1–2 answered)
const BRANCH_DRAFT: AnswerMap = {
  'chk-1-1': { answer: 'yes',     photos: [P, P] },
  'chk-1-2': { answer: 'yes',     photos: [P] },
  'chk-1-3': { answer: 'yes',     photos: [P] },
  'chk-1-4': { answer: 'yes',     photos: [P] },
  'chk-1-5': { answer: 'yes',     photos: [P] },
  'chk-2-1': { answer: 'partial', remarks: 'Directional signage needs improvement and beautification', photos: [P] },
  'chk-2-2': { answer: 'na' },
  'chk-2-3': { answer: 'yes',     photos: [P] },
  'chk-8-1': { answer: 'yes',     photos: [P, P] },
  'chk-8-3': { answer: 'yes',     photos: [P] },
}

// Submitted Repair Center (all answered, one partial)
const REPAIR_SUBMITTED: AnswerMap = {
  ...REPAIR_FULL,
  'chk-9-2': { answer: 'partial', remarks: 'Some showroom areas need reorganisation', photos: [P] },
}

// ─── Compliance records (one per location per month) ─────────────────────────

export const complianceRecords: ComplianceRecord[] = [
  // May 2026 — current cycle
  {
    id: 'comp-1',
    locationName: 'Anna Salai - Chennai',
    facilityTypes: ['Branch Office', 'HQ', 'Executive Office'],
    sbu: 'South',
    month: 5,
    year: 2026,
    status: 'draft',
    checklist: buildChecklist('Branch Office', BRANCH_DRAFT),
    savedAt: '2026-05-07T09:30:00',
  },
  {
    id: 'comp-2',
    locationName: 'Coimbatore',
    facilityTypes: ['Branch Office', 'Parts Warehouse', 'Repair Center'],
    sbu: 'South',
    month: 5,
    year: 2026,
    status: 'pending',
    checklist: buildChecklist('Branch Office'),
  },
  {
    id: 'comp-3',
    locationName: 'Madurai',
    facilityTypes: ['Repair Center', 'Branch Office', 'Parts Warehouse'],
    sbu: 'South',
    month: 5,
    year: 2026,
    status: 'submitted',
    checklist: buildChecklist('Repair Center', REPAIR_SUBMITTED),
    submittedAt: '2026-06-03T11:15:00',
    submittedBy: 'Ravi Anand',
  },
  // April 2026 — history
  {
    id: 'comp-4',
    locationName: 'Anna Salai - Chennai',
    facilityTypes: ['Branch Office', 'HQ', 'Executive Office'],
    sbu: 'South',
    month: 4,
    year: 2026,
    status: 'submitted',
    checklist: buildChecklist('Branch Office', BRANCH_FULL),
    submittedAt: '2026-05-05T10:30:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-05-07T14:00:00',
    approvedBy: 'Suresh Nair',
  },
  {
    id: 'comp-5',
    locationName: 'Coimbatore',
    facilityTypes: ['Branch Office', 'Parts Warehouse', 'Repair Center'],
    sbu: 'South',
    month: 4,
    year: 2026,
    status: 'submitted',
    checklist: buildChecklist('Branch Office', BRANCH_FULL),
    submittedAt: '2026-05-04T09:00:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-05-07T15:00:00',
    approvedBy: 'Suresh Nair',
  },
  {
    id: 'comp-6',
    locationName: 'Madurai',
    facilityTypes: ['Repair Center', 'Branch Office', 'Parts Warehouse'],
    sbu: 'South',
    month: 4,
    year: 2026,
    status: 'submitted',
    checklist: buildChecklist('Repair Center', REPAIR_FULL),
    submittedAt: '2026-05-03T08:00:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-05-06T10:00:00',
    approvedBy: 'Suresh Nair',
  },
]


// ─── Cascade data: SBU → State → City → Location ─────────────────────────────

export const sbuCascade: Record<string, Record<string, Record<string, string[]>>> = {
  South: {
    'Tamil Nadu': {
      Chennai:     ['Anna Salai', 'Nungambakkam', 'T Nagar', 'Adyar', 'Porur'],
      Coimbatore:  ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Saravanampatti'],
      Madurai:     ['Mattuthavani', 'Anna Nagar', 'Bypass Road'],
      Trichy:      ['Thillai Nagar', 'Woraiyur', 'Srirangam'],
      Salem:       ['Salem'],
      Tiruppur:    ['Tiruppur'],
      Vellore:     ['Vellore'],
      Tirunelveli: ['Tirunelveli'],
    },
    Kerala: {
      Kochi:      ['MG Road', 'Edapally', 'Kakkanad', 'Aluva'],
      Trivandrum: ['Pattom', 'Kazhakuttam', 'Technopark'],
      Kozhikode:  ['Kozhikode'],
      Thrissur:   ['Thrissur'],
    },
    Karnataka: {
      Bengaluru:  ['Koramangala', 'Whitefield', 'Electronic City', 'Hebbal'],
      Mysuru:     ['Vijayanagar', 'Nazarbad', 'Gokulam'],
    },
  },
}

export const locationAdminPool = [
  { id: 'la-1', name: 'Arjun Nair',     email: 'arjun.nair@gmmco.com'     },
  { id: 'la-2', name: 'Meena Suresh',   email: 'meena.suresh@gmmco.com'   },
  { id: 'la-3', name: 'Ravi Kumar',     email: 'ravi.kumar@gmmco.com'     },
  { id: 'la-4', name: 'Mohan Das',      email: 'mohan.das@gmmco.com'      },
  { id: 'la-5', name: 'Sunita Reddy',   email: 'sunita.reddy@gmmco.com'   },
  { id: 'la-6', name: 'Meera Joshi',    email: 'meera.joshi@gmmco.com'    },
  { id: 'la-7', name: 'Bhavana Murthy', email: 'bhavana.m@gmmco.com'      },
  { id: 'la-8', name: 'Karthik Menon',  email: 'karthik.menon@gmmco.com'  },
]
