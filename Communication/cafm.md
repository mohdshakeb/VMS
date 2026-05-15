# CAFM — Facility Management Module: Prototype Brief

## Context

This module extends the existing enterprise prototype that already contains the **Shield** (access control) and **Visitor** (visitor management) modules. The login screen currently presents three app tiles: **Shield**, **Visitor**, and **Facility**. Clicking **Facility** should open this CAFM module.

**Do not change the existing login screen, shell, or other modules.** Wire the Facility tile to the new CAFM module routes only.

---

## Visual language — inherit from existing prototype

Match the existing app exactly:
- Same font family, type scale, font weights
- Same colour palette and semantic colour tokens (use existing Tailwind config)
- Same component patterns: cards, badges, buttons, form inputs, modals
- Same nav shell: sidebar on desktop, bottom tab bar on mobile
- Same spacing and border-radius conventions
- Same status badge system (colours for pending, draft, submitted, approved, rejected, overdue)

**Do not introduce new design patterns.** If a component exists in the Visitor module (e.g. a detail panel, a status timeline, a form stepper), reuse it for CAFM.

---

## Scope for this prototype

Build the **Building Admin role only**. Other roles (SBU Admin, Central Admin, App Admin) are out of scope for this phase.

The Building Admin prototype covers:
1. Dashboard (post-login landing screen)
2. My buildings list
3. New building onboarding request (4-step form)
4. Onboarding request status / tracking view
5. Monthly compliance — building selection and photo upload
6. Compliance submission history

---

## Role context

**Building Admin** is a GMMCO employee (data from HRMS). They manage one or more buildings. Their primary monthly task is uploading compliance photos per infrastructure category. They can also initiate new building onboarding requests.

Logged-in user for prototype: **Ravi Anand** | EMP-4821 | South SBU | Tamil Nadu

---

## Navigation

Sidebar (desktop) / bottom tab bar (mobile) with these items:

| Tab | Icon | Screen |
|-----|------|--------|
| Dashboard | home | Compliance status overview |
| My buildings | building | List of assigned buildings |
| Compliance | camera | Monthly photo upload |

---

## Screen 1 — Dashboard

**Primary focus: compliance deadlines this month.**

### Metric cards (top row — 4 cards)
- My buildings: **3**
- Due this month: **2** (warning colour)
- Drafts pending: **1** (warning colour)
- Submitted: **1** (success colour)

### Compliance this month (list below metrics)

Each row shows:
- Building name + type + location + month/year
- Photo upload progress: `X / Y uploaded` + progress bar
- Status badge: Pending / Draft / Submitted / Approved / Rejected / Overdue
- Chevron → opens compliance upload for that building

**Dummy data — 3 buildings:**

| Building | Type | Progress | Status |
|----------|------|----------|--------|
| GMMCO Chennai Branch | Branch Office | 8 / 14 | Draft |
| GMMCO Coimbatore Office | Branch Office | 0 / 12 | Pending |
| GMMCO Madurai Workshop | Repair Center | 18 / 18 | Submitted |

### Quick actions (Header - right side)
- Primary button: `+ Onboard new building` → goes to onboarding form
- Secondary button: `Start compliance` → goes to compliance screen

---

## Screen 2 — My buildings

List of all buildings assigned to this admin.

Each building card shows:
- Building name, Building ID (auto-generated code), building type
- Location: SBU · State · City
- Status badge: Active / Inactive
- This month's compliance status badge
- Tap/click → building detail (read-only profile view with all fields)

**Same 3 buildings as dashboard.** Building detail shows all 23 fields read-only.

---

## Screen 3 — New building onboarding request (4-step form)

Accessed from dashboard quick action or My buildings screen.

### Step indicator
Vertical stepper on the left (desktop) or horizontal progress bar (mobile).
Steps: `1 → 2 → 3 → Review`
Completed steps show a tick. Active step highlighted. Future steps muted.

---

### Step 1 — Location & building details

**Fields (in order):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| SBU | Dropdown | Yes | Options: North, South, East, West |
| State | Dropdown | Yes | Cascades from SBU — shows states in that SBU only |
| City | Dropdown | Yes | Cascades from State |
| Location | Dropdown | Yes | Cascades from City — specific branch/locality |
| Building type | Dropdown | Yes | Options: Branch Office, Parts Warehouse, CRC, MRC, Repair Center, Executive Office, HQ |
| Store code | Text input | No | Placeholder: "From GMMCO website". Helper text: "You can look this up at the GMMCO portal" |
| Building name | Text input | Yes | Placeholder: "Unique within location" |
| Building description | Textarea | No | Placeholder: "Additional details" |

**Cascade behaviour:** Selecting SBU clears and repopulates State. Selecting State clears and repopulates City. And so on. All downstream dropdowns are disabled until their parent is selected.

**Navigation:** Back (disabled on step 1) | Next

---

### Step 2 — Physical & infrastructure

**Fields (top section):**

| Field | Type | Required |
|-------|------|----------|
| Address line 1 | Text | Yes |
| Address line 2 | Text | No |
| Pin code | Number | Yes |
| No. of floors | Number | Yes |
| Total area (sq. ft) | Number | No |
| Year of construction | Number | No |
| Latitude | Decimal | No |
| Longitude | Decimal | No |

**Infrastructure categories (bottom section):**

Auto-populated based on Building type selected in Step 1. Uses the applicability matrix (see reference data below).

Display rules:
- **Mandatory** categories: pre-selected, locked. Show lock icon. Red/danger tint. Cannot be deselected.
- **Optional** categories: pre-selected, removable. Show checkbox (checked). Amber/warning tint. Can be deselected.
- **Not applicable** categories: hidden by default.

Group categories under their Category Group headers: External, Office, Workshop, Warehouse, Electrical, Fire & Safety, Environment, Security, Utilities.

Add a button: `+ Add category` — opens a modal listing all hidden (not applicable) categories, grouped. User can select any and add them. These appear as Optional (removable) once added.

If the user adds a category not in the master list: show a text field `+ Request new category (name it)` — this is flagged for App Admin review.

**Navigation:** Back | Next

---

### Step 3 — Administration & documents

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Building status | Dropdown | Yes | Options: Active, Inactive. Default: Active |
| Remarks / notes | Textarea | No | |
| Layout plan | File upload | No | Accept: PDF, JPG, PNG. Max 10MB |
| Compliance documentation | File upload | No | Accept: PDF. Max 10MB |

> **Note:** Assigned Building Admin field is NOT shown to Building Admin. It is only available to SBU Admin when they review the request.

**Navigation:** Back | Next (goes to Review)

---

### Step 4 — Review & confirm

Read-only summary of all fields entered. Each section has an `Edit` link that jumps back to that step.

**Sections:**
1. Location & building details (with auto-generated Building ID displayed here, read-only, in muted style)
2. Physical & infrastructure (summarised: address, floors/area, "14 categories assigned — 11 mandatory, 3 optional")
3. Administration (status, remarks, documents attached)

**Building ID auto-generation logic (for display only):**
Format: `{BuildingTypeCode}_{StateCode}_{CityCode}_{LocationCode}_{PinCode}`
Example: `BO_TN_CHN_ANNASALAI_600002`
Generate this from the values entered in Steps 1 and 2.

**Navigation:** Back | `Submit request` (primary button)

On submit: show a success toast ("Onboarding request submitted") and navigate to the request tracking screen.

---

## Screen 4 — Onboarding request tracking

Accessible from My buildings or notifications. Shows the status of a submitted onboarding request.

### Layout (two columns on desktop, stacked on mobile)

**Left column — request summary:**
- Building name, type, location
- Submitted on (date)
- Submitted by (name + employee ID)
- Infrastructure categories: count

**Right column — approval timeline:**

Vertical timeline with 3 stages:
1. ✅ Request submitted — date + time
2. 🟡 SBU Admin review — "Pending — South SBU" (active/in-progress state)
3. ⬜ Building activated — "Awaiting approval" (future state)

If rejected: show rejected state on stage 2 with rejection reason. Show a `Revise & resubmit` button that opens the form pre-filled.

**Dummy data:** Request in "SBU Admin review" state (stage 2 active).

---

## Screen 5 — Monthly compliance upload

Accessed from dashboard row tap, quick action button, or Compliance nav tab.

### Step A — Select building

If Building Admin manages only one building, skip this step and go straight to Step B.
If multiple buildings, show a list to select from. Each item shows building name, this month's status badge, and progress.

### Step B — Upload by infrastructure category

**Header:** Building name | Month + Year | X of Y categories uploaded

**Category list:**
Each infrastructure category for this building is shown as a card:
- Category group label (as section header: External, Office, etc.)
- Category name
- Upload status: Not uploaded / Uploaded (with thumbnail) / ✓ Done
- `Upload photo` button / `Replace` button if already uploaded

Tapping `Upload photo` opens a file picker (accept: JPG, PNG, HEIC). On selection, show a thumbnail preview. Allow replace.

**Footer actions:**
- `Save as draft` — saves progress, returns to dashboard. Shows draft badge on that building's row.
- `Submit` — only enabled when all mandatory categories have a photo uploaded. If optional categories are empty, show a confirmation modal: "3 optional categories have no photo. Submit anyway?" with Confirm / Go back.

### Draft state rules (shown in UI):
- If a draft is 7+ days old: show a warning banner at the top — "This draft is 7 days old. Submit before {expiry date} to avoid losing your progress."
- If a draft is expired (30+ days): show a blocked state — "This draft has expired. Please start a fresh upload." The submit button is disabled and existing thumbnails are greyed out.

---

## Screen 6 — Compliance history

Accessed from Compliance tab (second view / sub-tab).

List of all past compliance records for all buildings, sorted by month descending.

Each row: Building name | Month | Status badge | Categories count | Date submitted

Tapping a row opens a read-only detail view:
- All categories listed with their uploaded photo thumbnails
- Submission date, submitted by
- If approved: approval date, approved by (SBU Admin name)
- If rejected: rejection reason, resubmission history

---

## Dummy data reference

### Buildings

**Building 1 — GMMCO Chennai Branch**
- Building ID: BO_TN_CHN_ANNASALAI_600002
- Type: Branch Office | SBU: South | State: Tamil Nadu | City: Chennai
- Address: 12 Anna Salai, Chennai 600002
- Floors: 3 | Area: 6,200 sq ft | Year: 2008
- Status: Active
- May 2026 compliance: 8/14 uploaded, Draft (started 6 days ago)
- Infra categories: 14 total (11 mandatory, 3 optional)

**Building 2 — GMMCO Coimbatore Office**
- Building ID: BO_TN_CBE_GANHIPURAM_641012
- Type: Branch Office | SBU: South | State: Tamil Nadu | City: Coimbatore
- Address: 45 Gandhipuram Main Road, Coimbatore 641012
- Floors: 2 | Area: 3,800 sq ft | Year: 2014
- Status: Active
- May 2026 compliance: 0/12 uploaded, Pending

**Building 3 — GMMCO Madurai Workshop**
- Building ID: RC_TN_MDU_MATTUTHAVANI_625010
- Type: Repair Center | SBU: South | State: Tamil Nadu | City: Madurai
- Address: 7 Mattuthavani Industrial Estate, Madurai 625010
- Floors: 1 | Area: 12,500 sq ft | Year: 2001
- Status: Active
- May 2026 compliance: 18/18 uploaded, Submitted (submitted 2 days ago)

### Infrastructure categories — Branch Office applicability (for form Step 2)

**Mandatory (pre-selected, locked):**
External: Building Front, Building Signage, Entry Gate, Security Cabin, Parking Area
Office: Reception Area, Meeting Room, Pantry, Washroom, Training Room
Electrical: Electrical Panel, Transformer, UPS Room, Earthing Pit, Internal Lighting
Fire & Safety: Fire Extinguishers, Emergency Assembly Point, Smoke Detector / Sprinkler System, Fire Alarm, Emergency Exit, First Aid Kit, PPE Station
Environment: Drainage System, Green Area
Security: CCTV Surveillance
Utilities: Water Tank, Pump Room

**Optional (pre-selected, removable):**
External: Yard / Open Area
Office: Office Workspace, Meeting Room (already mandatory — skip duplicate)
Electrical: DG Room
Fire & Safety: Fire Hydrant, Fire Pump Room / Fire Control Room
Environment: Waste Disposal

**Not applicable (hidden, addable via override):**
All Workshop and Warehouse categories

### Notifications (dummy — 3 items)
1. "Your draft for GMMCO Chennai Branch is 6 days old. Submit before 12 June to avoid expiry." — 1 day ago
2. "GMMCO Madurai Workshop compliance submitted successfully." — 2 days ago
3. "New compliance cycle started for May 2026. 3 buildings require photo uploads." — 13 days ago

---

## Status badge colour system

Reuse the existing badge component from the Visitor module. Map states:

| Status | Colour token |
|--------|-------------|
| Pending | Warning (amber) |
| Draft | Secondary (grey) |
| Submitted | Info (blue) |
| Approved | Success (green) |
| Rejected | Danger (red) |
| Overdue | Danger (red) |
| Active | Success (green) |
| Inactive | Secondary (grey) |

---

## Key interaction notes

1. **Onboarding form — cascade dropdowns:** SBU → State → City → Location must cascade. Selecting a parent clears all children.
2. **Onboarding form — Building ID:** Auto-generated on the Review screen from entered data. Not a user input field.
3. **Onboarding form — Assigned Building Admin:** Not shown to Building Admin at all. Only SBU Admin can set this.
4. **Compliance upload — Submit button:** Disabled until all mandatory categories have photos. Optional categories can be empty.
5. **Compliance upload — Draft expiry warning:** Show warning banner at 7 days, blocked state at 30 days.
6. **Category selection — mandatory lock:** Mandatory categories cannot be deselected. Clicking them does nothing (no error, just no action).

---

## File structure suggestion

```
src/
  pages/
    facility/
      FacilityApp.tsx          # Root for facility module, handles facility nav
      dashboard/
        BuildingAdminDashboard.tsx
      buildings/
        MyBuildings.tsx
        BuildingDetail.tsx
      onboarding/
        OnboardingForm.tsx     # 4-step form wrapper
        Step1Location.tsx
        Step2Physical.tsx
        Step3Admin.tsx
        Step4Review.tsx
        OnboardingStatus.tsx
      compliance/
        ComplianceHome.tsx     # Building selector
        ComplianceUpload.tsx   # Category-by-category upload
        ComplianceHistory.tsx
  data/
    facilityData.ts            # Buildings, categories, compliance records, notifications
  store/
    facilityStore.ts           # Zustand store for facility state
```

---

## What success looks like

A stakeholder should be able to:
1. Log in and click Facility to land on the Building Admin dashboard
2. See their 3 buildings with live compliance status and progress
3. Start a new onboarding request, fill all 4 steps, and reach the tracking screen
4. Open an in-progress compliance upload, add photos, save as draft or submit
5. View compliance history for a past month
6. Experience the draft expiry warning state on Chennai Branch (6 days old)

---

## Out of scope for this phase
- SBU Admin role and review screens
- Central Admin and App Admin roles
- Actual file upload to a server (use local state / object URLs)
- Authentication (reuse existing dummy login from the prototype)
- HRMS integration (Building Admin assignment is not shown to Building Admin)