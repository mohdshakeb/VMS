// ─────────────────────────────────────────────────────────────────────────────
// SBU Admin Dashboard — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// No responsive prefixes — every class here describes the mobile layout as-is.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import type { FacilityComplianceStatus } from '@/types/facility'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import KpiCardV2 from '@/components/KpiCardV2'
import ComplianceHeatmap, { ComplianceLegend } from '@/components/facility/ComplianceHeatmap'
import EmptyState from '@/components/common/EmptyState'
import BottomSheet from '@/components/Mobile/BottomSheet'
import Button from '@/components/Button'
import { CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'
import {
  getCurrentRecord, scoreChecklist, starsFromPct, groupFacilitiesByLocation,
  MONTH_SHORT, COMPLIANCE_LABEL, COMPLIANCE_STYLE,
} from '@/utils/facilityHelpers'

const TREND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
const MAX_SELECTED = 5

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

const DEFAULT_TREND_LOCATIONS = ['Trichy', 'Coimbatore', 'Anna Salai - Chennai', 'Madurai', 'Tirunelveli']

const RATING_OPTIONS = [
  { value: 'all',    label: 'All Ratings' },
  { value: '5',      label: '5 ★' },
  { value: '4',      label: '4 ★' },
  { value: '3',      label: '3 ★' },
  { value: '2',      label: '2 ★' },
  { value: '1',      label: '1 ★' },
  { value: 'gte3',   label: '≥ 3 ★' },
  { value: 'below3', label: 'Below 3 ★' },
]

function matchesRating(stars: number | null, f: string): boolean {
  if (f === 'all') return true
  if (stars === null) return false
  if (f === 'below3') return stars < 3
  if (f === 'gte3') return stars >= 3
  return stars === parseInt(f)
}

function StarDisplay({ stars }: { stars: number | null }) {
  if (stars === null) return <span className="text-xs text-text-tertiary">—</span>
  return (
    <div className="flex gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map(s => (
        <i key={s} className={`${s <= stars ? 'ri-star-fill text-amber-400' : 'ri-star-line text-text-tertiary'} text-[11px] leading-none`} />
      ))}
    </div>
  )
}

// ─── Custom tooltip for the compliance trend line chart ───────────────────────
function TrendTooltip({ active, payload, label, trendData, activePeriods }: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
  trendData: Array<Record<string, number | string>>
  activePeriods: Array<{ month: number; year: number }>
}) {
  if (!active || !payload?.length) return null
  const monthIdx = trendData.findIndex(d => d.month === label)
  const period = activePeriods[monthIdx]
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg px-2.5 py-2 min-w-[170px]">
      <p className="text-[10px] font-semibold text-text-secondary mb-1.5">
        {label} {period?.year ?? ''}
      </p>
      {payload.map(p => {
        const prevRaw = monthIdx > 0 ? trendData[monthIdx - 1][p.dataKey] : undefined
        const prev = typeof prevRaw === 'number' ? prevRaw : null
        const diff = prev !== null ? p.value - prev : null
        return (
          <div key={p.dataKey} className="flex items-center gap-1.5 mb-1 last:mb-0">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-[10px] text-text-primary flex-1 truncate max-w-[90px]">{p.dataKey}</span>
            <span className="text-[10px] font-bold tabular-nums text-text-primary">{p.value}%</span>
            {diff !== null && diff !== 0 && (
              <span className={`text-[9px] font-semibold tabular-nums ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {diff > 0 ? '+' : ''}{diff}%
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function SbuAdminDashboardMobile() {
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentSbu } = useAuthStore()

  const sbuFacilities = facilities.filter((f) => f.sbu === currentSbu)
  const overdue = sbuFacilities.filter((f) => f.complianceStatus === 'overdue').length

  const scoreByFacility = useMemo(() => {
    const map = new Map<string, number>()
    sbuFacilities.forEach((f) => {
      if (f.complianceProgress > 0) {
        const record = getCurrentRecord(complianceRecords, f.location)
        if (record) map.set(f.id, scoreChecklist(record.checklist).percentage)
      }
    })
    return map
  }, [sbuFacilities, complianceRecords])

  const avgScore = useMemo(() => {
    const scores = [...scoreByFacility.values()]
    return scores.length > 0 ? Math.round(scores.reduce((sum, p) => sum + p, 0) / scores.length) : null
  }, [scoreByFacility])

  const submittedCount = sbuFacilities.filter(
    (f) => f.complianceStatus === 'submitted' || f.complianceStatus === 'updated'
  ).length
  const compliancePct = sbuFacilities.length > 0
    ? Math.round(submittedCount / sbuFacilities.length * 100) : 0

  const avgStars = avgScore !== null ? starsFromPct(avgScore) : null
  const lowPerforming = [...scoreByFacility.values()].filter((pct) => pct < 60).length

  const prevPeriod = CURRENT_COMPLIANCE_PERIOD.month > 0
    ? { month: CURRENT_COMPLIANCE_PERIOD.month - 1, year: CURRENT_COMPLIANCE_PERIOD.year }
    : { month: 11, year: CURRENT_COMPLIANCE_PERIOD.year - 1 }
  const prevMonthRecords = complianceRecords.filter(
    (r) => r.month === prevPeriod.month && r.year === prevPeriod.year &&
      sbuFacilities.some((f) => f.location === r.locationName)
  )
  const overdueVsLastMonth = overdue - prevMonthRecords.filter((r) => r.status === 'overdue').length
  const lowPerformingVsLastMonth = lowPerforming - prevMonthRecords.filter((r) => {
    if (r.status !== 'submitted' && r.status !== 'updated') return false
    return scoreChecklist(r.checklist).percentage < 60
  }).length

  const locationGroups = useMemo(() => groupFacilitiesByLocation(sbuFacilities), [sbuFacilities])
  const heatmapSubmittedCount = locationGroups.filter((lg) => {
    const fac = lg.facilities[0]
    return fac && (fac.complianceStatus === 'submitted' || fac.complianceStatus === 'updated')
  }).length

  // ─── Compliance Trend ────────────────────────────────────────────────────────
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m')
  const [selectionMode, setSelectionMode] = useState<'default' | 'cleared' | 'custom'>('default')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const activePeriods = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)!.periods

  const locationTrendScores = useMemo(() => {
    return locationGroups.map(lg => {
      const monthScores = activePeriods.map(p => {
        const record = complianceRecords.find(r =>
          r.locationName === lg.location && r.month === p.month && r.year === p.year
        )
        if (!record || record.status === 'missed') return null
        if (record.status === 'submitted' || record.status === 'updated') {
          return scoreChecklist(record.checklist).percentage
        }
        return null
      })
      const valid = monthScores.filter(v => v !== null) as number[]
      const avg = valid.length > 0 ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length) : 0
      return { location: lg.location, scores: monthScores, avg }
    })
  }, [locationGroups, complianceRecords, activePeriods])

  const activeLocations = useMemo(() => {
    if (selectionMode === 'default') {
      return DEFAULT_TREND_LOCATIONS.filter(l => locationTrendScores.some(lt => lt.location === l))
    }
    if (selectionMode === 'cleared') return []
    return selectedLocations
  }, [selectionMode, selectedLocations, locationTrendScores])

  const trendData = useMemo(() =>
    activePeriods.map((p, i) => {
      const entry: Record<string, number | string> = { month: MONTH_SHORT[p.month - 1] }
      locationTrendScores
        .filter(l => activeLocations.includes(l.location))
        .forEach(loc => {
          const val = loc.scores[i]
          if (val !== null) entry[loc.location] = val
        })
      return entry
    }),
    [locationTrendScores, activeLocations, activePeriods]
  )

  function toggleLocation(loc: string) {
    if (selectionMode === 'default' || selectionMode === 'cleared') {
      setSelectedLocations([loc])
      setSelectionMode('custom')
      return
    }
    setSelectedLocations(prev => {
      if (prev.includes(loc)) {
        const next = prev.filter(l => l !== loc)
        if (next.length === 0) setSelectionMode('cleared')
        return next
      }
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, loc]
    })
  }

  function clearLocationSelection() {
    setSelectedLocations([])
    setSelectionMode('cleared')
  }

  function resetLocationSelection() {
    setSelectedLocations([])
    setSelectionMode('default')
  }

  // ─── Location / State rankings ───────────────────────────────────────────────
  const locationRankings = useMemo(() => {
    return locationGroups.map(lg => {
      const record = getCurrentRecord(complianceRecords, lg.location)
      const isOk = record && (record.status === 'submitted' || record.status === 'updated')
      const score = isOk ? scoreChecklist(record!.checklist).percentage : null
      const stars = score !== null ? starsFromPct(score) : null
      const status: FacilityComplianceStatus = record?.status ?? 'pending'
      return { location: lg.location, state: lg.state, score, stars, status }
    }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  }, [locationGroups, complianceRecords])

  const stateRankings = useMemo(() => {
    const stateMap = new Map<string, number[]>()
    locationRankings.forEach(lr => {
      if (lr.score !== null) {
        const arr = stateMap.get(lr.state) ?? []
        arr.push(lr.score)
        stateMap.set(lr.state, arr)
      }
    })
    return [...stateMap.entries()].map(([state, scores]) => {
      const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      return { state, score: avg, stars: starsFromPct(avg), count: scores.length }
    }).sort((a, b) => b.score - a.score)
  }, [locationRankings])

  const [viewMode, setViewMode] = useState<'locations' | 'states'>('locations')
  const [ratingFilter, setRatingFilter] = useState('all')

  const filteredLocations = locationRankings.filter(lr => matchesRating(lr.stars, ratingFilter)).slice(0, 10)
  const filteredStates = stateRankings.filter(sr => matchesRating(sr.stars, ratingFilter)).slice(0, 10)

  // ─── Bottom sheets ───────────────────────────────────────────────────────────
  const [heatmapMounted, setHeatmapMounted] = useState(false)
  const [heatmapVisible, setHeatmapVisible] = useState(false)

  function openHeatmapSheet() {
    setHeatmapMounted(true)
    requestAnimationFrame(() => { requestAnimationFrame(() => setHeatmapVisible(true)) })
  }
  function closeHeatmapSheet() {
    setHeatmapVisible(false)
    setTimeout(() => setHeatmapMounted(false), 260)
  }

  const [viewAllMounted, setViewAllMounted] = useState(false)
  const [viewAllVisible, setViewAllVisible] = useState(false)

  function openViewAll() {
    setViewAllMounted(true)
    requestAnimationFrame(() => { requestAnimationFrame(() => setViewAllVisible(true)) })
  }
  function closeViewAll() {
    setViewAllVisible(false)
    setTimeout(() => setViewAllMounted(false), 260)
  }

  const [locSelectorMounted, setLocSelectorMounted] = useState(false)
  const [locSelectorVisible, setLocSelectorVisible] = useState(false)

  function openLocSelector() {
    setLocSelectorMounted(true)
    requestAnimationFrame(() => { requestAnimationFrame(() => setLocSelectorVisible(true)) })
  }
  function closeLocSelector() {
    setLocSelectorVisible(false)
    setTimeout(() => setLocSelectorMounted(false), 260)
  }

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-4">

          {/* Header actions */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon="ri-shield-check-line" fullWidth onClick={() => navigate('/sbu/compliance')}>
              Review compliance
            </Button>
            <Button variant="primary" size="sm" icon="ri-add-line" fullWidth onClick={() => navigate('/sbu/onboarding/new')}>
              New Location
            </Button>
          </div>

          {/* KPI cards — horizontal scroll */}
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
            <div className="flex gap-2.5">
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Compliance Rate"
                  info={`${currentSbu} SBU`}
                  value={`${compliancePct}%`}
                  icon="ri-shield-check-line"
                  color="green"
                  showInfo
                  detail={`${submittedCount} of ${sbuFacilities.length} locations`}
                  onClick={openHeatmapSheet}
                />
              </div>

              {/* Average Rating — custom card with star icons */}
              <div className="w-[40vw] shrink-0">
                <div className="h-full rounded-xl bg-white border border-border-light px-4 py-4 flex flex-col justify-between transition-all duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-semibold text-text-primary uppercase tracking-widest leading-snug">Average Rating</p>
                      <p className="text-xs mt-1 text-text-tertiary">based on avg. score</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-yellow-surface border border-yellow-border">
                      <i className="ri-star-line text-lg text-yellow-fg" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    {avgStars !== null ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i key={s} className={`${s <= avgStars ? 'ri-star-fill text-amber-400' : 'ri-star-line text-text-tertiary'} text-lg leading-none`} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xl font-semibold text-text-primary leading-none">—</p>
                    )}
                    <span className="text-xs text-text-tertiary font-medium leading-none">
                      Avg. Score: {avgScore !== null ? `${avgScore}%` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Overdue"
                  info="Past cut-off date"
                  value={overdue}
                  icon="ri-alarm-warning-line"
                  color="red"
                  showInfo
                  trend={overdueVsLastMonth}
                  trendLabel="vs last month"
                  trendInverted
                  onClick={() => navigate('/sbu/compliance?status=overdue')}
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Low Performing"
                  info="Rating below 3 stars"
                  value={lowPerforming}
                  icon="ri-star-off-line"
                  color="yellow"
                  showInfo
                  trend={lowPerformingVsLastMonth}
                  trendLabel="vs last month"
                  trendInverted
                  onClick={() => navigate('/sbu/locations?rating=below3')}
                />
              </div>
              <div className="w-4 shrink-0" />
            </div>
          </div>

          {/* Compliance Trend */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
              <i className="ri-bar-chart-line text-text-tertiary text-base shrink-0" />
              <p className="text-sm font-semibold text-text-primary flex-1">Compliance Trend</p>
              {/* Period selector */}
              <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shrink-0">
                {PERIOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedPeriod(opt.value)}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                      selectedPeriod === opt.value
                        ? 'bg-white text-text-primary shadow-sm'
                        : 'text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* Location selector button */}
              <button
                onClick={openLocSelector}
                className={`flex items-center gap-1 text-[10px] font-medium border rounded-lg px-2 py-1 transition-colors shrink-0 ${
                  selectionMode !== 'default'
                    ? 'bg-brand-light text-brand border-brand'
                    : 'bg-surface text-text-secondary border-border'
                }`}
              >
                <i className="ri-map-pin-2-line text-xs" />
                {activeLocations.length} loc
              </button>
            </div>
            <div className="px-1 py-3">
              {activeLocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-44 gap-2 text-text-tertiary">
                  <i className="ri-map-pin-off-line text-xl" />
                  <p className="text-xs font-medium">Select locations to compare</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[40, 100]}
                      tickFormatter={(v) => v + '%'}
                      tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<TrendTooltip trendData={trendData} activePeriods={activePeriods} />} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                    {activeLocations.map((loc, i) => (
                      <Line
                        key={loc}
                        dataKey={loc}
                        stroke={TREND_COLORS[i % TREND_COLORS.length]}
                        strokeWidth={1.5}
                        dot={false}
                        animationDuration={400}
                        animationEasing="ease-out"
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Rated */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <i className="ri-map-pin-2-fill text-text-tertiary text-base shrink-0" />
              <p className="text-sm font-semibold text-text-primary flex-1">Top Rated</p>
              {/* Locations | States toggle */}
              <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shrink-0">
                {(['locations', 'states'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                      viewMode === mode
                        ? 'bg-white text-text-primary shadow-sm'
                        : 'text-text-secondary'
                    }`}
                  >
                    {mode === 'locations' ? 'Locations' : 'States'}
                  </button>
                ))}
              </div>
              {/* Rating filter */}
              <div className="relative flex items-center shrink-0">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="text-[11px] font-medium text-text-secondary bg-surface border border-border rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none appearance-none"
                >
                  {RATING_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-1.5 text-text-tertiary text-sm pointer-events-none" />
              </div>
            </div>

            {/* Ranked list */}
            <div className="divide-y divide-border-light">
              {viewMode === 'locations' ? (
                filteredLocations.length === 0 ? (
                  <EmptyState icon="ri-map-pin-line" title="No locations match" />
                ) : (
                  filteredLocations.map((lr, idx) => (
                    <div key={lr.location} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-[11px] text-text-tertiary w-5 tabular-nums shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate leading-tight">{lr.location}</p>
                        <p className="text-[10px] text-text-tertiary truncate mt-0.5">{lr.state}</p>
                      </div>
                      <StarDisplay stars={lr.stars} />
                      <span className="text-xs font-bold tabular-nums text-text-primary shrink-0 w-9 text-right">
                        {lr.score !== null ? `${lr.score}%` : '—'}
                      </span>
                    </div>
                  ))
                )
              ) : (
                filteredStates.length === 0 ? (
                  <EmptyState icon="ri-map-pin-line" title="No states match" />
                ) : (
                  filteredStates.map((sr, idx) => (
                    <div key={sr.state} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-[11px] text-text-tertiary w-5 tabular-nums shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate leading-tight">{sr.state}</p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">{sr.count} locations</p>
                      </div>
                      <StarDisplay stars={sr.stars} />
                      <span className="text-xs font-bold tabular-nums text-text-primary shrink-0 w-9 text-right">{sr.score}%</span>
                    </div>
                  ))
                )
              )}
            </div>

            {/* View All footer */}
            <div className="border-t border-border-light px-4 py-2.5">
              <button
                onClick={openViewAll}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand py-1"
              >
                View all <i className="ri-arrow-right-s-line text-sm" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Compliance heatmap sheet */}
      {heatmapMounted && (
        <BottomSheet
          mounted={heatmapMounted}
          visible={heatmapVisible}
          onClose={closeHeatmapSheet}
          title="Compliance Heatmap"
          subtitle={`${heatmapSubmittedCount} of ${locationGroups.length} locations submitted for current period`}
        >
          <div className="px-5 pb-2 pt-1 flex justify-end border-b border-border">
            <button className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary border border-border rounded-lg px-2.5 py-1.5 hover:bg-surface-secondary transition-colors">
              <i className="ri-download-2-line text-sm" />
              Export
            </button>
          </div>
          <div className="px-5 py-4 overflow-x-auto">
            <ComplianceHeatmap facilities={sbuFacilities} complianceRecords={complianceRecords} />
          </div>
          <div className="px-5 py-3 border-t border-border">
            <ComplianceLegend />
          </div>
        </BottomSheet>
      )}

      {/* View All sheet */}
      {viewAllMounted && (
        <BottomSheet
          mounted={viewAllMounted}
          visible={viewAllVisible}
          onClose={closeViewAll}
          title={viewMode === 'locations' ? 'All Locations' : 'All States'}
          subtitle={
            viewMode === 'locations'
              ? `${locationRankings.length} locations · current period`
              : `${stateRankings.length} states · aggregated score`
          }
        >
          <div className="divide-y divide-border-light overflow-y-auto">
            {viewMode === 'locations' ? (
              locationRankings.map((lr, idx) => (
                <div key={lr.location} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm text-text-tertiary tabular-nums w-6 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{lr.location}</p>
                    <p className="text-xs text-text-tertiary">{lr.state}</p>
                  </div>
                  <StarDisplay stars={lr.stars} />
                  <span className="text-sm font-bold tabular-nums text-text-primary w-10 text-right shrink-0">
                    {lr.score !== null ? `${lr.score}%` : '—'}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${COMPLIANCE_STYLE[lr.status]}`}>
                    {COMPLIANCE_LABEL[lr.status]}
                  </span>
                </div>
              ))
            ) : (
              stateRankings.map((sr, idx) => (
                <div key={sr.state} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm text-text-tertiary tabular-nums w-6 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{sr.state}</p>
                    <p className="text-xs text-text-tertiary">{sr.count} locations</p>
                  </div>
                  <StarDisplay stars={sr.stars} />
                  <span className="text-sm font-bold tabular-nums text-text-primary w-10 text-right shrink-0">{sr.score}%</span>
                </div>
              ))
            )}
          </div>
        </BottomSheet>
      )}

      {/* Location selector sheet */}
      {locSelectorMounted && (
        <BottomSheet
          mounted={locSelectorMounted}
          visible={locSelectorVisible}
          onClose={closeLocSelector}
          title="Select Locations"
          subtitle={`Choose up to ${MAX_SELECTED} locations to compare`}
        >
          <div className="flex items-center justify-between px-5 py-2 border-b border-border-light">
            <span className="text-xs text-text-tertiary">{activeLocations.length} of {MAX_SELECTED} selected</span>
            {selectionMode === 'default' ? (
              <button onClick={clearLocationSelection} className="text-xs text-brand font-medium">
                Clear
              </button>
            ) : (
              <button onClick={resetLocationSelection} className="text-xs text-brand font-medium">
                Reset
              </button>
            )}
          </div>
          <div className="divide-y divide-border-light overflow-y-auto">
            {locationTrendScores
              .sort((a, b) => a.location.localeCompare(b.location))
              .map((loc) => {
                const checked = activeLocations.includes(loc.location)
                const colorIdx = activeLocations.indexOf(loc.location)
                const disabled = !checked && activeLocations.length >= MAX_SELECTED
                return (
                  <button
                    key={loc.location}
                    disabled={disabled}
                    onClick={() => toggleLocation(loc.location)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                      disabled ? 'opacity-40' : checked ? 'bg-surface-secondary' : ''
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        checked ? 'border-transparent' : 'border-border'
                      }`}
                      style={checked ? { backgroundColor: TREND_COLORS[colorIdx % TREND_COLORS.length] } : {}}
                    >
                      {checked && <i className="ri-check-line text-white text-[10px]" />}
                    </span>
                    <span className={`text-sm flex-1 truncate ${checked ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {loc.location}
                    </span>
                    <span className="text-xs text-text-tertiary tabular-nums">{Math.round(loc.avg)}% avg</span>
                  </button>
                )
              })}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
