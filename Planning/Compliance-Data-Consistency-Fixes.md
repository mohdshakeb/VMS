# Compliance Data Consistency — Audit Findings & Fix Plan

Audit of the facility compliance prototype across seed data, visualisations, and store logic. Found 4 real inconsistencies. One earlier suspected issue (base locations missing historical records) was verified to be a non-issue — all 16 locations correctly receive Jun 2025–Mar 2026 history via the HIST_PERIODS loop.

---

## Issue 1 — Duplicate April 2026 records for the 3 base locations

**Severity:** High

**What's wrong:**
`facilityData.ts` already defines comp-4/5/6 (April 2026, submitted + approved) for Anna Salai, Coimbatore, and Madurai. But `sbuSouthSeed.ts` lines 451–469 also create a second set of April records for those same 3 locations (`comp-anna_salai_-_chennai-apr`, etc.). When merged in `facilityStore`, each base location ends up with 2 April 2026 records — causing the heatmap and trend chart to potentially double-count or behave unexpectedly for that month.

**Fix — `src/data/sbuSouthSeed.ts`:**
Delete lines 451–469 entirely (the `for` loop labelled "April 2026 for the 3 base locations"). The April records in `facilityData.ts` (comp-4/5/6) are sufficient, correctly approved, and don't need to be duplicated.

---

## Issue 2 — Trend chart period windows are 2 months behind; 1Y shows only 10 months

**Severity:** High

**What's wrong:**
Both dashboard files hardcode `PERIOD_OPTIONS` to end at **March 2026**, but `CURRENT_COMPLIANCE_PERIOD` is **May 2026**:

| Selector | Currently shows | Should show |
|----------|----------------|-------------|
| 3M | Jan – Mar 2026 | Mar – May 2026 |
| 6M | Oct 2025 – Mar 2026 | Dec 2025 – May 2026 |
| 1Y | Jun 2025 – Mar 2026 *(10 months)* | Jun 2025 – May 2026 *(12 months)* |

All 16 locations have records through May 2026 (Apr + May records exist for all), so extending the windows is safe. Some locations will show a gap at May (draft/pending/overdue statuses don't score) — this is correct and tells the right story.

**Fix — both dashboard files:**
- `src/pages/sbu/dashboard/SbuAdminDashboard.desktop.tsx` (lines 26–52)
- `src/pages/sbu/dashboard/Mobile/SbuAdminDashboard.tsx` (lines 28–54)

Replace the hardcoded `PERIOD_OPTIONS` with a dynamic helper. `CURRENT_COMPLIANCE_PERIOD` is already imported in both files:

```ts
function getRecentPeriods(current: { month: number; year: number }, count: number) {
  const periods: { month: number; year: number }[] = []
  let { month, year } = current
  for (let i = 0; i < count; i++) {
    periods.unshift({ month, year })
    if (month === 1) { month = 12; year-- } else { month-- }
  }
  return periods
}

const PERIOD_OPTIONS = [
  { value: '3m' as const, label: '3M', periods: getRecentPeriods(CURRENT_COMPLIANCE_PERIOD, 3) },
  { value: '6m' as const, label: '6M', periods: getRecentPeriods(CURRENT_COMPLIANCE_PERIOD, 6) },
  { value: '1y' as const, label: '1Y', periods: getRecentPeriods(CURRENT_COMPLIANCE_PERIOD, 12) },
]
```

---

## Issue 3 — Heatmap shows newest month on the left; trend chart shows oldest on the left

**Severity:** Medium

**What's wrong:**
`getPast12Periods()` in `ComplianceHeatmap.tsx` walks backwards from the current period, producing `[May 2026, Apr 2026, ..., Jun 2025]`. Rendered left-to-right in the grid, this puts **May 2026 on the far left** and Jun 2025 on the right — the opposite of the trend chart and of standard time-series convention (oldest left → newest right).

**Fix — `src/components/facility/ComplianceHeatmap.tsx`:**
Add `.reverse()` to the returned array so `periods[0]` = oldest (Jun 2025) and `periods[11]` = current (May 2026):

```ts
function getPast12Periods(current: { month: number; year: number }) {
  const periods: { month: number; year: number }[] = []
  let { month, year } = current
  for (let i = 0; i < 12; i++) {
    periods.push({ month, year })
    if (month === 1) { month = 12; year -= 1 } else { month -= 1 }
  }
  return periods.reverse()   // oldest first, newest (current) on right
}
```

The current-period highlight logic (`isCurrent` check on line 84) compares `p.month/year` against `CURRENT_COMPLIANCE_PERIOD` — it works correctly regardless of array order, so May 2026 will still be highlighted with the brand colour in its new rightmost position.

---

## Issue 4 — Store actions don't sync `Facility.complianceStatus` after record updates

**Severity:** Medium (demo-breaking for interactive flows)

**What's wrong:**
`submitCompliance`, `saveComplianceDraft`, and `clearCompliance` in `facilityStore.ts` update `complianceRecords` only — never the `facilities` array. Any page or KPI card reading `facility.complianceStatus` shows stale values after user interaction:

- SBU dashboard KPI cards: "Compliance Rate" and "Overdue" counts (`sbuFacilities.filter(f => isSubmitted(f.complianceStatus))`)
- FacilityDetail.tsx (line 91): compliance status badge
- MyFacilities.desktop.tsx (line 267): status filter

**Fix — `src/store/facilityStore.ts`:**

In each of the three actions, add a `facilities` update alongside the existing `complianceRecords` update. The record lookup already exists in `saveComplianceDraft` and `submitCompliance`; add one to `clearCompliance` too.

**`clearCompliance`:**
```ts
const record = s.complianceRecords.find((r) => r.id === recordId)
if (!record) return {}
return {
  complianceRecords: updateRecord(...),
  facilities: s.facilities.map((f) =>
    f.location === record.locationName
      ? { ...f, complianceStatus: 'pending', complianceProgress: 0, complianceDraftAge: undefined }
      : f
  ),
}
```

**`saveComplianceDraft`:**
```ts
const answeredCount = record.checklist.filter((e) => e.answer).length
return {
  complianceRecords: updateRecord(...),
  facilities: s.facilities.map((f) =>
    f.location === record.locationName
      ? { ...f, complianceStatus: nextStatus, complianceProgress: answeredCount }
      : f
  ),
}
```

**`submitCompliance`:**
```ts
return {
  complianceRecords: updateRecord(...),
  facilities: s.facilities.map((f) =>
    f.location === record.locationName
      ? { ...f, complianceStatus: nextStatus, complianceProgress: f.complianceTotal }
      : f
  ),
}
```

---

## Files to Modify

| File | Issue |
|------|-------|
| `src/data/sbuSouthSeed.ts` | Remove duplicate April 2026 base-location loop (lines 451–469) |
| `src/pages/sbu/dashboard/SbuAdminDashboard.desktop.tsx` | Replace hardcoded PERIOD_OPTIONS with dynamic helper |
| `src/pages/sbu/dashboard/Mobile/SbuAdminDashboard.tsx` | Same as desktop |
| `src/components/facility/ComplianceHeatmap.tsx` | Reverse period array so oldest is left, newest is right |
| `src/store/facilityStore.ts` | Add `facilities` sync to clearCompliance, saveComplianceDraft, submitCompliance |

---

## Verification Checklist

- [ ] **Duplicates gone:** No location shows two April rows in the heatmap; tooltip doesn't show duplicate entries.
- [ ] **Period windows correct:** 3M tab shows Mar/Apr/May 2026 on X-axis. 1Y shows 12 ticks, Jun 2025 → May 2026.
- [ ] **Heatmap direction fixed:** Open the heatmap modal — Jun 2025 is the leftmost column, May 2026 (brand-colour highlight) is the rightmost. Both the chart and heatmap now read oldest-left, newest-right.
- [ ] **Store sync works:** Save a draft on a compliance form → return to SBU dashboard → Compliance Rate / Overdue KPI cards update without page reload.
