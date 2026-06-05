import type {
  Building,
  BuildingType,
  InfraCategory,
  ChecklistItem,
  ComplianceChecklistEntry,
  ChecklistAnswer,
  ComplianceRecord,
  OnboardingRequest,
  FacilityNotification,
} from '@/types/facility'

// ─── Buildings ───────────────────────────────────────────────────────────────

export const buildings: Building[] = [
  {
    id: 'bld-1',
    buildingId: 'BO_TN_CHN_ANNASALAI_600002',
    name: 'Branch Office - Chennai',
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
    remarks: 'Main operations hub for South SBU. Priority building for monthly compliance.',
    layoutPlanName: 'FloorPlan_Chennai_Branch_v2.pdf',
    complianceDocName: 'ComplianceGuidelines_Chennai.pdf',
    complianceStatus: 'draft',
    complianceProgress: 11,
    complianceTotal: 33,
    complianceDraftAge: 28,
  },
  {
    id: 'bld-2',
    buildingId: 'BO_TN_CBE_GANHIPURAM_641012',
    name: 'Branch Office - Coimbatore',
    type: 'Branch Office',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    location: 'Gandhipuram - Coimbatore',
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
    remarks: '',
    layoutPlanName: 'FloorPlan_Coimbatore_Office.pdf',
    complianceDocName: 'ComplianceDoc_Coimbatore.pdf',
    complianceStatus: 'pending',
    complianceProgress: 0,
    complianceTotal: 33,
  },
  {
    id: 'bld-3',
    buildingId: 'RC_TN_MDU_MATTUTHAVANI_625010',
    name: 'Repair Center - Madurai',
    type: 'Repair Center',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Madurai',
    location: 'Mattuthavani - Madurai',
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
    remarks: '',
    layoutPlanName: 'WorkshopFloorPlan_Madurai.pdf',
    complianceDocName: 'Safety_Compliance_Madurai.pdf',
    complianceStatus: 'submitted',
    complianceProgress: 33,
    complianceTotal: 33,
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

export function getCategoriesForBuildingType(buildingType: string) {
  return infraCategories.filter(
    (c) => c.applicability[buildingType as keyof typeof c.applicability] !== undefined
  )
}

// ─── Compliance checklist ─────────────────────────────────────────────────────

const ALL_TYPES: BuildingType[] = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']
const OFFICE_TYPES: BuildingType[] = ['Branch Office', 'Executive Office', 'HQ']
const WORKSHOP_TYPES: BuildingType[] = ['CRC', 'MRC', 'Repair Center']
const HEAVY_TYPES: BuildingType[] = ['Parts Warehouse', 'CRC', 'MRC', 'Repair Center']
const INSPECT_TYPES: BuildingType[] = ['CRC', 'Repair Center']

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // External & Premises
  { id: 'chk-ext-1', section: 'External & Premises',    label: 'Building signage clearly visible',                      mandatoryFor: ALL_TYPES },
  { id: 'chk-ext-2', section: 'External & Premises',    label: 'Entry gate / barrier functional and manned',            mandatoryFor: ALL_TYPES },
  { id: 'chk-ext-3', section: 'External & Premises',    label: 'Security cabin operational',                            mandatoryFor: ALL_TYPES },
  { id: 'chk-ext-4', section: 'External & Premises',    label: 'Parking area maintained and marked',                    mandatoryFor: OFFICE_TYPES },
  { id: 'chk-ext-5', section: 'External & Premises',    label: 'Perimeter fencing / boundary wall intact',              mandatoryFor: HEAVY_TYPES },
  { id: 'chk-ext-6', section: 'External & Premises',    label: 'Yard / open area clean and hazard-free',                mandatoryFor: [] },
  // Office & Facilities
  { id: 'chk-off-1', section: 'Office & Facilities',    label: 'Reception area clean and presentable',                  mandatoryFor: OFFICE_TYPES },
  { id: 'chk-off-2', section: 'Office & Facilities',    label: 'Workspaces organized and clutter-free',                 mandatoryFor: ALL_TYPES },
  { id: 'chk-off-3', section: 'Office & Facilities',    label: 'Washrooms clean and functional',                        mandatoryFor: ALL_TYPES },
  { id: 'chk-off-4', section: 'Office & Facilities',    label: 'Pantry / break area maintained',                        mandatoryFor: [] },
  { id: 'chk-off-5', section: 'Office & Facilities',    label: 'Meeting rooms clean and equipment functional',          mandatoryFor: OFFICE_TYPES },
  // Fire & Safety
  { id: 'chk-frs-1', section: 'Fire & Safety',          label: 'Fire extinguishers in place and within validity',       mandatoryFor: ALL_TYPES },
  { id: 'chk-frs-2', section: 'Fire & Safety',          label: 'Fire alarm system tested and functional',               mandatoryFor: ALL_TYPES },
  { id: 'chk-frs-3', section: 'Fire & Safety',          label: 'Emergency exits clear and properly marked',             mandatoryFor: ALL_TYPES },
  { id: 'chk-frs-4', section: 'Fire & Safety',          label: 'Emergency assembly point clearly marked',               mandatoryFor: ALL_TYPES },
  { id: 'chk-frs-5', section: 'Fire & Safety',          label: 'Smoke detectors / sprinklers operational',              mandatoryFor: ALL_TYPES },
  { id: 'chk-frs-6', section: 'Fire & Safety',          label: 'First aid kit stocked and accessible',                  mandatoryFor: ALL_TYPES },
  { id: 'chk-frs-7', section: 'Fire & Safety',          label: 'PPE station stocked and accessible',                    mandatoryFor: HEAVY_TYPES },
  { id: 'chk-frs-8', section: 'Fire & Safety',          label: 'Fire hydrant accessible and unobstructed',              mandatoryFor: [...WORKSHOP_TYPES, 'HQ'] },
  // Electrical
  { id: 'chk-elc-1', section: 'Electrical',             label: 'Electrical panel labeled, locked, and accessible',      mandatoryFor: ALL_TYPES },
  { id: 'chk-elc-2', section: 'Electrical',             label: 'No exposed wiring or unsafe connections',               mandatoryFor: ALL_TYPES },
  { id: 'chk-elc-3', section: 'Electrical',             label: 'UPS / backup power system functional',                  mandatoryFor: OFFICE_TYPES },
  { id: 'chk-elc-4', section: 'Electrical',             label: 'Earthing connections intact',                           mandatoryFor: ALL_TYPES },
  { id: 'chk-elc-5', section: 'Electrical',             label: 'Internal lighting adequate across all areas',           mandatoryFor: ALL_TYPES },
  // Workshop & Equipment
  { id: 'chk-wks-1', section: 'Workshop & Equipment',   label: 'Workshop floor clean, dry, and organized',              mandatoryFor: WORKSHOP_TYPES },
  { id: 'chk-wks-2', section: 'Workshop & Equipment',   label: 'Tools accounted for and properly stored',               mandatoryFor: WORKSHOP_TYPES },
  { id: 'chk-wks-3', section: 'Workshop & Equipment',   label: 'Inspection bay functional and safe',                    mandatoryFor: INSPECT_TYPES },
  { id: 'chk-wks-4', section: 'Workshop & Equipment',   label: 'Wash bay operational',                                  mandatoryFor: [] },
  // Environment & Security
  { id: 'chk-env-1', section: 'Environment & Security', label: 'Drainage system clear and functional',                  mandatoryFor: ALL_TYPES },
  { id: 'chk-env-2', section: 'Environment & Security', label: 'Waste disposal bins in place and emptied regularly',    mandatoryFor: ALL_TYPES },
  { id: 'chk-env-3', section: 'Environment & Security', label: 'Water supply adequate and functional',                  mandatoryFor: ALL_TYPES },
  { id: 'chk-env-4', section: 'Environment & Security', label: 'CCTV cameras operational and recording',                mandatoryFor: ALL_TYPES },
  { id: 'chk-env-5', section: 'Environment & Security', label: 'Green area / landscaping maintained',                   mandatoryFor: [] },
]

// ─── Checklist builder helpers ────────────────────────────────────────────────

type AnswerMap = Record<string, { answer: ChecklistAnswer; remarks?: string; photos?: string[] }>

const P = 'https://placehold.co/400x300/e2e8f0/64748b?text=Photo'

function buildChecklist(buildingType: BuildingType, answers: AnswerMap = {}): ComplianceChecklistEntry[] {
  return CHECKLIST_ITEMS.map((item) => {
    const isMandatory = item.mandatoryFor.includes(buildingType)
    const a = answers[item.id]
    return {
      itemId: item.id,
      section: item.section,
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
  'chk-ext-1': { answer: 'yes', photos: [P, P] },
  'chk-ext-2': { answer: 'yes', photos: [P] },
  'chk-ext-3': { answer: 'yes', photos: [P] },
  'chk-ext-4': { answer: 'yes', photos: [P] },
  'chk-ext-5': { answer: 'na' },
  'chk-ext-6': { answer: 'yes', photos: [P] },
  'chk-off-1': { answer: 'yes', photos: [P, P] },
  'chk-off-2': { answer: 'yes', photos: [P] },
  'chk-off-3': { answer: 'yes', photos: [P] },
  'chk-off-4': { answer: 'yes', photos: [P] },
  'chk-off-5': { answer: 'yes', photos: [P] },
  'chk-frs-1': { answer: 'yes', photos: [P, P] },
  'chk-frs-2': { answer: 'yes', photos: [P] },
  'chk-frs-3': { answer: 'yes', photos: [P, P] },
  'chk-frs-4': { answer: 'yes', photos: [P] },
  'chk-frs-5': { answer: 'yes', photos: [P] },
  'chk-frs-6': { answer: 'yes', photos: [P] },
  'chk-frs-7': { answer: 'na' },
  'chk-frs-8': { answer: 'na' },
  'chk-elc-1': { answer: 'yes', photos: [P] },
  'chk-elc-2': { answer: 'yes', photos: [P] },
  'chk-elc-3': { answer: 'yes', photos: [P] },
  'chk-elc-4': { answer: 'yes', photos: [P] },
  'chk-elc-5': { answer: 'yes', photos: [P] },
  'chk-wks-1': { answer: 'na' },
  'chk-wks-2': { answer: 'na' },
  'chk-wks-3': { answer: 'na' },
  'chk-wks-4': { answer: 'na' },
  'chk-env-1': { answer: 'yes', photos: [P] },
  'chk-env-2': { answer: 'yes', photos: [P] },
  'chk-env-3': { answer: 'yes', photos: [P] },
  'chk-env-4': { answer: 'yes', photos: [P, P] },
  'chk-env-5': { answer: 'yes', photos: [P] },
}

const REPAIR_FULL: AnswerMap = {
  'chk-ext-1': { answer: 'yes', photos: [P, P] },
  'chk-ext-2': { answer: 'yes', photos: [P] },
  'chk-ext-3': { answer: 'yes', photos: [P] },
  'chk-ext-4': { answer: 'na' },
  'chk-ext-5': { answer: 'yes', photos: [P, P] },
  'chk-ext-6': { answer: 'yes', photos: [P] },
  'chk-off-1': { answer: 'na' },
  'chk-off-2': { answer: 'yes', photos: [P] },
  'chk-off-3': { answer: 'yes', photos: [P] },
  'chk-off-4': { answer: 'yes', photos: [P] },
  'chk-off-5': { answer: 'na' },
  'chk-frs-1': { answer: 'yes', photos: [P, P] },
  'chk-frs-2': { answer: 'yes', photos: [P] },
  'chk-frs-3': { answer: 'yes', photos: [P, P] },
  'chk-frs-4': { answer: 'yes', photos: [P] },
  'chk-frs-5': { answer: 'yes', photos: [P] },
  'chk-frs-6': { answer: 'yes', photos: [P] },
  'chk-frs-7': { answer: 'yes', photos: [P, P] },
  'chk-frs-8': { answer: 'yes', photos: [P] },
  'chk-elc-1': { answer: 'yes', photos: [P] },
  'chk-elc-2': { answer: 'yes', photos: [P] },
  'chk-elc-3': { answer: 'na' },
  'chk-elc-4': { answer: 'yes', photos: [P] },
  'chk-elc-5': { answer: 'yes', photos: [P] },
  'chk-wks-1': { answer: 'yes', photos: [P, P] },
  'chk-wks-2': { answer: 'yes', photos: [P] },
  'chk-wks-3': { answer: 'yes', photos: [P, P] },
  'chk-wks-4': { answer: 'yes', photos: [P] },
  'chk-env-1': { answer: 'yes', photos: [P] },
  'chk-env-2': { answer: 'yes', photos: [P] },
  'chk-env-3': { answer: 'yes', photos: [P] },
  'chk-env-4': { answer: 'yes', photos: [P, P] },
  'chk-env-5': { answer: 'yes', photos: [P] },
}

// Draft partial answers for Chennai (sections 1–2 answered)
const BRANCH_DRAFT: AnswerMap = {
  'chk-ext-1': { answer: 'yes',     photos: [P, P] },
  'chk-ext-2': { answer: 'yes',     photos: [P] },
  'chk-ext-3': { answer: 'yes',     photos: [P] },
  'chk-ext-4': { answer: 'yes',     photos: [P] },
  'chk-ext-5': { answer: 'na' },
  'chk-ext-6': { answer: 'na' },
  'chk-off-1': { answer: 'yes',     photos: [P, P] },
  'chk-off-2': { answer: 'partial', remarks: 'East wing workspaces need tidying', photos: [P] },
  'chk-off-3': { answer: 'yes',     photos: [P] },
  'chk-off-4': { answer: 'na' },
  'chk-off-5': { answer: 'yes',     photos: [P] },
}

// Submitted Repair Center (all answered, one partial)
const REPAIR_SUBMITTED: AnswerMap = {
  ...REPAIR_FULL,
  'chk-off-2': { answer: 'partial', remarks: 'Some storage areas need reorganisation', photos: [P] },
}

// ─── Compliance records ───────────────────────────────────────────────────────

export const complianceRecords: ComplianceRecord[] = [
  // May 2026 — current cycle
  {
    id: 'comp-1',
    buildingId: 'bld-1',
    buildingName: 'Branch Office - Chennai',
    month: 5,
    year: 2026,
    status: 'draft',
    checklist: buildChecklist('Branch Office', BRANCH_DRAFT),
    savedAt: '2026-05-07T09:30:00',
  },
  {
    id: 'comp-2',
    buildingId: 'bld-2',
    buildingName: 'Branch Office - Coimbatore',
    month: 5,
    year: 2026,
    status: 'pending',
    checklist: buildChecklist('Branch Office'),
  },
  {
    id: 'comp-3',
    buildingId: 'bld-3',
    buildingName: 'Repair Center - Madurai',
    month: 5,
    year: 2026,
    status: 'submitted',
    checklist: buildChecklist('Repair Center', REPAIR_SUBMITTED),
    submittedAt: '2026-05-11T11:15:00',
    submittedBy: 'Ravi Anand',
  },
  // April 2026 — approved history
  {
    id: 'comp-4',
    buildingId: 'bld-1',
    buildingName: 'Branch Office - Chennai',
    month: 4,
    year: 2026,
    status: 'approved',
    checklist: buildChecklist('Branch Office', BRANCH_FULL),
    submittedAt: '2026-04-10T10:30:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-04-12T14:00:00',
    approvedBy: 'Suresh Nair',
  },
  {
    id: 'comp-5',
    buildingId: 'bld-2',
    buildingName: 'Branch Office - Coimbatore',
    month: 4,
    year: 2026,
    status: 'approved',
    checklist: buildChecklist('Branch Office', BRANCH_FULL),
    submittedAt: '2026-04-09T09:00:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-04-12T15:00:00',
    approvedBy: 'Suresh Nair',
  },
  {
    id: 'comp-6',
    buildingId: 'bld-3',
    buildingName: 'Repair Center - Madurai',
    month: 4,
    year: 2026,
    status: 'approved',
    checklist: buildChecklist('Repair Center', REPAIR_FULL),
    submittedAt: '2026-04-08T08:00:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-04-11T10:00:00',
    approvedBy: 'Suresh Nair',
  },
]

// ─── Onboarding request (dummy — in SBU Admin review) ────────────────────────

export const dummyOnboardingRequest: OnboardingRequest = {
  id: 'onb-1',
  buildingName: 'Branch Office - Chennai',
  buildingType: 'Branch Office',
  sbu: 'South',
  state: 'Tamil Nadu',
  city: 'Chennai',
  location: 'Nungambakkam - Chennai',
  address1: '5 Nungambakkam High Road',
  pinCode: '600034',
  floors: 2,
  categoryCount: 12,
  status: 'sbu-review',
  submittedAt: '2026-05-06T14:00:00',
  submittedBy: 'Ravi Anand',
  submittedById: 'EMP-4821',
  timeline: [
    {
      stage: 1,
      label: 'Request submitted',
      status: 'done',
      timestamp: '2026-05-06T14:00:00',
    },
    {
      stage: 2,
      label: 'SBU Admin review',
      sublabel: 'Pending — South SBU',
      status: 'active',
    },
    {
      stage: 3,
      label: 'Business activated',
      sublabel: 'Awaiting approval',
      status: 'pending',
    },
  ],
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const facilityNotifications: FacilityNotification[] = [
  {
    id: 'fn-1',
    message: 'Your draft for Branch Office - Chennai is 28 days old. Submit before 12 June to avoid expiry.',
    timestamp: '2026-05-07T09:30:00',
    type: 'warning',
  },
  {
    id: 'fn-2',
    message: 'Repair Center - Madurai compliance submitted successfully.',
    timestamp: '2026-05-11T11:15:00',
    type: 'success',
  },
  {
    id: 'fn-3',
    message: 'New compliance cycle started for May 2026. 3 businesses require checklist completion.',
    timestamp: '2026-04-30T09:00:00',
    type: 'info',
  },
]

// ─── Cascade data: SBU → State → City → Location ─────────────────────────────

export const sbuCascade: Record<string, Record<string, Record<string, string[]>>> = {
  South: {
    'Tamil Nadu': {
      Chennai:    ['Anna Salai', 'Nungambakkam', 'T Nagar', 'Adyar', 'Porur'],
      Coimbatore: ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Saravanampatti'],
      Madurai:    ['Mattuthavani', 'Anna Nagar', 'Bypass Road'],
      Trichy:     ['Thillai Nagar', 'Woraiyur', 'Srirangam'],
    },
    Kerala: {
      Kochi:      ['MG Road', 'Edapally', 'Kakkanad', 'Aluva'],
      Trivandrum: ['Pattom', 'Kazhakuttam', 'Technopark'],
    },
    Karnataka: {
      Bengaluru:  ['Koramangala', 'Whitefield', 'Electronic City', 'Hebbal'],
      Mysuru:     ['Vijayanagar', 'Nazarbad', 'Gokulam'],
    },
  },
  North: {
    'Delhi NCR': {
      'New Delhi':  ['Connaught Place', 'Karol Bagh', 'Nehru Place'],
      Gurugram:     ['Sector 21', 'Udyog Vihar', 'DLF Phase 3'],
      Noida:        ['Sector 62', 'Sector 18', 'Greater Noida'],
    },
    'Uttar Pradesh': {
      Lucknow:  ['Hazratganj', 'Gomti Nagar', 'Alambagh'],
      Kanpur:   ['Civil Lines', 'Panki Industrial Area'],
    },
    Rajasthan: {
      Jaipur: ['C-Scheme', 'Bani Park', 'Tonk Road'],
      Jodhpur: ['Ratanada', 'Paota'],
    },
  },
  West: {
    Maharashtra: {
      Mumbai:   ['Bandra Kurla', 'Andheri', 'Lower Parel', 'Powai'],
      Pune:     ['Shivaji Nagar', 'Hinjewadi', 'Kharadi'],
      Nagpur:   ['Civil Lines', 'Dharampeth'],
    },
    Gujarat: {
      Ahmedabad: ['Navrangpura', 'SG Highway', 'Prahlad Nagar'],
      Surat:     ['Ring Road', 'Athwa Lines'],
    },
  },
  East: {
    'West Bengal': {
      Kolkata:   ['Salt Lake', 'Park Street', 'Rajarhat'],
      Durgapur:  ['City Centre', 'Benachity'],
    },
    Odisha: {
      Bhubaneswar: ['Saheed Nagar', 'Patia', 'Chandrasekharpur'],
      Rourkela:    ['Civil Township', 'Sector 7'],
    },
  },
}
