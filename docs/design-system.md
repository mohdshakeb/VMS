# VMS Design System
**Source:** GSS Design / Mintways — extracted from `textStyles.json` + `Colour Palette.json`

---

## Spacing — 4px Base Grid

**Rule:** All spacing must be a multiple of 4px. No ad-hoc pixel values.

`--spacing: 0.25rem` is declared in `@theme`. Every Tailwind spacing utility scales off this:

| Tailwind token | px value | Common usage |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight inline gaps |
| `space-2` | 8px | Between stacked small elements |
| `space-3` | 12px | Card inner padding (compact) |
| `space-4` | 16px | Standard padding, list item gap |
| `space-5` | 20px | Section internal padding |
| `space-6` | 24px | Card padding, form field gap |
| `space-8` | 32px | Between sections |
| `space-10` | 40px | Large section gaps |
| `space-12` | 48px | Page-level top padding |
| `space-16` | 64px | Major layout gaps |

**Never use:** `space-[13px]`, `mt-[7px]`, or any arbitrary pixel value not on the 4px grid.

**How it appears in Tailwind:** `p-4`, `gap-3`, `mt-6`, `px-5`, `py-3` — all multiples of 4px.

---

## Typography

**Font:** Inter (all weights and sizes)

| Token name | Size | Weight | Letter Spacing | Usage |
|---|---|---|---|---|
| `regular-xs` | 12px | 400 | +1% | Captions, labels, helper text |
| `regular-sm` | 14px | 400 | 0 | Body secondary, table cells |
| `regular-base` | 16px | 400 | 0 | Body default |
| `regular-lg` | 18px | 400 | 0 | Large body, card descriptions |
| `regular-xl` | 20px | 400 | 0 | Intro text |
| `medium-xs` | 12px | 500 | 0 | Tight labels |
| `medium-sm` | 14px | 500 | +1% | Form labels, secondary CTAs |
| `medium-base` | 16px | 500 | 0 | Emphasized body |
| `medium-lg` | 18px | 500 | 0 | Subheadings |
| `bold-xs` | 12px | 600 | 0 | Badge labels, overlines |
| `bold-sm` | 14px | 600 | 0 | Table headers, secondary headings |
| `bold-base` | 16px | 600 | 0 | Card headings, nav items |
| `bold-lg` | 18px | 600 | 0 | Section headings |
| `bold-xl` | 20px | 600 | 0 | Page subheadings |
| `bold-2xl` | 24px | 600 | 0 | Page headings |
| `bold-3xl` | 30px | 600 | 0 | Display headings, KPI numbers |

**Tailwind usage:** `text-sm font-medium`, `text-2xl font-semibold`, etc.

---

## Colour Palette

### Brand Red — Primary
| Scale | Hex | Usage |
|---|---|---|
| 50 | `#FEF5F5` | Hover backgrounds, tinted surfaces |
| 100 | `#FCDEDF` | Light backgrounds |
| 500 | `#EB2128` | **Primary CTAs, active states, brand moments** |
| 600 | `#C91218` | Hover on primary buttons |
| 700 | `#9A0D12` | Pressed state |

**Tailwind:** `bg-brand-red-500`, `text-brand-red-600`, `border-brand-red-200`

---

### Blue — Secondary / Accent
| Scale | Hex | Usage |
|---|---|---|
| 50 | `#F0F9FF` | Info backgrounds |
| 500 | `#00A6F4` | **Links, info states, secondary interactive** |
| 600 | `#0084D1` | Hover on blue elements |

**Tailwind:** `bg-blue-500`, `text-blue-600`

---

### Zinc — Neutrals (warm-tinted)
> Never use pure black or neutral gray. All grays have a warm cast.

| Scale | Hex | Usage |
|---|---|---|
| 50 | `#FAFAFA` | Page background |
| 100 | `#F5F4F4` | Card background, secondary surface |
| 200 | `#E7E4E4` | Borders, dividers |
| 300 | `#D8D4D4` | Disabled borders |
| 400 | `#A99F9F` | Placeholder text, tertiary |
| 500 | `#7B7171` | Secondary text |
| 600 | `#5C5252` | Muted text |
| 700 | `#463F3F` | Subdued headings |
| 800 | `#2A2727` | Dark text |
| 900 | `#1B1818` | Primary text |

**Tailwind:** `bg-zinc-100`, `text-zinc-900`, `border-zinc-200`

---

### Semantic Status Colours

| Colour | Scale 500 | Usage in VMS |
|---|---|---|
| Green | `#22C55E` | Approved, confirmed, checked-in, success |
| Red | `#DC2626` | Rejected, error, danger |
| Orange | `#F97316` | Pending, awaiting, warning |

---

### Badge / Tag Backgrounds
Three-value triads: `light` (background) / `subtle` (border or icon tint) / `dark` (text or icon)

| Colour | Light | Subtle | Dark |
|---|---|---|---|
| Yellow | `#FDF4E7` | `#F6D6AB` | `#E89221` |
| Blue | `#E8F0FD` | `#A7C7F5` | `#4B8DEC` |
| Red | `#FDE8EC` | `#F7B5C0` | `#EE6179` |
| Green | `#DBF9E2` | `#A6F1B6` | `#1FD447` |
| Pink | `#FDE8F4` | `#F5A7D6` | `#EA34A1` |
| Purple | `#FAE7FD` | `#EBABF6` | `#CA21E8` |
| Violet | `#EBE8FD` | `#C4B7F9` | `#7558F2` |

**Tailwind:** `bg-badge-green-light text-badge-green-dark`

---

## Semantic Aliases (use in components)

| Alias | Resolves to | Use for |
|---|---|---|
| `--color-surface` | zinc-50 | Page background |
| `--color-surface-secondary` | zinc-100 | Card / panel background |
| `--color-surface-tertiary` | zinc-200 | Input background |
| `--color-border` | zinc-200 | Standard border |
| `--color-border-light` | zinc-100 | Subtle dividers |
| `--color-text-primary` | zinc-900 | Headings, body |
| `--color-text-secondary` | zinc-600 | Labels, captions |
| `--color-text-tertiary` | zinc-400 | Placeholders, hints |
| `--color-brand` | brand-red-500 | Primary brand / CTA |
| `--color-brand-hover` | brand-red-600 | Button hover |
| `--color-brand-light` | brand-red-50 | Brand tinted background |

---

## VMS Visit Status → Colour Mapping

| Status | Colour | Light bg | Tailwind badge pattern |
|---|---|---|---|
| Pending | `--color-pending` (orange-500) | `--color-pending-light` | `bg-badge-yellow-light text-badge-yellow-dark` |
| Confirmed | `--color-confirmed` (green-500) | `--color-confirmed-light` | `bg-badge-green-light text-badge-green-dark` |
| Active | `--color-active` (blue-500) | `--color-active-light` | `bg-badge-blue-light text-badge-blue-dark` |
| Rejected | `--color-rejected` (red-500) | `--color-rejected-light` | `bg-badge-red-light text-badge-red-dark` |
| On Premises | `--color-on-premises` (violet-dark) | `--color-on-premises-light` | `bg-badge-violet-light text-badge-violet-dark` |
| Completed | `--color-completed` (zinc-500) | `--color-completed-light` | `bg-zinc-100 text-zinc-500` |

---

## Anti-Patterns (Refused)
- Pure black (`#000000`) or pure neutral gray — always use tinted Zinc
- Purple gradients
- Inter with no size or weight differentiation (flat typography)
- Animations over 300ms
- `scale(0)` animation origin
- Gray text on coloured backgrounds (use dark variant of the badge triad instead)
