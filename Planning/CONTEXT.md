# Planning Context — VMS

## What Is VMS

A clickable prototype for a Visitor Management System (VMS) — an in-house replacement for an existing third-party tool used across multiple office locations. The prototype demonstrates complete user flows for three roles (Employee, Front Desk, Visitor Manager) within a single app, targeting stakeholder review and developer handoff. This is a design prototype with realistic dummy data, no backend required.

**Client:** GMMCO Limited
**Engagement type:** {{TBD}}
**Target delivery:** {{TBD}}

## Tech Stack

- **Framework:** React (Vite + TypeScript)
- **Styling:** Tailwind CSS — utility-first, fast prototyping
- **Routing:** React Router — role-based navigation structure
- **State:** Zustand — lightweight, sufficient for prototype state (visits, roles, notifications)
- **Charts:** Recharts — Visitor Manager dashboard metrics and trends
- **Responsive:** Desktop (sidebar nav) + Mobile (bottom tab bar)

## Deliverables

1. **Clickable prototype with 3 role views** — Employee, Front Desk, Visitor Manager with role switcher. Stakeholders can toggle roles and walk through all flows.
2. **Complete visit lifecycle demonstration** — All 4 entry paths (employee request, walk-in, self-register, pre-scheduled) with state transitions and notification simulation.
3. **Visitor Manager analytics & leads** — Dashboard with cross-location metrics, charts, visitor profiles, report generation (simulated export), and lead management pipeline.

## Current Priorities

1. Dummy data + Zustand store setup — get the data layer working first
2. App shell + navigation — role switcher, sidebar/bottom bar, routing
3. Front Desk dashboard + flows — most complex and business-critical view
4. Employee flows — visit list + new request multi-step form
5. Visitor Manager dashboard + data views — charts, tables, leads
6. Notifications — badge counts, notification center
7. Polish — responsive tweaks, transitions, empty states

## Architectural Principles

- **Prototype-first mindset** — Optimize for demonstrating workflows, not production robustness. Dummy data is fine, no real auth or API calls.
- **Speed-first for Front Desk** — Most frequent actions should be 1-2 taps max. Dashboard is the operational nerve center.
- **Role isolation with shared shell** — Single app with role-based routing and navigation. Shared components, role-specific pages.
- **Mobile-friendly for Employee** — Employee role is most likely used on phone. FAB for primary actions, bottom sheets for quick actions.

## Roles and Permissions

### Employee
- Raise visit requests for future dates
- View own visits (upcoming, past, pending)
- Approve or reject walk-in requests (initiated by Front Desk)
- Cancel a scheduled visit
- Resubmit a rejected request with modifications
- Receives notifications on status changes

### Front Desk / Security
- View today's dashboard: Pending, Expected, On Premises
- Confirm or reject employee-raised visit requests
- Create walk-in visit requests on behalf of employees
- Check in visitors (issue digital pass / QR code)
- Check out visitors
- Cancel visits
- Scan QR code for quick check-in
- Location is fixed per user (set once, not switchable)

### Visitor Manager
- Overview dashboard with cross-location metrics and trends
- Browse and search all visitor data
- View visitor profiles (visit history, frequency, patterns)
- Generate and export reports
- Generate leads from customer visit data
- View lead details

## Visit Lifecycle

```
Request Created → Pending Confirmation (or Pending Approval) → Scheduled (future) / Confirmed (same-day) → Checked In → Checked Out
```

Terminal states: Rejected, Cancelled

After rejection, employee can resubmit a modified request (loops back to Request Created).

### Four Entry Paths

1. Employee raises request → Front Desk confirms → Scheduled
2. Front Desk creates walk-in → Employee approves → Confirmed → Check in
3. Visitor self-registers via QR (scans QR at location → opens web form on phone → submits details) → Employee approves → Front Desk confirms → Check in
4. Pre-scheduled visit → Visitor arrives → Front Desk scans QR → Direct check in

## Visit Type Hierarchy

Location Type → Purpose → Visit Type

### Enterprise Office (EO)
- **Official** → Interview, Contractor, Vendor, Customer, Government Official, CAT Officials, Employee from other branch
- **Training** → (subset of official types)
- **Personal** → Employee Visitor, General Visitor

### Branch Office
- **Customer**
- **Other** (catch-all)

Each visit type has fixed accessible zones (predefined in the system, not specified in the prototype UI). Form fields are mostly the same across types with minor differences.

## User Flow

```
[Role Switcher] → Select Role
    │
    ├── Employee
    │   ├── My Visits (tabs: Upcoming | Past | Pending)
    │   │   ├── Visit Detail → Cancel / Resubmit
    │   │   └── FAB → New Request (multi-step form)
    │   ├── Notifications → Approve Walk-in
    │   └── Profile / Settings
    │
    ├── Front Desk
    │   ├── Today's Dashboard
    │   │   ├── Pending → Review + Confirm/Reject
    │   │   ├── Expected → Check In (issue pass/QR)
    │   │   └── On Premises → Check Out
    │   ├── All Visits (search/filter)
    │   ├── Scan QR → Check In
    │   ├── Create Walk-in (quick form)
    │   └── Profile
    │
    └── Visitor Manager
        ├── Overview Dashboard (metrics, charts, location filter)
        ├── Visitor Data → Visitor Profile
        ├── Reports → Report Detail
        ├── Leads → Lead Detail
        └── Profile
```

## Screen Inventory

### Shared (all roles): 3 screens
- Login, Profile + Settings, Notification Center

### Employee: 4 screens
- My Visits (home), Visit Detail, New Request (multi-step), Approve Walk-in

### Front Desk: 7 screens
- Today's Dashboard, Review + Confirm, Check In, Check Out, Create Walk-in, All Visits, Scan QR

### Visitor Manager: 7 screens
- Overview Dashboard, Visitor Data, Visitor Profile, Reports, Report Detail, Leads, Lead Detail

### Visitor-Facing: 1 screen
- Self-Registration Form (mobile web form opened via QR scan at location — visitor fills in their details, selects employee host, submits)

**Total: ~22 screens**

## Key Interactions to Prototype

1. Employee: Raise a new visit request (multi-step with cascading selection)
2. Employee: Approve a walk-in (notification → review → approve/reject)
3. Front Desk: Confirm a pending request (dashboard → review → confirm/reject)
4. Front Desk: Check in expected visitor (dashboard → verify → issue pass with QR)
5. Front Desk: Create walk-in (quick form → "waiting for approval" state)
6. Front Desk: Check out (one-tap from on-premises list)
7. Visitor Manager: View dashboard (metrics, charts, location filter)
8. Visitor Manager: Browse visitors → drill into profile
9. Visitor Manager: Generate a lead from customer visit data

## Design Direction

- Clean, minimal UI — generous whitespace, no clutter
- Neutral color palette with semantic status colors: blue (active), amber (pending), green (confirmed), red (rejected), purple (on premises), gray (completed)
- Cards for visit items, status badges (colored pills), bottom sheets on mobile
- Multi-step form with progress indicator for new request
- Prominent search bars on Front Desk and Visitor Manager
- Charts: bar (visits by type), line (trends) on Visitor Manager dashboard

## Dummy Data Requirements

- 3 locations: "EO — Head Office", "Branch — Sector 21", "Branch — MG Road"
- 15-20 employees across locations
- 30-40 visit records in various states
- 5-6 repeat visitors for pattern detection / leads
- Visit types from the hierarchy above

## Decisions & Client Sign-offs

### 2026-03-31 — Initial Brief Clarifications
**Decisions:**
- Client: GMMCO Limited
- Visitor self-registration (Path 3): Visitor scans QR at location, opens a web form on their phone, fills details and submits. This adds a visitor-facing screen.
- Training purpose visit types: TBD — will define when building the new request form.
- Accessible zones: Predefined per visit type, not displayed or configured in the prototype UI.
- Lead status pipeline: TBD — stakeholder interviews in progress.
- Icon library: Remix Icons (`remixicon` / `react-icons/ri`)
- Engagement type and delivery date: Not set yet.
**Rationale:** Clarifications gathered before starting build. Deferred items will be resolved as we reach those features.

## Current System Analysis (Happy Visitor — Being Replaced)

### Stakeholder Pain Points (from client document)
1. **Front Desk lacks instant visibility** — No at-a-glance dashboard for expected visitors, on-premises count, or pending actions. Requires clicking through multiple screens.
2. **Employees circumvent the system** — Visit request process is too cumbersome. No mobile-friendly quick flow. No status transparency after submission. Inflexible cancellation. High no-show rates.
3. **Management has no analytics** — Visitor data exists but is siloed and inaccessible. No cross-location trends, no repeat visitor flagging, no lead generation capability.
4. **Strategic gap** — No internal data ownership. System is reactive, not proactive. Visitor intelligence isn't converted into business development opportunities.

### UX Flaws Identified from User Manuals
1. **Disconnected visit creation** — "Create Visit" and "Invite Visitor" are separate menu items with different UIs instead of a unified guided flow.
2. **Manual badge ID entry** — Security must delete the system-generated badge ID and manually re-type the physical badge number during check-in. Error-prone and slow.
3. **Badge-only check-out** — Check-out requires entering the badge ID number. No search by name, no visual list of on-premises visitors.
4. **No walk-in flow** — System assumes all visitors are pre-registered. No handling for unannounced visitors.
5. **No self-registration at gate** — Invite link is pre-visit only, no QR scan at location for walk-ins.
6. **No approval workflow** — Employee creates → visitor arrives → security checks in. No confirmation/rejection step.
7. **No employee notifications** — Visitors get SMS, but employees get no status updates, arrival alerts, or approval requests.
8. **Flat dashboard** — Just 3 static counts (Open, Check In, Closed). No filtering, search, or drill-down.
9. **Mobile number as sole identifier** — Fragile for international visitors, number changes, or missing numbers.
10. **No multi-location awareness** — Single generic login, no location-bound context for security, no cross-location views for managers.

### How the New VMS Addresses These
| Pain Point | New VMS Solution |
|---|---|
| No dashboard visibility | Tabbed Front Desk dashboard: Pending / Expected / On Premises with actionable cards |
| Cumbersome employee flow | Single multi-step form with cascading selections, mobile-first with FAB |
| Manual badge entry | Auto-assign badge or badge picker — no delete-and-retype |
| Badge-only checkout | On-premises list with one-tap check-out + search |
| No walk-ins | Front Desk creates walk-in → Employee approves → Check in |
| No self-registration | QR at gate → web form → submit → Employee approves |
| No approval workflow | Full Pending → Confirmed/Rejected lifecycle |
| No employee notifications | Notification center with approval actions and status updates |
| No analytics | Visitor Manager: cross-location dashboard, charts, visitor profiles, leads |
| No multi-location | Location-bound Front Desk + cross-location Visitor Manager views |

## Feature Specs

_Add feature specs here as they are defined._
