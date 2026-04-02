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
