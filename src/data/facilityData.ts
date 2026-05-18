import type {
  Building,
  InfraCategory,
  ComplianceRecord,
  OnboardingRequest,
  FacilityNotification,
} from '@/types/facility'

// ─── Buildings ───────────────────────────────────────────────────────────────

export const buildings: Building[] = [
  {
    id: 'bld-1',
    buildingId: 'BO_TN_CHN_ANNASALAI_600002',
    name: 'GMMCO Chennai Branch',
    type: 'Branch Office',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Chennai',
    location: 'Anna Salai',
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
    photoUrl: 'https://loremflickr.com/80/80/building,office?lock=11',
    layoutPlanName: 'FloorPlan_Chennai_Branch_v2.pdf',
    complianceDocName: 'ComplianceGuidelines_Chennai.pdf',
    complianceStatus: 'draft',
    complianceProgress: 8,
    complianceTotal: 35,
    complianceDraftAge: 6,
  },
  {
    id: 'bld-2',
    buildingId: 'BO_TN_CBE_GANHIPURAM_641012',
    name: 'GMMCO Coimbatore Office',
    type: 'Branch Office',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    location: 'Gandhipuram',
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
    photoUrl: 'https://loremflickr.com/80/80/building,office?lock=47',
    layoutPlanName: 'FloorPlan_Coimbatore_Office.pdf',
    complianceDocName: 'ComplianceDoc_Coimbatore.pdf',
    complianceStatus: 'pending',
    complianceProgress: 0,
    complianceTotal: 35,
  },
  {
    id: 'bld-3',
    buildingId: 'RC_TN_MDU_MATTUTHAVANI_625010',
    name: 'GMMCO Madurai Workshop',
    type: 'Repair Center',
    sbu: 'South',
    state: 'Tamil Nadu',
    city: 'Madurai',
    location: 'Mattuthavani',
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
    photoUrl: 'https://loremflickr.com/80/80/factory,warehouse?lock=23',
    layoutPlanName: 'WorkshopFloorPlan_Madurai.pdf',
    complianceDocName: 'Safety_Compliance_Madurai.pdf',
    complianceStatus: 'submitted',
    complianceProgress: 35,
    complianceTotal: 35,
  },
]

// ─── Infrastructure Categories ────────────────────────────────────────────────

export const infraCategories: InfraCategory[] = [
  // External
  { id: 'cat-ext-1', name: 'Building Front',         group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-2', name: 'Building Signage',        group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-3', name: 'Entry Gate',              group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-4', name: 'Security Cabin',          group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-5', name: 'Parking Area',            group: 'External',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-ext-6', name: 'Yard / Open Area',        group: 'External',      applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },

  // Office
  { id: 'cat-off-1', name: 'Reception Area',          group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-2', name: 'Meeting Room',             group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-3', name: 'Pantry',                  group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',       'CRC': 'optional',       'MRC': 'optional',       'Repair Center': 'optional',       'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-4', name: 'Washroom',                group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory',      'CRC': 'mandatory',      'MRC': 'mandatory',      'Repair Center': 'mandatory',      'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-off-5', name: 'Training Room',           group: 'Office',        applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-off-6', name: 'Office Workspace',        group: 'Office',        applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'not-applicable', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },

  // Workshop
  { id: 'cat-wks-1', name: 'Workshop Floor',          group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-wks-2', name: 'Tool Storage',            group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-wks-3', name: 'Inspection Bay',          group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'mandatory', 'MRC': 'optional',  'Repair Center': 'mandatory', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-wks-4', name: 'Wash Bay',                group: 'Workshop',      applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'not-applicable', 'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },

  // Warehouse
  { id: 'cat-whs-1', name: 'Warehouse Storage Area',  group: 'Warehouse',     applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'mandatory', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-whs-2', name: 'Loading / Unloading Dock',group: 'Warehouse',     applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'mandatory', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },
  { id: 'cat-whs-3', name: 'Rack Storage',            group: 'Warehouse',     applicability: { 'Branch Office': 'not-applicable', 'Parts Warehouse': 'mandatory', 'CRC': 'not-applicable', 'MRC': 'not-applicable', 'Repair Center': 'not-applicable', 'Executive Office': 'not-applicable', 'HQ': 'not-applicable' } },

  // Electrical
  { id: 'cat-elc-1', name: 'Electrical Panel',        group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-elc-2', name: 'Transformer',             group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-elc-3', name: 'UPS Room',                group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-elc-4', name: 'Earthing Pit',            group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-elc-5', name: 'Internal Lighting',       group: 'Electrical',    applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-elc-6', name: 'DG Room',                 group: 'Electrical',    applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'optional',  'HQ': 'mandatory' } },

  // Fire & Safety
  { id: 'cat-frs-1', name: 'Fire Extinguishers',              group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-2', name: 'Emergency Assembly Point',        group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-3', name: 'Smoke Detector / Sprinkler System',group: 'Fire & Safety',applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-4', name: 'Fire Alarm',                      group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-5', name: 'Emergency Exit',                  group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-6', name: 'First Aid Kit',                   group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-frs-7', name: 'PPE Station',                     group: 'Fire & Safety', applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'optional'  } },
  { id: 'cat-frs-8', name: 'Fire Hydrant',                    group: 'Fire & Safety', applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-frs-9', name: 'Fire Pump Room / Fire Control Room',group:'Fire & Safety', applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },

  // Environment
  { id: 'cat-env-1', name: 'Drainage System',         group: 'Environment',   applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-env-2', name: 'Green Area',              group: 'Environment',   applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-env-3', name: 'Waste Disposal',          group: 'Environment',   applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },

  // Security
  { id: 'cat-sec-1', name: 'CCTV Surveillance',       group: 'Security',      applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-sec-2', name: 'Access Control System',   group: 'Security',      applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'optional',  'MRC': 'optional',  'Repair Center': 'optional',  'Executive Office': 'mandatory', 'HQ': 'mandatory' } },

  // Utilities
  { id: 'cat-utl-1', name: 'Water Tank',              group: 'Utilities',     applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'mandatory', 'HQ': 'mandatory' } },
  { id: 'cat-utl-2', name: 'Pump Room',               group: 'Utilities',     applicability: { 'Branch Office': 'mandatory', 'Parts Warehouse': 'mandatory', 'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
  { id: 'cat-utl-3', name: 'Generator Room',          group: 'Utilities',     applicability: { 'Branch Office': 'optional',  'Parts Warehouse': 'optional',  'CRC': 'mandatory', 'MRC': 'mandatory', 'Repair Center': 'mandatory', 'Executive Office': 'optional',  'HQ': 'mandatory' } },
]

// ─── Helper: get categories for a building type ───────────────────────────────

export function getCategoriesForBuildingType(buildingType: string) {
  return infraCategories.filter(
    (c) => c.applicability[buildingType as keyof typeof c.applicability] !== undefined
  )
}

// ─── Compliance records (May 2026) ───────────────────────────────────────────

// All applicable categories for a Branch Office (27 mandatory + 8 optional = 35 total)
// Order matches infraCategories groups: External → Office → Electrical → Fire & Safety → Environment → Security → Utilities
const BRANCH_OFFICE_ALL_CATS = [
  // External (5M + 1O)
  { categoryId: 'cat-ext-1', categoryName: 'Building Front',                      group: 'External'      },
  { categoryId: 'cat-ext-2', categoryName: 'Building Signage',                    group: 'External'      },
  { categoryId: 'cat-ext-3', categoryName: 'Entry Gate',                          group: 'External'      },
  { categoryId: 'cat-ext-4', categoryName: 'Security Cabin',                      group: 'External'      },
  { categoryId: 'cat-ext-5', categoryName: 'Parking Area',                        group: 'External'      },
  { categoryId: 'cat-ext-6', categoryName: 'Yard / Open Area',                    group: 'External'      },
  // Office (5M + 1O)
  { categoryId: 'cat-off-1', categoryName: 'Reception Area',                      group: 'Office'        },
  { categoryId: 'cat-off-2', categoryName: 'Meeting Room',                        group: 'Office'        },
  { categoryId: 'cat-off-3', categoryName: 'Pantry',                              group: 'Office'        },
  { categoryId: 'cat-off-4', categoryName: 'Washroom',                            group: 'Office'        },
  { categoryId: 'cat-off-5', categoryName: 'Training Room',                       group: 'Office'        },
  { categoryId: 'cat-off-6', categoryName: 'Office Workspace',                    group: 'Office'        },
  // Electrical (5M + 1O)
  { categoryId: 'cat-elc-1', categoryName: 'Electrical Panel',                    group: 'Electrical'    },
  { categoryId: 'cat-elc-2', categoryName: 'Transformer',                         group: 'Electrical'    },
  { categoryId: 'cat-elc-3', categoryName: 'UPS Room',                            group: 'Electrical'    },
  { categoryId: 'cat-elc-4', categoryName: 'Earthing Pit',                        group: 'Electrical'    },
  { categoryId: 'cat-elc-5', categoryName: 'Internal Lighting',                   group: 'Electrical'    },
  { categoryId: 'cat-elc-6', categoryName: 'DG Room',                             group: 'Electrical'    },
  // Fire & Safety (7M + 2O)
  { categoryId: 'cat-frs-1', categoryName: 'Fire Extinguishers',                  group: 'Fire & Safety' },
  { categoryId: 'cat-frs-2', categoryName: 'Emergency Assembly Point',            group: 'Fire & Safety' },
  { categoryId: 'cat-frs-3', categoryName: 'Smoke Detector / Sprinkler System',   group: 'Fire & Safety' },
  { categoryId: 'cat-frs-4', categoryName: 'Fire Alarm',                          group: 'Fire & Safety' },
  { categoryId: 'cat-frs-5', categoryName: 'Emergency Exit',                      group: 'Fire & Safety' },
  { categoryId: 'cat-frs-6', categoryName: 'First Aid Kit',                       group: 'Fire & Safety' },
  { categoryId: 'cat-frs-7', categoryName: 'PPE Station',                         group: 'Fire & Safety' },
  { categoryId: 'cat-frs-8', categoryName: 'Fire Hydrant',                        group: 'Fire & Safety' },
  { categoryId: 'cat-frs-9', categoryName: 'Fire Pump Room / Fire Control Room',  group: 'Fire & Safety' },
  // Environment (2M + 1O)
  { categoryId: 'cat-env-1', categoryName: 'Drainage System',                     group: 'Environment'   },
  { categoryId: 'cat-env-2', categoryName: 'Green Area',                          group: 'Environment'   },
  { categoryId: 'cat-env-3', categoryName: 'Waste Disposal',                      group: 'Environment'   },
  // Security (1M + 1O)
  { categoryId: 'cat-sec-1', categoryName: 'CCTV Surveillance',                   group: 'Security'      },
  { categoryId: 'cat-sec-2', categoryName: 'Access Control System',               group: 'Security'      },
  // Utilities (2M + 1O)
  { categoryId: 'cat-utl-1', categoryName: 'Water Tank',                          group: 'Utilities'     },
  { categoryId: 'cat-utl-2', categoryName: 'Pump Room',                           group: 'Utilities'     },
  { categoryId: 'cat-utl-3', categoryName: 'Generator Room',                      group: 'Utilities'     },
]

// All applicable categories for a Repair Center (27 mandatory + 8 optional = 35 total)
const REPAIR_CENTER_ALL_CATS = [
  // Workshop (3M + 1O)
  { categoryId: 'cat-wks-1', categoryName: 'Workshop Floor',                      group: 'Workshop'      },
  { categoryId: 'cat-wks-2', categoryName: 'Tool Storage',                        group: 'Workshop'      },
  { categoryId: 'cat-wks-3', categoryName: 'Inspection Bay',                      group: 'Workshop'      },
  { categoryId: 'cat-wks-4', categoryName: 'Wash Bay',                            group: 'Workshop'      },
  // External (4M + 2O)
  { categoryId: 'cat-ext-1', categoryName: 'Building Front',                      group: 'External'      },
  { categoryId: 'cat-ext-2', categoryName: 'Building Signage',                    group: 'External'      },
  { categoryId: 'cat-ext-3', categoryName: 'Entry Gate',                          group: 'External'      },
  { categoryId: 'cat-ext-4', categoryName: 'Security Cabin',                      group: 'External'      },
  { categoryId: 'cat-ext-5', categoryName: 'Parking Area',                        group: 'External'      },
  { categoryId: 'cat-ext-6', categoryName: 'Yard / Open Area',                    group: 'External'      },
  // Office (1M + 1O)
  { categoryId: 'cat-off-3', categoryName: 'Pantry',                              group: 'Office'        },
  { categoryId: 'cat-off-4', categoryName: 'Washroom',                            group: 'Office'        },
  // Electrical (4M + 2O)
  { categoryId: 'cat-elc-1', categoryName: 'Electrical Panel',                    group: 'Electrical'    },
  { categoryId: 'cat-elc-2', categoryName: 'Transformer',                         group: 'Electrical'    },
  { categoryId: 'cat-elc-3', categoryName: 'UPS Room',                            group: 'Electrical'    },
  { categoryId: 'cat-elc-4', categoryName: 'Earthing Pit',                        group: 'Electrical'    },
  { categoryId: 'cat-elc-5', categoryName: 'Internal Lighting',                   group: 'Electrical'    },
  { categoryId: 'cat-elc-6', categoryName: 'DG Room',                             group: 'Electrical'    },
  // Fire & Safety (9M)
  { categoryId: 'cat-frs-1', categoryName: 'Fire Extinguishers',                  group: 'Fire & Safety' },
  { categoryId: 'cat-frs-2', categoryName: 'Emergency Assembly Point',            group: 'Fire & Safety' },
  { categoryId: 'cat-frs-3', categoryName: 'Smoke Detector / Sprinkler System',   group: 'Fire & Safety' },
  { categoryId: 'cat-frs-4', categoryName: 'Fire Alarm',                          group: 'Fire & Safety' },
  { categoryId: 'cat-frs-5', categoryName: 'Emergency Exit',                      group: 'Fire & Safety' },
  { categoryId: 'cat-frs-6', categoryName: 'First Aid Kit',                       group: 'Fire & Safety' },
  { categoryId: 'cat-frs-7', categoryName: 'PPE Station',                         group: 'Fire & Safety' },
  { categoryId: 'cat-frs-8', categoryName: 'Fire Hydrant',                        group: 'Fire & Safety' },
  { categoryId: 'cat-frs-9', categoryName: 'Fire Pump Room / Fire Control Room',  group: 'Fire & Safety' },
  // Environment (2M + 1O)
  { categoryId: 'cat-env-1', categoryName: 'Drainage System',                     group: 'Environment'   },
  { categoryId: 'cat-env-2', categoryName: 'Green Area',                          group: 'Environment'   },
  { categoryId: 'cat-env-3', categoryName: 'Waste Disposal',                      group: 'Environment'   },
  // Security (1M + 1O)
  { categoryId: 'cat-sec-1', categoryName: 'CCTV Surveillance',                   group: 'Security'      },
  { categoryId: 'cat-sec-2', categoryName: 'Access Control System',               group: 'Security'      },
  // Utilities (3M)
  { categoryId: 'cat-utl-1', categoryName: 'Water Tank',                          group: 'Utilities'     },
  { categoryId: 'cat-utl-2', categoryName: 'Pump Room',                           group: 'Utilities'     },
  { categoryId: 'cat-utl-3', categoryName: 'Generator Room',                      group: 'Utilities'     },
]

const MAY_2026_CHENNAI_DRAFT_DATE = new Date('2026-05-07T09:30:00').toISOString()

// IDs of the 8 categories already uploaded in the Chennai May 2026 draft
const CHENNAI_MAY_UPLOADED = new Set([
  'cat-ext-1', 'cat-ext-2', 'cat-ext-3', 'cat-ext-4', 'cat-ext-5',
  'cat-off-1', 'cat-off-2', 'cat-off-3',
])
const CHENNAI_MAY_UPLOAD_TIMES: Record<string, string> = {
  'cat-ext-1': '2026-05-07T09:30:00', 'cat-ext-2': '2026-05-07T09:32:00',
  'cat-ext-3': '2026-05-07T09:34:00', 'cat-ext-4': '2026-05-07T09:36:00',
  'cat-ext-5': '2026-05-07T09:38:00', 'cat-off-1': '2026-05-07T09:40:00',
  'cat-off-2': '2026-05-07T09:42:00', 'cat-off-3': '2026-05-07T09:44:00',
}

// Chennai draft — 8 of 35 uploaded
const chennaiCategories = BRANCH_OFFICE_ALL_CATS.map((c) => ({
  ...c,
  photoUrl: CHENNAI_MAY_UPLOADED.has(c.categoryId)
    ? 'https://placehold.co/200x150/e2e8f0/64748b?text=Photo'
    : undefined,
  uploadedAt: CHENNAI_MAY_UPLOAD_TIMES[c.categoryId],
}))

// Madurai — all 35 RC categories uploaded, Submitted
const maduraiCategories = REPAIR_CENTER_ALL_CATS.map((c, i) => ({
  ...c,
  photoUrl: `https://placehold.co/200x150/e2e8f0/64748b?text=Photo+${i + 1}`,
  uploadedAt: '2026-05-11T11:00:00',
}))

export const complianceRecords: ComplianceRecord[] = [
  {
    id: 'comp-1',
    buildingId: 'bld-1',
    buildingName: 'GMMCO Chennai Branch',
    month: 5,
    year: 2026,
    status: 'draft',
    categories: chennaiCategories,
    totalMandatory: 27,
    totalOptional: 8,
    savedAt: MAY_2026_CHENNAI_DRAFT_DATE,
  },
  {
    id: 'comp-2',
    buildingId: 'bld-2',
    buildingName: 'GMMCO Coimbatore Office',
    month: 5,
    year: 2026,
    status: 'pending',
    categories: [],
    totalMandatory: 27,
    totalOptional: 8,
  },
  {
    id: 'comp-3',
    buildingId: 'bld-3',
    buildingName: 'GMMCO Madurai Workshop',
    month: 5,
    year: 2026,
    status: 'submitted',
    categories: maduraiCategories,
    totalMandatory: 27,
    totalOptional: 8,
    submittedAt: '2026-05-11T11:15:00',
    submittedBy: 'Ravi Anand',
  },
  // April 2026 history — all 35 categories with photos for each building
  {
    id: 'comp-4',
    buildingId: 'bld-1',
    buildingName: 'GMMCO Chennai Branch',
    month: 4,
    year: 2026,
    status: 'approved',
    categories: BRANCH_OFFICE_ALL_CATS.map((c) => ({
      ...c,
      photoUrl: 'https://placehold.co/200x150/e2e8f0/64748b?text=Apr',
      uploadedAt: '2026-04-10T09:00:00',
    })),
    totalMandatory: 27,
    totalOptional: 8,
    submittedAt: '2026-04-10T10:30:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-04-12T14:00:00',
    approvedBy: 'SBU Admin — South',
  },
  {
    id: 'comp-5',
    buildingId: 'bld-2',
    buildingName: 'GMMCO Coimbatore Office',
    month: 4,
    year: 2026,
    status: 'approved',
    categories: BRANCH_OFFICE_ALL_CATS.map((c) => ({
      ...c,
      photoUrl: 'https://placehold.co/200x150/e2e8f0/64748b?text=Apr',
      uploadedAt: '2026-04-09T08:00:00',
    })),
    totalMandatory: 27,
    totalOptional: 8,
    submittedAt: '2026-04-09T09:00:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-04-12T15:00:00',
    approvedBy: 'SBU Admin — South',
  },
  {
    id: 'comp-6',
    buildingId: 'bld-3',
    buildingName: 'GMMCO Madurai Workshop',
    month: 4,
    year: 2026,
    status: 'approved',
    categories: REPAIR_CENTER_ALL_CATS.map((c) => ({
      ...c,
      photoUrl: 'https://placehold.co/200x150/e2e8f0/64748b?text=Apr',
      uploadedAt: '2026-04-08T07:00:00',
    })),
    totalMandatory: 27,
    totalOptional: 8,
    submittedAt: '2026-04-08T08:00:00',
    submittedBy: 'Ravi Anand',
    approvedAt: '2026-04-11T10:00:00',
    approvedBy: 'SBU Admin — South',
  },
]

// ─── Onboarding request (dummy — in SBU Admin review) ────────────────────────

export const dummyOnboardingRequest: OnboardingRequest = {
  id: 'onb-1',
  buildingName: 'GMMCO Chennai Annex',
  buildingType: 'Branch Office',
  sbu: 'South',
  state: 'Tamil Nadu',
  city: 'Chennai',
  location: 'Nungambakkam',
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
      label: 'Building activated',
      sublabel: 'Awaiting approval',
      status: 'pending',
    },
  ],
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const facilityNotifications: FacilityNotification[] = [
  {
    id: 'fn-1',
    message: 'Your draft for GMMCO Chennai Branch is 6 days old. Submit before 12 June to avoid expiry.',
    timestamp: '2026-05-12T10:00:00',
    type: 'warning',
  },
  {
    id: 'fn-2',
    message: 'GMMCO Madurai Workshop compliance submitted successfully.',
    timestamp: '2026-05-11T11:15:00',
    type: 'success',
  },
  {
    id: 'fn-3',
    message: 'New compliance cycle started for May 2026. 3 buildings require photo uploads.',
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
