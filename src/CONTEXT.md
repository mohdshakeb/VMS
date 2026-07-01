# Codebase Context — VMS

## Code Structure

```
src/
├── components/           # Shared UI components
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── BottomSheet.tsx
│   ├── SearchBar.tsx
│   ├── TabBar.tsx
│   ├── StatusBadge.tsx
│   ├── NotificationBell.tsx
│   └── RoleSwitcher.tsx
├── layouts/
│   └── AppLayout.tsx     # Sidebar (desktop) / bottom bar (mobile), role-based nav
├── pages/
│   ├── employee/
│   │   ├── MyVisits.tsx
│   │   ├── VisitDetail.tsx
│   │   ├── NewRequest.tsx
│   │   └── ApproveWalkIn.tsx
│   ├── frontdesk/
│   │   ├── Dashboard.tsx
│   │   ├── ReviewConfirm.tsx
│   │   ├── CheckIn.tsx
│   │   ├── CheckOut.tsx
│   │   ├── CreateWalkIn.tsx
│   │   ├── AllVisits.tsx
│   │   └── ScanQR.tsx
│   ├── manager/
│   │   ├── Dashboard.tsx
│   │   ├── VisitorData.tsx
│   │   ├── VisitorProfile.tsx
│   │   ├── Reports.tsx
│   │   ├── ReportDetail.tsx
│   │   ├── Leads.tsx
│   │   └── LeadDetail.tsx
│   ├── visitor/
│   │   └── SelfRegister.tsx   # Mobile web form opened via QR scan
│   └── shared/
│       ├── Login.tsx
│       ├── Profile.tsx
│       └── Notifications.tsx
├── store/
│   ├── visitStore.ts     # Visit data, CRUD, state transitions
│   ├── authStore.ts      # Current role, role switching
│   └── notificationStore.ts
├── data/
│   ├── employees.ts      # 15-20 employees across 3 locations
│   ├── visitors.ts       # Visitor records
│   ├── visits.ts         # 30-40 visit records in various states
│   └── locations.ts      # 3 locations with types and zones
├── types/
│   ├── visit.ts          # Visit, VisitStatus, VisitType, Purpose
│   ├── user.ts           # Employee, Visitor, Role
│   ├── location.ts       # Location, Zone
│   └── notification.ts   # Notification types
├── utils/
│   └── helpers.ts        # Date formatting, status helpers
└── App.tsx               # Router setup with role-based routing
```

## Facility Module — Roles & Routes

The Facility module has two roles, both reusing the same `FacilityDetail` and `ComplianceDetail` pages (role-aware via `currentRole` from `authStore`):

- **Location Admin** (`/facility/*`) — manages a flat list of facilities, submits monthly compliance checklists. Login: `facilityadmin@gmmco.com`. Scoped to 3 locations (`LOCATION_ADMIN_LOCATIONS` in `facilityHelpers.ts`: `Anna Salai - Chennai`, `Coimbatore`, `Madurai` — 9 facilities total) via `scopeToLocationAdmin()`, applied in `LocationAdminDashboard`, `MyFacilities`, and `ComplianceHome` (both desktop/mobile twins). `FacilityDetail`/`ComplianceDetail` stay unscoped since they're reached only via links from those already-scoped lists and are shared with SBU Admin.
- **SBU Admin** (`/sbu/*`) — oversees all Location Admins within one SBU (`authStore.currentSbu`, set at login). Only one SBU exists in the prototype: **South**. Login: `sbuadmin@gmmco.com`.
  - `/sbu/dashboard` — header has two actions: "New Location" (primary, → `/sbu/onboarding/new`) and "Review compliance" (secondary, → `/sbu/compliance`) — the onboarding route existed but was previously unlinked from any UI. KPI row (Facilities, Avg Compliance Score, Due this month, Overdue) + a "Compliance — current period" section (`SbuComplianceCard`, a sibling of `ComplianceCard` that adds a facility-type label and a score badge) filterable by Location and Facility Type, + notifications. Mirrors `LocationAdminDashboard`'s compliance section but scoped to the whole SBU; uses `getCurrentRecord`/`scoreChecklist` (`facilityHelpers.ts`) to compute a score per facility, gated on `facility.complianceProgress > 0` (a freshly-built, untouched record would otherwise score a misleading 0%). South SBU's seed data (`src/data/sbuSouthSeed.ts`, merged into the store in `facilityStore.ts`) was expanded to 16 locations / 48 facilities so these filters have something to demonstrate — locations are named just by city (e.g. `Kochi`), except Chennai which has 3 ("Locality - City" format, the rare exception for a city with multiple locations). North/East/West SBUs (and the one hand-authored West facility, `bld-4`) were removed — `sbuCascade` (`facilityData.ts`) now only has a `South` key. Draft compliance is rare for an SBU Admin to encounter directly (Location Admins own that state) — the seed data deliberately keeps only 2 facilities in `draft`, the rest are `pending`/`submitted`/`overdue`.
  - `/sbu/locations`, `/sbu/locations/:location` — **Locations tab** (replaces the old separate "Location Admins" roster + "Facilities" list). There's no separate Location entity — locations are derived by grouping `facilities` on the `Facility.location` string field via `groupFacilitiesByLocation` (`facilityHelpers.ts`). The list page is a table (Location, State, Location Admin, Facilities, Compliance); `:location` is the URL-encoded `location` string. The detail page (`LocationDetail.tsx`) mirrors `FacilityDetail`'s layout — `FacilityIdentityCard` on the left (location-level fields + aggregate compliance badges), and one `FacilityComplianceCard` per facility at that location on the right (extracted from `FacilityDetail.tsx`, also reused there). Facility titles deep-link to `/sbu/facilities/:facilityId` (kept solely for this drill-in — there's no standalone facilities list route anymore).
  - `/sbu/compliance`, `/sbu/compliance/record/:recordId` — mirrors `ComplianceHome`/`ComplianceDetail`, same SBU scoping.
  - `/sbu/onboarding/new` — minimal "New Facility" form (`OnboardingFormSBU.tsx`), SBU fixed to `currentSbu`, builds a real `Facility` + `ComplianceRecord` via `facilityStore.submitOnboarding`.

**Facility status change request/approval:** Location Admin's status toggle now opens a request modal (`facilityStore.requestStatusChange`) instead of flipping instantly; SBU Admin sees an Approve/Reject banner on `FacilityDetail` (`resolveStatusChange`) and keeps an instant toggle for their own changes. State lives on `Facility.pendingStatusRequest`.

**SBU compliance review mode (`ComplianceDetail.tsx`, `isSbuAdmin` branch only — Location Admin's own flow is untouched):** SBU Admin can directly edit any compliance record's answers/photos regardless of status or period (`setSbuChecklistAnswer` — unlike `setChecklistAnswer`, it never clears `remarks`/`photos` as a side effect, since the Location Admin's original evidence must survive an SBU override). A `ComplianceReportCard` (Maximum Score / Facility Score / 5-star Rating / per-section %, via `scoreChecklist` in `facilityHelpers.ts` — each question worth 10pts: Yes=10/10, Partial=5/10, No=0/10, N/A excluded) renders live above the checklist. Each of the three score tiles has an `InfoTooltip` (`src/components/common/InfoTooltip.tsx` — click-to-toggle info-icon popover, closes on outside click/Escape, first reusable tooltip component in the codebase) explaining how that number/rating is derived. Each item (`ChecklistItemRowSbuEdit`) shows the Location Admin's `remarks` as static text (never editable); once SBU touches that item's answer or photos, an `sbuComment` box appears below it (tracked via local `touchedItemIds`, persists if `sbuComment` already has a value). The header/footer "Save" button (`sendComplianceFeedback`) only renders while `isDirty`.

Shared helpers for facility list pages (status labels/styles, due-date math, last-compliance lookups, location grouping, compliance scoring) live in `src/utils/facilityHelpers.ts` — import from there rather than redefining per page.

## Naming Conventions

- **Files:** PascalCase for components/pages (`MyVisits.tsx`), camelCase for utilities/stores (`visitStore.ts`)
- **Components/Classes:** PascalCase (`StatusBadge`, `AppLayout`)
- **Hooks/Functions:** camelCase, prefix hooks with `use` (`useVisitStore`, `formatDate`)
- **Types/Interfaces:** PascalCase, no `I` prefix (`Visit`, `Employee`, `VisitStatus`)
- **Variables:** camelCase (`pendingVisits`, `currentRole`)
- **Constants:** UPPER_SNAKE_CASE for true constants (`VISIT_STATUSES`, `LOCATIONS`), camelCase for config objects

## Patterns to Follow

- **Zustand stores with selectors** — Use selectors to avoid unnecessary re-renders. Each store is a single file with typed state and actions.
- **Role-based routing** — Routes are grouped by role. AppLayout renders different nav items based on current role from authStore.
- **Status-driven UI** — Visit status determines available actions, badge color, and card layout. Centralize status → color/action mapping.
- **Responsive via Tailwind breakpoints** — Mobile-first. `md:` breakpoint for desktop sidebar. No separate mobile/desktop components — same component, different layout.
- **Dummy data as initial store state** — Seed Zustand stores with imported dummy data on initialization. All mutations happen in-memory.

## Patterns to Avoid

- **No real API calls or backend** — This is a prototype. All data lives in Zustand stores seeded with dummy data.
- **No complex auth** — Role switching is a simple dropdown/toggle, not a login flow (Login screen is for demonstration only).
- **No premature abstraction** — Don't build a generic "DataTable" if only the Visitor Manager uses tables. Build what each screen needs.
- **No over-engineering state** — Zustand is sufficient. No Redux, no context nesting, no server state libraries.

## Testing Requirements

- {{Test category 1}}: {{what to test}}
- {{Test category 2}}: {{what to test}}
- {{Test category 3}}: {{what to test}}

## Key Libraries

- **react** — UI framework
- **react-router-dom** — Client-side routing with role-based route groups
- **zustand** — Lightweight state management for visits, auth/role, notifications
- **recharts** — Charts on Visitor Manager dashboard (bar chart, line chart)
- **tailwindcss** — Utility-first CSS, responsive design
- **remixicon / react-icons** — Icon library (Remix Icons)

## Reference Documentation

- [React Router docs](https://reactrouter.com/) — Routing patterns, nested routes
- [Zustand docs](https://zustand-demo.pmnd.rs/) — Store patterns, selectors
- [Recharts docs](https://recharts.org/) — Chart components and customization
- [Tailwind CSS docs](https://tailwindcss.com/docs) — Utility classes, responsive design

## Skills

Skills relevant when working on code in this workspace.

- **`testing-skill`** — Invoke when writing or updating tests
- **`emil-design-eng`** — Invoke for any component with interaction, animation, or motion
- **`impeccable`** — Invoke for any visual design work (typography, color, spacing, layout)
- **`interface-design`** — Run `/interface-design:init` at project start; `/interface-design:audit` before shipping UI
- **`ui-skills`** — Final Web Interface Guidelines compliance check before UI is considered done
