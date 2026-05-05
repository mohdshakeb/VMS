# Visit Card States

## All Visit Statuses (8 total)

| Status | Display Label | Color Theme |
|---|---|---|
| `pending-approval` | Pending Approval | Amber/pending |
| `scheduled` | Scheduled | Blue/confirmed |
| `confirmed` | Confirmed | Blue/confirmed |
| `checked-in` | On Premises | Green/on-premises |
| `checked-out` | Completed | Gray/completed |
| `cancelled` | Cancelled | Gray/completed |
| `rejected` | Rejected | Red/rejected |
| `no-show` | No Show | Red/rejected |

---

## Status Definitions

### `pending-approval`
A walk-in visitor has arrived at the front desk and been logged, but the host employee has not yet approved the visit. The visit is waiting for the employee to confirm or reject.

**Activated by:** Front desk submitting a walk-in form (`createWalkIn`). The visit starts in this status automatically.

---

### `confirmed`
The visit is approved and ready — the visitor can be checked in when they arrive. Applies to both walk-ins approved by an employee, and employee-raised visits (which skip `pending-approval` entirely and are created directly as `confirmed`).

**Activated by:**
- Employee approving a walk-in (`approveWalkIn`) → transitions from `pending-approval`
- Employee scheduling a visit (`createEmployeeVisit`) → created directly as `confirmed`

---

### `scheduled`
The visit is confirmed but set for a future date. Functionally identical to `confirmed` — the front desk can still check the visitor in. Used to distinguish visits that are not happening today.

**Activated by:** Seed data only — visits with a future `scheduledDate` are set to `scheduled`. There is currently no runtime action that transitions a visit to `scheduled`.

---

### `checked-in`
The visitor has physically arrived, passed front desk verification, and is currently on premises. A badge number and check-in timestamp are recorded.

**Activated by:** Front desk completing the check-in flow (`checkIn`) → transitions from `pending-approval`, `confirmed`, or `scheduled`.

---

### `checked-out`
The visit is complete. The visitor has left the premises. Check-out time is recorded; optional fields like out-temperature and asset return are captured.

**Activated by:** Front desk completing the check-out flow (`checkOut`) → transitions from `checked-in`.

---

### `rejected`
The visit was denied. A rejection reason is recorded. Applies to walk-ins rejected by the employee, or employee-raised visits rejected by a manager/front desk.

**Activated by:**
- Employee rejecting a walk-in (`rejectWalkIn`) → transitions from `pending-approval`
- `rejectVisit` action (available but not prominently surfaced in the current UI)

---

### `cancelled`
The visit was called off before it happened — typically by the host employee. No check-in ever occurred.

**Activated by:** `cancelVisit` action → can transition from any pre-check-in status.

---

### `no-show`
The visitor was expected (confirmed/scheduled) but never arrived. No check-in occurred and no cancellation was made.

**Activated by:** Seed data only. There is no runtime action that sets a visit to `no-show` in the current prototype.

---

## Terminal vs. Active States

**Terminal** (show a colored status bar at the bottom of the card): `checked-out`, `cancelled`, `no-show`, `rejected`

**Active** (show action buttons): `pending-approval`, `scheduled`, `confirmed`, `checked-in`

---

## Action Buttons by Role

### Front Desk
| Status | Button |
|---|---|
| `pending-approval` | "Manual Check-in" |
| `confirmed` | "Check In" |
| `scheduled` | "Check In" |
| `checked-in` | "Check Out" |
| `checked-out` / `cancelled` / `rejected` / `no-show` | No button (card is clickable) |

### Employee
| Status | Button |
|---|---|
| `pending-approval` | "Approve" + "Reject" |
| All other statuses | No button rendered |

---

## Entry Path Badges
The card also shows a badge based on `entryPath`:
- `employee-request` or `pre-scheduled` → "By You" (if viewer is the host) or "By Host" (if viewer is front desk)
- `self-register` → "Self" badge
- `walk-in` → no badge

The `entryPath` also affects what time is displayed: scheduled time for employee-invited visits, actual check-in time if checked in, or creation time for walk-ins.
