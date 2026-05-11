import { useState, useMemo, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { drawPath, stateCode } from '@/data/indiaMapData'
import { locations } from '@/data/locations'
import { employees } from '@/data/employees'
import type { Visit } from '@/types/visit'
import type { Visitor } from '@/types/user'
import { getVisitTypeLabel } from '@/utils/helpers'

// Merge Ladakh into J&K so it renders as one undivided state
const DRAW_PATH: Record<string, string> = {
  ...drawPath,
  'Jammu and Kashmir': drawPath['Jammu and Kashmir'] + ' ' + drawPath['Ladakh'],
}
delete DRAW_PATH['Ladakh']
const STATE_CODES: string[] = stateCode.filter((s) => s !== 'Ladakh')

const FULL_VIEWBOX = '-20 -15 800 820'
const PAD = 24
const BOTTOM_EXTRA = 60

// The CSS height set on the SVG element — used by px() to stay scale-invariant.
const SVG_CSS_H = 650

// Desired physical sizes in CSS pixels. px() converts to SVG user-units for the
// current viewBox so these dimensions stay visually constant across all zoom levels.
const TARGET = {
  countFont:   15,   // px — visitor count number
  labelFont:   12,   // px — location name
  dotR:         6,   // px — main location dot radius
  ringR:        11,  // px — ambient glow ring radius
  strokeW:     1.5,  // px — dot border
  countOffY:   20,   // px — distance above dot centre (applied as negative y)
  labelOffY:   22,   // px — label below dot centre
  avatarOffY:  30,   // px — avatar row top below dot centre
  avatarH:     28,   // px — foreignObject height
  avatarW:     22,   // px — individual avatar circle
  avatarGap:    5,   // px — CSS pixel overlap between avatars
}

type MarkerPos = Record<string, { cx: number; cy: number }>

interface TooltipData {
  visitor: Visitor
  visit: Visit
  x: number
  y: number
}

interface RenderItem {
  loc: typeof locations[number]
  locIds: string[]
  visits: Visit[]
  xOffset: number
  label: string
}

export interface IndiaMapHandle {
  reset: () => void
}

interface IndiaMapProps {
  visitsByLocation: Record<string, Visit[]>
  visitorMap: Record<string, Visitor>
  activeLocationId: string
  onStateChange?: (state: string | null) => void
}

const IndiaMap = forwardRef<IndiaMapHandle, IndiaMapProps>(function IndiaMap({
  visitsByLocation,
  visitorMap,
  activeLocationId,
  onStateChange,
}, ref) {
  const svgRef = useRef<SVGSVGElement>(null)
  const mapWrapRef = useRef<HTMLDivElement>(null)
  const [viewBox, setViewBox] = useState(FULL_VIEWBOX)
  const [fullViewBox, setFullViewBox] = useState(FULL_VIEWBOX)
  const [markerPos, setMarkerPos] = useState<MarkerPos>({})
  const [drilledState, setDrilledState] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  // Convert a desired CSS-pixel measurement to SVG user-units for the current viewBox height.
  // At full-map view (vbH≈928, cssH=650) → px(12) ≈ 17 SVG.
  // At drilled state view (vbH≈300, cssH=650) → px(12) ≈ 6 SVG — both render as 12px CSS.
  const vbH = parseFloat(viewBox.split(' ')[3]) || 928
  const px = (cssPx: number) => Math.max(1, Math.round(cssPx * vbH / SVG_CSS_H))

  // Map state → list of locations
  const stateToLocs = useMemo(() => {
    const map: Record<string, typeof locations> = {}
    for (const loc of locations) {
      if (!loc.state) continue
      if (!map[loc.state]) map[loc.state] = []
      map[loc.state].push(loc)
    }
    return map
  }, [])

  const drillableStates = useMemo(() => new Set(Object.keys(stateToLocs)), [stateToLocs])

  const computeLayout = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    try {
      const full = svg.getBBox()
      const vb = `${full.x - PAD} ${full.y - PAD} ${full.width + PAD * 2} ${full.height + PAD * 2 + BOTTOM_EXTRA}`
      setFullViewBox(vb)
      setViewBox(vb)
    } catch { /* getBBox() can throw before layout */ }

    const positions: MarkerPos = {}
    for (const loc of locations) {
      if (!loc.state) continue
      const el = svg.querySelector<SVGPathElement>(`[data-state="${loc.state}"]`)
      if (!el) continue
      try {
        const bb = el.getBBox()
        positions[loc.id] = { cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2 }
      } catch { /* skip */ }
    }
    setMarkerPos(positions)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(computeLayout)
    return () => cancelAnimationFrame(id)
  }, [computeLayout])

  function handleStateClick(state: string) {
    if (!drillableStates.has(state)) return
    const el = svgRef.current?.querySelector<SVGPathElement>(`[data-state="${state}"]`)
    if (el) {
      try {
        const bb = el.getBBox()
        const cx = bb.x + bb.width / 2
        const cy = bb.y + bb.height / 2
        // Zoom into the state bbox with generous padding.
        // A minimum viewBox of 280 prevents over-zooming into tiny states like Delhi.
        const DRILL_PAD = 60
        const MIN_VB = 280
        const vbW = Math.max(bb.width + DRILL_PAD * 2, MIN_VB)
        const drillVbH = Math.max(bb.height + DRILL_PAD * 2, MIN_VB)
        setViewBox(`${cx - vbW / 2} ${cy - drillVbH / 2} ${vbW} ${drillVbH}`)
      } catch { /* keep current viewBox */ }
    }
    setDrilledState(state)
    setTooltip(null)
    onStateChange?.(state)
  }

  const handleBack = useCallback(() => {
    setViewBox(fullViewBox)
    setDrilledState(null)
    setTooltip(null)
    onStateChange?.(null)
  }, [fullViewBox, onStateChange])

  // Expose reset() so the parent card header can trigger back-navigation
  useImperativeHandle(ref, () => ({ reset: handleBack }), [handleBack])

  // Smart tooltip placement: flip above cursor if near bottom; flip left if near right edge
  function handleAvatarHover(e: React.MouseEvent, visitor: Visitor, visit: Visit) {
    const wrapper = mapWrapRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const TW = 218
    const TH = 130

    const ax = x + 16 + TW > rect.width ? x - TW - 8 : x + 16
    const ay = y + TH > rect.height ? Math.max(4, y - TH - 4) : y - 8

    setTooltip({ visitor, visit, x: ax, y: ay })
  }

  // One aggregated pin per state in overview; individual spread pins when drilled
  const renderItems = useMemo<RenderItem[]>(() => {
    if (drilledState) {
      const stateLocs = stateToLocs[drilledState] ?? []
      return stateLocs.map((loc, idx) => ({
        loc,
        locIds: [loc.id],
        visits: visitsByLocation[loc.id] ?? [],
        xOffset: stateLocs.length > 1 ? (idx - (stateLocs.length - 1) / 2) * 55 : 0,
        label: loc.name.replace('EO — ', '').replace('Branch — ', ''),
      }))
    }
    return Object.entries(stateToLocs).map(([, stateLocs]) => {
      const rep = stateLocs[0]
      const allVisits = stateLocs.flatMap((l) => visitsByLocation[l.id] ?? [])
      const label = stateLocs.length === 1
        ? rep.name.replace('EO — ', '').replace('Branch — ', '')
        : rep.state ?? rep.name.replace('EO — ', '')
      return { loc: rep, locIds: stateLocs.map((l) => l.id), visits: allVisits, xOffset: 0, label: label ?? '' }
    })
  }, [drilledState, stateToLocs, visitsByLocation])

  // Pre-compute px values used in the render loop (these depend on viewBox / vbH)
  const sz = {
    countFont:  px(TARGET.countFont),
    labelFont:  px(TARGET.labelFont),
    dotR:       px(TARGET.dotR),
    ringR:      px(TARGET.ringR),
    strokeW:    px(TARGET.strokeW),
    countY:     px(TARGET.countOffY),    // negative — above dot
    labelY:     px(TARGET.labelOffY),
    avatarY:    px(TARGET.avatarOffY),
    avatarH:    px(TARGET.avatarH),
    avatarW:    px(TARGET.avatarW),
    avatarNet:  px(TARGET.avatarW - TARGET.avatarGap),  // net advance per additional avatar
  }

  return (
    <div className="flex flex-col w-full" data-map-container>
      {/* SVG Map — overflow hidden so paths don't bleed outside this element's CSS bounds */}
      <div ref={mapWrapRef} className="relative w-full flex justify-center overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          style={{ width: '100%', height: SVG_CSS_H, display: 'block' }}
          aria-label="India map"
        >
          {STATE_CODES.map((state) => {
            const hasBranch = drillableStates.has(state)
            const isActive = drilledState === state
            return (
              <path
                key={state}
                data-state={state}
                d={DRAW_PATH[state] ?? ''}
                onClick={() => handleStateClick(state)}
                style={{
                  fill: isActive
                    ? 'var(--color-brand-red-100)'
                    : hasBranch
                      ? 'var(--color-brand-red-50)'
                      : 'var(--color-surface-secondary)',
                  stroke: hasBranch ? 'var(--color-brand-red-200)' : 'var(--color-border)',
                  strokeWidth: hasBranch ? 0.7 : 0.5,
                  cursor: hasBranch ? 'pointer' : 'default',
                  outline: 'none',
                  transition: 'fill 150ms',
                }}
                onMouseEnter={(e) => {
                  if (hasBranch && !isActive)
                    (e.currentTarget as SVGPathElement).style.fill = 'var(--color-brand-red-100)'
                }}
                onMouseLeave={(e) => {
                  if (hasBranch && !isActive)
                    (e.currentTarget as SVGPathElement).style.fill = 'var(--color-brand-red-50)'
                }}
              />
            )
          })}

          {renderItems.map((item) => {
            const pos = markerPos[item.loc.id]
            if (!pos) return null
            const isActive = activeLocationId === 'all' || item.locIds.some((id) => id === activeLocationId)
            const count = item.visits.length
            const shown = item.visits.slice(0, 4)
            const overflow = count - 4

            // Avatar row width in SVG units: first avatar + net advance per additional
            const avatarRowW = shown.length > 0
              ? sz.avatarW + (shown.length - 1) * sz.avatarNet + (overflow > 0 ? sz.avatarNet : 0)
              : 0

            return (
              <g
                key={item.loc.id}
                transform={`translate(${pos.cx + item.xOffset}, ${pos.cy})`}
                style={{ opacity: isActive ? 1 : 0.3, transition: 'opacity 200ms' }}
              >
                {/* Visitor count — bare text, no background */}
                {count > 0 && (
                  <text
                    x={0} y={-sz.countY}
                    textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: sz.countFont, fontWeight: 800, fill: 'var(--color-brand)', pointerEvents: 'none', letterSpacing: '-0.5px' }}
                  >
                    {count}
                  </text>
                )}

                {/* Ambient glow ring */}
                {count > 0 && <circle r={sz.ringR} fill="var(--color-brand)" opacity={0.12} />}

                {/* Main location dot */}
                <circle r={sz.dotR} fill="var(--color-brand)" stroke="white" strokeWidth={sz.strokeW} />

                {/* Location label */}
                <text
                  y={sz.labelY} textAnchor="middle"
                  style={{ fontSize: sz.labelFont, fontWeight: 600, fill: 'var(--color-text-primary)', pointerEvents: 'none' }}
                >
                  {item.label}
                </text>

                {/* Visitor avatars */}
                {count > 0 && avatarRowW > 0 && (
                  <foreignObject
                    x={-(avatarRowW / 2)}
                    y={sz.avatarY}
                    width={avatarRowW + sz.avatarNet}
                    height={sz.avatarH}
                    style={{ overflow: 'visible' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'visible' }}>
                      {shown.map((visit) => {
                        const visitor = visitorMap[visit.visitorId]
                        if (!visitor) return null
                        return (
                          <MiniAvatar
                            key={visit.id}
                            visitor={visitor}
                            visit={visit}
                            onHover={handleAvatarHover}
                            onLeave={() => setTooltip(null)}
                          />
                        )
                      })}
                      {overflow > 0 && (
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', border: '2px solid white',
                          background: '#f1f5f9', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', marginLeft: -5, flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 8, fontWeight: 700, color: '#64748b' }}>+{overflow}</span>
                        </div>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>

        {/* Tooltip — smart-flipped to stay inside the wrapper bounds */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <VisitTooltip visitor={tooltip.visitor} visit={tooltip.visit} />
          </div>
        )}
      </div>

      {/* Hint — padded to match card inner edges */}
      {!drilledState && (
        <p className="text-[10px] text-text-tertiary flex items-center gap-1 px-4 pb-2 pt-1">
          <i className="ri-cursor-line" />
          Click a highlighted state to drill down
        </p>
      )}
    </div>
  )
})

export default IndiaMap

function MiniAvatar({ visitor, visit, onHover, onLeave }: {
  visitor: Visitor
  visit: Visit
  onHover: (e: React.MouseEvent, v: Visitor, visit: Visit) => void
  onLeave: () => void
}) {
  const initials = visitor.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      onMouseEnter={(e) => onHover(e, visitor, visit)}
      onMouseLeave={onLeave}
      style={{
        width: 22, height: 22, borderRadius: '50%', border: '2px solid white',
        background: 'var(--color-brand-red-100)', overflow: 'hidden',
        flexShrink: 0, marginLeft: -5, cursor: 'pointer',
      }}
      className="first:ml-0 hover:scale-110 transition-transform"
    >
      {visitor.avatar ? (
        <img src={visitor.avatar} alt={visitor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 8, fontWeight: 700, color: 'var(--color-brand)' }}>
          {initials}
        </span>
      )}
    </div>
  )
}

function VisitTooltip({ visitor, visit }: { visitor: Visitor; visit: Visit }) {
  const host = employees.find((e) => e.id === visit.hostEmployeeId)
  const checkInTime = visit.checkInTime
    ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 w-[210px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-brand-light flex items-center justify-center">
          {visitor.avatar
            ? <img src={visitor.avatar} alt={visitor.name} className="w-full h-full object-cover" />
            : <span className="text-xs font-semibold text-brand">{visitor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
          }
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">{visitor.name}</p>
          {visitor.company && <p className="text-[11px] text-text-tertiary truncate">{visitor.company}</p>}
        </div>
      </div>
      <div className="space-y-1 border-t border-border-light pt-2">
        {host && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <i className="ri-user-line text-text-tertiary shrink-0" />
            <span className="truncate">{host.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <i className="ri-id-card-line text-text-tertiary shrink-0" />
          <span className="truncate">{getVisitTypeLabel(visit.visitType)}</span>
        </div>
        {checkInTime && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <i className="ri-login-box-line text-text-tertiary shrink-0" />
            <span>In {checkInTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}
