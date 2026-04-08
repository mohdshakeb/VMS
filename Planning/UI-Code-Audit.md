# VMS — UI & Code Audit Report

**Date:** 2026-04-07  
**Scope:** Full codebase review — `src/` components, pages, layouts, types, store, utils, data  
**Purpose:** Identify inconsistencies in UI (text style, color, border, spacing) and code patterns before final polish

---

## Table of Contents

1. [Critical Issues Summary](#1-critical-issues-summary)
2. [UI Inconsistencies](#2-ui-inconsistencies)
   - [Colors](#a-colors)
   - [Typography](#b-typography)
   - [Borders & Radius](#c-borders--radius)
   - [Spacing](#d-spacing)
   - [Buttons](#e-buttons)
   - [Cards & Surfaces](#f-cards--surfaces)
   - [Shadows](#g-shadows)
3. [Code Inconsistencies](#3-code-inconsistencies)
   - [Naming Conventions](#a-naming-conventions)
   - [Component Patterns](#b-component-patterns)
   - [State Management](#c-state-management)
   - [Type Safety](#d-type-safety)
   - [Import Organization](#e-import-organization)
   - [Event Handlers](#f-event-handlers)
   - [Conditional Rendering](#g-conditional-rendering)
4. [File-by-File Notes](#4-file-by-file-notes)
5. [Recommendations](#5-recommendations)

---

## 1. Critical Issues Summary

| # | Category | Issue | Impact |
|---|----------|-------|--------|
| C1 | **Colors** | Brand color hardcoded as `bg-brand-red-500` in 4+ places instead of using `bg-brand` semantic token | Theme changes require touching multiple files |
| C2 | **Colors** | `zinc-*` utility classes used directly throughout instead of semantic tokens (`text-primary`, `surface-*`, `border-*`) | Can't consistently apply or override theme |
| C5 | **Typography** | No consistent weight pairing — `font-semibold` (600) and `font-bold` (700) used interchangeably at the same hierarchy level | Inconsistent visual emphasis across pages |
| C6 | **Spacing** | `space-y-*`, `gap-*`, and manual `mt-*` / `mb-*` mixed with no governing rule | Spacing feels arbitrary; hard to iterate on rhythm |
| C7 | **Forms** | `CreateWalkIn.tsx` is 720 lines with no sub-component extraction and no form abstraction | Unmaintainable; any form change requires reading the whole file |
| C8 | **State** | Complex business logic lives inside Zustand store actions (`visitStore.ts`) rather than in services/utils | Stores are hard to test; logic is hard to trace |

---

## 2. UI Inconsistencies

### A. Colors

#### Semantic Token System (Defined — Good)
`src/index.css` defines CSS variables covering:
- Brand red palette: `--color-brand-red-50` → `--color-brand-red-950`
- Semantic aliases: `--color-brand`, `--color-pending`, `--color-confirmed`, `--color-rejected`, `--color-on-premises`, `--color-completed`
- Surface, border, and text tokens

#### Hardcoded Color Issues

**Brand Red — bypassing semantic layer:**

| File | Line | Usage | Should Be |
|------|------|-------|-----------|
| `AppLayout.tsx` | ~108 | `bg-brand-red-500` | `bg-brand` |
| `Dashboard.tsx` | ~109 | `bg-brand-red-500` | `bg-brand` |
| `DashboardV2.tsx` | ~109 | `bg-brand-red-500` | `bg-brand` |
| `DashboardV3.tsx` | ~106 | `bg-brand-red-500` | `bg-brand` |

`VisitCard.tsx` correctly uses `bg-brand-red-50` / `text-brand-red-500` for the category icon — this is intentional use of the palette. The issue above is specifically where the brand's primary accent color is used without the semantic alias.

**Zinc — bypassing semantic layer:**

| File | Hardcoded Class | Semantic Equivalent |
|------|----------------|---------------------|
| `PageHeader.tsx` | `text-zinc-400`, `text-zinc-600` | `text-text-secondary` |
| `VisitCard.tsx` | `border-zinc-200` | `border-border-light` |
| `VisitColumn.tsx` | `border-zinc-200` | `border-border-light` |
| `Sidebar.tsx` | `bg-zinc-800`, `bg-zinc-700`, `text-zinc-*` | (sidebar has its own dark theme; may be intentional but should be tokenized) |
| `Button.tsx` | `disabled:!bg-zinc-100 disabled:!text-zinc-400` | `disabled:!bg-surface-secondary disabled:!text-text-disabled` |

**Opacity syntax inconsistency:**
- `Modal.tsx` uses `text-text-primary/30` (Tailwind opacity modifier)
- Should define a dedicated token like `--color-text-muted` rather than relying on opacity modifiers for a predictable, repeatable color

**KpiCardV2.tsx — CSS variable inline syntax:**
- Uses `bg-[var(--color-badge-*)]` inline throughout (lines 5–22)
- Functional but inconsistent; better to define Tailwind utility classes for these in `index.css` alongside other tokens

---

### B. Typography

#### Font Weight Inconsistencies at Same Hierarchy Level

| Component | Usage | Issue |
|-----------|-------|-------|
| `KpiCard.tsx` | Metric value: `font-semibold` | — |
| `KpiCardV2.tsx` | Metric value: `font-bold` | Different weight for same element type |
| `Dashboard.tsx` | Section heading: `font-bold` | — |
| `PageHeader.tsx` | Title: `font-semibold` | Different weight for comparable heading |
| `VisitCard.tsx` | Visitor name: `font-semibold`; metadata: no weight | — |
| `Button.tsx` | `md` size: `font-semibold`; `lg` size: no weight defined | Missing weight on the largest button size |

**Rule needed:** Define explicit weight-per-size pairings (e.g., `text-lg` → always `font-semibold`; metric values → always `font-bold`; body text → no weight override).

#### Text Size Gaps

- `Button.tsx` `lg` size uses `text-sm` — same as `md`. The largest button should be at least `text-base`.
- `VisitHistory.tsx` uses `tabular-nums` class in one cell but this is not applied consistently to other numeric columns.

---

### C. Borders & Radius

#### Border Radius — No Governing Rule

| Usage | Class | Rem |
|-------|-------|-----|
| Buttons, SearchBar, PageHeader inner | `rounded-lg` | 0.5rem |
| Cards, Modals, Dashboard panels | `rounded-xl` | 0.75rem |
| Badge pills, avatars | `rounded-full` | 9999px |
| Some input fields | `rounded-md` | 0.375rem |

No documented pattern for when to use `lg` vs `xl`. Should define: interactive elements = `rounded-lg`, container surfaces = `rounded-xl`.

#### Border Color — Mixed Semantic/Raw Usage

| Component | Usage |
|-----------|-------|
| `Card.tsx` | `border-border-light` ✓ semantic |
| `VisitCard.tsx` | `border-zinc-200` ✗ raw (same visual result, inconsistent source) |
| `VisitColumn.tsx` | `border-zinc-200` ✗ raw |
| `SearchBar.tsx` | `border-border` ✓ semantic |
| `TabBar.tsx` | `border-border` ✓ semantic |

---

### D. Spacing

#### Padding — No Consistent Scale

| Context | Usage |
|---------|-------|
| Page layout | `px-4 md:px-6` |
| PageHeader | `px-6 py-3` |
| Card padding (`sm`) | `p-3` |
| Card padding (`md`) | `p-4` |
| Card padding (`lg`) | `p-5` |
| Form fields | `px-3 py-2` (SearchBar), `px-4 py-2` (buttons) |
| Modal | `p-4` |

No rule for when to use `p-3` vs `p-4` vs `p-5`. Recommend: define named sizes in `Card.tsx` with explicit use cases.

#### Vertical Rhythm — Three Competing Patterns

| Pattern | Used In |
|---------|---------|
| `space-y-4` / `space-y-5` | KPI sections, card lists |
| `gap-2` / `gap-3` / `gap-4` | Flex/grid layouts |
| `mt-2` / `mb-4` | One-off margin adjustments |

All three produce vertical spacing but have different semantics. `gap-*` should be preferred for flex/grid children; `space-y-*` for stacks; manual margin only when adjacent items have special relationship.

---

### E. Buttons

#### Size Inconsistency

| Size | Padding | Text | Font Weight |
|------|---------|------|-------------|
| `sm` | `px-3 py-1` | `text-xs` | (none specified) |
| `md` | `px-4 py-2` | `text-sm` | `font-semibold` |
| `lg` | `px-5 py-3` | `text-sm` | (none specified) |

Issues:
- `lg` uses same text size as `md` — no visual distinction between button sizes beyond padding
- `sm` and `lg` missing explicit font-weight

#### Hover State Inconsistency

| Variant | Hover |
|---------|-------|
| Primary | `hover:opacity-90` |
| Danger | `hover:opacity-90` |
| Secondary | `hover:bg-surface-secondary` |
| Ghost | `hover:bg-surface-secondary/60` |

Primary/Danger use opacity-based hover; Secondary/Ghost use background-based hover. For cohesion, pick one approach or make the difference intentional (opacity = filled buttons, background = ghost buttons — this could actually be the rule).

---

### F. Cards & Surfaces

**`Card.tsx`** — base component is clean, but:
- No shadow variant prop (some consumers force `!p-0` to override padding, e.g. CheckIn preview panel)
- No loading/skeleton state
- No disabled visual state

The override pattern (`!p-0`) bypasses the component's intent and is fragile. A `padding={false}` or `noPadding` prop would be cleaner.

---

### G. Shadows

All shadow values are hardcoded inline rather than being defined in the Tailwind theme:

| Location | Value |
|----------|-------|
| Avatar images | `shadow-[0_2px_8px_rgba(0,0,0,0.15)]` |
| Initials avatar | `shadow-[0_2px_8px_rgba(0,0,0,0.10)]` |
| Modal | `shadow-xl` (Tailwind default) |
| Sidebar dropdown | `shadow-lg` (Tailwind default) |
| Toast | `shadow-lg` (Tailwind default) |

The inconsistency between hardcoded RGBA shadows and Tailwind named shadows creates unpredictable visual depth. Should define a 3-step shadow scale in the CSS theme and use consistently.

---

## 3. Code Inconsistencies

### A. Naming Conventions

**Positive — consistent:**
- Types: PascalCase (`VisitStatus`, `Role`, `Purpose`) ✓
- Store hooks: `use*Store` (`useAuthStore`, `useVisitStore`) ✓
- Utility functions: `get*`, `format*`, `generate*`, `is*` prefix pattern ✓

**Issues:**
- `KpiCardV2.tsx` — "V2" is not a meaningful name variant. Should reflect the difference: e.g., `KpiCardCompact` vs `KpiCardDetailed`.
- `DashboardV2.tsx`, `DashboardV3.tsx` — three iterations of the same screen with no indication of which is current/canonical. This is prototype noise that needs to be resolved.
- Local types not exported: `StatusFilter` in `Dashboard.tsx`, `ActiveFilter` defined separately in `DashboardV2.tsx` and `DashboardV3.tsx` — same type defined three times.

---

### B. Component Patterns

#### Form Handling — No Abstraction

- `CreateWalkIn.tsx`: Manual `FormData` state + `handleChange<K extends keyof FormData>` generic handler (720 lines total)
- `CheckIn.tsx`: Simple `useState` for a single field
- No shared form pattern; each form reimplements validation, state, and error display from scratch

#### List Rendering — Inconsistent Memoization

- `Dashboard.tsx`: `visitorMap` computed via `Object.fromEntries()` with no `useMemo`
- `VisitHistory.tsx`: Same visitorMap computed inside `useMemo`
- Inconsistency means Dashboard may recompute on every render while VisitHistory doesn't

#### Empty States — No Reusable Component

Three different empty state patterns exist:
1. No empty state (parent decides) — `VisitCard.tsx`
2. Inline icon + text block — `VisitColumn.tsx`
3. Styled divider + centered text — `Dashboard.tsx`

No `<EmptyState />` component exists. Same UI need solved three different ways.

#### Modal/Dialog — Inconsistent Patterns

- `Modal.tsx`: Custom overlay + content wrapper (used for confirmations, detail views)
- `CreateWalkIn.tsx`: Full-screen form rendered as a page (no modal)
- `ApproveWalkIn` flows: Appear to use a mix of both

---

### C. State Management

`visitStore.ts` contains substantial business logic within store actions:
- `createWalkIn()`: ~30 lines including ID generation, notification creation, employee lookup
- `approveWalkIn()`: ~20 lines of status transitions and notification dispatch

This makes stores hard to unit-test and makes it hard to reuse logic outside of store context. Business logic should live in `src/utils/` or `src/services/` and be called by store actions.

`notificationStore.ts` creates notification objects inline in action calls. `visitStore.ts` also creates notifications inline. There is no shared notification factory — the shape of a notification is constructed ad-hoc in multiple places.

---

### D. Type Safety

**Good:**
- Type imports used correctly: `import type { Role }` in `VisitCard.tsx`
- Generic handler pattern in `CreateWalkIn.tsx`: `handleChange<K extends keyof FormData>`

**Issues:**
- `StatusFilter` type defined locally in `Dashboard.tsx`; `ActiveFilter` type defined independently in `DashboardV2.tsx` and `DashboardV3.tsx` — functionally the same type in three places
- `VisitHistory.tsx`: Some optional chaining uses `??` for fallback, some don't — `visitor?.name ?? 'Unknown'` vs `visitor?.company ?? ''` (empty string vs 'Unknown' as fallbacks for similar fields)

---

### E. Import Organization

No enforced import order. Some files group consistently (React → Router → Store → Data → Types); others mix freely.

**Best example (`CreateWalkIn.tsx`):**
```
React hooks
React Router
Store hooks
Data imports
```

**Inconsistent example (`Dashboard.tsx`):**
```
React hooks
Router (hooks + components mixed)
Store hooks (useStore + named imports mixed)
Component imports (all flat, no grouping)
Data imports
```

Recommend an ESLint `import/order` rule or simply a documented convention.

---

### F. Event Handlers

Three competing conventions for defining handlers:

| Pattern | Example | Files |
|---------|---------|-------|
| `handle*` function | `handleChange()`, `handleSubmit()` | `CreateWalkIn.tsx` |
| Direct setter | `setCheckInSearch()` | `Dashboard.tsx` |
| Inline arrow | `onClick={() => navigate(...)}` | Many files |

No rule for when to extract vs inline. Recommend: extract to named `handle*` functions when the handler does more than call a single function or setter.

---

### G. Conditional Rendering

Four patterns in use — no consistency:

```tsx
// 1. Ternary in className
className={isClickable ? 'cursor-pointer' : ''}

// 2. Logical AND in JSX
{showBlock && <div>...</div>}

// 3. Computed variable before return
const isExpanded = activeFilter !== null || search !== ''

// 4. Null return
{visit.duration ? formatTime(visit.duration) : null}
```

Patterns 1 and 4 are fine for simple cases. Pattern 2 is appropriate for block-level conditional rendering. Pattern 3 is the cleanest for complex conditions. The issue is that all four are used interchangeably for both simple and complex cases.

---

## 4. File-by-File Notes

### Components

| File | Issues |
|------|--------|
| `Button.tsx` | `lg` size missing font-weight; disabled uses hardcoded zinc colors; `lg` text size same as `md` |
| `Card.tsx` | No shadow variant; no `noPadding` prop (forces `!p-0` override); no loading state |
| `KpiCard.tsx` | Legacy component — unclear if still in use alongside V2 |
| `KpiCardV2.tsx` | Inline `bg-[var(--color-badge-*)]` syntax; uses `font-bold` vs `KpiCard`'s `font-semibold` |
| `Modal.tsx` | Uses `text-text-primary/30` opacity syntax — should be a defined token |
| `PageHeader.tsx` | Uses `text-zinc-*` directly instead of semantic tokens |
| `SearchBar.tsx` | Focus ring `focus:ring-brand/20` — opacity-modified color should be a named token |
| `StatusBadge.tsx` | Correct semantic class usage; no issues |
| `TabBar.tsx` | Badge count styling isolated and inconsistent with global badge patterns |
| `VisitCard.tsx` | `border-zinc-200` raw class should be `border-border-light` |
| `VisitColumn.tsx` | `border-zinc-200` raw class should be `border-border-light`; inline empty state |

### Pages

| File | Issues |
|------|--------|
| `Dashboard.tsx` | Canonical? Unmemoized `visitorMap`; mixed `rounded-xl` / `rounded-lg`; uses raw zinc |
| `DashboardV2.tsx` | Near-duplicate of V1; defines `ActiveFilter` type locally |
| `DashboardV3.tsx` | Third version; another local `ActiveFilter` definition; unclear status |
| `CheckIn.tsx` | Simple but relies on `form-input` class with no ARIA labels |
| `CheckOut.tsx` | Small; uses `color-on-premises` correctly |
| `CreateWalkIn.tsx` | 720 lines; no form abstraction; no sub-components; complex but functional |
| `VisitHistory.tsx` | `tabular-nums` class used in one column only; memoized visitorMap (correct) |

### Layouts

| File | Issues |
|------|--------|
| `AppLayout.tsx` | Uses `bg-brand-red-500` directly; dark/light mode mixed (`bg-zinc-950` for app bar) |
| `Sidebar.tsx` | Full zinc-based dark theme not tokenized; would break if dark theme is ever inverted |

### Stores

| File | Issues |
|------|--------|
| `authStore.ts` | Clean simple store; no issues |
| `visitStore.ts` | Business logic (ID gen, notification dispatch) embedded in actions |
| `notificationStore.ts` | Notification objects created inline; no factory pattern |

---

## 5. Recommendations

### High Priority (Before Any More UI Work)

1. **Resolve Dashboard versions** — Pick one (likely V3 as most recent), delete or archive V1 and V2, rename to `Dashboard.tsx`
2. **Resolve KpiCard versions** — Consolidate into one component with a `variant` or `size` prop; delete the other
3. **Replace all `brand-red-*` with `bg-brand`** — 4 files; 10-minute fix that protects the whole theme
4. **Replace all raw `zinc-*` with semantic tokens** — Covers `PageHeader`, `VisitCard`, `VisitColumn`, `Button`, `Sidebar`
5. **Define typography weight rules** — Match font-weight to size/hierarchy level and apply consistently

### Medium Priority (Polish Phase)

6. **Add `noPadding` prop to `Card.tsx`** — Eliminates `!p-0` override anti-pattern
7. **Create `EmptyState` component** — One reusable component replaces three ad-hoc patterns
8. **Export shared filter types** — `StatusFilter` / `ActiveFilter` should live in `types/visit.ts` or `types/ui.ts`
9. **Standardize event handler naming** — `handle*` for extracted handlers; inline for single-call callbacks only
10. **Define shadow scale in CSS theme** — Replace inline `shadow-[...]` values with named tokens

### Low Priority (Pre-Handoff)

11. **Extract business logic from `visitStore.ts`** — Move ID generation and notification construction to `utils/`
12. **Add notification factory function** — Single source of truth for notification object shape
13. **Document import order convention** — Or add ESLint `import/order` rule
14. **Add ARIA labels to `CheckIn.tsx` and `CreateWalkIn.tsx` form elements**
15. **Review `CreateWalkIn.tsx` for sub-component extraction** — At minimum extract the visitor details section and the host selection section

---

*Report generated from static analysis of `src/`. No code was changed.*

---

## 6. Resolution Checklist

_Last checked: 2026-04-08. `[x]` = resolved, `[ ]` = still open._

### Critical Issues

| # | Status | Issue |
|---|--------|-------|
| C1 | ⚠️ Partial | `bg-brand-red-500` replaced in `AppLayout.tsx` ✓ — still present in `Dashboard.tsx` (line 110, 424) and `DashboardV2.tsx` (line 119, 560) |
| C2 | ⚠️ Partial | `PageHeader`, `VisitCard`, `VisitColumn`, `Button` (disabled) switched to semantic tokens ✓ — `Dashboard.tsx`, `DashboardV2.tsx`, `Sidebar.tsx` still use raw `zinc-*` throughout |
| C5 | ⚠️ Partial | `Button` all sizes now have `font-medium` ✓; `KpiCardV2` now uses `font-semibold` matching `KpiCard` ✓ — no documented rule exists for when to use each weight |
| C6 | ❌ Open | Mixed `space-y-*`, `gap-*`, and manual `mt-*`/`mb-*` — no governing rule defined |
| C7 | ❌ Open | `CreateWalkIn.tsx` is now 759 lines (grown since audit); no sub-components extracted, no form abstraction |
| C8 | ❌ Open | Business logic (visitor lookup, ID gen, notification dispatch) still embedded in `visitStore.ts` actions |

---

### High Priority Recommendations

- [x] **AppLayout.tsx** — `bg-brand-red-500` replaced with `bg-brand`
- [ ] **Resolve Dashboard versions** — `Dashboard.tsx`, `DashboardV2.tsx`, `DashboardV3.tsx` all still exist; pick one canonical version, delete the others
- [ ] **Resolve KpiCard versions** — `KpiCard.tsx` and `KpiCardV2.tsx` both still exist; consolidate into one component with a `variant` prop
- [ ] **Replace remaining `brand-red-500`** — `Dashboard.tsx` (notification dot + FAB), `DashboardV2.tsx` (notification dot + FAB + search button)
- [ ] **Replace `zinc-*` in `Dashboard.tsx` and `DashboardV2.tsx`** — heavy use of raw zinc throughout both files
- [ ] **Tokenize `Sidebar.tsx`** — full dark theme uses raw `zinc-*`; not covered by semantic token system
- [ ] **Define and document typography weight rule** — weights are now more consistent but no explicit rule exists (e.g. headings → `font-semibold`, metrics → `font-semibold`, body → no override)

---

### Medium Priority Recommendations

- [x] **`Card.tsx` `noPadding` prop** — implemented as `padding="none"` variant; eliminates `!p-0` overrides
- [x] **`Button.tsx` `lg` size** — now uses `text-base` (distinct from `md`) and `font-medium`
- [x] **`KpiCardV2.tsx` inline CSS var syntax** — replaced with proper Tailwind utility classes
- [ ] **Create `<EmptyState />` component** — three ad-hoc empty state patterns still exist across `VisitColumn`, `Dashboard`, and `DashboardV2`
- [ ] **Export shared filter types** — `StatusFilter` in `Dashboard.tsx` and `ActiveFilter` in `DashboardV2.tsx`/`DashboardV3.tsx` are still locally defined; should live in `types/visit.ts` or `types/ui.ts`
- [ ] **Standardize event handler naming** — no convention applied; inline arrows, direct setters, and `handle*` functions still mixed
- [ ] **Define shadow scale in CSS theme** — inline `shadow-[0_2px_8px_rgba(0,0,0,0.15)]` still present in `Dashboard.tsx` (lines 333–336) and `DashboardV2.tsx`; named shadow tokens not defined
- [ ] **Fix `Button` hover state inconsistency** — primary/danger use opacity-based hover; secondary/ghost use background-based hover; rule not documented
- [ ] **Fix `Modal.tsx` opacity syntax** — `text-text-primary/30` should be a named token
- [ ] **Fix `SearchBar.tsx` focus ring** — `focus:ring-brand/20` is an opacity modifier, not a named token
- [ ] **Fix `VisitHistory.tsx` `tabular-nums`** — applied to one column only; should be consistent across all numeric columns
- [ ] **`Dashboard.tsx` `visitorMap`** — computed with `Object.fromEntries()` but not wrapped in `useMemo`; recomputes on every render

---

### Low Priority Recommendations (Pre-Handoff)

- [ ] **Extract business logic from `visitStore.ts`** — visitor find-or-create and notification construction should move to `src/utils/` or `src/services/`
- [ ] **Add notification factory function** — notification objects are constructed inline in `visitStore.ts` in four separate action handlers; no shared shape
- [ ] **Document import order convention** — or add ESLint `import/order` rule
- [ ] **Add ARIA labels to `CheckIn.tsx` form elements** — no `aria-label` or `aria-describedby` attributes present
- [ ] **Add ARIA labels to `CreateWalkIn.tsx` form elements** — same gap
- [ ] **Extract sub-components from `CreateWalkIn.tsx`** — at minimum: visitor details section and host selection section
- [ ] **Document border-radius rule** — no written rule for when to use `rounded-lg` vs `rounded-xl`; should be: interactive elements = `rounded-lg`, container surfaces = `rounded-xl`
- [ ] **Rename `KpiCardV2`** — "V2" is not meaningful; rename to reflect the distinction (e.g. `KpiCardDetailed` vs `KpiCardCompact`)
- [ ] **Standardize conditional rendering patterns** — all four patterns (ternary in className, logical `&&`, computed variable, null return) used interchangeably; document when each applies
